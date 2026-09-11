// Etapa 2 — targeted tests for the constraints the user explicitly required
// before implementation: count clamping on /api/days, slotsCount derived
// from the same availability call (no second query), the month grid never
// assuming a fixed month length, the service/date state-reset guards in
// BookingFlow.jsx, and endTime coming from the canonical backend calc.
//
// No test runner was previously set up in this project (verification so far
// was manual, via Playwright/curl scripts) — this uses Node's built-in
// `node:test` + `node:assert/strict` so no new dependency is introduced.
// Requires: local Postgres test DB seeded (already set up this session) and
// `next dev -p 3001` running, since these exercise the real API + real DB,
// not mocks — consistent with "não invente dados" for the availability math.
//
// Run with: node --test tests/etapa2.test.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { toMinutes, toHHMM } from '../lib/studio.js';
import { buildMonthGrid } from '../lib/calendar.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3001';
const prisma = new PrismaClient();

const SHORT_SERVICE = 'depilacao-buco'; // 15min
const LONG_SERVICE = 'alongamento-gel'; // 120min

describe('/api/days count clamping', () => {
  test('missing count falls back to 14', async () => {
    const r = await fetch(`${BASE}/api/days?servico=${LONG_SERVICE}`);
    const data = await r.json();
    assert.equal(data.days.length, 14);
  });

  test('count=0 falls back to default (14)', async () => {
    const r = await fetch(`${BASE}/api/days?servico=${LONG_SERVICE}&count=0`);
    const data = await r.json();
    assert.equal(data.days.length, 14);
  });

  test('negative count falls back to default (14)', async () => {
    const r = await fetch(`${BASE}/api/days?servico=${LONG_SERVICE}&count=-5`);
    const data = await r.json();
    assert.equal(data.days.length, 14);
  });

  test('non-numeric count falls back to default (14)', async () => {
    const r = await fetch(`${BASE}/api/days?servico=${LONG_SERVICE}&count=abc`);
    const data = await r.json();
    assert.equal(data.days.length, 14);
  });

  test('count=42 is accepted as-is', async () => {
    const r = await fetch(`${BASE}/api/days?servico=${LONG_SERVICE}&count=42`);
    const data = await r.json();
    assert.equal(data.days.length, 42);
  });

  test('count above 42 is clamped to 42', async () => {
    const r1 = await fetch(`${BASE}/api/days?servico=${LONG_SERVICE}&count=100`);
    const r2 = await fetch(`${BASE}/api/days?servico=${LONG_SERVICE}&count=9999`);
    assert.equal((await r1.json()).days.length, 42);
    assert.equal((await r2.json()).days.length, 42);
  });
});

describe('slotsCount is derived from the same availability call as disabled', () => {
  test('slotsCount matches the real per-day slot count from /api/availability', async () => {
    const daysRes = await fetch(`${BASE}/api/days?servico=${LONG_SERVICE}&count=10`);
    const { days } = await daysRes.json();
    // Check every day: slotsCount from listAvailableDays must equal the
    // number of non-disabled slots that listSlotsForDay independently
    // returns for that same day/service — proving the count is real, not
    // estimated, and consistent with the actual slot list.
    for (const d of days) {
      assert.ok(typeof d.slotsCount === 'number', `day ${d.value} is missing slotsCount`);
      const availRes = await fetch(`${BASE}/api/availability?servico=${LONG_SERVICE}&date=${d.value}`);
      const { slots } = await availRes.json();
      const realCount = slots.filter((s) => !s.disabled).length;
      assert.equal(d.slotsCount, realCount, `mismatch on ${d.value}`);
      assert.equal(d.disabled, realCount === 0, `disabled flag inconsistent with slotsCount on ${d.value}`);
    }
  });
});

describe('MonthCalendarSheet grid (buildMonthGrid) never assumes a fixed month length', () => {
  test('February (28 days, non-leap) still yields a 42-cell grid starting from the first visible date', () => {
    const grid = buildMonthGrid('2026-02-01');
    assert.equal(grid.length, 42);
    // first cell must be the Sunday on/before the 1st, not the 1st itself
    assert.equal(grid[0].weekday, 0);
    const inMonthDays = grid.filter((c) => c.inMonth).map((c) => c.day);
    assert.equal(inMonthDays.length, 28);
    assert.deepEqual(inMonthDays, Array.from({ length: 28 }, (_, i) => i + 1));
  });

  test('April (30 days) yields a 42-cell grid with exactly 30 in-month days', () => {
    const grid = buildMonthGrid('2026-04-01');
    assert.equal(grid.length, 42);
    assert.equal(grid.filter((c) => c.inMonth).length, 30);
  });

  test('September 2026 (30 days) — the month exercised by the live test data — 42-cell grid', () => {
    const grid = buildMonthGrid('2026-09-01');
    assert.equal(grid.length, 42);
    assert.equal(grid.filter((c) => c.inMonth).length, 30);
  });

  test('January (31 days) yields a 42-cell grid with exactly 31 in-month days', () => {
    const grid = buildMonthGrid('2026-01-01');
    assert.equal(grid.length, 42);
    assert.equal(grid.filter((c) => c.inMonth).length, 31);
  });
});

describe('BookingFlow.jsx state-reset guards (source invariant)', () => {
  const source = readFileSync(join(__dirname, '../components/site/BookingFlow.jsx'), 'utf8');

  test('changing service resets day and time before refetching days', () => {
    const effectStart = source.indexOf("useEffect(() => {\n    if (!service) return;");
    assert.notEqual(effectStart, -1, 'service-change effect not found');
    const effectBody = source.slice(effectStart, source.indexOf('}, [service]);', effectStart));
    assert.match(effectBody, /setDay\(null\)/);
    assert.match(effectBody, /setTime\(null\)/);
  });

  test('changing day (via strip or month sheet) invalidates the previously selected time', () => {
    const effectStart = source.indexOf("useEffect(() => {\n    if (!service || !day) {");
    assert.notEqual(effectStart, -1, 'day-change effect not found');
    const effectBody = source.slice(effectStart, source.indexOf('}, [service, day]);', effectStart));
    assert.match(effectBody, /setTime\(null\)/);
  });

  test('MonthCalendarSheet onSelect feeds the same setDay used by the strip (single source of truth)', () => {
    assert.match(source, /onSelect=\{\(v\) => setDay\(v\)\}/);
  });
});

describe('Confirmation endTime is reused from the backend, never recomputed ad hoc', () => {
  test('BookingFlow.jsx does not recompute endTime with toMinutes/toHHMM — it reuses confirmation.endTime', () => {
    const source = readFileSync(join(__dirname, '../components/site/BookingFlow.jsx'), 'utf8');
    assert.ok(!source.includes('toMinutes') && !source.includes('toHHMM'),
      'BookingFlow.jsx should not import/call the time-math helpers itself — it must reuse the backend-computed endTime');
    assert.match(source, /confirmation\?\.endTime/);
  });

  test('the backend appointment endTime is itself the canonical toMinutes/toHHMM calculation (short service)', async () => {
    const slot = await firstAvailableSlot(SHORT_SERVICE);
    const res = await bookTestAppointment(SHORT_SERVICE, slot);
    try {
      const expectedEnd = toHHMM(toMinutes(slot.startTime) + 15);
      assert.equal(res.appointment.endTime, expectedEnd);
    } finally {
      await prisma.appointment.delete({ where: { id: res.appointment.id } });
    }
  });

  test('the backend appointment endTime is itself the canonical toMinutes/toHHMM calculation (long service)', async () => {
    const slot = await firstAvailableSlot(LONG_SERVICE);
    const res = await bookTestAppointment(LONG_SERVICE, slot);
    try {
      const expectedEnd = toHHMM(toMinutes(slot.startTime) + 120);
      assert.equal(res.appointment.endTime, expectedEnd);
    } finally {
      await prisma.appointment.delete({ where: { id: res.appointment.id } });
    }
  });
});

async function firstAvailableSlot(slug) {
  const daysRes = await fetch(`${BASE}/api/days?servico=${slug}&count=14`);
  const { days } = await daysRes.json();
  const freeDay = days.find((d) => !d.disabled);
  assert.ok(freeDay, `no free day found for ${slug} in the next 14 days`);
  const availRes = await fetch(`${BASE}/api/availability?servico=${slug}&date=${freeDay.value}`);
  const { slots } = await availRes.json();
  const freeSlot = slots.find((s) => !s.disabled);
  assert.ok(freeSlot, `no free slot found for ${slug} on ${freeDay.value}`);
  return { date: freeDay.value, startTime: freeSlot.value };
}

async function bookTestAppointment(slug, { date, startTime }) {
  const res = await fetch(`${BASE}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceSlug: slug, date, startTime,
      clientName: '[TESTE] Etapa2', clientPhone: '15999990000', wantsReminder: false,
    }),
  });
  const data = await res.json();
  assert.equal(res.status, 201, `booking failed: ${JSON.stringify(data)}`);
  return data;
}

test('cleanup: close prisma connection', async () => {
  await prisma.$disconnect();
});
