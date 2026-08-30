'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '../../../components/core/Logo';
import { Field } from '../../../components/forms/Field';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/core/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Não foi possível entrar.');
        return;
      }
      router.push('/admin');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-alt)', padding: '24px' }}>
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: '360px', background: 'var(--surface-card)',
        border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: '36px 30px',
        display: 'flex', flexDirection: 'column', gap: '22px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Logo size={0.7} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: '1.75rem', color: 'var(--text-heading)' }}>Agenda</h1>
          <p style={{ margin: '6px 0 0', fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}>Acesso só para a Bell.</p>
        </div>
        <Field label="Senha" htmlFor="admin-pass">
          <Input id="admin-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoFocus />
        </Field>
        {error && <span style={{ color: 'var(--danger-500)', fontSize: 'var(--text-small)' }}>{error}</span>}
        <Button type="submit" fullWidth disabled={!password || loading}>{loading ? 'Entrando…' : 'Entrar'}</Button>
      </form>
    </div>
  );
}
