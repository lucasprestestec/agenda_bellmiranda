'use client';

import Link from 'next/link';
import { Icon } from '../core/Icon';
import { ServiceImage } from './ServiceImage';

// Product-card treatment: price sits on the photo (like a catalog card),
// name carries the most weight, duration is a quiet second line.
export function ServiceHighlightCard({ service }) {
  return (
    <Link href={`/reservar?servico=${service.slug}`} style={{ border: 0, flex: '0 0 auto', width: '150px',
      display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <ServiceImage service={service} ratio="4/5" sizes="150px" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <span style={{ position: 'absolute', inset: '0', background: 'linear-gradient(0deg, rgba(43,31,27,.55) 0%, rgba(43,31,27,0) 42%)' }} />
        <span style={{ position: 'absolute', left: '9px', bottom: '9px', padding: '5px 10px', borderRadius: 'var(--radius-pill)',
          background: 'rgba(250,247,243,.94)',
          fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--espresso-900)' }}>
          {service.priceNote ? 'Desde ' : ''}{service.price}
        </span>
        <span aria-hidden="true" style={{ position: 'absolute', right: '9px', bottom: '9px', width: '26px', height: '26px',
          borderRadius: '50%', background: 'var(--espresso-900)', color: 'var(--ivory-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={14} />
        </span>
      </ServiceImage>
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
