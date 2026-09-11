import { NextResponse } from 'next/server';
import { getClientHistory } from '../../../../../lib/clients';

// Auth is enforced by proxy.js for the whole /api/admin/* prefix.
export async function GET(request, { params }) {
  const { phone } = await params;
  const client = await getClientHistory(decodeURIComponent(phone));
  if (!client) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
  return NextResponse.json({ client });
}
