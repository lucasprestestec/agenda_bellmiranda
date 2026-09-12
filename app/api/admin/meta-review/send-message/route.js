import { NextResponse } from 'next/server';
import { sendTestMessage } from '../../../../../lib/meta-review';

// TEMPORARY — Meta App Review evidence only. See lib/meta-review.js.
// Auth is enforced by proxy.js for the whole /api/admin/* prefix.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }
  const to = String(body.to || '').trim();
  if (!to) return NextResponse.json({ error: 'Informe o número destinatário.' }, { status: 400 });

  const result = await sendTestMessage(to);
  if (!result.ok) return NextResponse.json({ error: result.error, raw: result.raw }, { status: result.status || 500 });
  return NextResponse.json({ ok: true, data: result.data });
}
