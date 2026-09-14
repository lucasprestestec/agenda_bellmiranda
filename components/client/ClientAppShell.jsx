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
          padding: greeting ? '16px 14px 18px 18px' : '0 14px 0 18px', height: greeting ? undefined : '52px',
          display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ border: 0 }}>
              <Logo size={0.36} align="left" descriptor={false} />
            </Link>
            <IconButton label="Falar no WhatsApp" variant="bare" size={38} onClick={() => window.open(SITE.whatsappHref, '_blank')}
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border-hairline)' }}>
              <Icon name="message-circle" size={16} />
            </IconButton>
          </div>
          {greeting && (
            <div>
              <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-serif-display)',
                fontWeight: 400, fontSize: '1.5rem', lineHeight: 1.2, color: 'var(--ink-900)' }}>
                {greeting.title}
                <Icon name="heart" size={17} color="var(--rose-500)" />
              </h1>
              <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-500)' }}>
                {greeting.subtitle}
              </p>
            </div>
          )}
        </header>
        {children}
        <ClientBottomNav />
      </div>
    </div>
  );
}
