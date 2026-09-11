import { PrismaClient } from '@prisma/client';

// One-off: reassigns the 3 traditional mani/pedi services from Bell to
// Carol, who actually performs them. Safe to re-run (idempotent upsert by
// slug is not needed here — it's a plain update by known slug).
//
// Usage: node scripts/assign-carol.mjs

const CAROL = { staffName: 'Carol', staffPhone: '5515998389776' };
const SLUGS = ['so-mao', 'so-pe', 'pe-mao-tradicional'];

const prisma = new PrismaClient();

async function main() {
  for (const slug of SLUGS) {
    const service = await prisma.service.findUnique({ where: { slug } });
    if (!service) {
      console.log(`(pulando — não encontrado) ${slug}`);
      continue;
    }
    await prisma.service.update({ where: { slug }, data: CAROL });
    console.log(`${service.name}: agora com ${CAROL.staffName} (${CAROL.staffPhone})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
