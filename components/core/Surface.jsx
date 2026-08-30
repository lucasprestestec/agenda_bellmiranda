'use client';

import React from 'react';

export function Surface({ tone='card', padding=28, radius='var(--radius-lg)', border=true, elevation='sm', interactive=false, style, children, ...rest }) {
  const [hover,setHover] = React.useState(false);
  const tones = { card:'var(--surface-card)', alt:'var(--surface-alt)', page:'var(--surface-page)', blush:'var(--surface-accent-soft)', inverse:'var(--surface-inverse)' };
  const shadows = { none:'var(--shadow-none)', xs:'var(--shadow-xs)', sm:'var(--shadow-sm)', md:'var(--shadow-md)' };
  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={Object.assign({
        background:tones[tone], borderRadius:radius, padding:padding+'px',
        border: border ? '1px solid '+(tone==='inverse'?'rgba(250,247,243,.14)':'var(--border-hairline)') : '1px solid transparent',
        boxShadow: shadows[elevation],
        color: tone==='inverse' ? 'var(--text-on-inverse)' : 'inherit',
        transition:'transform var(--dur-base) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft), border-color var(--dur-base) var(--ease-soft)'
      }, interactive && hover ? { transform:'translateY(var(--lift-hover))', boxShadow:'var(--shadow-md)', borderColor:'var(--border-strong)' } : null, style)} {...rest}>
      {children}
    </div>
  );
}
