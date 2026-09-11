'use client';

import { useEffect, useState } from 'react';
import { Button } from '../core/Button';
import { IconButton } from '../core/IconButton';
import { Icon } from '../core/Icon';
import { WEEKDAY_LABELS } from '../../lib/studio';
import { addDays, parseISO } from '../../lib/calendar';

const STATUS_COLOR = {
  CONFIRMED: { bg: 'var(--blush-400)', fg: 'var(--cocoa-800)' },
  COMPLETED: { bg: 'var(--success-100)', fg: 'var(--success-500)' },
  CANCELLED: { bg: 'var(--nude-300)', fg: 'var(--text-muted)' },
};

function staffFor(service, staffList) {
  if (!service?.staffPhone) return null;
  return staffList.find((s) => s.staffPhone === service.staffPhone) || null;
}

export function WeekView({ weekStart, refreshToken, today, onSelectDay, onEditAppointment, onCreateAt, mobile, staffPhone, staff = [] }) {
  const [byDate, setByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- immediate loading flag on range/refresh change
    setLoading(true);
    const to = addDays(weekStart, 6);
    const url = `/api/admin/range?from=${weekStart}&to=${to}` + (staffPhone ? `&staffPhone=${encodeURIComponent(staffPhone)}` : '');
    fetch(url)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setByDate(data.days || {}); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [weekStart, refreshToken, staffPhone]);

  // Mobile: a phone can't usefully show 7 side-by-side columns, so each day
  // gets its own full-width block, stacked — a day-by-day list rather than a grid.
  if (mobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {days.map((iso) => {
          const isToday = iso === today;
          const weekday = parseISO(iso).getDay();
          const dayData = byDate[iso];
          const appts = dayData?.appointments || [];
          return (
            <div key={iso} style={{ border: '1px solid ' + (isToday ? 'var(--rose-500)' : 'var(--border-hairline)'),
              borderRadius: 'var(--radius-sm)', padding: '12px 12px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <button onClick={() => onSelectDay(iso)} style={{ border: 0, cursor: 'pointer', textAlign: 'left', display: 'flex',
                  alignItems: 'baseline', gap: '10px', background: 'transparent' }}>
                  <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.25rem', color: isToday ? 'var(--rose-500)' : 'var(--text-heading)' }}>
                    {parseISO(iso).getDate()}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {WEEKDAY_LABELS[weekday]}
                  </span>
                </button>
                <IconButton label={`Novo agendamento em ${iso}`} variant="bare" size={34} onClick={() => onCreateAt(iso)}>
                  <Icon name="plus" size={16} />
                </IconButton>
              </div>
              {loading ? null : appts.length === 0 ? (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nenhum agendamento.</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {appts.map((a) => {
                    const color = STATUS_COLOR[a.status];
                    const person = !staffPhone ? staffFor(a.service, staff) : null;
                    return (
                      <button key={a.id} onClick={() => onEditAppointment(a.id)} style={{ border: 0, textAlign: 'left', cursor: 'pointer',
                        borderLeft: person ? `3px solid ${person.accent}` : 'none',
                        borderRadius: 'var(--radius-xs)', padding: '10px 12px', background: color.bg, color: color.fg,
                        fontFamily: 'var(--font-sans)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 600 }}>{a.startTime} · {a.clientName || 'Sem nome'}</span>
                          <span style={{ fontSize: '11px', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.service.name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {dayData?.closed ? (
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--warning-500)' }}>Fechado</span>
              ) : dayData?.blockedCount > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dayData.blockedCount} bloqueio(s)</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bm-scroller" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(140px, 1fr))', gap: '10px', overflowX: 'auto' }}>
      {days.map((iso) => {
        const isToday = iso === today;
        const weekday = parseISO(iso).getDay();
        const dayData = byDate[iso];
        const appts = dayData?.appointments || [];
        return (
          <div key={iso} style={{ display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
            <button onClick={() => onSelectDay(iso)} style={{ border: 0, cursor: 'pointer', textAlign: 'left', padding: '8px 6px',
              borderRadius: 'var(--radius-sm)', background: isToday ? 'var(--surface-accent-soft)' : 'transparent' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {WEEKDAY_LABELS[weekday]}
              </div>
              <div style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.25rem', color: isToday ? 'var(--rose-500)' : 'var(--text-heading)' }}>
                {parseISO(iso).getDate()}
              </div>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px 2px', minHeight: '40px' }}>
              {loading ? null : appts.length === 0 ? (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
              ) : appts.map((a) => {
                const color = STATUS_COLOR[a.status];
                const person = !staffPhone ? staffFor(a.service, staff) : null;
                return (
                  <button key={a.id} onClick={() => onEditAppointment(a.id)} style={{ border: 0, textAlign: 'left', cursor: 'pointer',
                    borderLeft: person ? `3px solid ${person.accent}` : 'none',
                    borderRadius: 'var(--radius-xs)', padding: '6px 8px', background: color.bg, color: color.fg, fontFamily: 'var(--font-sans)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600 }}>{a.startTime}</div>
                    <div style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.clientName || 'Sem nome'}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.service.name}</div>
                  </button>
                );
              })}
              {dayData?.closed ? (
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--warning-500)' }}>Fechado</span>
              ) : dayData?.blockedCount > 0 && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{dayData.blockedCount} bloqueio(s)</span>
              )}
            </div>
            <Button size="sm" variant="ghost" onClick={() => onCreateAt(iso)} style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>+ Novo</Button>
          </div>
        );
      })}
    </div>
  );
}
