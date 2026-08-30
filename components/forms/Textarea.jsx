'use client';

import React from 'react';

export function Textarea({ error=false, rows=4, style, ...rest }) {
  const [focus,setFocus] = React.useState(false);
  return <textarea rows={rows} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
    style={Object.assign({ width:'100%', height:'48px', padding:'0 14px', fontFamily:'var(--font-sans)', fontSize:'var(--text-body)',
      background:'var(--surface-field)', color:'var(--text-body)',
      border:'1px solid '+(error?'var(--danger-500)':(focus?'var(--rose-500)':'var(--border-hairline)')),
      borderRadius:'var(--radius-sm)', outline:'none',
      boxShadow: focus ? '0 0 0 3px rgba(215,149,163,.16)' : 'none',
      transition:'border-color var(--dur-base) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft)' }, { height:'auto', padding:'14px', lineHeight:'var(--leading-body)', resize:'vertical' }, style)} {...rest} />;
}
