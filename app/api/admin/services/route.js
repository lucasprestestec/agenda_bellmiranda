import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { slugify } from '../../../../lib/studio';
import { listAllServices } from '../../../../lib/services';

export async function GET() {
  const services = await listAllServices();
  return NextResponse.json({ services });
}

async function uniqueSlug(base) {
  let slug = base;
  let n = 2;
  while (await prisma.service.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const name = String(body.name || '').trim().slice(0, 120);
  if (!name) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });

  const description = String(body.description || '').trim().slice(0, 600);

  let priceCents = null;
  if (body.priceCents !== null && body.priceCents !== undefined && body.priceCents !== '') {
    priceCents = Math.max(0, Math.round(Number(body.priceCents)));
    if (!Number.isFinite(priceCents)) return NextResponse.json({ error: 'Preço inválido.' }, { status: 400 });
  }

  const durationMin = body.durationMin === null || body.durationMin === undefined || body.durationMin === ''
    ? null
    : Math.max(5, Math.round(Number(body.durationMin)));
  const priceNote = body.priceNote ? String(body.priceNote).trim().slice(0, 80) : null;
  const tags = body.tags ? String(body.tags).trim().slice(0, 200) : null;
  const order = Number.isFinite(body.order) ? Math.round(body.order) : 0;

  const slug = await uniqueSlug(slugify(body.slug || name));

  const service = await prisma.service.create({
    data: { slug, name, description, priceCents, durationMin, priceNote, tags, order, active: true },
  });

  return NextResponse.json({ service }, { status: 201 });
}
