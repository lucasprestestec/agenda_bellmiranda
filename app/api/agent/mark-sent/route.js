import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { isAuthorizedCronRequest } from '../../../../lib/cron';

const FIELD_BY_TYPE = {
  confirmation: 'confirmationSentAt',
  reminder: 'reminderSentAt',
};

// Called by the external WhatsApp agent once EVERY recipient in an item's
// `recipients` list (client, plus staff if the service has one) has been
// sent successfully via Evolution API — marks it so the next poll of
// GET /api/agent/pending-messages doesn't hand it out again. If only some
// recipients succeeded, don't call this yet — the whole item (all
// recipients) is retried on the next poll rather than tracked per-recipient.
// The daily summary has no per-appointment record, so there's nothing to
// mark for it; the agent is expected to dedupe that one by date on its own
// side.
export async function POST(request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const { appointmentId, type } = body;
  const field = FIELD_BY_TYPE[type];
  if (!appointmentId || !field) {
    return NextResponse.json({ error: 'appointmentId e type ("confirmation" ou "reminder") são obrigatórios.' }, { status: 400 });
  }

  try {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { [field]: new Date() },
    });
  } catch {
    return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
