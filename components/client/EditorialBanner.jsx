'use client';

import Link from 'next/link';
import { Icon } from '../core/Icon';

// Reuses the .ph-booking background-image class already declared in
// app/site.css (photo-booking-hands.png) — no new image reference, no
// inline url(), same convention the institutional site already follows.
export function EditorialBanner() {
  return (
    <Link href="/reservar" className="ph ph-booking" style={{ border: 0, display: 'block', position: 'relative',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: '168px', padding: '22px' }}>
      <span style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(200deg, rgba(43,31,27,.15) 10%, rgba(43,31,27,.82) 90%)' }} />
      <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end', gap: '14px' }}>
        <span style={{ fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: '1.625rem', lineHeight: 1.15, color: 'var(--ivory-100)' }}>
          Sua beleza,<br />no seu tempo.
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start',
          background: 'var(--ivory-100)', color: 'var(--espresso-900)', padding: '11px 18px', borderRadius: 'var(--radius-pill)',
          fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Agendar agora <Icon name="arrow-right" size={13} />
        </span>
      </span>
    </Link>
  );
}
