'use client';

import React from 'react';

export function FeatureItem({ index, icon, title, children, layout='number', style }) {
  return (
    <div style={Object.assign({ display:'flex', gap:'18px', alignItems:'flex-start' }, style)}>
      <span style={{ flex:'0 0 auto', display:'inline-flex', alignItems:'center', justifyContent:'center',
        width: layout==='number' ? 'auto' : '40px', height:'40px',
        borderRadius: layout==='number' ? 0 : 'var(--radius-pill)',
        background: layout==='icon' ? 'var(--nude-300)' : 'transparent',
        fontFamily:'var(--font-serif-display)', fontSize: layout==='number' ? '1.5rem' : '1rem',
        color:'var(--champagne-500)' }}>
        {layout==='number' ? index : icon}
      </span>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        <h4 style={{ margin:0, fontFamily:'var(--font-serif-display)', fontWeight:400, fontSize:'1.25rem', lineHeight:1.25, color:'var(--text-heading)' }}>{title}</h4>
        <p style={{ margin:0, fontSize:'var(--text-small)', lineHeight:1.65, color:'var(--text-muted)', maxWidth:'38ch' }}>{children}</p>
      </div>
    </div>
  );
}
