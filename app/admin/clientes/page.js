'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminAppShell } from '../../../components/admin/AdminAppShell';
import { Button } from '../../../components/core/Button';
import { IconButton } from '../../../components/core/IconButton';
import { Icon } from '../../../components/core/Icon';
import { Surface } from '../../../components/core/Surface';
import { Input } from '../../../components/forms/Input';
import { useMobile } from '../../../lib/useMobile';
import { formatDayShort } from '../../../lib/calendar';
import { formatPhoneDisplay } from '../../../lib/phone';
import { formatPriceCents } from '../../../lib/studio';

const STATUS_LABELS = { CONFIRMED: 'Confirmado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' };
const STATUS_COLORS = { CONFIRMED: 'var(--ink-500)', COMPLETED: 'var(--success-500)', CANCELLED: 'var(--text-muted)' };

// Clients aren't a separate entity in the database — this list and each
// client's history are derived from Appointment.clientName/clientPhone,
// which every appointment already saves (see lib/clients.js). Read-only:
// nothing here edits an appointment — that stays in Agenda.
export default function AdminClientesPage() {
  const m = useMobile();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openPhone, setOpenPhone] = useState(null);

  useEffect(() => {
    fetch('/api/admin/clients').then((r) => r.json()).then((data) => setClients(data.clients || [])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q) || (qDigits && c.phone.includes(qDigits)));
  }, [clients, search]);

  return (
    <AdminAppShell>
      <main style={{ maxWidth: '880px', margin: '0 auto', padding: m ? '24px var(--gutter) 24px' : '40px var(--gutter) 80px',
        display: 'flex', flexDirection: 'column', gap: m ? '18px' : '26px' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {clients.length > 0 ? `${clients.length} cliente${clients.length === 1 ? '' : 's'}` : 'Clientes'}
          </span>
          <h1 style={{ margin: '10px 0 0', fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: m ? '1.5rem' : '1.75rem', color: 'var(--text-heading)' }}>Clientes</h1>
        </div>

        {!loading && clients.length > 0 && (
          <Input iconLeft={<Icon name="search" size={15} />} placeholder="Buscar por nome ou telefone…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        )}

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando…</p>
        ) : clients.length === 0 ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '14px', maxWidth: '360px', margin: '0 auto' }}>
            <span style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--nude-300)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-600)' }}>
              <Icon name="users" size={24} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.25rem', color: 'var(--ink-900)' }}>Nenhum cliente ainda</h2>
              <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--ink-500)' }}>
                Assim que o primeiro agendamento com nome e WhatsApp for salvo, a cliente aparece aqui.
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}>Nenhuma cliente encontrada para &ldquo;{search}&rdquo;.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((c) => (
              <Surface key={c.phone} tone="card" padding={m ? 14 : 18} elevation="xs" interactive
                onClick={() => setOpenPhone(c.phone)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: 'var(--nude-300)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif-display)',
                    fontSize: '0.9375rem', color: 'var(--cocoa-800)' }}>{c.name.charAt(0).toUpperCase()}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.9375rem',
                      color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>
                      {formatPhoneDisplay(c.phone)} · {c.count} atendimento{c.count === 1 ? '' : 's'} · última em {formatDayShort(c.lastVisit)}
                    </span>
                  </div>
                  <Icon name="chevron-right" size={16} color="var(--taupe-500)" />
                </div>
              </Surface>
            ))}
          </div>
        )}
      </main>

      {openPhone && <ClientHistorySheet phone={openPhone} mobile={m} onClose={() => setOpenPhone(null)} />}
    </AdminAppShell>
  );
}

function ClientHistorySheet({ phone, mobile: m, onClose }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- immediate loading flag on phone change
    setLoading(true);
    fetch(`/api/admin/clients/${encodeURIComponent(phone)}`).then((r) => r.json()).then((data) => {
      if (!cancelled) setClient(data.client || null);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [phone]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,22,20,.4)', zIndex: 100,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: m ? 0 : '5vh 16px', overflowY: 'auto' }}
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface-card)',
        borderRadius: m ? 0 : 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', width: '100%',
        maxWidth: m ? 'none' : '560px', minHeight: m ? '100dvh' : 'auto', padding: m ? '22px 18px' : '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: m ? '1.3rem' : '1.5rem', color: 'var(--text-heading)' }}>
            {loading ? 'Carregando…' : client?.name || 'Cliente'}
          </h2>
          <IconButton label="Fechar" variant="bare" size={m ? 40 : 36} onClick={onClose}><Icon name="x" size={18} /></IconButton>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando…</p>
        ) : !client ? (
          <p style={{ color: 'var(--text-muted)' }}>Não foi possível carregar o histórico desta cliente.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Button variant="whatsapp" fullWidth={m} href={`https://wa.me/${client.phone}`} target="_blank" rel="noopener noreferrer"
              iconLeft={<Icon name="message-circle" size={15} />}>{formatPhoneDisplay(client.phone)}</Button>

            <div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)',
                textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Histórico · {client.appointments.length} atendimento{client.appointments.length === 1 ? '' : 's'}
              </span>
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column' }}>
                {client.appointments.map((a, i) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)' }}>
                    <span style={{ width: '62px', flex: '0 0 auto', paddingTop: '1px', fontFamily: 'var(--font-sans)', fontWeight: 700,
                      fontSize: '0.8125rem', color: 'var(--ink-900)' }}>{formatDayShort(a.date)}</span>
                    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink-900)' }}>{a.serviceName}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                        {a.startTime} · {formatPriceCents(a.priceCents) || 'sem preço'}
                      </span>
                      {a.note && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>Obs: {a.note}</span>}
                    </span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.03em', flex: '0 0 auto', paddingTop: '3px', color: STATUS_COLORS[a.status] }}>{STATUS_LABELS[a.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
