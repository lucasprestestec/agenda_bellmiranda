import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { isAuthorizedCronRequest } from '../../../../lib/cron';
import { toAppointmentServiceView } from '../../../../lib/services';
import { sendDailySummary } from '../../../../lib/whatsapp/send';
import { dateToISO, APPOINTMENT_STATUS } from '../../../../lib/studio';

// Runs once a day in the morning — sends Bell a WhatsApp summary of today's
// agenda so she doesn't have to open /admin first thing.
export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const today = dateToISO(new Date());
  const appointments = await prisma.appointment.findMany({
    where: { date: today, status: APPOINTMENT_STATUS.CONFIRMED },
    include: { service: true },
    orderBy: { startTime: 'asc' },
  });

  const appointmentsWithServiceView = appointments.map((appointment) => ({
    ...appointment,
    serviceView: toAppointmentServiceView(appointment),
  }));

  try {
    await sendDailySummary(today, appointmentsWithServiceView);
  } catch (err) {
    console.error('Falha ao enviar resumo diário:', err);
    return NextResponse.json({ error: 'Falha ao enviar resumo diário.' }, { status: 502 });
  }

  return NextResponse.json({ date: today, count: appointments.length });
}
