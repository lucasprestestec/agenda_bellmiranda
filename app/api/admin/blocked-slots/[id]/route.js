import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.blockedSlot.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
