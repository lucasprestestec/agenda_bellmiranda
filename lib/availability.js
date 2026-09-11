import { prisma } from './prisma';
import { WORKING_HOURS, SLOT_STEP_MIN, WEEKDAY_LABELS, toMinutes, toHHMM, dateToISO } from './studio';
import { samePhone } from './phone';

function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// Bell, Jessica, etc. each have their own schedule — an appointment only
// conflicts with another if they're for the same staff member. An
// appointment/block with no identifiable staff (ad-hoc appointment, a
// service with no staffPhone set, or a studio-wide block) is treated as a
// shared resource that conflicts with everyone, since we can't tell who it
// actually occupies.
function conflictsWithStaff(intervalStaffPhone, staffPhone) {
  if (!intervalStaffPhone || !staffPhone) return true;
  return samePhone(intervalStaffPhone, staffPhone);
}

async function busyIntervalsForDay(dateISO, excludeAppointmentId, staffPhone) {
  const [appointments, blocked] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: dateISO, status: { not: 'CANCELLED' }, id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined },
      select: { startTime: true, endTime: true, service: { select: { staffPhone: true } } },
    }),
    prisma.blockedSlot.findMany({
      where: { date: dateISO },
      select: { startTime: true, endTime: true, staffPhone: true },
    }),
  ]);
  return [...appointments, ...blocked]
    .filter((b) => conflictsWithStaff(b.service ? b.service.staffPhone : b.staffPhone, staffPhone))
    .map((b) => ({ start: toMinutes(b.startTime), end: toMinutes(b.endTime) }));
}

// Admin-facing: does this exact [startTime, startTime+durationMin) range
// overlap an existing appointment/block on that day, for that staff member?
// Unlike the public listSlotsForDay, this has no "must be in the future"
// restriction and can exclude one appointment (so editing its own slot
// doesn't conflict with itself).
export async function isRangeFree({ dateISO, startTime, durationMin, excludeAppointmentId, staffPhone }) {
  const busy = await busyIntervalsForDay(dateISO, excludeAppointmentId, staffPhone);
  const start = toMinutes(startTime);
  const end = start + durationMin;
  return !busy.some((b) => overlaps(start, end, b.start, b.end));
}

// The hard business rule: a professional can never have two ACTIVE
// (non-cancelled) appointments with overlapping times — mirrors the
// appointment_no_overlap DB exclusion constraint (the actual last line of
// defense), and is deliberately separate from isRangeFree/busyIntervalsForDay
// above. isRangeFree also folds in BlockedSlot conflicts, which an admin can
// still consciously override (their own schedule note, e.g. a lunch break) —
// this function only ever looks at other Appointment rows, and has no
// force/override path anywhere that calls it, by design.
// Shared copy for the one case where an overlap can never be forced —
// used by every route that calls hasActiveAppointmentOverlap, so the
// message stays identical everywhere it can appear (admin create/reschedule,
// and the DB-constraint catch as a last-resort race backstop).
export const ACTIVE_APPOINTMENT_CONFLICT_MESSAGE = 'Este horário já está ocupado para esta profissional. Escolha outro horário ou cancele/reagende o atendimento existente.';

export async function hasActiveAppointmentOverlap({ dateISO, startTime, durationMin, excludeAppointmentId, staffPhone }) {
  if (!staffPhone) return false; // no identifiable professional — not covered by this per-professional rule
  const appointments = await prisma.appointment.findMany({
    where: { date: dateISO, status: { not: 'CANCELLED' }, id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined },
    select: { startTime: true, endTime: true, staffPhone: true },
  });
  const start = toMinutes(startTime);
  const end = start + durationMin;
  return appointments.some((a) => samePhone(a.staffPhone, staffPhone) && overlaps(start, end, toMinutes(a.startTime), toMinutes(a.endTime)));
}

export async function listSlotsForDay({ dateISO, durationMin, staffPhone }) {
  const date = parseISODate(dateISO);
  const hours = WORKING_HOURS[date.getDay()];
  if (!hours) return [];

  const openMin = toMinutes(hours.open);
  const closeMin = toMinutes(hours.close);
  const busy = await busyIntervalsForDay(dateISO, undefined, staffPhone);

  const today = dateToISO(new Date());
  const nowMin = date.getTime() === parseISODate(today).getTime()
    ? new Date().getHours() * 60 + new Date().getMinutes()
    : -Infinity;

  const slots = [];
  for (let start = openMin; start + durationMin <= closeMin; start += SLOT_STEP_MIN) {
    const end = start + durationMin;
    const isPast = dateISO === today && start <= nowMin;
    const isBusy = busy.some((b) => overlaps(start, end, b.start, b.end));
    slots.push({ value: toHHMM(start), disabled: isPast || isBusy });
  }
  return slots;
}

export async function listAvailableDays({ durationMin, from, count = 14, staffPhone }) {
  const start = from ? parseISODate(from) : new Date();
  start.setHours(0, 0, 0, 0);
  const days = [];
  const cursor = new Date(start);
  while (days.length < count) {
    const dateISO = dateToISO(cursor);
    const hours = WORKING_HOURS[cursor.getDay()];
    let disabled = !hours;
    let slotsCount = 0;
    if (hours) {
      const slots = await listSlotsForDay({ dateISO, durationMin, staffPhone });
      slotsCount = slots.filter((s) => !s.disabled).length;
      disabled = slotsCount === 0;
    }
    days.push({
      value: dateISO,
      weekday: WEEKDAY_LABELS[cursor.getDay()],
      day: String(cursor.getDate()).padStart(2, '0'),
      disabled,
      slotsCount,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export async function isSlotStillAvailable({ dateISO, startTime, durationMin, staffPhone }) {
  const slots = await listSlotsForDay({ dateISO, durationMin, staffPhone });
  const slot = slots.find((s) => s.value === startTime);
  return !!slot && !slot.disabled;
}
