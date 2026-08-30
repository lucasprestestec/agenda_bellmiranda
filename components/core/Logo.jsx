'use client';

import React from 'react';

/* Type-set reconstruction of the Bell Miranda lockup: script "Bell",
   letterspaced serif "MIRANDA", hairline rule + spaced sans descriptor.
   Use assets/logo-primary.png when the exact licensed lettering is required. */
export function Logo({ size=1, tone='cocoa', descriptor=true, align='center', style }) {
  const tones = {
    cocoa:{ script:'var(--champagne-500)', word:'var(--cocoa-800)', desc:'var(--rose-500)' },
    rose:{ script:'var(--rose-500)', word:'var(--cocoa-700)', desc:'var(--rose-500)' },
    ivory:{ script:'var(--nude-400)', word:'var(--ivory-100)', desc:'var(--nude-400)' }
  }[tone];
  const items = { center:'center', left:'flex-start' }[align];
  return (
    <div style={Object.assign({ display:'flex', flexDirection:'column', alignItems:items, lineHeight:1, gap:(2*size)+'px' }, style)}>
      <span style={{ fontFamily:'var(--font-script)', fontSize:(38*size)+'px', color:tones.script, lineHeight:1.1, marginBottom:(-4*size)+'px' }}>Bell</span>
      <span style={{ fontFamily:'var(--font-serif-display)', fontSize:(21*size)+'px', letterSpacing:'var(--tracking-serif-wide)', textTransform:'uppercase', color:tones.word, paddingLeft:'0.14em' }}>Miranda</span>
      {descriptor && (
        <span style={{ display:'flex', alignItems:'center', gap:(8*size)+'px', marginTop:(5*size)+'px' }}>
          <span style={{ width:(22*size)+'px', height:'1px', background:tones.desc, opacity:.5 }}></span>
          <span style={{ fontFamily:'var(--font-sans)', fontSize:(8.5*size)+'px', letterSpacing:'0.3em', textTransform:'uppercase', color:tones.desc }}>Nail Designer</span>
          <span style={{ width:(22*size)+'px', height:'1px', background:tones.desc, opacity:.5 }}></span>
        </span>
      )}
    </div>
  );
}
