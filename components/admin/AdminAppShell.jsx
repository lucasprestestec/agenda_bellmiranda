'use client';

import Link from 'next/link';
import { Logo } from '../core/Logo';
import { Icon } from '../core/Icon';
import { AdminBottomNav } from './AdminBottomNav';

// Replaces AdminHeader's top text-nav with a fixed bottom nav — the admin
// is used mid-shift on a phone, not browsed like a website. Full width
// (unlike the client shell) since the agenda genuinely needs the room on
// larger screens. Logout lives in /admin/mais now, not up here — the header
// is just identity + a way to get to account-level things.
export function AdminAppShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
      <header style={{ padding: '14px var(--gutter) 4px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size={0.36} align="left" descriptor={false} />
        <Link href="/admin/mais" aria-label="Mais" style={{ border: 0, width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--nude-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cocoa-800)' }}>
          <Icon name="user-round" size={15} />
        </Link>
      </header>
      {children}
      <AdminBottomNav />
    </div>
  );
}
