'use client';

import React from 'react';

export function DateStrip({ days=[], value, onChange, monthLabel, style }) {
  return (
    <div style={Object.assign({ display:'flex', flexDirection:'column', gap:'14px', minWidth:0 }, style)}>
      {monthLabel && <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-eyebrow)', letterSpacing:'var(--tracking-eyebrow)', textTransform:'uppercase', color:'var(--text-muted)' }}>{monthLabel}</span>}
      <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'4px', minWidth:0 }}>
        {days.map(d => {
          const on = value === d.value;
          return (
            <button key={d.value} disabled={d.disabled} onClick={()=>onChange && onChange(d.value)}
              style={{ flex:'0 0 auto', width:'62px', height:'78px', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:'6px', cursor:d.disabled?'not-allowed':'pointer',
                borderRadius:'var(--radius-md)', background: on ? 'var(--cocoa-800)' : 'var(--surface-card)',
                border:'1px solid '+(on ? 'var(--cocoa-800)' : 'var(--border-hairline)'),
                color: on ? 'var(--ivory-100)' : 'var(--text-body)', opacity:d.disabled?.35:1,
                transition:'all var(--dur-base) var(--ease-soft)' }}>
              <span style={{ fontFamily:'var(--font-sans)', fontSize:'10px', letterSpacing:'0.16em', textTransform:'uppercase', opacity:.75 }}>{d.weekday}</span>
              <span style={{ fontFamily:'var(--font-serif-display)', fontSize:'1.5rem', lineHeight:1 }}>{d.day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
