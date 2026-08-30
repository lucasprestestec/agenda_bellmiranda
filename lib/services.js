import { prisma } from './prisma';
import { formatDuration, formatPriceCents } from './studio';

export async function listActiveServices() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });
  return services.map(toServiceView);
}

export async function getServiceBySlug(slug) {
  const service = await prisma.service.findUnique({ where: { slug } });
  return service && service.active ? service : null;
}

export function toServiceView(service) {
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    description: service.description,
    durationMin: service.durationMin,
    duration: formatDuration(service.durationMin),
    price: formatPriceCents(service.priceCents),
    priceCents: service.priceCents,
    priceNote: service.priceNote || null,
    tags: service.tags ? service.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  };
}
