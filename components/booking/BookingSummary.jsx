'use client';

import React from 'react';

export function BookingSummary({ items=[], total, totalLabel='Total', note, footer, tone='card', style }) {
  const inverse = tone === 'inverse';
  return (
    <div style={Object.assign({ background: inverse ? 'var(--surface-inverse)' : 'var(--surface-card)',
      color: inverse ? 'var(--text-on-inverse)' : 'inherit',
      border:'1px solid '+(inverse ? 'rgba(250,247,243,.14)' : 'var(--border-hairline)'),
      borderRadius:'var(--radius-lg)', padding:'26px', display:'flex', flexDirection:'column', gap:'18px' }, style)}>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {items.map((it,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:'16px', alignItems:'baseline' }}>
            <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-eyebrow)', letterSpacing:'var(--tracking-eyebrow)',
              textTransform:'uppercase', color: inverse ? 'var(--nude-400)' : 'var(--text-muted)' }}>{it.label}</span>
            <span style={{ fontFamily:'var(--font-serif-display)', fontSize:'1.125rem', textAlign:'right' }}>{it.value}</span>
          </div>
        ))}
      </div>
      {total && (
        <div style={{ borderTop:'1px solid '+(inverse?'rgba(250,247,243,.16)':'var(--border-hairline)'), paddingTop:'16px',
          display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
          <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-eyebrow)', letterSpacing:'var(--tracking-eyebrow)', textTransform:'uppercase' }}>{totalLabel}</span>
          <span style={{ fontFamily:'var(--font-serif-display)', fontSize:'1.75rem' }}>{total}</span>
        </div>
      )}
      {note && <p style={{ margin:0, fontSize:'var(--text-caption)', lineHeight:1.6, color: inverse ? 'var(--nude-300)' : 'var(--text-muted)' }}>{note}</p>}
      {footer}
    </div>
  );
}
