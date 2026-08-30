'use client';

import { useRouter } from 'next/navigation';
import { Logo } from '../core/Logo';
import { IconButton } from '../core/IconButton';
import { Icon } from '../core/Icon';
import { SITE } from '../../lib/site-config';

export function MobileBookingShell({ children }) {
  const router = useRouter();
  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', background: 'var(--surface-page)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(250,247,243,.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-hairline)', height: '64px', padding: '0 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton label="Voltar" variant="bare" size={40} onClick={() => router.push('/')}>
          <Icon name="arrow-left" size={18} />
        </IconButton>
        <Logo size={0.42} descriptor={false} />
        <IconButton label="WhatsApp" variant="soft" size={40} onClick={() => window.open(SITE.whatsappHref, '_blank')}>
          <Icon name="message-circle" size={16} />
        </IconButton>
      </header>
      {children}
      <footer style={{ padding: '8px 18px 40px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--text-muted)' }}>{SITE.address} — Tatuí, SP</span>
      </footer>
    </div>
  );
}
