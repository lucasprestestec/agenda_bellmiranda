'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { MonthView } from '../../components/admin/MonthView';
import { WeekView } from '../../components/admin/WeekView';
import { DayView } from '../../components/admin/DayView';
import { AppointmentForm } from '../../components/admin/AppointmentForm';
import { StaffSwitcher } from '../../components/admin/StaffSwitcher';
import { Button } from '../../components/core/Button';
import { IconButton } from '../../components/core/IconButton';
import { Icon } from '../../components/core/Icon';
import { dateToISO } from '../../lib/studio';
import { useMobile } from '../../lib/useMobile';
import { addDays, addMonths, startOfWeek, startOfMonth, formatLong, formatMonthYear, formatWeekRange } from '../../lib/calendar';

const VIEWS = [
  { value: 'month', label: 'Mês' },
  { value: 'week', label: 'Semana' },
  { value: 'day', label: 'Dia' },
];

export default function AdminAgendaPage() {
  const m = useMobile();
  const today = dateToISO(new Date());
  const [view, setView] = useState('day');
  const [focusDate, setFocusDate] = useState(today);
  const [refreshToken, setRefreshToken] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formAppointmentId, setFormAppointmentId] = useState(null);
  const [formDefaults, setFormDefaults] = useState(null);
  const [staff, setStaff] = useState([]);
  const [staffFilter, setStaffFilter] = useState(null);

  useEffect(() => {
    fetch('/api/admin/staff').then((r) => r.json()).then((data) => setStaff(data.staff || []));
  }, []);

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

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: m ? '20px var(--gutter) 88px' : '40px var(--gutter) 80px',
        display: 'flex', flexDirection: 'column', gap: m ? '16px' : '24px' }}>

        {/* Who's agenda: the first question, so it sits above everything else. */}
        {staff.length > 0 && (
          <StaffSwitcher staff={staff} value={staffFilter} onChange={setStaffFilter} mobile={m} />
        )}

        {/* One wrapping toolbar instead of separate full-width blocks — date
            nav always comes first, secondary controls (view, hoje, novo) flow
            onto their own line only when there's no room, instead of every
            control claiming a full row regardless of how little space it needs. */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: m ? '10px' : '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: m ? '8px' : '12px' }}>
            <IconButton label="Dia anterior" variant="bare" size={m ? 34 : 32} onClick={goPrev}>
              <Icon name="chevron-left" size={16} />
            </IconButton>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: m ? '1.15rem' : '1.6rem',
              color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>
              {label()}
            </h1>
            <IconButton label="Próximo dia" variant="bare" size={m ? 34 : 32} onClick={goNext}>
              <Icon name="chevron-right" size={16} />
            </IconButton>
            {focusDate !== today && (
              <button onClick={goToday} style={{ border: '1px solid var(--border-strong)', background: 'none', cursor: 'pointer',
                borderRadius: 'var(--radius-pill)', padding: '5px 12px', fontFamily: 'var(--font-sans)', fontSize: '11px',
                fontWeight: 700, color: 'var(--cocoa-800)' }}>Hoje</button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '3px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-pill)', padding: '3px' }}>
              {VIEWS.map((v) => (
                <button key={v.value} onClick={() => setView(v.value)} style={{
                  border: 0, cursor: 'pointer', padding: m ? '7px 11px' : '7px 15px', borderRadius: 'var(--radius-pill)',
                  fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: view === v.value ? 'var(--surface-card)' : 'transparent',
                  color: view === v.value ? 'var(--cocoa-800)' : 'var(--text-muted)',
                  boxShadow: view === v.value ? 'var(--shadow-xs)' : 'none' }}>{v.label}</button>
              ))}
            </div>
            <Button size={m ? 'md' : 'sm'} iconLeft={<Icon name="plus" size={15} />} onClick={() => openCreate(focusDate)}>Novo</Button>
          </div>
        </div>

        {view === 'month' && (
          <MonthView monthDate={startOfMonth(focusDate)} refreshToken={refreshToken} today={today} mobile={m}
            staffPhone={staffFilter}
            onSelectDay={(d) => { setFocusDate(d); setView('day'); }} />
        )}
        {view === 'week' && (
          <WeekView weekStart={startOfWeek(focusDate)} refreshToken={refreshToken} today={today} mobile={m}
            staffPhone={staffFilter} staff={staff}
            onSelectDay={(d) => { setFocusDate(d); setView('day'); }}
            onEditAppointment={openEdit}
            onCreateAt={openCreate} />
        )}
        {view === 'day' && (
          <DayView date={focusDate} refreshToken={refreshToken} mobile={m} onEdit={openEdit}
            staffPhone={staffFilter} staff={staff} today={today} />
        )}
      </main>

      <AppointmentForm open={formOpen} onClose={closeForm} appointmentId={formAppointmentId} defaults={formDefaults} onSaved={onSaved} />
    </div>
  );
}
