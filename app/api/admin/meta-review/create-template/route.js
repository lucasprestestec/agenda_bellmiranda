import { NextResponse } from 'next/server';
import { createTestTemplate } from '../../../../../lib/meta-review';

// TEMPORARY — Meta App Review evidence only. See lib/meta-review.js.
// Auth is enforced by proxy.js for the whole /api/admin/* prefix.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }
  const name = String(body.name || '').trim();
  const language = String(body.language || 'pt_BR').trim();
  const text = String(body.body || '').trim();
  if (!name || !text) return NextResponse.json({ error: 'Preencha nome e texto do modelo.' }, { status: 400 });

  const result = await createTestTemplate({ name, language, body: text });
  if (!result.ok) return NextResponse.json({ error: result.error, raw: result.raw }, { status: result.status || 500 });
  return NextResponse.json({ ok: true, data: result.data });
}
