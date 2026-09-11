import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { isAuthorizedCronRequest } from '../../../../../lib/cron';
import { isRangeFree } from '../../../../../lib/availability';
import { toServiceView } from '../../../../../lib/services';
import { toMinutes, toHHMM, APPOINTMENT_STATUS } from '../../../../../lib/studio';
import { samePhone } from '../../../../../lib/phone';
import { isOverlapConstraintError } from '../../../../../lib/db-errors';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

// Reschedule or cancel an appointment via chat, once the AI has found the
// right appointmentId (GET /api/agent/agenda's `appointments` array) and
// gotten an explicit yes. Deliberately narrow compared to the admin panel's
// PATCH — no service reassignment, no ad-hoc editing — just move a slot or
// cancel it, and only for a service that belongs to the staffPhone asking.
export async function PATCH(request, { params }) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const staffPhone = String(body.staffPhone || '').trim();
  if (!staffPhone) return NextResponse.json({ error: 'staffPhone é obrigatório.' }, { status: 400 });

  const existing = await prisma.appointment.findUnique({ where: { id }, include: { service: true } });
  if (!existing) return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
  if (!existing.service || !samePhone(existing.service.staffPhone, staffPhone)) {
    return NextResponse.json({ error: 'Esse agendamento não pertence a esse profissional.' }, { status: 403 });
  }

  const wantsCancel = body.status !== undefined;
  const wantsReschedule = body.date !== undefined || body.startTime !== undefined;
  if (!wantsCancel && !wantsReschedule) {
    return NextResponse.json({ error: 'Informe status:"CANCELLED" para cancelar, ou date/startTime para remarcar.' }, { status: 400 });
  }
  if (wantsCancel && body.status !== APPOINTMENT_STATUS.CANCELLED) {
    return NextResponse.json({ error: 'Por chat só é permitido cancelar (status:"CANCELLED").' }, { status: 400 });
  }

  const data = {};
  if (wantsCancel) {
    data.status = APPOINTMENT_STATUS.CANCELLED;
  }

  if (wantsReschedule) {
    const date = body.date !== undefined ? body.date : existing.date;
    const startTime = body.startTime !== undefined ? body.startTime : existing.startTime;
    if (!DATE_RE.test(date) || !TIME_RE.test(startTime)) {
      return NextResponse.json({ error: 'date/startTime inválidos.' }, { status: 400 });
    }
    const durationMin = existing.service.durationMin;
    const free = await isRangeFree({ dateISO: date, startTime, durationMin, excludeAppointmentId: id, staffPhone });
    if (!free) return NextResponse.json({ error: 'Esse horário não está disponível.', conflict: true }, { status: 409 });
    data.date = date;
    data.startTime = startTime;
    data.endTime = toHHMM(toMinutes(startTime) + durationMin);
    // No service reassignment on this route, so staffPhone can't change —
    // but keep it in sync in case an older row predates this column.
    data.staffPhone = existing.service.staffPhone;
  }

  let appointment;
  try {
    appointment = await prisma.appointment.update({ where: { id }, data, include: { service: true } });
  } catch (err) {
    if (!isOverlapConstraintError(err)) throw err;
    return NextResponse.json({ error: 'Esse horário acabou de ficar indisponível. Escolha outro.', conflict: true }, { status: 409 });
  }

  return NextResponse.json({
    appointment: {
      appointmentId: appointment.id,
      status: appointment.status,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone || null,
      service: toServiceView(appointment.service).name,
    },
  });
}
