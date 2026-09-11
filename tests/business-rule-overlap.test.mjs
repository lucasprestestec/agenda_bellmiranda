// Business rule hardening — a professional can never have two ACTIVE
// (non-cancelled) appointments with overlapping times, with NO override
// path anywhere (UI or API), while a schedule block (the admin's own note)
// remains a valid, force-able conflict. See lib/availability.js's
// hasActiveAppointmentOverlap and ACTIVE_APPOINTMENT_CONFLICT_MESSAGE.
//
// Requires: local Postgres test DB with the appointment_no_overlap
// constraint applied, and `next dev -p 3001` running.
// Run with: node --test tests/business-rule-overlap.test.mjs

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const BASE = 'http://localhost:3001';
const prisma = new PrismaClient();
const TEST_NAME_PREFIX = '[RULE-TEST]';
const EXPECTED_MESSAGE = 'Este horário já está ocupado para esta profissional. Escolha outro horário ou cancele/reagende o atendimento existente.';

let adminCookie;

async function adminFetch(path, options = {}) {
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', cookie: adminCookie, ...(options.headers || {}) },
  });
}

async function cleanupTestData() {
  await prisma.appointment.deleteMany({ where: { clientName: { startsWith: TEST_NAME_PREFIX } } });
  await prisma.blockedSlot.deleteMany({ where: { reason: { startsWith: TEST_NAME_PREFIX } } });
}

before(async () => {
  const res = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'devpass123' }),
  });
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'admin login must succeed for these tests to run');
  adminCookie = setCookie.split(';')[0];
  await cleanupTestData();
});

after(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

describe('1. An active appointment blocks any overlapping booking for the same professional', () => {
  test('creating a second appointment overlapping an active one is rejected, with the clear business message', async () => {
    const service = await prisma.service.findUniqueOrThrow({ where: { slug: 'depilacao-buco' } });
    const date = '2027-04-05';

    const a = await prisma.appointment.create({ data: {
      serviceId: service.id, clientName: `${TEST_NAME_PREFIX} active-A`, clientPhone: '15999911111',
      date, startTime: '09:00', endTime: '11:00', status: 'CONFIRMED', staffPhone: service.staffPhone,
    } });
    assert.ok(a.id);

    const res = await adminFetch('/api/admin/appointments', {
      method: 'POST',
      body: JSON.stringify({ serviceId: service.id, date, startTime: '10:00', clientName: `${TEST_NAME_PREFIX} active-B` }),
    });
    const data = await res.json();
    assert.equal(res.status, 409);
    assert.equal(data.conflictType, 'appointment');
    assert.equal(data.error, EXPECTED_MESSAGE);

    const rows = await prisma.appointment.findMany({ where: { clientName: { startsWith: TEST_NAME_PREFIX }, date } });
    assert.equal(rows.length, 1, 'only the original appointment should exist');
  });
});

describe('2. Cancelling an appointment frees its slot for a new booking', () => {
  test('cancel then rebook the exact same professional/date/time succeeds', async () => {
    const service = await prisma.service.findUniqueOrThrow({ where: { slug: 'depilacao-buco' } });
    const date = '2027-04-06';
    const startTime = '09:00';

    const original = await prisma.appointment.create({ data: {
      serviceId: service.id, clientName: `${TEST_NAME_PREFIX} to-cancel`, clientPhone: '15999911112',
      date, startTime, endTime: '09:15', status: 'CONFIRMED', staffPhone: service.staffPhone,
    } });

    const cancelRes = await adminFetch(`/api/admin/appointments/${original.id}`, {
      method: 'PATCH', body: JSON.stringify({ status: 'CANCELLED' }),
    });
    assert.equal(cancelRes.status, 200);
    const cancelled = await prisma.appointment.findUniqueOrThrow({ where: { id: original.id } });
    assert.equal(cancelled.status, 'CANCELLED');

    const rebookRes = await adminFetch('/api/admin/appointments', {
      method: 'POST',
      body: JSON.stringify({ serviceId: service.id, date, startTime, clientName: `${TEST_NAME_PREFIX} rebooked` }),
    });
    const rebookData = await rebookRes.json();
    assert.equal(rebookRes.status, 201, `expected rebooking to succeed, got ${rebookRes.status}: ${JSON.stringify(rebookData)}`);
  });
});

describe('3. There is no UI/API path left that forces an active-appointment conflict', () => {
  test('force:true on create still rejects an overlap with an active appointment', async () => {
    const service = await prisma.service.findUniqueOrThrow({ where: { slug: 'depilacao-buco' } });
    const date = '2027-04-07';

    await prisma.appointment.create({ data: {
      serviceId: service.id, clientName: `${TEST_NAME_PREFIX} force-A`, clientPhone: '15999911113',
      date, startTime: '09:00', endTime: '11:00', status: 'CONFIRMED', staffPhone: service.staffPhone,
    } });

    const res = await adminFetch('/api/admin/appointments', {
      method: 'POST',
      body: JSON.stringify({ serviceId: service.id, date, startTime: '10:00', clientName: `${TEST_NAME_PREFIX} force-B`, force: true }),
    });
    const data = await res.json();
    assert.equal(res.status, 409, `force:true must not bypass an active-appointment conflict, got ${res.status}`);
    assert.equal(data.conflictType, 'appointment');

    const rows = await prisma.appointment.findMany({ where: { clientName: { startsWith: TEST_NAME_PREFIX }, date } });
    assert.equal(rows.length, 1);
  });

  test('force:true on reschedule (PATCH) still rejects moving into an active appointment', async () => {
    const service = await prisma.service.findUniqueOrThrow({ where: { slug: 'depilacao-buco' } });
    const date = '2027-04-08';

    await prisma.appointment.create({ data: {
      serviceId: service.id, clientName: `${TEST_NAME_PREFIX} resched-occupied`, clientPhone: '15999911114',
      date, startTime: '09:00', endTime: '11:00', status: 'CONFIRMED', staffPhone: service.staffPhone,
    } });
    const mover = await prisma.appointment.create({ data: {
      serviceId: service.id, clientName: `${TEST_NAME_PREFIX} resched-mover`, clientPhone: '15999911115',
      date, startTime: '13:00', endTime: '15:00', status: 'CONFIRMED', staffPhone: service.staffPhone,
    } });

    const res = await adminFetch(`/api/admin/appointments/${mover.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ date, startTime: '10:00', force: true }),
    });
    const data = await res.json();
    assert.equal(res.status, 409, `force:true must not bypass an active-appointment conflict on reschedule, got ${res.status}`);
    assert.equal(data.conflictType, 'appointment');

    const unchanged = await prisma.appointment.findUniqueOrThrow({ where: { id: mover.id } });
    assert.equal(unchanged.startTime, '13:00', 'the mover appointment must not have been rescheduled');
  });
});

describe('Regression guard: a schedule BLOCK (not another appointment) remains a valid, force-able conflict', () => {
  test('a block without force is rejected as conflictType "block"; the same request with force:true succeeds', async () => {
    const service = await prisma.service.findUniqueOrThrow({ where: { slug: 'depilacao-buco' } });
    const date = '2027-04-09';

    await prisma.blockedSlot.create({ data: {
      date, startTime: '09:00', endTime: '11:00', staffPhone: service.staffPhone, reason: `${TEST_NAME_PREFIX} lunch break`,
    } });

    const blockedRes = await adminFetch('/api/admin/appointments', {
      method: 'POST',
      body: JSON.stringify({ serviceId: service.id, date, startTime: '09:30', clientName: `${TEST_NAME_PREFIX} block-conflict` }),
    });
    const blockedData = await blockedRes.json();
    assert.equal(blockedRes.status, 409);
    assert.equal(blockedData.conflictType, 'block');

    const forcedRes = await adminFetch('/api/admin/appointments', {
      method: 'POST',
      body: JSON.stringify({ serviceId: service.id, date, startTime: '09:30', clientName: `${TEST_NAME_PREFIX} block-forced`, force: true }),
    });
    const forcedData = await forcedRes.json();
    assert.equal(forcedRes.status, 201, `force:true must still be able to override a block, got ${forcedRes.status}: ${JSON.stringify(forcedData)}`);
  });
});
