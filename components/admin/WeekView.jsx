'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '../core/Button';
import { IconButton } from '../core/IconButton';
import { Icon } from '../core/Icon';
import { WEEKDAY_LABELS, WORKING_HOURS, toMinutes, toHHMM } from '../../lib/studio';
import { addDays, parseISO } from '../../lib/calendar';

const STATUS_COLOR = {
  CONFIRMED: { bg: 'var(--blush-400)', fg: 'var(--cocoa-800)' },
  COMPLETED: { bg: 'var(--success-100)', fg: 'var(--success-500)' },
  CANCELLED: { bg: 'var(--nude-300)', fg: 'var(--text-muted)' },
};

const PX_PER_MIN = 1.15;
const HOUR_HEIGHT = 60 * PX_PER_MIN;

function staffFor(service, staffList) {
  if (!service?.staffPhone) return null;
  return staffList.find((s) => s.staffPhone === service.staffPhone) || null;
}

// Greedy lane assignment so overlapping appointments (different staff,
// "Todos" filter) sit side by side instead of on top of each other —
// same idea as any calendar's day view, kept intentionally simple.
function layoutLanes(appts) {
  const sorted = [...appts].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  const laneEnds = [];
  const placed = sorted.map((a) => {
    const start = toMinutes(a.startTime);
    const end = toMinutes(a.endTime);
    let lane = laneEnds.findIndex((endAt) => endAt <= start);
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(end); } else laneEnds[lane] = end;
    return { appt: a, start, end, lane };
  });
  return { placed, laneCount: Math.max(1, laneEnds.length) };
}

function DayTimeline({ iso, dayData, loading, staff, staffPhone, onEditAppointment, onCreateAt }) {
  const weekday = parseISO(iso).getDay();
  const hours = WORKING_HOURS[weekday];
  const appts = (dayData?.appointments || []).filter((a) => a.status !== 'CANCELLED');

  if (dayData?.closed || !hours) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--warning-500)' }}>Fechado</span>
      </div>
    );
  }

  const dayStart = toMinutes(hours.open);
  const dayEnd = toMinutes(hours.close);
  const hourMarks = [];
  for (let m = dayStart; m <= dayEnd; m += 60) hourMarks.push(m);
  const totalHeight = (dayEnd - dayStart) * PX_PER_MIN;
  const { placed, laneCount } = layoutLanes(appts);

  return (
    <div>
      <div style={{ position: 'relative', display: 'flex' }}>
        <div style={{ width: '46px', flexShrink: 0 }}>
          {hourMarks.map((m) => (
            <div key={m} style={{ height: `${HOUR_HEIGHT}px`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-6px', right: '8px', fontFamily: 'var(--font-sans)', fontSize: '10px',
                color: 'var(--text-muted)' }}>{toHHMM(m)}</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: 0, height: `${totalHeight}px`, borderLeft: '1px solid var(--border-hairline)' }}>
          {hourMarks.map((m) => (
            <div key={m} style={{ position: 'absolute', top: `${(m - dayStart) * PX_PER_MIN}px`, left: 0, right: 0,
              borderTop: '1px solid var(--border-hairline)' }} />
          ))}
          {loading ? null : placed.map(({ appt: a, start, end, lane }) => {
            const color = STATUS_COLOR[a.status] || STATUS_COLOR.CONFIRMED;
            const person = !staffPhone ? staffFor(a.service, staff) : null;
            const top = Math.max(0, (start - dayStart) * PX_PER_MIN);
            // Fixed floor (not proportional to HOUR_HEIGHT) — short
            // appointments (e.g. 15-20min) still need room for both text
            // lines (time+name, service) without clipping mid-word.
            const height = Math.max(40, (end - start) * PX_PER_MIN - 2);
            return (
              <button key={a.id} onClick={() => onEditAppointment(a.id)} style={{ position: 'absolute',
                top: `${top}px`, height: `${height}px`, left: `calc(${(lane / laneCount) * 100}% + 4px)`,
                width: `calc(${100 / laneCount}% - 8px)`, border: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
                borderLeft: person ? `3px solid ${person.accent}` : '3px solid var(--border-strong)',
                borderRadius: 'var(--radius-xs)', padding: '5px 8px', background: color.bg, color: color.fg,
                fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.startTime} · {a.clientName || 'Sem nome'}
                </span>
                <span style={{ fontSize: '10px', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.service.name}{!staffPhone && person ? ` · ${person.staffName}` : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '10px' }}>
        {dayData?.blockedCount > 0 && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-muted)' }}>{dayData.blockedCount} bloqueio(s)</span>
        )}
        <Button size="sm" variant="ghost" iconLeft={<Icon name="plus" size={13} />} onClick={() => onCreateAt(iso)} style={{ marginLeft: 'auto' }}>Novo</Button>
      </div>
    </div>
  );
}

export function WeekView({ weekStart, refreshToken, today, onSelectDay, onEditAppointment, onCreateAt, mobile, staffPhone, staff = [] }) {
  const [byDate, setByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const [selectedDay, setSelectedDay] = useState(() => (days.includes(today) ? today : weekStart));

  useEffect(() => {
    // A new week loaded: keep today selected if it's in range, otherwise
    // land on the week's first day instead of a stale selection.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resync selection when the visible week changes
    setSelectedDay(days.includes(today) ? today : days[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

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

  if (mobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="bm-scroller" style={{ display: 'flex', gap: '8px' }}>
          {days.map((iso) => {
            const on = iso === selectedDay;
            const isToday = iso === today;
            const weekday = parseISO(iso).getDay();
            const count = (byDate[iso]?.appointments || []).filter((a) => a.status !== 'CANCELLED').length;
            return (
              <button key={iso} onClick={() => setSelectedDay(iso)} style={{ flex: '0 0 auto', width: '52px', height: '68px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                cursor: 'pointer', borderRadius: 'var(--radius-md)',
                background: on ? 'var(--blush-400)' : 'var(--surface-card)',
                border: '1px solid ' + (on ? 'var(--blush-400)' : isToday ? 'var(--rose-500)' : 'var(--border-hairline)'),
                color: on ? 'var(--cocoa-800)' : 'var(--text-body)' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9.5px', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: .7 }}>
                  {WEEKDAY_LABELS[weekday]}
                </span>
                <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.1875rem', lineHeight: 1 }}>{parseISO(iso).getDate()}</span>
                {count > 0 && (
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: on ? 'var(--cocoa-800)' : 'var(--champagne-500)' }} />
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.0625rem', color: 'var(--ink-900)' }}>
            {WEEKDAY_LABELS[parseISO(selectedDay).getDay()].charAt(0).toUpperCase() + WEEKDAY_LABELS[parseISO(selectedDay).getDay()].slice(1)}-feira
          </span>
          <IconButton label="Ver dia completo" variant="bare" size={30} onClick={() => onSelectDay(selectedDay)}>
            <Icon name="arrow-up-right" size={15} />
          </IconButton>
        </div>

        <DayTimeline iso={selectedDay} dayData={byDate[selectedDay]} loading={loading} staff={staff}
          staffPhone={staffPhone} onEditAppointment={onEditAppointment} onCreateAt={onCreateAt} />
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
