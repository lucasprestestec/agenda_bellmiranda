import { NextResponse } from 'next/server';
import { listStaff } from '../../../../lib/staff';

// Auth is enforced by proxy.js for the whole /api/admin/* prefix.
export async function GET() {
  const staff = await listStaff();
  return NextResponse.json({ staff });
}
