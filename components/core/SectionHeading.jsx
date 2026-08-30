'use client';

import React from 'react';

export function SectionHeading({ eyebrow, title, lead, align='left', ornament=false, level='h2', maxWidth=560, tone='dark', style }) {
  const H = level;
  const dark = tone==='dark';
  return (
    <header style={Object.assign({ display:'flex', flexDirection:'column', gap:'18px',
      alignItems: align==='center' ? 'center' : 'flex-start',
      textAlign: align==='center' ? 'center' : 'left', maxWidth:maxWidth+'px' }, style)}>
      {eyebrow && <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-eyebrow)', letterSpacing:'var(--tracking-eyebrow)', textTransform:'uppercase', fontWeight:500, color: dark ? 'var(--text-muted)' : 'var(--nude-400)' }}>{eyebrow}</span>}
      {ornament && <span style={{ marginTop:'-6px' }}><span style={{ display:'block', width:'120px', height:'1px', background:'var(--champagne-500)', opacity:.5 }}></span></span>}
      <H style={{ fontFamily:'var(--font-serif-display)', fontWeight:300, fontSize:'var(--text-display-2)', lineHeight:1.06, letterSpacing:'var(--tracking-display)', margin:0, color: dark ? 'var(--text-heading)' : 'var(--ivory-100)' }}>{title}</H>
      {lead && <p style={{ margin:0, fontSize:'var(--text-lead)', lineHeight:'var(--leading-body)', color: dark ? 'var(--text-muted)' : 'var(--nude-300)', maxWidth:'52ch' }}>{lead}</p>}
    </header>
  );
}
