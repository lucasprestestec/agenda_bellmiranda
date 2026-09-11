'use client';

import React from 'react';

// Presentation only — the underlying number is always the real slotsCount
// from the API, never estimated. Above 3 it collapses to a plain "Disponível"
// instead of a raw count, since a bare "20 vagas" reads like inventory/stock
// language rather than a discreet availability cue.
function countLabel(count) {
  if (count === 0) return 'Sem horários';
  if (count === 1) return '1 horário';
  if (count <= 3) return `${count} horários`;
  return 'Disponível';
}

// `showCounts` is opt-in (default off) so existing call sites render exactly
// as before — only a caller that explicitly asks for it gets the small real
// availability count under the day number.
export function DateStrip({ days=[], value, onChange, monthLabel, showCounts=false, style }) {
  return (
    <div style={Object.assign({ display:'flex', flexDirection:'column', gap:'14px', minWidth:0 }, style)}>
      {monthLabel && <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-eyebrow)', letterSpacing:'var(--tracking-eyebrow)', textTransform:'uppercase', color:'var(--text-muted)' }}>{monthLabel}</span>}
      <div className="bm-scroller" style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'4px', minWidth:0 }}>
        {days.map(d => {
          const on = value === d.value;
          const count = showCounts && !d.disabled && typeof d.slotsCount === 'number' ? d.slotsCount : null;
          return (
            <button key={d.value} disabled={d.disabled} onClick={()=>onChange && onChange(d.value)}
              style={{ flex:'0 0 auto', width:'62px', height: count!=null ? '90px' : '78px', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:'6px', cursor:d.disabled?'not-allowed':'pointer',
                borderRadius:'var(--radius-md)', background: on ? 'var(--cocoa-800)' : 'var(--surface-card)',
                border:'1px solid '+(on ? 'var(--cocoa-800)' : 'var(--border-hairline)'),
                color: on ? 'var(--ivory-100)' : 'var(--text-body)', opacity:d.disabled?.35:1,
                transition:'all var(--dur-base) var(--ease-soft)' }}>
              <span style={{ fontFamily:'var(--font-sans)', fontSize:'10px', letterSpacing:'0.16em', textTransform:'uppercase', opacity:.75 }}>{d.weekday}</span>
              <span style={{ fontFamily:'var(--font-serif-display)', fontSize:'1.5rem', lineHeight:1 }}>{d.day}</span>
              {count != null && (
                <span style={{ fontFamily:'var(--font-sans)', fontSize:'9px', fontWeight:600, opacity:.8 }}>
                  {countLabel(count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
