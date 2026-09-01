import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { isRangeFree } from '../../../../lib/availability';
import { toHHMM, toMinutes, APPOINTMENT_STATUS } from '../../../../lib/studio';
import { toAppointmentServiceView } from '../../../../lib/services';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

// Admin-only manual booking: a walk-in, a phone call, whatever didn't come
// through the public flow. Accepts either a catalog serviceId or a fully
// custom one-off service (name/price/duration typed on the spot).
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const { date, startTime, serviceId } = body;
  const clientName = String(body.clientName || '').trim().slice(0, 120);
  const clientPhone = String(body.clientPhone || '').trim().slice(0, 40);
  const note = body.note ? String(body.note).trim().slice(0, 600) : null;

  if (!DATE_RE.test(date || '') || !TIME_RE.test(startTime || '')) {
    return NextResponse.json({ error: 'Data ou horário inválidos.' }, { status: 400 });
  }
  let durationMin;
  let data = {
    clientName, clientPhone, note,
    wantsReminder: false,
    date, startTime,
    status: APPOINTMENT_STATUS.CONFIRMED,
  };

  if (serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 400 });
    durationMin = service.durationMin ?? Number(body.customDurationMin);
    if (!durationMin || durationMin < 5) {
      return NextResponse.json({ error: 'Esse serviço não tem duração definida — informe uma duração.' }, { status: 400 });
    }
    data.serviceId = service.id;
  } else {
    const name = String(body.customServiceName || '').trim();
    const price = Number(body.customPriceCents);
    durationMin = Number(body.customDurationMin);
    if (!name || !Number.isFinite(price) || price < 0 || !Number.isFinite(durationMin) || durationMin < 5) {
      return NextResponse.json({ error: 'Serviço avulso precisa de nome, preço e duração válidos.' }, { status: 400 });
    }
    data.customServiceName = name;
    data.customPriceCents = Math.round(price);
    data.customDurationMin = Math.round(durationMin);
  }

  if (!body.force) {
    const free = await isRangeFree({ dateISO: date, startTime, durationMin });
    if (!free) {
      return NextResponse.json({ error: 'Esse horário conflita com outro agendamento ou bloqueio.', conflict: true }, { status: 409 });
    }
  }

  data.endTime = toHHMM(toMinutes(startTime) + durationMin);

  const appointment = await prisma.appointment.create({ data, include: { service: true } });

  return NextResponse.json({
    appointment: {
      id: appointment.id,
      serviceId: appointment.serviceId,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      status: appointment.status,
      service: toAppointmentServiceView(appointment),
    },
  }, { status: 201 });
}
