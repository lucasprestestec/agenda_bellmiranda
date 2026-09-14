'use client';

import Link from 'next/link';
import { Icon } from '../core/Icon';

// Reuses the .ph-hero background-image class already declared in
// app/site.css (photo-hero-hands.png) — the same moody, warm-lit photo
// used on the institutional site's own hero, so this reads as the same
// studio rather than a different photoshoot. No new image reference, no
// inline url().
export function EditorialBanner() {
  return (
    <Link href="/reservar" className="ph ph-hero" style={{ border: 0, display: 'block', position: 'relative',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: '210px', padding: '24px', boxShadow: 'var(--shadow-image)' }}>
      <span style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(195deg, rgba(43,31,27,.08) 20%, rgba(43,31,27,.88) 92%)' }} />
      <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end', gap: '16px' }}>
        <span style={{ fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: '1.875rem', lineHeight: 1.12, color: 'var(--ivory-100)' }}>
          Sua beleza,<br />no seu tempo.
        </span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', lineHeight: 1.5, color: 'rgba(250,247,243,.82)', maxWidth: '30ch' }}>
          Agende seus serviços de forma rápida e prática.
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start',
          background: 'var(--ivory-100)', color: 'var(--espresso-900)', padding: '12px 20px', borderRadius: 'var(--radius-pill)',
          fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Agendar agora <Icon name="arrow-right" size={13} />
        </span>
      </span>
    </Link>
  );
}
