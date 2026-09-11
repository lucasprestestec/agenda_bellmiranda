'use client';

import { useEffect, useState } from 'react';
import { AdminAppShell } from '../../../components/admin/AdminAppShell';
import { useMobile } from '../../../lib/useMobile';
import { formatPriceCents, WEEKDAY_LABELS } from '../../../lib/studio';
import { formatWeekRange, parseISO } from '../../../lib/calendar';

function centsToLabel(cents) {
  return formatPriceCents(cents) || 'R$ 0';
}

export default function FinanceiroPage() {
  const m = useMobile();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/financeiro').then((r) => r.json()).then(setData);
  }, []);

  return (
    <AdminAppShell>
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: m ? '24px var(--gutter) 24px' : '40px var(--gutter) 80px',
        display: 'flex', flexDirection: 'column', gap: m ? '20px' : '28px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Financeiro</span>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: m ? '1.5rem' : '1.9rem', color: 'var(--text-heading)' }}>
            {data ? `Semana de ${formatWeekRange(data.weekStart)}` : 'Carregando…'}
          </h1>
        </div>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--text-muted)',
          background: 'var(--surface-alt)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}>
          Considera só atendimentos já realizados (data de hoje pra trás). Os que ainda vão acontecer nesta semana entram assim que a data passar.
        </div>

        {!data ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando…</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {data.staff.map((s) => (
                <StaffCard key={s.staffPhone} s={s} />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
              padding: '14px 18px', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-alt)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>A receber no resto da semana</span>
              <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.3rem', color: 'var(--text-heading)' }}>{centsToLabel(data.pendingTotalCents)}</span>
            </div>
          </>
        )}
      </main>
    </AdminAppShell>
  );
}

function StaffCard({ s }) {
  const maxCents = Math.max(1, ...s.days.map((d) => d.cents));
  return (
    <div style={{ border: '1px solid var(--border-hairline)', borderTop: `3px solid ${s.accent}`, borderRadius: 'var(--radius-md)',
      background: 'var(--surface-card)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.accent }} />
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontSize: '1.1rem', color: 'var(--text-heading)' }}>{s.staffName}</h3>
      </div>

      <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2rem', fontWeight: 600, color: 'var(--text-heading)' }}>{centsToLabel(s.realizedCents)}</span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {s.realizedCount} atendimento{s.realizedCount === 1 ? '' : 's'} realizado{s.realizedCount === 1 ? '' : 's'}
      </span>

      <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end', height: '48px', marginBottom: '16px' }}>
        {s.days.map((d) => {
          const weekday = parseISO(d.date).getDay();
          return (
            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '100%', height: '40px', background: 'var(--surface-alt)', borderRadius: '4px 4px 2px 2px', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderRadius: '4px 4px 2px 2px',
                  height: `${Math.max(4, Math.round((d.cents / maxCents) * 100))}%`, background: d.cents > 0 ? s.accent : 'transparent' }} />
              </div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{WEEKDAY_LABELS[weekday].charAt(0).toUpperCase()}</span>
            </div>
          );
        })}
      </div>

      {s.breakdown.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {s.breakdown.map((row, i) => (
            <div key={row.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '0.8125rem',
              paddingTop: i === 0 ? 0 : '8px', borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)' }}>
              <span style={{ color: 'var(--text-body)' }}>{row.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>· {row.count}x</span></span>
              <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{centsToLabel(row.cents)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
