import { prisma } from './prisma';
import { formatDuration, formatPriceCents } from './studio';

export async function listActiveServices() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });
  return services.map(toServiceView);
}

export async function listAllServices() {
  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
  return services.map(toServiceView);
}

export async function getServiceBySlug(slug) {
  const service = await prisma.service.findUnique({ where: { slug } });
  return service && service.active ? service : null;
}

// Appointments reference either a catalog Service (serviceId set) or carry
// their own one-off custom* fields (serviceId null) — this normalizes both
// into the same shape for display.
export function toAppointmentServiceView(appointment) {
  if (appointment.serviceId && appointment.service) {
    return { ...toServiceView(appointment.service), adhoc: false };
  }
  return {
    id: null,
    slug: null,
    name: appointment.customServiceName || 'Serviço avulso',
    description: null,
    durationMin: appointment.customDurationMin,
    duration: formatDuration(appointment.customDurationMin),
    bookable: true,
    price: formatPriceCents(appointment.customPriceCents || 0),
    priceCents: appointment.customPriceCents || 0,
    priceNote: null,
    tags: [],
    adhoc: true,
  };
}

export function toServiceView(service) {
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    description: service.description,
    durationMin: service.durationMin,
    duration: formatDuration(service.durationMin),
    bookable: service.durationMin != null,
    price: formatPriceCents(service.priceCents),
    priceCents: service.priceCents,
    priceNote: service.priceNote || null,
    tags: service.tags ? service.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    active: service.active,
    order: service.order,
  };
}
