import { prisma } from './prisma';
import { WORKING_HOURS, SLOT_STEP_MIN, WEEKDAY_LABELS, toMinutes, toHHMM, dateToISO } from './studio';

function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

async function busyIntervalsForDay(dateISO) {
  const [appointments, blocked] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: dateISO, status: { not: 'CANCELLED' } },
      select: { startTime: true, endTime: true },
    }),
    prisma.blockedSlot.findMany({
      where: { date: dateISO },
      select: { startTime: true, endTime: true },
    }),
  ]);
  return [...appointments, ...blocked].map((b) => ({
    start: toMinutes(b.startTime),
    end: toMinutes(b.endTime),
  }));
}

export async function listSlotsForDay({ dateISO, durationMin }) {
  const date = parseISODate(dateISO);
  const hours = WORKING_HOURS[date.getDay()];
  if (!hours) return [];

  const openMin = toMinutes(hours.open);
  const closeMin = toMinutes(hours.close);
  const busy = await busyIntervalsForDay(dateISO);

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

export async function listAvailableDays({ durationMin, from, count = 14 }) {
  const start = from ? parseISODate(from) : new Date();
  start.setHours(0, 0, 0, 0);
  const days = [];
  const cursor = new Date(start);
  while (days.length < count) {
    const dateISO = dateToISO(cursor);
    const hours = WORKING_HOURS[cursor.getDay()];
    let disabled = !hours;
    if (hours) {
      const slots = await listSlotsForDay({ dateISO, durationMin });
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

export async function isSlotStillAvailable({ dateISO, startTime, durationMin }) {
  const slots = await listSlotsForDay({ dateISO, durationMin });
  const slot = slots.find((s) => s.value === startTime);
  return !!slot && !slot.disabled;
}
