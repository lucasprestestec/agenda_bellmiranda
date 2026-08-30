'use client';

import React from 'react';

export function Input({ error=false, iconLeft, style, ...rest }) {
  const [focus,setFocus] = React.useState(false);
  const css = Object.assign({ width:'100%', height:'48px', padding:'0 14px', fontFamily:'var(--font-sans)', fontSize:'var(--text-body)',
      background:'var(--surface-field)', color:'var(--text-body)',
      border:'1px solid '+(error?'var(--danger-500)':(focus?'var(--rose-500)':'var(--border-hairline)')),
      borderRadius:'var(--radius-sm)', outline:'none',
      boxShadow: focus ? '0 0 0 3px rgba(215,149,163,.16)' : 'none',
      transition:'border-color var(--dur-base) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft)' }, iconLeft ? { paddingLeft:'42px' } : null, style);
  const input = <input onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} style={css} {...rest} />;
  if (!iconLeft) return input;
  return (
    <span style={{ position:'relative', display:'block' }}>
      <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', lineHeight:0 }}>{iconLeft}</span>
      {input}
    </span>
  );
}
