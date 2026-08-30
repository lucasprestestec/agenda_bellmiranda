import { NextResponse } from 'next/server';
import { verifyPassword, createSessionToken, SESSION_COOKIE, SESSION_TTL_MS } from '../../../../lib/auth';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const password = String(body.password || '');
  const ok = verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);
  if (!ok) return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });

  const token = createSessionToken(process.env.ADMIN_SESSION_SECRET);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return res;
}
