import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { toAppointmentServiceView } from '../../../../lib/services';
import { listStaff } from '../../../../lib/staff';
import { dateToISO, APPOINTMENT_STATUS } from '../../../../lib/studio';
import { startOfWeek, addDays } from '../../../../lib/calendar';

// Per-staff earnings for the current week — "realized" means the
// appointment's date has already happened (date <= today); a cancelled
// appointment earned nothing and is excluded entirely. No new data entry:
// this is just Service.priceCents summed over Appointment, same source the
// booking flow already shows the client.
export async function GET() {
  const today = dateToISO(new Date());
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const [staff, appointments] = await Promise.all([
    listStaff(),
    prisma.appointment.findMany({
      where: { date: { gte: weekStart, lte: weekEnd }, status: { not: APPOINTMENT_STATUS.CANCELLED } },
      include: { service: true },
    }),
  ]);

  const byStaff = new Map(staff.map((s) => [s.staffPhone, {
    ...s, realizedCents: 0, realizedCount: 0, pendingCents: 0, byDate: new Map(), breakdown: new Map(),
  }]));

  for (const a of appointments) {
    const staffPhone = a.service?.staffPhone;
    if (!staffPhone || !byStaff.has(staffPhone)) continue;
    const bucket = byStaff.get(staffPhone);
    const view = toAppointmentServiceView(a);
    const cents = view.priceCents || 0;

    if (a.date <= today) {
      bucket.realizedCents += cents;
      bucket.realizedCount += 1;
      bucket.byDate.set(a.date, (bucket.byDate.get(a.date) || 0) + cents);
      const row = bucket.breakdown.get(view.name) || { name: view.name, count: 0, cents: 0 };
      row.count += 1;
      row.cents += cents;
      bucket.breakdown.set(view.name, row);
    } else {
      bucket.pendingCents += cents;
    }
  }

  const result = Array.from(byStaff.values()).map((b) => ({
    staffName: b.staffName,
    staffPhone: b.staffPhone,
    accent: b.accent,
    soft: b.soft,
    realizedCents: b.realizedCents,
    realizedCount: b.realizedCount,
    pendingCents: b.pendingCents,
    days: weekDays.map((date) => ({ date, cents: b.byDate.get(date) || 0 })),
    breakdown: Array.from(b.breakdown.values()).sort((x, y) => y.cents - x.cents),
  }));

  const pendingTotalCents = result.reduce((sum, b) => sum + b.pendingCents, 0);

  return NextResponse.json({ weekStart, weekEnd, today, staff: result, pendingTotalCents });
}
