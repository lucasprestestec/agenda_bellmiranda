import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Placeholder catalog — from the design kit's Services.jsx (source of truth).
// Real prices/durations to be confirmed by the studio; see project/readme.md.
const SERVICES = [
  {
    slug: 'cuticula-esmaltacao',
    name: 'Cutícula + esmaltação',
    description: 'Higienização, cutícula feita com cuidado e esmalte da sua escolha.',
    durationMin: 70,
    priceCents: 9000,
    tags: 'Especialidade',
    order: 0,
  },
  {
    slug: 'alongamento-gel',
    name: 'Alongamento em gel',
    description: 'Estrutura leve e natural, com acabamento espelhado e curva perfeita.',
    durationMin: 150,
    priceCents: 18000,
    tags: 'Especialidade',
    order: 1,
  },
  {
    slug: 'alongamento-fibra',
    name: 'Alongamento em fibra de vidro',
    description: 'Indicado para quem quer resistência com aparência fininha.',
    durationMin: 165,
    priceCents: 19000,
    order: 2,
  },
  {
    slug: 'manutencao-alongamento',
    name: 'Manutenção de alongamento',
    description: 'Reequilíbrio, blindagem e novo acabamento.',
    durationMin: 120,
    priceCents: 13000,
    priceNote: 'a cada 3 semanas',
    order: 3,
  },
  {
    slug: 'nail-design-autoral',
    name: 'Nail design autoral',
    description: 'Desenho feito à mão, combinado com você antes de começar.',
    durationMin: 40,
    priceCents: 4500,
    priceNote: 'a partir de',
    order: 4,
  },
  {
    slug: 'blindagem-unhas-naturais',
    name: 'Blindagem de unhas naturais',
    description: 'Para fortalecer sem alongar.',
    durationMin: 60,
    priceCents: 11000,
    order: 5,
  },
];

async function main() {
  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: service,
      update: service,
    });
  }
  console.log(`Seeded ${SERVICES.length} services.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
