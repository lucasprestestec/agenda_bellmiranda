import { NextResponse } from 'next/server';
import { getServiceBySlug } from '../../../lib/services';
import { listAvailableDays } from '../../../lib/availability';

const DEFAULT_COUNT = 14;
const MAX_COUNT = 42;

// Additive, backward-compatible: callers that omit `count` (or pass
// something invalid) keep getting the original 14-day behavior. Clamped to
// 42 (a full calendar-month grid) so a caller can't ask for an unbounded
// number of days worth of availability computation.
function parseCount(raw) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return DEFAULT_COUNT;
  return Math.min(n, MAX_COUNT);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('servico');
  const from = searchParams.get('from') || undefined;
  const count = parseCount(searchParams.get('count'));

  const service = await getServiceBySlug(slug);
  if (!service) return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
  if (service.durationMin == null || service.priceCents == null) {
    return NextResponse.json({ error: 'Serviço ainda não está disponível para agendamento online.' }, { status: 409 });
  }

  const days = await listAvailableDays({ durationMin: service.durationMin, from, count, staffPhone: service.staffPhone });
  return NextResponse.json({ days });
}
