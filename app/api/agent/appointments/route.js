import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { isAuthorizedCronRequest } from '../../../../lib/cron';
import { isSlotStillAvailable } from '../../../../lib/availability';
import { toServiceView } from '../../../../lib/services';
import { toMinutes, toHHMM, APPOINTMENT_STATUS } from '../../../../lib/studio';
import { samePhone } from '../../../../lib/phone';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

// Called by the external WhatsApp agent's AI once Bell or Jessica has
// confirmed a natural-language booking request ("Ana, segunda 10h,
// depilação axila") — the AI is expected to have already resolved the
// service via GET /api/agent/services and gotten an explicit yes from
// whoever's texting before calling this. clientPhone may be empty (the
// human chose to book without it); that appointment just won't get an
// automatic confirmation/reminder text since there's no number to send to.
export async function POST(request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const staffPhone = String(body.staffPhone || '').trim();
  const serviceId = String(body.serviceId || '').trim();
  const date = String(body.date || '');
  const startTime = String(body.startTime || '');
  const clientName = String(body.clientName || '').trim().slice(0, 120);
  const clientPhone = String(body.clientPhone || '').trim().slice(0, 40);
  const wantsReminder = body.wantsReminder !== false;

  if (!staffPhone) return NextResponse.json({ error: 'staffPhone é obrigatório.' }, { status: 400 });
  if (!serviceId) return NextResponse.json({ error: 'serviceId é obrigatório.' }, { status: 400 });
  if (!DATE_RE.test(date) || !TIME_RE.test(startTime)) {
    return NextResponse.json({ error: 'date/startTime inválidos.' }, { status: 400 });
  }
  if (!clientName) return NextResponse.json({ error: 'clientName é obrigatório.' }, { status: 400 });

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
  if (!samePhone(service.staffPhone, staffPhone)) {
    return NextResponse.json({ error: 'Esse serviço não pertence a esse profissional.' }, { status: 403 });
  }
  if (service.durationMin == null || service.priceCents == null) {
    return NextResponse.json({ error: 'Esse serviço ainda não tem duração/preço definidos.' }, { status: 409 });
  }

  const available = await isSlotStillAvailable({ dateISO: date, startTime, durationMin: service.durationMin, staffPhone });
  if (!available) {
    return NextResponse.json({ error: 'Esse horário não está disponível.', conflict: true }, { status: 409 });
  }

  const endTime = toHHMM(toMinutes(startTime) + service.durationMin);

  const appointment = await prisma.$transaction(async (tx) => {
    const stillFree = await isSlotStillAvailable({ dateISO: date, startTime, durationMin: service.durationMin, staffPhone });
    if (!stillFree) return null;
    return tx.appointment.create({
      data: {
        serviceId: service.id,
        clientName,
        clientPhone,
        wantsReminder,
        date,
        startTime,
        endTime,
        status: APPOINTMENT_STATUS.CONFIRMED,
      },
    });
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Esse horário acabou de ficar indisponível. Escolha outro.', conflict: true }, { status: 409 });
  }

  return NextResponse.json({
    appointment: {
      appointmentId: appointment.id,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone || null,
      service: toServiceView(service).name,
    },
  }, { status: 201 });
}
