'use client';

import { useRouter } from 'next/navigation';
import { Logo } from '../core/Logo';
import { IconButton } from '../core/IconButton';
import { Icon } from '../core/Icon';
import { SITE } from '../../lib/site-config';

// Focused booking shell — no institutional nav, no bottom nav, back arrow
// returns to the Home app (not the marketing site) so /agendar → /reservar
// reads as staying inside one product. The address footer that used to sit
// below the flow was dropped: it's promotional/institutional content that
// doesn't belong once someone is mid-booking, and it would sit underneath
// BookingFlow's own fixed sticky action bar anyway.
export function MobileBookingShell({ children }) {
  const router = useRouter();
  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', background: 'var(--surface-page)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(250,247,243,.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-hairline)', height: '64px', padding: '0 18px',
        paddingTop: 'env(safe-area-inset-top)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton label="Voltar" variant="bare" size={40} onClick={() => router.push('/agendar')}>
          <Icon name="arrow-left" size={18} />
        </IconButton>
        <Logo size={0.42} descriptor={false} />
        <IconButton label="WhatsApp" variant="soft" size={40} onClick={() => window.open(SITE.whatsappHref, '_blank')}>
          <Icon name="message-circle" size={16} />
        </IconButton>
      </header>
      {children}
    </div>
  );
}
