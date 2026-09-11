'use client';

import Link from 'next/link';
import { Icon } from '../core/Icon';

// Product-card treatment: price sits on the photo (like a catalog card),
// name carries the most weight, duration is a quiet second line. Rotates
// through the 5 real work photos already in app/site.css (.ph-w1..5) — no
// per-service photography exists, so this reuses the studio's real
// portfolio shots rather than inventing per-service images.
export function ServiceHighlightCard({ service, index }) {
  const photoClass = `ph-w${(index % 5) + 1}`;
  return (
    <Link href={`/reservar?servico=${service.slug}`} style={{ border: 0, flex: '0 0 auto', width: '156px',
      display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span className={`ph ${photoClass}`} style={{ position: 'relative', display: 'block', width: '100%',
        aspectRatio: '4/5', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', inset: '0', background: 'linear-gradient(0deg, rgba(43,31,27,.5) 0%, rgba(43,31,27,0) 38%)' }} />
        <span style={{ position: 'absolute', left: '9px', bottom: '9px', padding: '5px 10px', borderRadius: 'var(--radius-pill)',
          background: 'rgba(250,247,243,.94)',
          fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--espresso-900)' }}>
          {service.priceNote ? 'Desde ' : ''}{service.price}
        </span>
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700,
          color: 'var(--ink-900)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.name}</span>
        {service.duration && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)', fontSize: '0.6875rem' }}>
            <Icon name="clock" size={10} /> {service.duration}
          </span>
        )}
      </span>
    </Link>
  );
}
