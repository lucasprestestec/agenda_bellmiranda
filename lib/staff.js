import { prisma } from './prisma';

// Cycled in staff order — see the matching --staff-N tokens in
// app/tokens/colors.css. Four is enough headroom past today's 3 people;
// a 5th would just repeat the cycle rather than break.
const PALETTE = [
  { accent: 'var(--staff-1)', soft: 'var(--staff-1-soft)' },
  { accent: 'var(--staff-2)', soft: 'var(--staff-2-soft)' },
  { accent: 'var(--staff-3)', soft: 'var(--staff-3-soft)' },
  { accent: 'var(--staff-4)', soft: 'var(--staff-4-soft)' },
];

// One row per distinct professional currently assigned to an active,
// bookable service — drives the Bell/Jessica/Carol/Todos filter in the
// admin agenda and financeiro, without hardcoding names anywhere.
export async function listStaff() {
  const services = await prisma.service.findMany({
    where: { active: true, staffPhone: { not: null } },
    select: { staffName: true, staffPhone: true },
    orderBy: { staffName: 'asc' },
  });

  const seen = new Map();
  for (const s of services) {
    if (!s.staffName || !s.staffPhone) continue;
    if (!seen.has(s.staffPhone)) seen.set(s.staffPhone, s.staffName);
  }

  return Array.from(seen.entries()).map(([staffPhone, staffName], i) => ({
    staffName,
    staffPhone,
    ...PALETTE[i % PALETTE.length],
  }));
}
