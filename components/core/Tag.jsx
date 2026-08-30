'use client';

import React from 'react';

export function Tag({ tone='neutral', selected=false, as='span', onClick, style, children, ...rest }) {
  const Tag_ = onClick ? 'button' : as;
  const tones = {
    neutral:{ background:'transparent', color:'var(--text-muted)', borderColor:'var(--border-strong)' },
    blush:{ background:'var(--blush-400)', color:'var(--cocoa-800)', borderColor:'transparent' },
    gold:{ background:'transparent', color:'var(--champagne-600)', borderColor:'var(--champagne-500)' },
    cocoa:{ background:'var(--cocoa-800)', color:'var(--ivory-100)', borderColor:'var(--cocoa-800)' }
  };
  return (
    <Tag_ onClick={onClick} style={Object.assign({
      display:'inline-flex', alignItems:'center', gap:'6px', height:'30px', padding:'0 14px',
      borderRadius:'var(--radius-pill)', border:'1px solid transparent',
      fontFamily:'var(--font-sans)', fontSize:'11px', fontWeight:500,
      letterSpacing:'0.12em', textTransform:'uppercase', lineHeight:1,
      cursor:onClick?'pointer':'default', transition:'all var(--dur-base) var(--ease-soft)'
    }, tones[tone], selected ? { background:'var(--selected-bg)', color:'var(--selected-text)', borderColor:'var(--selected-bg)' } : null, style)} {...rest}>
      {children}
    </Tag_>
  );
}
