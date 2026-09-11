'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '../core/Icon';

const ITEMS = [
  { href: '/agendar', label: 'Início', icon: 'home' },
  { href: '/agendar/agendamentos', label: 'Agendamentos', icon: 'calendar-days' },
  { href: '/agendar/servicos', label: 'Serviços', icon: 'sparkles' },
  { href: '/agendar/perfil', label: 'Perfil', icon: 'user-round' },
];

export function ClientBottomNav() {
  const pathname = usePathname();
  return (
    <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, maxWidth: '430px', margin: '0 auto',
      background: 'rgba(250,247,243,.96)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border-hairline)',
      display: 'flex', padding: '6px 6px calc(env(safe-area-inset-bottom))' }}>
      {ITEMS.map((item) => {
        const active = item.href === '/agendar' ? pathname === '/agendar' : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} style={{ border: 0, flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '6px 2px', minHeight: '50px' }}>
            <span style={{ width: '40px', height: '26px', borderRadius: 'var(--radius-pill)',
              background: active ? 'var(--blush-400)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: active ? 'var(--cocoa-800)' : 'var(--taupe-500)' }}>
              <Icon name={item.icon} size={18} stroke={active ? 1.6 : 1.25} />
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9.5px', fontWeight: active ? 700 : 500,
              letterSpacing: '0.02em', color: active ? 'var(--cocoa-800)' : 'var(--taupe-500)' }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
