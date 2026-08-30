'use client';

import React from 'react';

export function TimeSlotGrid({ slots=[], value, onChange, label, emptyMessage='Sem horários neste dia.', style }) {
  return (
    <div style={Object.assign({ display:'flex', flexDirection:'column', gap:'14px' }, style)}>
      {label && <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-eyebrow)', letterSpacing:'var(--tracking-eyebrow)', textTransform:'uppercase', color:'var(--text-muted)' }}>{label}</span>}
      {slots.length === 0
        ? <p style={{ margin:0, fontSize:'var(--text-small)', color:'var(--text-muted)' }}>{emptyMessage}</p>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(92px,1fr))', gap:'10px' }}>
            {slots.map(s => {
              const on = value === s.value;
              return (
                <button key={s.value} disabled={s.disabled} onClick={()=>onChange && onChange(s.value)}
                  style={{ height:'46px', cursor:s.disabled?'not-allowed':'pointer', borderRadius:'var(--radius-sm)',
                    fontFamily:'var(--font-sans)', fontSize:'var(--text-small)', letterSpacing:'0.04em',
                    background: on ? 'var(--selected-bg)' : 'var(--surface-card)',
                    color: on ? 'var(--selected-text)' : 'var(--text-body)',
                    border:'1px solid '+(on ? 'var(--selected-bg)' : 'var(--border-hairline)'),
                    textDecoration: s.disabled ? 'line-through' : 'none', opacity: s.disabled ? .4 : 1,
                    transition:'all var(--dur-base) var(--ease-soft)' }}>
                  {s.label || s.value}
                </button>
              );
            })}
          </div>}
    </div>
  );
}
