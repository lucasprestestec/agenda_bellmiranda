import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function PATCH(request, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const data = {};
  if (typeof body.name === 'string') data.name = body.name.trim().slice(0, 120);
  if (typeof body.description === 'string') data.description = body.description.trim().slice(0, 600);
  if (body.priceCents !== undefined) {
    if (!Number.isFinite(body.priceCents) || body.priceCents < 0) {
      return NextResponse.json({ error: 'Preço inválido.' }, { status: 400 });
    }
    data.priceCents = Math.round(body.priceCents);
  }
  if (body.durationMin !== undefined) {
    data.durationMin = body.durationMin === null || body.durationMin === ''
      ? null
      : Math.max(5, Math.round(Number(body.durationMin)));
  }
  if (body.priceNote !== undefined) data.priceNote = body.priceNote ? String(body.priceNote).trim().slice(0, 80) : null;
  if (body.tags !== undefined) data.tags = body.tags ? String(body.tags).trim().slice(0, 200) : null;
  if (body.order !== undefined && Number.isFinite(body.order)) data.order = Math.round(body.order);
  if (typeof body.active === 'boolean') data.active = body.active;

  const service = await prisma.service.update({ where: { id }, data }).catch(() => null);
  if (!service) return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });

  return NextResponse.json({ service });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const inUse = await prisma.appointment.count({ where: { serviceId: id } });
  if (inUse > 0) {
    // Has booking history — deactivate instead of losing referential history.
    const service = await prisma.service.update({ where: { id }, data: { active: false } }).catch(() => null);
    if (!service) return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
    return NextResponse.json({ service, deactivatedInstead: true });
  }

  await prisma.service.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
