import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real catalog from the studio (2026-09-01 revision). Prices/durations kept
// from the previous catalog where a service clearly carries over; left null
// (not bookable online yet) for genuinely new services until Bell sets a
// price/duration from /admin/servicos.
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
    slug: 'blindagem-unhas',
    name: 'Blindagem de unhas naturais',
    description: 'Proteção das unhas naturais com acabamento leve, resistente e de aparência natural.',
    priceCents: null,
    order: 5,
  },
  {
    slug: 'esmaltacao-gel-maos',
    name: 'Esmaltação em gel — mãos',
    description: 'Esmaltação em gel com acabamento uniforme, brilho intenso e maior durabilidade.',
    priceCents: null,
    order: 6,
  },
  {
    slug: 'esmaltacao-gel-pes',
    name: 'Esmaltação em gel — pés',
    description: 'Esmaltação em gel nos pés com acabamento preciso, brilho intenso e maior durabilidade.',
    priceCents: null,
    order: 7,
  },
  {
    slug: 'cuticula-esmaltacao',
    name: 'Cutícula + esmaltação',
    description: 'Cuidado das cutículas com esmaltação e acabamento preciso.',
    priceCents: null,
    order: 8,
  },
  {
    slug: 'nail-design-autoral',
    name: 'Nail design autoral',
    description: 'Criações personalizadas para complementar as unhas com detalhes únicos e delicados.',
    priceCents: null,
    order: 9,
  },
  {
    slug: 'so-mao',
    name: 'Manicure tradicional',
    description: 'Cuidado das mãos e cutículas com esmaltação tradicional e acabamento delicado.',
    priceCents: 3700,
    order: 10,
  },
  {
    slug: 'so-pe',
    name: 'Pedicure tradicional',
    description: 'Cuidado dos pés e cutículas com esmaltação tradicional e acabamento preciso.',
    priceCents: 4200,
    order: 11,
  },
  {
    slug: 'pe-mao-tradicional',
    name: 'Mãos + pés tradicional',
    description: 'Manicure e pedicure tradicional realizados no mesmo atendimento.',
    priceCents: 6500,
    order: 12,
  },
  {
    slug: 'spa-pes',
    name: 'Spa dos pés',
    description: 'Cuidado completo para os pés com renovação, hidratação e acabamento.',
    priceCents: 12000,
    order: 13,
  },
  {
    slug: 'reconstrucao-unha-pe',
    name: 'Reconstrução de unha do pé',
    description: 'Reconstrução estética para recuperar o formato e a aparência natural da unha.',
    priceCents: 2500,
    priceNote: 'cada unha',
    order: 14,
  },
  {
    slug: 'postica-realista',
    name: 'Postiça realista',
    description: 'Alongamento com unhas postiças de aparência natural e acabamento cuidadosamente ajustado.',
    priceCents: 12000,
    order: 15,
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
