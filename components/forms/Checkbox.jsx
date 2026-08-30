'use client';

import React from 'react';

export function Checkbox({ checked=false, onChange, label, disabled=false, style }) {
  return (
    <label style={Object.assign({ display:'inline-flex', alignItems:'flex-start', gap:'10px',
      cursor:disabled?'not-allowed':'pointer', opacity:disabled?.45:1, fontFamily:'var(--font-sans)',
      fontSize:'var(--text-small)', lineHeight:1.5, color:'var(--text-body)' }, style)}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange}
        style={{ position:'absolute', opacity:0, width:0, height:0 }} />
      <span aria-hidden="true" style={{ flex:'0 0 auto', width:'18px', height:'18px', marginTop:'1px',
        borderRadius:'var(--radius-xs)', border:'1px solid '+(checked?'var(--rose-500)':'var(--border-strong)'),
        background: checked ? 'var(--rose-500)' : 'var(--surface-field)', color:'var(--white)',
        display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'11px',
        transition:'all var(--dur-fast) var(--ease-soft)' }}>{checked ? '\u2713' : ''}</span>
      {label && <span>{label}</span>}
    </label>
  );
}
