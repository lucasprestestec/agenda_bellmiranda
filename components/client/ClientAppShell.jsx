'use client';

import Link from 'next/link';
import { Logo } from '../core/Logo';
import { IconButton } from '../core/IconButton';
import { Icon } from '../core/Icon';
import { ClientBottomNav } from './ClientBottomNav';
import { SITE } from '../../lib/site-config';

// The client-facing agenda's own shell — separate from the institutional
// site's Header (no full nav, no "Agendar" CTA, since booking already is
// the point of everything under here). Phone-width column even on desktop,
// same idea as MobileBookingShell, so it keeps reading as one app.
//
// `greeting` (optional) renders inside the same header block as the
// logo/action row — one composed unit, not a nav bar followed by a
// separate text paragraph — used only by the Home screen.
export function ClientAppShell({ children, greeting }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', background: 'var(--surface-page)',
        position: 'relative', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(250,247,243,.94)', backdropFilter: 'blur(10px)',
          padding: greeting ? '12px 14px 12px 18px' : '0 14px 0 18px', height: greeting ? undefined : '52px',
          display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ border: 0 }}>
              <Logo size={0.36} align="left" descriptor={false} />
            </Link>
            <IconButton label="Falar no WhatsApp" variant="bare" size={34} onClick={() => window.open(SITE.whatsappHref, '_blank')}>
              <Icon name="message-circle" size={16} />
            </IconButton>
          </div>
          {greeting && (
            <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.1875rem',
              lineHeight: 1.25, color: 'var(--ink-900)' }}>
              {greeting.title} <span style={{ color: 'var(--ink-500)', fontSize: '0.85em' }}>{greeting.subtitle}</span>
            </h1>
          )}
        </header>
        {children}
        <ClientBottomNav />
      </div>
    </div>
  );
}
