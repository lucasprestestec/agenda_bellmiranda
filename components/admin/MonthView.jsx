'use client';

import { useEffect, useState } from 'react';
import { WEEKDAY_LABELS } from '../../lib/studio';
import { buildMonthGrid } from '../../lib/calendar';

const STATUS_DOT = { CONFIRMED: 'var(--rose-500)', COMPLETED: 'var(--success-500)', CANCELLED: 'var(--text-muted)' };

export function MonthView({ monthDate, refreshToken, today, onSelectDay }) {
  const [byDate, setByDate] = useState({});
  const grid = buildMonthGrid(monthDate);
  const from = grid[0].date;
  const to = grid[grid.length - 1].date;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/range?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setByDate(data.days || {}); });
    return () => { cancelled = true; };
  }, [from, to, refreshToken]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '6px' }}>
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '10px',
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 0' }}>{label}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {grid.map(({ date, inMonth, day }) => {
          const dayData = byDate[date];
          const appts = dayData?.appointments || [];
          const isToday = date === today;
          return (
            <button key={date} onClick={() => onSelectDay(date)} style={{
              textAlign: 'left', cursor: 'pointer', border: '1px solid ' + (isToday ? 'var(--rose-500)' : 'var(--border-hairline)'),
              borderRadius: 'var(--radius-sm)', padding: '8px', minHeight: '78px', background: inMonth ? 'var(--surface-card)' : 'var(--surface-alt)',
              opacity: inMonth ? 1 : 0.5, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1rem', color: isToday ? 'var(--rose-500)' : 'var(--text-heading)' }}>{day}</span>
              {appts.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                  {appts.slice(0, 6).map((a) => (
                    <span key={a.id} title={`${a.startTime} ${a.clientName}`} style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_DOT[a.status] }} />
                  ))}
                </div>
              )}
              {appts.length > 0 && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{appts.length} agend.</span>
              )}
              {dayData?.blockedCount > 0 && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{dayData.blockedCount} bloqueio(s)</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
