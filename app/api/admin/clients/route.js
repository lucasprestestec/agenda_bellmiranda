import { NextResponse } from 'next/server';
import { listClients } from '../../../../lib/clients';

// Auth is enforced by proxy.js for the whole /api/admin/* prefix.
export async function GET() {
  const clients = await listClients();
  return NextResponse.json({ clients });
}
