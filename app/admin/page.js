'use client';

import { useState } from 'react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { MonthView } from '../../components/admin/MonthView';
import { WeekView } from '../../components/admin/WeekView';
import { DayView } from '../../components/admin/DayView';
import { AppointmentForm } from '../../components/admin/AppointmentForm';
import { Button } from '../../components/core/Button';
import { IconButton } from '../../components/core/IconButton';
import { Icon } from '../../components/core/Icon';
import { dateToISO } from '../../lib/studio';
import { addDays, addMonths, startOfWeek, startOfMonth, formatLong, formatMonthYear, formatWeekRange } from '../../lib/calendar';

const VIEWS = [
  { value: 'month', label: 'Mês' },
  { value: 'week', label: 'Semana' },
  { value: 'day', label: 'Dia' },
];

export default function AdminAgendaPage() {
  const today = dateToISO(new Date());
  const [view, setView] = useState('day');
  const [focusDate, setFocusDate] = useState(today);
  const [refreshToken, setRefreshToken] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formAppointmentId, setFormAppointmentId] = useState(null);
  const [formDefaults, setFormDefaults] = useState(null);

  function openCreate(date) {
    setFormAppointmentId(null);
    setFormDefaults({ date: date || focusDate, startTime: '' });
    setFormOpen(true);
  }

  function openEdit(id) {
    setFormAppointmentId(id);
    setFormDefaults(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
  }

  function onSaved() {
    setFormOpen(false);
    setRefreshToken((t) => t + 1);
  }

  function goToday() {
    setFocusDate(today);
  }

  function goPrev() {
    if (view === 'month') setFocusDate((d) => addMonths(d, -1));
    else if (view === 'week') setFocusDate((d) => addDays(d, -7));
    else setFocusDate((d) => addDays(d, -1));
  }

  function goNext() {
    if (view === 'month') setFocusDate((d) => addMonths(d, 1));
    else if (view === 'week') setFocusDate((d) => addDays(d, 7));
    else setFocusDate((d) => addDays(d, 1));
  }

  function label() {
    if (view === 'month') return formatMonthYear(focusDate);
    if (view === 'week') return formatWeekRange(startOfWeek(focusDate));
    return formatLong(focusDate);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <AdminHeader />

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px var(--gutter) 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Agenda</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
              <IconButton label="Anterior" variant="outline" size={38} onClick={goPrev}>
                <Icon name="chevron-left" size={16} />
              </IconButton>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: '1.75rem', color: 'var(--text-heading)', minWidth: '220px' }}>
                {label()}
              </h1>
              <IconButton label="Próximo" variant="outline" size={38} onClick={goNext}>
                <Icon name="chevron-right" size={16} />
              </IconButton>
              <Button variant="ghost" onClick={goToday}>Hoje</Button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '6px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-pill)', padding: '4px' }}>
              {VIEWS.map((v) => (
                <button key={v.value} onClick={() => setView(v.value)} style={{
                  border: 0, cursor: 'pointer', padding: '8px 18px', borderRadius: 'var(--radius-pill)',
                  fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: view === v.value ? 'var(--surface-card)' : 'transparent',
                  color: view === v.value ? 'var(--cocoa-800)' : 'var(--text-muted)',
                  boxShadow: view === v.value ? 'var(--shadow-xs)' : 'none' }}>{v.label}</button>
              ))}
            </div>
            <Button iconLeft={<Icon name="plus" size={15} />} onClick={() => openCreate(focusDate)}>Novo agendamento</Button>
          </div>
        </div>

        {view === 'month' && (
          <MonthView monthDate={startOfMonth(focusDate)} refreshToken={refreshToken} today={today}
            onSelectDay={(d) => { setFocusDate(d); setView('day'); }} />
        )}
        {view === 'week' && (
          <WeekView weekStart={startOfWeek(focusDate)} refreshToken={refreshToken} today={today}
            onSelectDay={(d) => { setFocusDate(d); setView('day'); }}
            onEditAppointment={openEdit}
            onCreateAt={openCreate} />
        )}
        {view === 'day' && (
          <DayView date={focusDate} refreshToken={refreshToken} onEdit={openEdit} onCreate={openCreate} />
        )}
      </main>

      <AppointmentForm open={formOpen} onClose={closeForm} appointmentId={formAppointmentId} defaults={formDefaults} onSaved={onSaved} />
    </div>
  );
}
