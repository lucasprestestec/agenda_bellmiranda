import { prisma } from './prisma';
import { WORKING_HOURS, SLOT_STEP_MIN, WEEKDAY_LABELS, toMinutes, toHHMM, dateToISO } from './studio';

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
  return intervalStaffPhone === staffPhone;
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
    if (hours) {
      const slots = await listSlotsForDay({ dateISO, durationMin, staffPhone });
      disabled = slots.every((s) => s.disabled);
    }
    days.push({
      value: dateISO,
      weekday: WEEKDAY_LABELS[cursor.getDay()],
      day: String(cursor.getDate()).padStart(2, '0'),
      disabled,
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
