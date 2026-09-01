import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Official catalog (2026-09-01, final revision) — exactly these 13 services.
// Durations are kept from whatever the service already had (the field is
// simply omitted below) until Bell sets them from /admin/servicos. This
// script only ever upserts these — it never deletes or deactivates
// anything else, so a service added later through /admin/servicos, or a
// real appointment, is never touched by a future deploy.
const SERVICES = [
  {
    slug: 'alongamento-gel',
    name: 'Alongamento em gel',
    description: 'Estrutura leve e resistente, com formato personalizado e acabamento natural.',
    priceCents: 18000,
    tags: 'Especialidade',
    order: 0,
  },
  {
    slug: 'alongamento-fibra',
    name: 'Alongamento com fibra de vidro',
    description: 'Alongamento com estrutura em fibra para maior resistência, leveza e naturalidade.',
    priceCents: 20000,
    tags: 'Especialidade',
    order: 1,
  },
  {
    slug: 'manutencao-gel',
    name: 'Manutenção de alongamento em gel',
    description: 'Manutenção da estrutura, correção do crescimento e renovação completa do acabamento.',
    priceCents: 16000,
    order: 2,
  },
  {
    slug: 'manutencao-fibra',
    name: 'Manutenção de fibra de vidro',
    description: 'Reposição do crescimento e manutenção da estrutura em fibra, preservando formato e resistência.',
    priceCents: 16000,
    order: 3,
  },
  {
    slug: 'banho-gel',
    name: 'Banho de gel',
    description: 'Camada de gel sobre as unhas naturais para reforçar, nivelar e proporcionar maior durabilidade.',
    priceCents: 16000,
    order: 4,
  },
  {
    slug: 'esmaltacao-gel-maos',
    name: 'Esmaltação em gel — mãos',
    description: 'Esmaltação em gel com acabamento uniforme, brilho intenso e maior durabilidade.',
    priceCents: 8500,
    order: 5,
  },
  {
    slug: 'esmaltacao-gel-pes',
    name: 'Esmaltação em gel — pés',
    description: 'Esmaltação em gel nos pés com acabamento preciso, brilho intenso e maior durabilidade.',
    priceCents: 9500,
    order: 6,
  },
  {
    slug: 'postica-realista',
    name: 'Postiça realista',
    description: 'Alongamento com unhas postiças de aparência natural e acabamento cuidadosamente ajustado.',
    priceCents: 12000,
    order: 7,
  },
  {
    slug: 'so-mao',
    name: 'Manicure tradicional',
    description: 'Cuidado das mãos e cutículas com esmaltação tradicional e acabamento delicado.',
    priceCents: 3700,
    order: 8,
  },
  {
    slug: 'so-pe',
    name: 'Pedicure tradicional',
    description: 'Cuidado dos pés e cutículas com esmaltação tradicional e acabamento preciso.',
    priceCents: 4200,
    order: 9,
  },
  {
    slug: 'pe-mao-tradicional',
    name: 'Mãos + pés tradicional',
    description: 'Manicure e pedicure tradicional realizados no mesmo atendimento.',
    priceCents: 6500,
    order: 10,
  },
  {
    slug: 'spa-pes',
    name: 'Spa dos pés',
    description: 'Cuidado completo para os pés com renovação, hidratação e acabamento.',
    priceCents: 12000,
    order: 11,
  },
  {
    slug: 'reconstrucao-unha-pe',
    name: 'Reconstrução de unha do pé',
    description: 'Reconstrução estética para recuperar o formato e a aparência natural da unha.',
    priceCents: 2500,
    priceNote: 'cada unha',
    order: 12,
  },
];

async function main() {
  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: { ...service, active: true },
      update: { ...service, active: true },
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
