import Link from 'next/link';
import { ClientAppShell } from '../../components/client/ClientAppShell';
import { EditorialBanner } from '../../components/client/EditorialBanner';
import { CategorySelector } from '../../components/client/CategorySelector';
import { ServiceHighlightCard } from '../../components/client/ServiceHighlightCard';
import { Icon } from '../../components/core/Icon';
import { listActiveServices } from '../../lib/services';
import { groupByCategory } from '../../lib/serviceCategories';

export const metadata = {
  title: 'Agendar horário — Bell Miranda',
};

export default async function AgendarHomePage() {
  const services = await listActiveServices();
  const bookable = services.filter((s) => s.bookable);
  const grouped = groupByCategory(bookable);
  // One representative per category so the highlight row reflects the whole
  // studio (unhas, sobrancelha, depilação), not just whichever comes first.
  const featured = grouped.map((g) => g.items[0]).filter(Boolean).slice(0, 4);

  return (
    <ClientAppShell greeting={{ title: 'Olá', subtitle: '— que bom ter você aqui' }}>
      <div style={{ padding: '14px 18px 10px' }}>
        <Link href="/agendar/servicos" style={{ border: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', gap: '10px',
          height: '44px', padding: '0 16px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-card)' }}>
          <Icon name="search" size={15} color="var(--text-muted)" />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Buscar serviços…</span>
        </Link>
      </div>

      {grouped.length > 0 && (
        <div style={{ padding: '2px 18px 4px' }}>
          <CategorySelector categories={grouped} />
        </div>
      )}

      <div style={{ padding: '12px 18px' }}>
        <EditorialBanner />
      </div>

      {featured.length > 0 && (
        <div style={{ padding: '16px 0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 18px 12px' }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.0625rem', color: 'var(--ink-900)' }}>Serviços em destaque</h2>
            <Link href="/agendar/servicos" style={{ border: 0, fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--champagne-600)' }}>Ver todos</Link>
          </div>
          {/* Fade-out mask on the right edge turns the next card's partial
              visibility into a deliberate "there's more, swipe" cue instead
              of content that just looks cut off mid-scroll. */}
          <div className="bm-scroller" style={{ display: 'flex', gap: '12px', padding: '0 18px',
            WebkitMaskImage: 'linear-gradient(to right, black 92%, transparent 100%)',
            maskImage: 'linear-gradient(to right, black 92%, transparent 100%)' }}>
            {featured.map((s, i) => <ServiceHighlightCard key={s.slug} service={s} index={i} />)}
          </div>
        </div>
      )}

      <div style={{ margin: '18px 18px 4px', paddingTop: '16px', borderTop: '1px solid var(--border-hairline)',
        display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon name="message-circle" size={14} color="var(--champagne-600)" />
        <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: '0.75rem', lineHeight: 1.5, color: 'var(--ink-500)' }}>
          Confirmação e lembrete chegam no seu WhatsApp.
        </span>
        <Link href="/reservar" style={{ border: 0, flexShrink: 0, fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--cocoa-800)' }}>Agendar</Link>
      </div>
    </ClientAppShell>
  );
}
