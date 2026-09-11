// Category, not staff — "Unhas" includes both Bell's and Carol's services.
// Keeping this in one place instead of guessing per-screen keeps the client
// app and /agendar/servicos showing the same grouping for the same catalog.
const CATEGORY_ORDER = ['Unhas', 'Sobrancelha', 'Depilação'];

export function categorizeService(service) {
  const key = `${service.slug || ''} ${service.name || ''}`.toLowerCase();
  if (key.includes('sobrancelha')) return 'Sobrancelha';
  if (key.includes('depila')) return 'Depilação';
  return 'Unhas';
}

export function groupByCategory(services) {
  const groups = new Map(CATEGORY_ORDER.map((c) => [c, []]));
  for (const s of services) {
    const cat = categorizeService(s);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(s);
  }
  return CATEGORY_ORDER
    .map((c) => ({ category: c, items: groups.get(c) || [] }))
    .filter((g) => g.items.length > 0);
}
