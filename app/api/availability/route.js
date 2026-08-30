import { NextResponse } from 'next/server';
import { getServiceBySlug } from '../../../lib/services';
import { listSlotsForDay } from '../../../lib/availability';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('servico');
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'Informe a data.' }, { status: 400 });

  const service = await getServiceBySlug(slug);
  if (!service) return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });

  const slots = await listSlotsForDay({ dateISO: date, durationMin: service.durationMin });
  return NextResponse.json({ slots });
}
