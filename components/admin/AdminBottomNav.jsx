'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '../core/Icon';

const ITEMS = [
  { href: '/admin', label: 'Hoje', icon: 'home' },
  { href: '/admin/agenda', label: 'Agenda', icon: 'calendar-days' },
  { href: '/admin/clientes', label: 'Clientes', icon: 'users' },
  { href: '/admin/financeiro', label: 'Financeiro', icon: 'wallet' },
  { href: '/admin/mais', label: 'Mais', icon: 'more-horizontal' },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  return (
    <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30,
      background: 'rgba(250,247,243,.96)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border-hairline)',
      display: 'flex', padding: '6px 6px calc(env(safe-area-inset-bottom))' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', width: '100%' }}>
        {ITEMS.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{ border: 0, flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '6px 2px', minHeight: '50px' }}>
              <span style={{ width: '44px', height: '26px', borderRadius: 'var(--radius-pill)',
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
      </div>
    </nav>
  );
}
