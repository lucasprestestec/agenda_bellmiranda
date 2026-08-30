import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { toMinutes } from '../../../../lib/studio';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const { date, startTime, endTime } = body;
  const reason = body.reason ? String(body.reason).trim().slice(0, 200) : null;

  if (!DATE_RE.test(date || '') || !TIME_RE.test(startTime || '') || !TIME_RE.test(endTime || '')) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    return NextResponse.json({ error: 'O horário final deve ser depois do inicial.' }, { status: 400 });
  }

  const blocked = await prisma.blockedSlot.create({ data: { date, startTime, endTime, reason } });
  return NextResponse.json({ blockedSlot: blocked }, { status: 201 });
}
