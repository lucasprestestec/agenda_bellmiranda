import { NextResponse } from 'next/server';
import { getServiceBySlug } from '../../../lib/services';
import { listAvailableDays } from '../../../lib/availability';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('servico');
  const from = searchParams.get('from') || undefined;

  const service = await getServiceBySlug(slug);
  if (!service) return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
  if (service.durationMin == null || service.priceCents == null) {
    return NextResponse.json({ error: 'Serviço ainda não está disponível para agendamento online.' }, { status: 409 });
  }

  const days = await listAvailableDays({ durationMin: service.durationMin, from, count: 14 });
  return NextResponse.json({ days });
}
