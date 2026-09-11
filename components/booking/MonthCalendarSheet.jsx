'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../core/Icon';
import { buildMonthGrid, startOfMonth, addMonths, formatMonthYear, parseISO } from '../../lib/calendar';
import { dateToISO } from '../../lib/studio';

const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Real month-grid date picker for "Ver outras datas". Loads only the grid
// actually on screen — never more than one month's worth of cells (42, six
// weeks) — and only asks the server for cells from today onward: the
// backend's day-availability check only accounts for "already past" within
// today itself, so a date strictly before today is never queried and is
// simply shown disabled, never guessed either way.
export function MonthCalendarSheet({ open, onClose, serviceSlug, value, onSelect }) {
  const today = dateToISO(new Date());
  const [monthIso, setMonthIso] = useState(() => startOfMonth(value || today));
  const [cellData, setCellData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to the selected/current month whenever the sheet opens
    if (open) setMonthIso(startOfMonth(value || today));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const grid = useMemo(() => buildMonthGrid(monthIso), [monthIso]);
  const minMonth = startOfMonth(today);

  useEffect(() => {
    if (!open || !serviceSlug) return;
    const fetchFrom = grid.find((c) => c.date >= today)?.date;
    if (!fetchFrom) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale cells when the whole visible grid is in the past
      setCellData({});
      return;
    }
    const lastCell = grid[grid.length - 1].date;
    const span = Math.round((parseISO(lastCell) - parseISO(fetchFrom)) / 86400000) + 1;
    const count = Math.min(span, 42);
    let cancelled = false;
    setLoading(true);
    fetch(`/api/days?servico=${serviceSlug}&from=${fetchFrom}&count=${count}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const map = {};
        for (const d of data.days || []) map[d.value] = d;
        setCellData(map);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, serviceSlug, monthIso]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Escolher outra data"
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(43,31,27,.42)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '430px', background: 'var(--surface-card)',
        borderRadius: '20px 20px 0 0', padding: '16px 18px calc(20px + env(safe-area-inset-bottom))',
        display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '78vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button aria-label="Mês anterior" disabled={monthIso <= minMonth} onClick={() => setMonthIso(addMonths(monthIso, -1))}
            style={{ border: 0, background: 'none', cursor: monthIso <= minMonth ? 'default' : 'pointer',
              opacity: monthIso <= minMonth ? .3 : 1, color: 'var(--ink-900)', padding: '6px' }}>
            <Icon name="chevron-left" size={18} />
          </button>
          <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.0625rem', color: 'var(--ink-900)' }}>{formatMonthYear(monthIso)}</span>
          <button aria-label="Próximo mês" onClick={() => setMonthIso(addMonths(monthIso, 1))}
            style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--ink-900)', padding: '6px' }}>
            <Icon name="chevron-right" size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {WEEKDAY_INITIALS.map((w, i) => (
            <span key={i} style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 600,
              color: 'var(--text-muted)', paddingBottom: '4px' }}>{w}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px', overflowY: 'auto' }}>
          {grid.map((cell) => {
            const isPast = cell.date < today;
            const info = cellData[cell.date];
            const disabled = !cell.inMonth || isPast || !info || info.disabled;
            const showDot = cell.inMonth && !isPast && info && !info.disabled;
            const selected = value === cell.date;
            return (
              <button key={cell.date} disabled={disabled} onClick={() => { onSelect(cell.date); onClose(); }}
                style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '2px', border: 0, borderRadius: '10px', cursor: disabled ? 'default' : 'pointer',
                  background: selected ? 'var(--espresso-900)' : 'transparent',
                  visibility: cell.inMonth ? 'visible' : 'hidden',
                  color: selected ? 'var(--ivory-100)' : disabled ? 'var(--taupe-500)' : 'var(--ink-900)',
                  opacity: disabled && !selected ? .4 : 1 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: selected ? 700 : 500 }}>{cell.day}</span>
                {showDot && (
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%',
                    background: selected ? 'var(--ivory-100)' : 'var(--champagne-600)' }} />
                )}
              </button>
            );
          })}
        </div>
        {loading && (
          <p style={{ margin: 0, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Carregando disponibilidade…
          </p>
        )}
      </div>
    </div>
  );
}
