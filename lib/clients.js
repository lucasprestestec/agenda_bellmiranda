import { prisma } from './prisma';
import { toE164 } from './phone';

// There's no separate Client table — every appointment already carries the
// client's name and phone at booking time (Appointment.clientName/
// clientPhone), so "client history" is derived by grouping existing
// appointments by phone rather than introducing a new entity to keep in
// sync. Phones are grouped on their E164-normalized form (see lib/phone.js)
// so the same person typed as "(15) 99999-8888" and "15999998888" merges
// into one client instead of showing up twice.

function serviceLabel(a) {
  return a.service ? a.service.name : (a.customServiceName || 'Serviço avulso');
}

function priceCentsOf(a) {
  return a.service ? a.service.priceCents : a.customPriceCents;
}

// One row per distinct client, most recently seen first. Appointments with
// no phone on file (blank clientPhone, allowed for quick ad-hoc admin
// entries) aren't a trackable client and are left out of this list.
export async function listClients() {
  const appointments = await prisma.appointment.findMany({
    where: { clientPhone: { not: '' } },
    select: { clientName: true, clientPhone: true, date: true, status: true },
    orderBy: { date: 'desc' },
  });

  const byPhone = new Map();
  for (const a of appointments) {
    const key = toE164(a.clientPhone);
    if (!key) continue;
    let c = byPhone.get(key);
    if (!c) {
      // First row seen for this phone, in date-desc order, so this is also
      // the client's most recent name and visit.
      c = { phone: key, rawPhone: a.clientPhone, name: a.clientName || 'Sem nome', lastVisit: a.date, count: 0, activeCount: 0 };
      byPhone.set(key, c);
    }
    c.count += 1;
    if (a.status !== 'CANCELLED') c.activeCount += 1;
  }

  return Array.from(byPhone.values()).sort((a, b) => (a.lastVisit < b.lastVisit ? 1 : -1));
}

// Full appointment history for one client (all statuses, most recent
// first) — matched by normalized phone since the same client may have been
// typed slightly differently across visits.
export async function getClientHistory(phone) {
  const target = toE164(phone);
  if (!target) return null;

  const appointments = await prisma.appointment.findMany({
    where: { clientPhone: { not: '' } },
    include: { service: true },
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
  });

  const mine = appointments.filter((a) => toE164(a.clientPhone) === target);
  if (mine.length === 0) return null;

  return {
    phone: target,
    name: mine[0].clientName || 'Sem nome',
    appointments: mine.map((a) => ({
      id: a.id,
      date: a.date,
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
      serviceName: serviceLabel(a),
      priceCents: priceCentsOf(a),
      note: a.note,
    })),
  };
}
