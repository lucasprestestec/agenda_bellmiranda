'use client';

import React from 'react';

export function ConfirmationPanel({ title='Seu horário está reservado', message, details=[], actions, style }) {
  return (
    <div style={Object.assign({ background:'var(--surface-alt)', border:'1px solid var(--border-hairline)',
      borderRadius:'var(--radius-lg)', padding:'40px 34px', textAlign:'center',
      display:'flex', flexDirection:'column', alignItems:'center', gap:'18px' }, style)}>
      <span style={{ width:'54px', height:'54px', borderRadius:'var(--radius-pill)', background:'var(--blush-400)',
        display:'inline-flex', alignItems:'center', justifyContent:'center', color:'var(--cocoa-800)', fontSize:'20px' }}>{'\u2726'}</span>
      <h3 style={{ margin:0, fontFamily:'var(--font-serif-display)', fontWeight:300, fontSize:'2rem', lineHeight:1.1, color:'var(--text-heading)' }}>{title}</h3>
      {message && <p style={{ margin:0, maxWidth:'40ch', fontSize:'var(--text-body)', color:'var(--text-muted)' }}>{message}</p>}
      {details.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'10px 28px', marginTop:'4px' }}>
          {details.map((d,i) => (
            <span key={i} style={{ display:'flex', flexDirection:'column', gap:'4px', minWidth:'110px' }}>
              <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-eyebrow)', letterSpacing:'var(--tracking-eyebrow)', textTransform:'uppercase', color:'var(--text-muted)' }}>{d.label}</span>
              <span style={{ fontFamily:'var(--font-serif-display)', fontSize:'1.125rem', color:'var(--cocoa-800)' }}>{d.value}</span>
            </span>
          ))}
        </div>
      )}
      {actions && <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', justifyContent:'center', marginTop:'8px' }}>{actions}</div>}
    </div>
  );
}
