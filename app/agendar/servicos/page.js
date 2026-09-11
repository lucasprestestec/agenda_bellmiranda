import Link from 'next/link';
import { ClientAppShell } from '../../../components/client/ClientAppShell';
import { Icon } from '../../../components/core/Icon';
import { listActiveServices } from '../../../lib/services';
import { groupByCategory } from '../../../lib/serviceCategories';
import { slugify } from '../../../lib/studio';

export const metadata = {
  title: 'Serviços — Bell Miranda',
};

export default async function ServicosPage() {
  const services = await listActiveServices();
  const grouped = groupByCategory(services.filter((s) => s.bookable));

  return (
    <ClientAppShell>
      <div style={{ padding: '20px 18px 4px' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.25rem', color: 'var(--ink-900)' }}>Serviços</h1>
      </div>

      {grouped.map(({ category, items }) => (
        <div key={category} id={slugify(category)} style={{ padding: '18px 18px 4px' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--champagne-600)' }}>{category}</span>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {items.map((s, i) => (
              <Link key={s.slug} href={`/reservar?servico=${s.slug}`} style={{ border: 0, display: 'flex', alignItems: 'center',
                gap: '12px', padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-900)' }}>{s.name}</span>
                  {s.duration && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', color: 'var(--text-muted)',
                      fontFamily: 'var(--font-sans)', fontSize: '0.75rem' }}>
                      <Icon name="clock" size={11} /> {s.duration}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--cocoa-800)', whiteSpace: 'nowrap' }}>
                  {s.priceNote ? 'A partir de ' : ''}{s.price}
                </span>
                <Icon name="chevron-right" size={16} color="var(--taupe-500)" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </ClientAppShell>
  );
}
