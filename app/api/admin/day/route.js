import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { toAppointmentServiceView } from '../../../../lib/services';
import { samePhone } from '../../../../lib/phone';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const staffPhone = searchParams.get('staffPhone') || null;
  if (!DATE_RE.test(date || '')) return NextResponse.json({ error: 'Data inválida.' }, { status: 400 });

  const [allAppointments, blockedSlots] = await Promise.all([
    prisma.appointment.findMany({
      where: { date },
      include: { service: true },
      orderBy: { startTime: 'asc' },
    }),
    prisma.blockedSlot.findMany({ where: { date }, orderBy: { startTime: 'asc' } }),
  ]);

  const appointments = staffPhone
    ? allAppointments.filter((a) => samePhone(a.service?.staffPhone, staffPhone))
    : allAppointments;

  return NextResponse.json({
    appointments: appointments.map((a) => ({
      id: a.id,
      serviceId: a.serviceId,
      startTime: a.startTime,
      endTime: a.endTime,
      clientName: a.clientName,
      clientPhone: a.clientPhone,
      note: a.note,
      status: a.status,
      wantsReminder: a.wantsReminder,
      confirmationSentAt: a.confirmationSentAt,
      reminderSentAt: a.reminderSentAt,
      service: toAppointmentServiceView(a),
    })),
    blockedSlots,
  });
}
