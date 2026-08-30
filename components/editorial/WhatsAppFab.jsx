'use client';

import React from 'react';

/* Floating WhatsApp affordance. Cocoa surface, not WhatsApp green. */
export function WhatsAppFab({ label='WhatsApp', href='#', icon, expanded=true, style }) {
  const [hover,setHover] = React.useState(false);
  return (
    <a href={href} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={Object.assign({ position:'fixed', right:'22px', bottom:'22px', zIndex:40,
        display:'inline-flex', alignItems:'center', gap:'10px', height:'50px', padding: expanded ? '0 20px' : '0',
        width: expanded ? 'auto' : '50px', justifyContent:'center',
        borderRadius:'var(--radius-pill)', background: hover ? 'var(--ink-900)' : 'var(--cocoa-800)',
        color:'var(--ivory-100)', border:0, textDecoration:'none', boxShadow:'var(--shadow-md)',
        fontFamily:'var(--font-sans)', fontSize:'11px', fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase',
        transition:'background var(--dur-base) var(--ease-soft)' }, style)}>
      {icon}
      {expanded && <span>{label}</span>}
    </a>
  );
}
