'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '../core/Logo';
import { Button } from '../core/Button';
import { Icon } from '../core/Icon';

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header style={{ borderBottom: '1px solid var(--border-hairline)', padding: '18px var(--gutter)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(20px,3vw,40px)' }}>
        <Logo size={0.5} align="left" descriptor={false} />
        <nav style={{ display: 'flex', gap: '22px' }}>
          <Link href="/admin" style={{ border: 0, fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: pathname === '/admin' ? 'var(--cocoa-800)' : 'var(--ink-500)',
            borderBottom: '1px solid ' + (pathname === '/admin' ? 'var(--rose-500)' : 'transparent'), paddingBottom: '3px' }}>Agenda</Link>
          <Link href="/admin/servicos" style={{ border: 0, fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: pathname === '/admin/servicos' ? 'var(--cocoa-800)' : 'var(--ink-500)',
            borderBottom: '1px solid ' + (pathname === '/admin/servicos' ? 'var(--rose-500)' : 'transparent'), paddingBottom: '3px' }}>Serviços</Link>
        </nav>
      </div>
      <Button variant="ghost" onClick={logout} iconRight={<Icon name="log-out" size={15} />}>Sair</Button>
    </header>
  );
}
