import { NextResponse } from 'next/server';
import { listActiveServices } from '../../../../lib/services';
import { isAuthorizedCronRequest } from '../../../../lib/cron';
import { samePhone } from '../../../../lib/phone';

// Lets the external chat AI resolve a free-text service name ("depilação
// axila") against the real catalog before creating/editing an appointment
// — scoped to one staff member's own bookable services, same staffPhone
// convention as the other /api/agent/* routes.
export async function GET(request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const staffPhone = searchParams.get('staffPhone') || null;

  const services = await listActiveServices();
  const scoped = services.filter((s) => s.bookable && (!staffPhone || samePhone(s.staffPhone, staffPhone)));

  return NextResponse.json({
    services: scoped.map((s) => ({
      serviceId: s.id,
      name: s.name,
      durationMin: s.durationMin,
      price: s.price,
      staffName: s.staffName,
    })),
  });
}
