'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminAppShell } from '../../../components/admin/AdminAppShell';
import { Icon } from '../../../components/core/Icon';

const ITEMS = [
  { href: '/admin/servicos', label: 'Serviços', hint: 'Catálogo, preços e quem atende cada um', icon: 'sparkles' },
];

export default function AdminMaisPage() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <AdminAppShell>
      <div style={{ padding: '18px 18px 0' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.375rem', color: 'var(--ink-900)' }}>Mais</h1>
      </div>
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {ITEMS.map((item) => (
          <Link key={item.href} href={item.href} style={{ border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)',
            padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
            <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--nude-300)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-600)', flexShrink: 0 }}>
              <Icon name={item.icon} size={18} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink-900)' }}>{item.label}</span>
              <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.hint}</span>
            </span>
            <Icon name="chevron-right" size={16} color="var(--taupe-500)" />
          </Link>
        ))}
        <button onClick={logout} style={{ border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)',
          padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--nude-300)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-500)', flexShrink: 0 }}>
            <Icon name="log-out" size={18} />
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink-900)' }}>Sair</span>
        </button>
      </div>
    </AdminAppShell>
  );
}
