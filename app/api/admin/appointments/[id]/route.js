import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { isRangeFree } from '../../../../../lib/availability';
import { APPOINTMENT_STATUS, toMinutes, toHHMM } from '../../../../../lib/studio';

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
    } else {
      const service = await prisma.service.findUnique({ where: { id: body.serviceId } });
      if (!service) return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 400 });
      if (service.durationMin == null) {
        return NextResponse.json({ error: 'Defina a duração desse serviço antes de usá-lo em um agendamento.' }, { status: 400 });
      }
      data.serviceId = service.id;
      data.customServiceName = null;
      data.customPriceCents = null;
      data.customDurationMin = null;
      durationMin = service.durationMin;
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
    if (!body.force) {
      const free = await isRangeFree({ dateISO: date, startTime, durationMin, excludeAppointmentId: id });
      if (!free) return NextResponse.json({ error: 'Esse horário conflita com outro agendamento ou bloqueio.', conflict: true }, { status: 409 });
    }
    data.date = date;
    data.startTime = startTime;
    data.endTime = toHHMM(toMinutes(startTime) + durationMin);
  }

  const appointment = await prisma.appointment.update({ where: { id }, data, include: { service: true } }).catch(() => null);
  if (!appointment) return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });

  return NextResponse.json({ appointment });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.appointment.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
