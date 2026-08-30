'use client';

import React from 'react';

export function Select({ error=false, options=[], placeholder, style, children, ...rest }) {
  const [focus,setFocus] = React.useState(false);
  return (
    <span style={{ position:'relative', display:'block' }}>
      <select onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
        style={Object.assign({ width:'100%', height:'48px', padding:'0 14px', fontFamily:'var(--font-sans)', fontSize:'var(--text-body)',
      background:'var(--surface-field)', color:'var(--text-body)',
      border:'1px solid '+(error?'var(--danger-500)':(focus?'var(--rose-500)':'var(--border-hairline)')),
      borderRadius:'var(--radius-sm)', outline:'none',
      boxShadow: focus ? '0 0 0 3px rgba(215,149,163,.16)' : 'none',
      transition:'border-color var(--dur-base) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft)' }, { appearance:'none', paddingRight:'40px', cursor:'pointer' }, style)} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        {children}
      </select>
      <span aria-hidden="true" style={{ position:'absolute', right:'16px', top:'50%', transform:'translateY(-50%)',
        pointerEvents:'none', color:'var(--text-muted)', fontSize:'10px' }}>{'\u25BE'}</span>
    </span>
  );
}
