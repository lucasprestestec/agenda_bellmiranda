'use client';

import { useEffect, useState } from 'react';
import { StaffSwitcher } from './StaffSwitcher';
import { AppointmentForm } from './AppointmentForm';
import { Icon } from '../core/Icon';
import { dateToISO, formatPriceCents } from '../../lib/studio';
import { formatLong } from '../../lib/calendar';
import { toE164 } from '../../lib/phone';

function staffFor(service, staffList) {
  if (!service?.staffPhone) return null;
  return staffList.find((s) => s.staffPhone === service.staffPhone) || null;
}

function initialsOf(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : trimmed.slice(0, 2).toUpperCase();
}

function StatTile({ icon, value, label, wide }) {
  return (
    <div style={{ gridColumn: wide ? '1 / -1' : undefined, display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', border: '1px solid var(--border-hairline)' }}>
      <span style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: 'var(--nude-300)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-600)' }}>
        <Icon name={icon} size={16} />
      </span>
      <div style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-serif-display)', fontSize: '1.3125rem', lineHeight: 1.1, color: 'var(--ink-900)' }}>{value}</span>
        <span style={{ display: 'block', marginTop: '2px', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: 'var(--ink-500)' }}>{label}</span>
      </div>
    </div>
  );
}

// The screen a professional opens first: today, at a glance. Deliberately
// lighter than /admin/agenda's day view — full block management, week/
// month, and per-appointment editing beyond a quick tap stay on
// /admin/agenda.
export function TodayView() {
  const today = dateToISO(new Date());
  const [staff, setStaff] = useState([]);
  const [staffFilter, setStaffFilter] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formAppointmentId, setFormAppointmentId] = useState(null);
  const [formDefaults, setFormDefaults] = useState(null);

  useEffect(() => {
    fetch('/api/admin/staff').then((r) => r.json()).then((data) => setStaff(data.staff || []));
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- immediate loading flag on filter/refresh change
    setLoading(true);
    const url = `/api/admin/day?date=${today}` + (staffFilter ? `&staffPhone=${encodeURIComponent(staffFilter)}` : '');
    fetch(url).then((r) => r.json()).then((data) => {
      if (!cancelled) setAppointments(data.appointments || []);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [today, staffFilter, refreshToken]);

  const active = appointments.filter((a) => a.status !== 'CANCELLED');
  const revenueCents = active.reduce((sum, a) => sum + (a.service?.priceCents || 0), 0);
  // Real, derived from the same appointment list already fetched — never a
  // second query, never estimated.
  const uniqueClients = new Set(active.map((a) => toE164(a.clientPhone)).filter(Boolean)).size;

  function openCreate() {
    setFormAppointmentId(null);
    setFormDefaults({ date: today, startTime: '' });
    setFormOpen(true);
  }
  function openEdit(id) {
    setFormAppointmentId(id);
    setFormDefaults(null);
    setFormOpen(true);
  }
  function onSaved() {
    setFormOpen(false);
    setRefreshToken((t) => t + 1);
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ padding: '2px 18px 14px' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.5rem', color: 'var(--ink-900)' }}>Hoje</h1>
        <p style={{ margin: '3px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--ink-500)' }}>{formatLong(today)}</p>
      </div>

      {staff.length > 0 && (
        <div style={{ padding: '0 18px 14px' }}>
          <StaffSwitcher staff={staff} value={staffFilter} onChange={setStaffFilter} mobile />
        </div>
      )}

      <div style={{ padding: '0 18px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <StatTile icon="calendar-days" value={active.length} label={`Agendamento${active.length === 1 ? '' : 's'} hoje`} />
        <StatTile icon="users" value={uniqueClients} label={`Cliente${uniqueClients === 1 ? '' : 's'} único${uniqueClients === 1 ? '' : 's'}`} />
        <StatTile icon="wallet" value={formatPriceCents(revenueCents) || 'R$ 0'} label="Faturamento previsto" wide />
      </div>

      <div style={{ borderTop: '1px solid var(--border-hairline)', padding: '4px 18px 0' }}>
        <span style={{ display: 'block', padding: '12px 0 6px', fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Próximos agendamentos</span>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', paddingTop: '10px' }}>Carregando…</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', paddingTop: '10px' }}>Nenhum agendamento hoje.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {appointments.map((a, i) => {
              const person = staffFor(a.service, staff);
              const cancelled = a.status === 'CANCELLED';
              const pendingConfirmation = !cancelled && !a.confirmationSentAt;
              return (
                <button key={a.id} onClick={() => openEdit(a.id)} style={{ border: 0, background: 'none', cursor: 'pointer',
                  textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)', opacity: cancelled ? 0.5 : 1 }}>
                  <span style={{ width: '42px', flex: '0 0 auto', paddingTop: '1px', fontFamily: 'var(--font-sans)', fontWeight: 700,
                    fontSize: '0.8125rem', color: 'var(--ink-900)' }}>{a.startTime}</span>
                  <span style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: person ? person.soft : 'var(--nude-300)', color: person ? person.accent : 'var(--cocoa-800)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-serif-display)', fontSize: '0.8125rem' }}>
                    {initialsOf(a.clientName)}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.875rem',
                      color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.clientName || 'Sem nome'}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--ink-500)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {[a.service?.name, !staffFilter && person?.staffName, a.service?.price].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  {cancelled ? (
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9.5px', fontWeight: 700, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.03em', flex: '0 0 auto' }}>Cancelado</span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: '0 0 auto',
                      fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
                      color: pendingConfirmation ? 'var(--warning-500)' : 'var(--success-500)' }}>
                      {pendingConfirmation && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning-500)' }} />}
                      {pendingConfirmation ? 'Pendente' : 'Confirmado'}
                      <Icon name="chevron-right" size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={openCreate} aria-label="Novo agendamento" style={{ position: 'fixed', right: '20px',
        bottom: 'calc(76px + env(safe-area-inset-bottom))', width: '52px', height: '52px', borderRadius: '50%',
        border: 'none', background: 'var(--espresso-900)', color: 'var(--ivory-100)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(43,31,27,.28)', zIndex: 25 }}>
        <Icon name="plus" size={22} />
      </button>

      <AppointmentForm open={formOpen} onClose={() => setFormOpen(false)} appointmentId={formAppointmentId} defaults={formDefaults} onSaved={onSaved} />
    </div>
  );
}
