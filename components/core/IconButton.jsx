'use client';

import React from 'react';

export function IconButton({ variant='outline', size=44, label, children, style, ...rest }) {
  const [hover,setHover] = React.useState(false);
  const skins = {
    outline:{ background:'transparent', border:'1px solid var(--border-strong)', color:'var(--cocoa-800)' },
    solid:{ background:'var(--action-primary-bg)', border:'1px solid var(--action-primary-bg)', color:'var(--action-primary-text)' },
    soft:{ background:'var(--nude-300)', border:'1px solid transparent', color:'var(--cocoa-800)' },
    bare:{ background:'transparent', border:'1px solid transparent', color:'var(--cocoa-800)' }
  };
  const hoverSkins = {
    outline:{ borderColor:'var(--rose-500)', color:'var(--rose-500)' },
    solid:{ background:'var(--ink-900)' },
    soft:{ background:'var(--nude-400)' },
    bare:{ color:'var(--rose-500)' }
  };
  return (
    <button aria-label={label} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={Object.assign({ width:size+'px', height:size+'px', display:'inline-flex', alignItems:'center',
        justifyContent:'center', borderRadius:'var(--radius-pill)', cursor:'pointer',
        transition:'all var(--dur-base) var(--ease-soft)' }, skins[variant], hover?hoverSkins[variant]:null, style)} {...rest}>
      {children}
    </button>
  );
}
