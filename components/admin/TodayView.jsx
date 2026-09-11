'use client';

import { useEffect, useState } from 'react';
import { StaffSwitcher } from './StaffSwitcher';
import { AppointmentForm } from './AppointmentForm';
import { Icon } from '../core/Icon';
import { dateToISO, formatPriceCents } from '../../lib/studio';
import { formatLong } from '../../lib/calendar';

function staffFor(service, staffList) {
  if (!service?.staffPhone) return null;
  return staffList.find((s) => s.staffPhone === service.staffPhone) || null;
}

// The screen a professional opens first: today, at a glance. Deliberately
// lighter than /admin/agenda's day view — one summary line, one list,
// status only surfaced as a small dot when something needs attention. Full
// block management, week/month, and per-appointment editing beyond a quick
// tap stay on /admin/agenda.
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
      <div style={{ padding: '2px 18px 10px' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.375rem', color: 'var(--ink-900)' }}>Hoje</h1>
        <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--ink-500)' }}>{formatLong(today)}</p>
      </div>

      {staff.length > 0 && (
        <div style={{ padding: '0 18px 10px' }}>
          <StaffSwitcher staff={staff} value={staffFilter} onChange={setStaffFilter} mobile />
        </div>
      )}

      {/* One quiet line instead of two large stat cards — perceptible, not dominant. */}
      <div style={{ padding: '0 18px 14px', display: 'flex', alignItems: 'center', gap: '8px',
        fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--ink-500)' }}>
        <span><strong style={{ color: 'var(--ink-900)' }}>{active.length}</strong> atendimento{active.length === 1 ? '' : 's'}</span>
        <span style={{ color: 'var(--border-strong)' }}>•</span>
        <span><strong style={{ color: 'var(--ink-900)' }}>{formatPriceCents(revenueCents) || 'R$ 0'}</strong> previsto</span>
      </div>

      <div style={{ borderTop: '1px solid var(--border-hairline)', padding: '2px 84px 0 18px' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', paddingTop: '14px' }}>Carregando…</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', paddingTop: '14px' }}>Nenhum agendamento hoje.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {appointments.map((a, i) => {
              const person = staffFor(a.service, staff);
              const cancelled = a.status === 'CANCELLED';
              const pendingConfirmation = !cancelled && !a.confirmationSentAt;
              return (
                <button key={a.id} onClick={() => openEdit(a.id)} style={{ border: 0, background: 'none', cursor: 'pointer',
                  textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '13px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)', opacity: cancelled ? 0.5 : 1 }}>
                  <span style={{ width: '2px', alignSelf: 'stretch', borderRadius: '1px',
                    background: person ? person.accent : 'var(--border-strong)' }} />
                  <span style={{ width: '44px', flex: '0 0 auto', paddingTop: '1px', fontFamily: 'var(--font-sans)', fontWeight: 700,
                    fontSize: '0.8125rem', color: 'var(--ink-900)' }}>{a.startTime}</span>
                  <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.875rem',
                      color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.clientName || 'Sem nome'}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--ink-500)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.service?.name}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: 'var(--taupe-500)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {[!staffFilter && person?.staffName, a.service?.price].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  {cancelled ? (
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9.5px', fontWeight: 700, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.03em', flex: '0 0 auto', paddingTop: '3px' }}>Cancelado</span>
                  ) : pendingConfirmation ? (
                    <span title="Confirmação pendente" style={{ width: '7px', height: '7px', borderRadius: '50%', marginTop: '5px',
                      background: 'var(--warning-500)', flex: '0 0 auto' }} />
                  ) : null}
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
