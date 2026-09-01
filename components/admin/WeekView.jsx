'use client';

import { useEffect, useState } from 'react';
import { Button } from '../core/Button';
import { WEEKDAY_LABELS } from '../../lib/studio';
import { addDays, parseISO } from '../../lib/calendar';

const STATUS_COLOR = {
  CONFIRMED: { bg: 'var(--blush-400)', fg: 'var(--cocoa-800)' },
  COMPLETED: { bg: 'var(--success-100)', fg: 'var(--success-500)' },
  CANCELLED: { bg: 'var(--nude-300)', fg: 'var(--text-muted)' },
};

export function WeekView({ weekStart, refreshToken, today, onSelectDay, onEditAppointment, onCreateAt }) {
  const [byDate, setByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- immediate loading flag on range/refresh change
    setLoading(true);
    const to = addDays(weekStart, 6);
    fetch(`/api/admin/range?from=${weekStart}&to=${to}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setByDate(data.days || {}); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [weekStart, refreshToken]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(140px, 1fr))', gap: '10px', overflowX: 'auto' }}>
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
                return (
                  <button key={a.id} onClick={() => onEditAppointment(a.id)} style={{ border: 0, textAlign: 'left', cursor: 'pointer',
                    borderRadius: 'var(--radius-xs)', padding: '6px 8px', background: color.bg, color: color.fg, fontFamily: 'var(--font-sans)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600 }}>{a.startTime}</div>
                    <div style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.clientName}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.service.name}</div>
                  </button>
                );
              })}
              {dayData?.blockedCount > 0 && (
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
