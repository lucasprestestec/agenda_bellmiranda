'use client';

import { useRouter } from 'next/navigation';
import { useMobile } from '../../lib/useMobile';

function PriceBlock({ duration, price, bookable }) {
  const [cur, val] = price ? price.split(/\s+/) : [null, null];
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', whiteSpace: 'nowrap' }}>
      {duration && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-500)' }}>{duration}</span>}
      {duration && <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--taupe-500)' }}></span>}
      {!bookable && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--champagne-600)', border: '1px solid var(--champagne-500)',
          borderRadius: '999px', padding: '3px 9px' }}>Em breve</span>
      )}
      {price ? (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1rem', color: 'var(--champagne-600)' }}>{cur}</span>
          <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: 'clamp(1.9rem,2.6vw,2.5rem)',
            fontWeight: 300, lineHeight: 1, color: 'var(--champagne-600)' }}>{val}</span>
        </span>
      ) : (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-500)' }}>Consulte o valor</span>
      )}
    </div>
  );
}

function ServiceLine({ index, name, description, duration, price, bookable, last, onSelect }) {
  return (
    <div onClick={bookable ? onSelect : undefined}
      style={{ display: 'grid', gridTemplateColumns: '62px 1fr auto', alignItems: 'start',
        gap: '0 clamp(12px,2vw,28px)', padding: 'clamp(24px,2.6vw,34px) 0', cursor: bookable ? 'pointer' : 'default',
        borderBottom: last ? 'none' : '1px solid var(--border-hairline)' }}>
      <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.25rem', color: 'var(--champagne-500)',
        paddingTop: '6px', letterSpacing: '0.02em' }}>{index}</span>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400,
          fontSize: 'clamp(1.45rem,2vw,1.85rem)', lineHeight: 1.2, color: 'var(--ink-900)' }}>{name}</h3>
        <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', lineHeight: 1.7,
          color: 'var(--ink-500)', maxWidth: '42ch' }}>{description}</p>
      </div>
      <div style={{ paddingTop: '10px' }}><PriceBlock duration={duration} price={price} bookable={bookable} /></div>
    </div>
  );
}

// Compact mobile card: name + a 2-line taste of the description + price, so
// browsing 13 services doesn't mean scrolling through 13 full write-ups —
// that's what the booking picker's row list is for once you commit to one.
function ServiceCard({ index, name, description, duration, price, bookable, onSelect }) {
  return (
    <div onClick={bookable ? onSelect : undefined}
      style={{ flex: '0 0 auto', width: '74vw', maxWidth: '280px', cursor: bookable ? 'pointer' : 'default',
        background: 'var(--surface-card)', border: '1px solid var(--border-hairline)',
        padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1rem', color: 'var(--champagne-500)' }}>{index}</span>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400,
        fontSize: '1.3125rem', lineHeight: 1.22, color: 'var(--ink-900)' }}>{name}</h3>
      <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--ink-500)',
        display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>{description}</p>
      <span style={{ height: '1px', background: 'var(--border-hairline)', marginTop: 'auto' }}></span>
      <PriceBlock duration={duration} price={price} bookable={bookable} />
    </div>
  );
}

export function ServiceList({ services }) {
  const router = useRouter();
  const m = useMobile();
  const goTo = (slug) => router.push(`/agendar?servico=${slug}`);

  const note = (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px',
      marginTop: m ? '20px' : 0, paddingTop: m ? 0 : '22px', borderTop: m ? 'none' : '1px solid var(--border-hairline)' }}>
      <span style={{ color: 'var(--champagne-500)', fontSize: '13px', lineHeight: 1.6 }}>✦</span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: m ? '9.5px' : '10.5px', fontWeight: 500, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: 'var(--ink-500)', lineHeight: 1.8 }}>Consulte disponibilidade para mais opções personalizadas.</span>
    </div>
  );

  if (m) {
    return (
      <div>
        <div className="bm-scroller" style={{ margin: '0 calc(var(--gutter) * -1)', padding: '2px var(--gutter) 6px' }}>
          {services.map((s, i) => (
            <ServiceCard key={s.slug} index={'0' + (i + 1)} name={s.name} description={s.description}
              duration={s.duration} price={s.price} bookable={s.bookable} onSelect={() => goTo(s.slug)} />
          ))}
        </div>
        {note}
      </div>
    );
  }

  return (
    <div>
      {services.map((s, i) => (
        <ServiceLine key={s.slug} index={'0' + (i + 1)} name={s.name} description={s.description}
          duration={s.duration} price={s.price} bookable={s.bookable} last={i === services.length - 1}
          onSelect={() => goTo(s.slug)} />
      ))}
      {note}
    </div>
  );
}
