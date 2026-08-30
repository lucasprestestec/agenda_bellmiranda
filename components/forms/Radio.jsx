'use client';

import React from 'react';

export function Radio({ checked=false, onChange, label, description, name, value, style }) {
  return (
    <label style={Object.assign({ display:'flex', alignItems:'flex-start', gap:'12px', cursor:'pointer',
      fontFamily:'var(--font-sans)', fontSize:'var(--text-small)', color:'var(--text-body)' }, style)}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange}
        style={{ position:'absolute', opacity:0, width:0, height:0 }} />
      <span aria-hidden="true" style={{ flex:'0 0 auto', width:'18px', height:'18px', marginTop:'1px', borderRadius:'var(--radius-pill)',
        border:'1px solid '+(checked?'var(--rose-500)':'var(--border-strong)'), background:'var(--surface-field)',
        display:'inline-flex', alignItems:'center', justifyContent:'center', transition:'all var(--dur-fast) var(--ease-soft)' }}>
        {checked && <span style={{ width:'8px', height:'8px', borderRadius:'var(--radius-pill)', background:'var(--rose-500)' }}></span>}
      </span>
      <span>
        <span style={{ display:'block' }}>{label}</span>
        {description && <span style={{ display:'block', color:'var(--text-muted)', fontSize:'var(--text-caption)', marginTop:'2px' }}>{description}</span>}
      </span>
    </label>
  );
}
