'use client';

import React from 'react';

const base = {
  display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'10px',
  fontFamily:'var(--font-sans)', fontWeight:500, textTransform:'uppercase',
  letterSpacing:'0.14em', lineHeight:1, textAlign:'center', whiteSpace:'nowrap',
  border:'1px solid transparent', borderRadius:'var(--radius-sm)', cursor:'pointer',
  textDecoration:'none', transition:'background var(--dur-base) var(--ease-soft), color var(--dur-base) var(--ease-soft), border-color var(--dur-base) var(--ease-soft), transform var(--dur-fast) var(--ease-soft)'
};

const sizes = {
  sm:{ height:'36px', padding:'0 16px', fontSize:'11px' },
  md:{ height:'44px', padding:'0 22px', fontSize:'12px' },
  lg:{ height:'52px', padding:'0 30px', fontSize:'12.5px' }
};

const variants = {
  primary:{ background:'var(--action-primary-bg)', color:'var(--action-primary-text)', borderColor:'var(--action-primary-bg)' },
  secondary:{ background:'transparent', color:'var(--action-secondary-text)', borderColor:'var(--action-secondary-border)' },
  accent:{ background:'var(--action-accent-bg)', color:'var(--text-on-accent)', borderColor:'var(--action-accent-bg)' },
  ghost:{ background:'transparent', color:'var(--cocoa-800)', borderColor:'transparent', padding:'0 4px' },
  whatsapp:{ background:'var(--whatsapp-soft)', color:'var(--whatsapp-ink)', borderColor:'var(--whatsapp-soft)' }
};

const hovers = {
  primary:{ background:'var(--action-primary-bg-hover)', borderColor:'var(--action-primary-bg-hover)' },
  secondary:{ background:'var(--nude-300)' },
  accent:{ background:'var(--action-accent-bg-hover)', borderColor:'var(--action-accent-bg-hover)' },
  ghost:{ color:'var(--rose-500)' },
  whatsapp:{ background:'#D8E0CF', borderColor:'#D8E0CF' }
};

export function Button({ variant='primary', size='md', fullWidth=false, disabled=false, href, iconLeft, iconRight, style, children, ...rest }) {
  const [hover,setHover] = React.useState(false);
  const [down,setDown] = React.useState(false);
  const Tag = href ? 'a' : 'button';
  const css = Object.assign({}, base, sizes[size], variants[variant],
    hover && !disabled ? hovers[variant] : null,
    down && !disabled ? { transform:'scale(var(--press-scale))' } : null,
    fullWidth ? { width:'100%' } : null,
    disabled ? { opacity:.4, cursor:'not-allowed' } : null,
    style);
  return (
    <Tag href={href} style={css} disabled={!href && disabled ? true : undefined}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>{setHover(false);setDown(false);}}
      onMouseDown={()=>setDown(true)} onMouseUp={()=>setDown(false)} {...rest}>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </Tag>
  );
}
