import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { APPOINTMENT_STATUS } from '../../../../../lib/studio';

export async function PATCH(request, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const status = body.status;
  if (!Object.values(APPOINTMENT_STATUS).includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }

  const appointment = await prisma.appointment.update({ where: { id }, data: { status } }).catch(() => null);
  if (!appointment) return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });

  return NextResponse.json({ appointment });
}
