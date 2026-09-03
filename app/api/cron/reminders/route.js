import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { isAuthorizedCronRequest } from '../../../../lib/cron';
import { toAppointmentServiceView } from '../../../../lib/services';
import { sendAppointmentReminder } from '../../../../lib/whatsapp/send';
import { dateToISO } from '../../../../lib/studio';
import { addDays } from '../../../../lib/calendar';
import { APPOINTMENT_STATUS } from '../../../../lib/studio';

// Runs once a day the evening before — sends the "lembrete no WhatsApp um dia
// antes" clients opted into at booking time (see BookingFlow's remind checkbox).
export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const tomorrow = addDays(dateToISO(new Date()), 1);
  const appointments = await prisma.appointment.findMany({
    where: {
      date: tomorrow,
      status: APPOINTMENT_STATUS.CONFIRMED,
      wantsReminder: true,
      reminderSentAt: null,
    },
    include: { service: true },
  });

  let sent = 0;
  let failed = 0;
  for (const appointment of appointments) {
    try {
      await sendAppointmentReminder(appointment, toAppointmentServiceView(appointment));
      sent++;
    } catch (err) {
      failed++;
      console.error(`Falha ao enviar lembrete para agendamento ${appointment.id}:`, err);
    }
  }

  return NextResponse.json({ date: tomorrow, candidates: appointments.length, sent, failed });
}
