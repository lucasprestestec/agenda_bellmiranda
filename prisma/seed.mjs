import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real catalog from the studio (2026-08-30). Durations are not set yet —
// Bell fills those in from /admin before a service becomes bookable online.
const SERVICES = [
  {
    slug: 'alongamento-gel',
    name: 'Alongamento em gel',
    description: 'Estrutura leve e natural, com acabamento espelhado e curva perfeita.',
    priceCents: 18000,
    tags: 'Especialidade',
    order: 0,
  },
  {
    slug: 'manutencao-gel',
    name: 'Manutenção (gel)',
    description: 'Reequilíbrio, blindagem e novo acabamento do alongamento em gel.',
    priceCents: 16000,
    order: 1,
  },
  {
    slug: 'mao',
    name: 'Mão',
    description: 'Cuidado completo para as mãos.',
    priceCents: 8500,
    order: 2,
  },
  {
    slug: 'pe',
    name: 'Pé',
    description: 'Cuidado completo para os pés.',
    priceCents: 9500,
    order: 3,
  },
  {
    slug: 'alongamento-fibra',
    name: 'Alongamento em fibra de vidro',
    description: 'Indicado para quem quer resistência com aparência fininha.',
    priceCents: 20000,
    tags: 'Especialidade',
    order: 4,
  },
  {
    slug: 'manutencao-fibra',
    name: 'Manutenção (fibra)',
    description: 'Reequilíbrio, blindagem e novo acabamento do alongamento em fibra.',
    priceCents: 16000,
    order: 5,
  },
  {
    slug: 'banho-gel',
    name: 'Banho de gel',
    description: 'Reforço e acabamento espelhado sobre a unha natural.',
    priceCents: 16000,
    order: 6,
  },
  {
    slug: 'reconstrucao-unha-pe',
    name: 'Reconstrução de unha do pé',
    description: 'Reconstrução pontual de unha danificada ou quebrada.',
    priceCents: 2500,
    priceNote: 'cada unha',
    order: 7,
  },
  {
    slug: 'pe-mao-tradicional',
    name: 'Pé e mão tradicional',
    description: 'Cuidado tradicional completo para mãos e pés.',
    priceCents: 6500,
    order: 8,
  },
  {
    slug: 'so-mao',
    name: 'Só mão',
    description: 'Manicure tradicional.',
    priceCents: 3700,
    order: 9,
  },
  {
    slug: 'so-pe',
    name: 'Só pé',
    description: 'Pedicure tradicional.',
    priceCents: 4200,
    order: 10,
  },
  {
    slug: 'spa-pes',
    name: 'Spa dos pés',
    description: 'Esfoliação, hidratação profunda e relaxamento para os pés.',
    priceCents: 12000,
    order: 11,
  },
  {
    slug: 'postica-realista',
    name: 'Postiça realista',
    description: 'Unha postiça com acabamento natural e realista.',
    priceCents: 12000,
    order: 12,
  },
];

async function main() {
  const keepSlugs = SERVICES.map((s) => s.slug);

  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: { ...service, active: true },
      update: { ...service, active: true },
    });
  }

  // Retire any previous catalog entries not in this list (deactivate, not
  // delete, so past appointments keep their service reference intact).
  const retired = await prisma.service.updateMany({
    where: { slug: { notIn: keepSlugs } },
    data: { active: false },
  });

  console.log(`Seeded ${SERVICES.length} services. Retired ${retired.count} old ones.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
