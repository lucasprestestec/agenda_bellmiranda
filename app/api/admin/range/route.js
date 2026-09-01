import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { toAppointmentServiceView } from '../../../../lib/services';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Overview data for month/week calendar grids — appointment counts (and a
// light summary) per day across a date range, in one round trip.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (!DATE_RE.test(from || '') || !DATE_RE.test(to || '')) {
    return NextResponse.json({ error: 'Informe from e to (YYYY-MM-DD).' }, { status: 400 });
  }

  const [appointments, blockedSlots] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: { gte: from, lte: to } },
      include: { service: true },
      orderBy: { startTime: 'asc' },
    }),
    prisma.blockedSlot.findMany({ where: { date: { gte: from, lte: to } } }),
  ]);

  const byDate = {};
  for (const a of appointments) {
    (byDate[a.date] ||= { appointments: [], blockedCount: 0 }).appointments.push({
      id: a.id,
      startTime: a.startTime,
      endTime: a.endTime,
      clientName: a.clientName,
      status: a.status,
      service: toAppointmentServiceView(a),
    });
  }
  for (const b of blockedSlots) {
    (byDate[b.date] ||= { appointments: [], blockedCount: 0 }).blockedCount += 1;
  }

  return NextResponse.json({ days: byDate });
}
