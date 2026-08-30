'use client';

import React from 'react';

/* Delicate divider taken from the brand board: hairline — 4-point star — hairline. */
export function Ornament({ width=180, motif='star', color='var(--champagne-500)', style }) {
  const glyph = motif==='star' ? '\u2726' : motif==='heart' ? '\u2661' : '\u00B7';
  return (
    <span style={Object.assign({ display:'inline-flex', alignItems:'center', gap:'12px', width:width+'px', maxWidth:'100%' }, style)}>
      <span style={{ flex:1, height:'1px', background:color, opacity:.45 }}></span>
      {motif!=='rule' && <span style={{ color, fontSize:'11px', lineHeight:1, opacity:.85 }}>{glyph}</span>}
      <span style={{ flex:1, height:'1px', background:color, opacity:.45 }}></span>
    </span>
  );
}
