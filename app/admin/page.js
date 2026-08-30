'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '../../components/core/Logo';
import { Button } from '../../components/core/Button';
import { IconButton } from '../../components/core/IconButton';
import { Icon } from '../../components/core/Icon';
import { Surface } from '../../components/core/Surface';
import { Field } from '../../components/forms/Field';
import { Input } from '../../components/forms/Input';
import { dateToISO } from '../../lib/studio';

const STATUS_LABEL = { CONFIRMED: 'Confirmado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' };
const STATUS_COLOR = {
  CONFIRMED: { bg: 'var(--blush-400)', fg: 'var(--cocoa-800)' },
  COMPLETED: { bg: 'var(--success-100)', fg: 'var(--success-500)' },
  CANCELLED: { bg: 'var(--nude-300)', fg: 'var(--text-muted)' },
};

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return dateToISO(date);
}

function formatLong(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const label = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function AdminAgendaPage() {
  const router = useRouter();
  const [date, setDate] = useState(() => dateToISO(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockError, setBlockError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/day?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        setAppointments(data.appointments || []);
        setBlockedSlots(data.blockedSlots || []);
      })
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- immediate loading flag on date change
    setLoading(true);
    fetch(`/api/admin/day?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setAppointments(data.appointments || []);
        setBlockedSlots(data.blockedSlots || []);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [date]);

  async function setStatus(id, status) {
    await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function addBlock(e) {
    e.preventDefault();
    setBlockError(null);
    const res = await fetch('/api/admin/blocked-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, startTime: blockStart, endTime: blockEnd, reason: blockReason }),
    });
    const data = await res.json();
    if (!res.ok) { setBlockError(data.error || 'Não foi possível bloquear.'); return; }
    setBlockStart(''); setBlockEnd(''); setBlockReason('');
    load();
  }

  async function removeBlock(id) {
    await fetch(`/api/admin/blocked-slots/${id}`, { method: 'DELETE' });
    load();
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <header style={{ borderBottom: '1px solid var(--border-hairline)', padding: '18px var(--gutter)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size={0.5} align="left" descriptor={false} />
        <Button variant="ghost" onClick={logout} iconRight={<Icon name="log-out" size={15} />}>Sair</Button>
      </header>

      <main style={{ maxWidth: '880px', margin: '0 auto', padding: '40px var(--gutter) 80px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Agenda</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
            <IconButton label="Dia anterior" variant="outline" size={38} onClick={() => setDate((d) => addDays(d, -1))}>
              <Icon name="chevron-left" size={16} />
            </IconButton>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: '1.75rem', color: 'var(--text-heading)', minWidth: '280px' }}>
              {formatLong(date)}
            </h1>
            <IconButton label="Próximo dia" variant="outline" size={38} onClick={() => setDate((d) => addDays(d, 1))}>
              <Icon name="chevron-right" size={16} />
            </IconButton>
            <Button variant="ghost" onClick={() => setDate(dateToISO(new Date()))}>Hoje</Button>
          </div>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Carregando…</p>
          ) : appointments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhum agendamento neste dia.</p>
          ) : appointments.map((a) => {
            const color = STATUS_COLOR[a.status];
            return (
              <Surface key={a.id} padding={20} elevation="xs">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.375rem', color: 'var(--cocoa-800)' }}>
                      {a.startTime} – {a.endTime}
                    </span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'var(--text-body)' }}>{a.clientName} · {a.clientPhone}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}>{a.service.name} · {a.service.duration} · {a.service.price}</span>
                    {a.note && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}>Obs: {a.note}</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: color.bg, color: color.fg }}>{STATUS_LABEL[a.status]}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {a.status !== 'COMPLETED' && <Button size="sm" variant="ghost" onClick={() => setStatus(a.id, 'COMPLETED')}>Concluir</Button>}
                      {a.status !== 'CANCELLED' && <Button size="sm" variant="ghost" onClick={() => setStatus(a.id, 'CANCELLED')}>Cancelar</Button>}
                      {a.status !== 'CONFIRMED' && <Button size="sm" variant="ghost" onClick={() => setStatus(a.id, 'CONFIRMED')}>Reabrir</Button>}
                    </div>
                  </div>
                </div>
              </Surface>
            );
          })}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SectionLabel>Horários bloqueados</SectionLabel>
          {blockedSlots.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-small)' }}>Nenhum bloqueio neste dia.</p>
          ) : blockedSlots.map((b) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              padding: '12px 16px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-small)' }}>
                {b.startTime} – {b.endTime}{b.reason ? ` · ${b.reason}` : ''}
              </span>
              <IconButton label="Remover bloqueio" variant="bare" size={32} onClick={() => removeBlock(b.id)}>
                <Icon name="trash" size={15} />
              </IconButton>
            </div>
          ))}

          <Surface padding={20} elevation="none">
            <form onSubmit={addBlock} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr auto', gap: '14px', alignItems: 'end' }}>
              <Field label="Início" htmlFor="block-start">
                <Input id="block-start" type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} required />
              </Field>
              <Field label="Fim" htmlFor="block-end">
                <Input id="block-end" type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} required />
              </Field>
              <Field label="Motivo" htmlFor="block-reason" hint="Opcional">
                <Input id="block-reason" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Almoço, compromisso…" />
              </Field>
              <Button type="submit" iconLeft={<Icon name="ban" size={15} />}>Bloquear</Button>
            </form>
            {blockError && <p style={{ margin: '10px 0 0', color: 'var(--danger-500)', fontSize: 'var(--text-small)' }}>{blockError}</p>}
          </Surface>
        </section>
      </main>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
      {children}
    </span>
  );
}
