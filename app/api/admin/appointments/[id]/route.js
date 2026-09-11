import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { isRangeFree, hasActiveAppointmentOverlap, ACTIVE_APPOINTMENT_CONFLICT_MESSAGE } from '../../../../../lib/availability';
import { APPOINTMENT_STATUS, toMinutes, toHHMM } from '../../../../../lib/studio';
import { isOverlapConstraintError } from '../../../../../lib/db-errors';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function GET(request, { params }) {
  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({ where: { id }, include: { service: true } });
  if (!appointment) return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
  return NextResponse.json({ appointment });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const existing = await prisma.appointment.findUnique({ where: { id }, include: { service: true } });
  if (!existing) return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });

  const data = {};

  // Status-only change (confirm/cancel/complete/reopen) — no other fields.
  if (body.status !== undefined) {
    if (!Object.values(APPOINTMENT_STATUS).includes(body.status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }
    data.status = body.status;
  }

  // Reassign to a different catalog service, or to an ad-hoc one-off.
  let durationMin = existing.serviceId ? existing.service.durationMin : existing.customDurationMin;
  let staffPhone = existing.serviceId ? existing.service.staffPhone : null;
  if (body.serviceId !== undefined) {
    if (body.serviceId === null) {
      const name = String(body.customServiceName || '').trim();
      const price = Number(body.customPriceCents);
      const duration = Number(body.customDurationMin);
      if (!name || !Number.isFinite(price) || price < 0 || !Number.isFinite(duration) || duration < 5) {
        return NextResponse.json({ error: 'Serviço avulso precisa de nome, preço e duração válidos.' }, { status: 400 });
      }
      data.serviceId = null;
      data.customServiceName = name;
      data.customPriceCents = Math.round(price);
      data.customDurationMin = Math.round(duration);
      durationMin = data.customDurationMin;
      staffPhone = null;
    } else {
      const service = await prisma.service.findUnique({ where: { id: body.serviceId } });
      if (!service) return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 400 });
      data.serviceId = service.id;
      data.customServiceName = null;
      data.customPriceCents = null;
      data.customDurationMin = null;
      staffPhone = service.staffPhone;
      if (service.durationMin != null) {
        durationMin = service.durationMin;
      } else {
        const overrideDuration = Number(body.customDurationMin);
        if (!Number.isFinite(overrideDuration) || overrideDuration < 5) {
          return NextResponse.json({ error: 'Esse serviço não tem duração definida — informe a duração deste atendimento.' }, { status: 400 });
        }
        durationMin = Math.round(overrideDuration);
      }
    }
  } else if (body.customDurationMin !== undefined && existing.serviceId === null) {
    // Editing an ad-hoc appointment's own duration without changing anything else.
    const duration = Number(body.customDurationMin);
    if (!Number.isFinite(duration) || duration < 5) {
      return NextResponse.json({ error: 'Duração inválida.' }, { status: 400 });
    }
    data.customDurationMin = Math.round(duration);
    durationMin = data.customDurationMin;
  }
  if (body.customServiceName !== undefined && existing.serviceId === null && data.serviceId === undefined) {
    data.customServiceName = String(body.customServiceName || '').trim().slice(0, 120);
  }
  if (body.customPriceCents !== undefined && existing.serviceId === null && data.serviceId === undefined) {
    const price = Number(body.customPriceCents);
    if (Number.isFinite(price) && price >= 0) data.customPriceCents = Math.round(price);
  }
  if (body.note !== undefined) data.note = body.note ? String(body.note).trim().slice(0, 600) : null;
  if (body.clientName !== undefined) data.clientName = String(body.clientName || existing.clientName).trim().slice(0, 120);
  if (body.clientPhone !== undefined) data.clientPhone = String(body.clientPhone || existing.clientPhone).trim().slice(0, 40);

  // Reschedule (date and/or time). Re-check the slot is free unless force:true.
  const date = body.date !== undefined ? body.date : existing.date;
  const startTime = body.startTime !== undefined ? body.startTime : existing.startTime;
  const reschedule = date !== existing.date || startTime !== existing.startTime || data.serviceId !== undefined || data.customDurationMin !== undefined;

  if (body.date !== undefined && !DATE_RE.test(date)) return NextResponse.json({ error: 'Data inválida.' }, { status: 400 });
  if (body.startTime !== undefined && !TIME_RE.test(startTime)) return NextResponse.json({ error: 'Horário inválido.' }, { status: 400 });

  if (reschedule) {
    if (!durationMin) return NextResponse.json({ error: 'Duração do serviço não definida.' }, { status: 400 });

    // Hard rule, never bypassable by force:true — see the POST route for
    // the full rationale (block conflicts stay force-able; overlapping
    // active appointments for the same professional never are).
    const activeConflict = await hasActiveAppointmentOverlap({ dateISO: date, startTime, durationMin, excludeAppointmentId: id, staffPhone });
    if (activeConflict) {
      return NextResponse.json({ error: ACTIVE_APPOINTMENT_CONFLICT_MESSAGE, conflict: true, conflictType: 'appointment' }, { status: 409 });
    }

    if (!body.force) {
      const free = await isRangeFree({ dateISO: date, startTime, durationMin, excludeAppointmentId: id, staffPhone });
      if (!free) return NextResponse.json({ error: 'Esse horário conflita com um bloqueio de agenda.', conflict: true, conflictType: 'block' }, { status: 409 });
    }
    data.date = date;
    data.startTime = startTime;
    data.endTime = toHHMM(toMinutes(startTime) + durationMin);
  }
  // Keep the denormalized staffPhone (used by the DB-level
  // appointment_no_overlap constraint) in sync with whatever service this
  // appointment ends up pointing at, on every PATCH — cheap and always
  // correct, and backfills any row that predates this column.
  data.staffPhone = staffPhone;

  let appointment;
  try {
    appointment = await prisma.appointment.update({ where: { id }, data, include: { service: true } });
  } catch (err) {
    if (isOverlapConstraintError(err)) {
      return NextResponse.json({ error: ACTIVE_APPOINTMENT_CONFLICT_MESSAGE, conflict: true, conflictType: 'appointment' }, { status: 409 });
    }
    appointment = null;
  }
  if (!appointment) return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });

  return NextResponse.json({ appointment });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.appointment.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
