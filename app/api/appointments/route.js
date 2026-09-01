import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServiceBySlug, toServiceView } from '../../../lib/services';
import { isSlotStillAvailable } from '../../../lib/availability';
import { toMinutes, toHHMM, DEPOSIT_RATE, APPOINTMENT_STATUS } from '../../../lib/studio';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const { serviceSlug, date, startTime, wantsReminder = true } = body;
  const clientName = String(body.clientName || '').trim().slice(0, 120);
  const clientPhone = String(body.clientPhone || '').trim().slice(0, 40);
  const note = body.note ? String(body.note).trim().slice(0, 600) : null;

  if (!serviceSlug || !DATE_RE.test(date || '') || !TIME_RE.test(startTime || '')) {
    return NextResponse.json({ error: 'Dados de agendamento inválidos.' }, { status: 400 });
  }
  if (!clientName || !clientPhone) {
    return NextResponse.json({ error: 'Nome e WhatsApp são obrigatórios.' }, { status: 400 });
  }

  const service = await getServiceBySlug(serviceSlug);
  if (!service) return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
  if (service.durationMin == null) {
    return NextResponse.json({ error: 'Serviço ainda não está disponível para agendamento online.' }, { status: 409 });
  }

  const available = await isSlotStillAvailable({ dateISO: date, startTime, durationMin: service.durationMin });
  if (!available) {
    return NextResponse.json({ error: 'Esse horário acabou de ficar indisponível. Escolha outro.' }, { status: 409 });
  }

  const endTime = toHHMM(toMinutes(startTime) + service.durationMin);

  const appointment = await prisma.$transaction(async (tx) => {
    const stillFree = await isSlotStillAvailable({ dateISO: date, startTime, durationMin: service.durationMin });
    if (!stillFree) return null;
    return tx.appointment.create({
      data: {
        serviceId: service.id,
        clientName,
        clientPhone,
        note,
        wantsReminder: Boolean(wantsReminder),
        date,
        startTime,
        endTime,
        status: APPOINTMENT_STATUS.CONFIRMED,
      },
    });
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Esse horário acabou de ficar indisponível. Escolha outro.' }, { status: 409 });
  }

  const serviceView = toServiceView(service);
  return NextResponse.json({
    appointment: {
      id: appointment.id,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      clientName: appointment.clientName,
      service: serviceView,
      depositCents: Math.round(service.priceCents * DEPOSIT_RATE),
    },
  }, { status: 201 });
}
