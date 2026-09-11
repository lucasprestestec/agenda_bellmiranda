// Hardening — real concurrency tests for the appointment_no_overlap
// exclusion constraint (see prisma/ensure-constraints.mjs). These fire
// GENUINELY parallel requests (Promise.all, not sequential awaits) — the
// whole point of this suite is to catch races a sequential test can't.
//
// Requires: local Postgres test DB with the constraint applied
// (`npm run db:ensure-constraints`) and `next dev -p 3001` running.
// Run with: node --test tests/concurrency.test.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const BASE = 'http://localhost:3001';
const prisma = new PrismaClient();

// Two real services with the SAME professional (Jessica), short enough to
// not collide with other tests' dates.
const SVC_SLUG = 'depilacao-buco';
// A real service with a DIFFERENT professional (Bell), for the
// no-conflict-across-staff case.
const SVC_SLUG_OTHER_STAFF = 'so-mao';

const TEST_DATE = '2027-03-08'; // a Monday, far enough out to not collide with other suites' data
const TEST_NAME_PREFIX = '[CONC-TEST]';

async function cleanupTestData() {
  await prisma.appointment.deleteMany({ where: { clientName: { startsWith: TEST_NAME_PREFIX } } });
}

async function book(slug, date, startTime, label) {
  const res = await fetch(`${BASE}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceSlug: slug, date, startTime,
      clientName: `${TEST_NAME_PREFIX} ${label}`, clientPhone: '15999912345', wantsReminder: false,
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

describe('Concurrent double-booking is prevented (same professional, same slot)', () => {
  test('two truly simultaneous requests for the exact same slot: exactly 1 success, 1 conflict, 1 row persisted', async () => {
    await cleanupTestData();
    try {
      const startTime = '09:00';
      const [r1, r2] = await Promise.all([
        book(SVC_SLUG, TEST_DATE, startTime, 'A'),
        book(SVC_SLUG, TEST_DATE, startTime, 'B'),
      ]);

      const statuses = [r1.status, r2.status].sort();
      assert.deepEqual(statuses, [201, 409], `expected one 201 and one 409, got ${statuses}`);

      const conflictResponse = [r1, r2].find((r) => r.status === 409);
      assert.equal(conflictResponse.data.error, 'Esse horário acabou de ficar indisponível. Escolha outro.');
      assert.ok(!/prisma|postgres|constraint|SQL/i.test(conflictResponse.data.error), 'error message must not leak DB details');

      const rows = await prisma.appointment.findMany({ where: { clientName: { startsWith: TEST_NAME_PREFIX }, date: TEST_DATE, startTime } });
      assert.equal(rows.length, 1, `expected exactly 1 persisted row, found ${rows.length}`);
    } finally {
      await cleanupTestData();
    }
  });
});

describe('Overlapping (not just identical) intervals are prevented for the same professional', () => {
  test('09:00-11:00 vs 10:30-12:00 for the same staffPhone: only one can exist', async () => {
    // The public API only accepts a service slug + startTime (duration is
    // fixed by the service), so arbitrary start/end pairs like these can't
    // be driven through it directly — this exercises the DB constraint
    // itself (the actual guarantee being tested) with two concurrent
    // Prisma writes carrying explicit, real overlapping ranges for a real
    // service/staff, exactly like the application code would write them.
    await cleanupTestData();
    try {
      const service = await prisma.service.findUniqueOrThrow({ where: { slug: SVC_SLUG } });
      const date = '2027-03-09';

      const results = await Promise.allSettled([
        prisma.appointment.create({ data: {
          serviceId: service.id, clientName: `${TEST_NAME_PREFIX} overlap-A`, clientPhone: '15999912346',
          date, startTime: '09:00', endTime: '11:00', status: 'CONFIRMED', staffPhone: service.staffPhone,
        } }),
        prisma.appointment.create({ data: {
          serviceId: service.id, clientName: `${TEST_NAME_PREFIX} overlap-B`, clientPhone: '15999912347',
          date, startTime: '10:30', endTime: '12:00', status: 'CONFIRMED', staffPhone: service.staffPhone,
        } }),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');
      assert.equal(fulfilled.length, 1, `expected exactly 1 of the two overlapping writes to succeed, got ${fulfilled.length}`);
      assert.equal(rejected.length, 1, `expected exactly 1 to be rejected, got ${rejected.length}`);
      assert.match(String(rejected[0].reason?.message || ''), /appointment_no_overlap/);

      const rows = await prisma.appointment.findMany({ where: { clientName: { startsWith: TEST_NAME_PREFIX }, date } });
      assert.equal(rows.length, 1, `expected exactly 1 persisted row, found ${rows.length}`);
    } finally {
      await cleanupTestData();
    }
  });
});

describe('No false conflict across different professionals', () => {
  test('same date/time, different staff: both requests succeed', async () => {
    await cleanupTestData();
    try {
      const startTime = '09:00';
      const [r1, r2] = await Promise.all([
        book(SVC_SLUG, TEST_DATE, startTime, 'diffstaff-A'),
        book(SVC_SLUG_OTHER_STAFF, TEST_DATE, startTime, 'diffstaff-B'),
      ]);
      assert.equal(r1.status, 201, `expected first booking to succeed, got ${r1.status}: ${JSON.stringify(r1.data)}`);
      assert.equal(r2.status, 201, `expected second booking (different staff) to succeed, got ${r2.status}: ${JSON.stringify(r2.data)}`);

      const rows = await prisma.appointment.findMany({ where: { clientName: { startsWith: TEST_NAME_PREFIX }, date: TEST_DATE, startTime } });
      assert.equal(rows.length, 2);
    } finally {
      await cleanupTestData();
    }
  });
});

describe('A cancelled appointment does not block rebooking the same slot', () => {
  test('cancel then rebook the exact same professional/date/time succeeds', async () => {
    await cleanupTestData();
    try {
      const service = await prisma.service.findUniqueOrThrow({ where: { slug: SVC_SLUG } });
      const date = '2027-03-10';
      const startTime = '09:00';

      const cancelled = await prisma.appointment.create({ data: {
        serviceId: service.id, clientName: `${TEST_NAME_PREFIX} cancelled`, clientPhone: '15999912348',
        date, startTime, endTime: '09:15', status: 'CANCELLED', staffPhone: service.staffPhone,
      } });
      assert.ok(cancelled.id);

      const { status, data } = await book(SVC_SLUG, date, startTime, 'rebook-after-cancel');
      assert.equal(status, 201, `expected rebooking to succeed since the existing appointment is cancelled, got ${status}: ${JSON.stringify(data)}`);
    } finally {
      await cleanupTestData();
    }
  });
});

test('cleanup: close prisma connection', async () => {
  await prisma.$disconnect();
});
