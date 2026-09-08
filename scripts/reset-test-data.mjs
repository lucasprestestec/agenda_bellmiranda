import { PrismaClient } from '@prisma/client';

// Clears out test appointments/blocked slots before going live for real.
// Never touches Service (the real catalog, including staffName/staffPhone).
//
// Usage (run against whatever DATABASE_URL is set in your shell):
//   node scripts/reset-test-data.mjs            -> lists what's in the DB, deletes nothing
//   node scripts/reset-test-data.mjs --confirm   -> deletes all Appointment + BlockedSlot rows

const prisma = new PrismaClient();

async function main() {
  const confirm = process.argv.includes('--confirm');

  const appointments = await prisma.appointment.findMany({
    include: { service: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
  const blockedSlots = await prisma.blockedSlot.findMany({ orderBy: { date: 'asc' } });

  console.log(`\nAppointments (${appointments.length}):`);
  for (const a of appointments) {
    const serviceName = a.service?.name || a.customServiceName || '(sem serviço)';
    console.log(`  ${a.date} ${a.startTime} — ${a.clientName} (${a.clientPhone || 'sem telefone'}) — ${serviceName} — ${a.status}`);
  }

  console.log(`\nBlockedSlots (${blockedSlots.length}):`);
  for (const b of blockedSlots) {
    console.log(`  ${b.date} ${b.startTime}-${b.endTime}${b.staffPhone ? ` (staff: ${b.staffPhone})` : ' (estúdio todo)'}`);
  }

  if (!confirm) {
    console.log('\nNada foi apagado. Confira a lista acima — se estiver tudo certo, rode de novo com --confirm.');
    return;
  }

  const deletedAppointments = await prisma.appointment.deleteMany({});
  const deletedBlocked = await prisma.blockedSlot.deleteMany({});
  console.log(`\nApagados: ${deletedAppointments.count} agendamentos, ${deletedBlocked.count} bloqueios.`);
  console.log('Catálogo de serviços (Service) não foi tocado.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
