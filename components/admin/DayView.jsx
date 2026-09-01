'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '../core/Button';
import { IconButton } from '../core/IconButton';
import { Icon } from '../core/Icon';
import { Surface } from '../core/Surface';
import { Field } from '../forms/Field';
import { Input } from '../forms/Input';

const STATUS_LABEL = { CONFIRMED: 'Confirmado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' };
const STATUS_COLOR = {
  CONFIRMED: { bg: 'var(--blush-400)', fg: 'var(--cocoa-800)' },
  COMPLETED: { bg: 'var(--success-100)', fg: 'var(--success-500)' },
  CANCELLED: { bg: 'var(--nude-300)', fg: 'var(--text-muted)' },
};

export function DayView({ date, refreshToken, onEdit, mobile }) {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- immediate loading flag on date/refresh change
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
  }, [date, refreshToken]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '32px' : '40px' }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SectionLabel>Agendamentos</SectionLabel>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando…</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nenhum agendamento neste dia.</p>
        ) : appointments.map((a) => {
          const color = STATUS_COLOR[a.status];
          return (
            <Surface key={a.id} padding={mobile ? 16 : 20} elevation="xs">
              <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', justifyContent: 'space-between', gap: mobile ? '14px' : '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.375rem', color: 'var(--cocoa-800)' }}>
                    {a.startTime} – {a.endTime}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'var(--text-body)' }}>{a.clientName} · {a.clientPhone}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}>
                    {a.service.name}{a.service.adhoc ? ' (avulso)' : ''} · {a.service.duration} · {a.service.price || 'preço a definir'}
                  </span>
                  {a.note && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-small)', color: 'var(--text-muted)' }}>Obs: {a.note}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'column', alignItems: mobile ? 'stretch' : 'flex-end', gap: '10px' }}>
                  <span style={{ alignSelf: mobile ? 'flex-start' : 'flex-end', fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: color.bg, color: color.fg }}>{STATUS_LABEL[a.status]}</span>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: mobile ? 'flex-start' : 'flex-end' }}>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(a.id)} iconLeft={<Icon name="pencil" size={14} />}>Editar</Button>
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
            <IconButton label="Remover bloqueio" variant="bare" size={mobile ? 40 : 32} onClick={() => removeBlock(b.id)}>
              <Icon name="trash" size={15} />
            </IconButton>
          </div>
        ))}

        <Surface padding={mobile ? 16 : 20} elevation="none">
          <form onSubmit={addBlock} style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '1fr 1fr 1.4fr auto', gap: '14px', alignItems: 'end' }}>
            <Field label="Início" htmlFor="block-start">
              <Input id="block-start" type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} required />
            </Field>
            <Field label="Fim" htmlFor="block-end">
              <Input id="block-end" type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} required />
            </Field>
            <Field label="Motivo" htmlFor="block-reason" hint="Opcional" style={mobile ? { gridColumn: '1 / -1' } : undefined}>
              <Input id="block-reason" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Almoço, compromisso…" />
            </Field>
            <Button type="submit" fullWidth={mobile} iconLeft={<Icon name="ban" size={15} />} style={mobile ? { gridColumn: '1 / -1' } : undefined}>Bloquear</Button>
          </form>
          {blockError && <p style={{ margin: '10px 0 0', color: 'var(--danger-500)', fontSize: 'var(--text-small)' }}>{blockError}</p>}
        </Surface>
      </section>
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
