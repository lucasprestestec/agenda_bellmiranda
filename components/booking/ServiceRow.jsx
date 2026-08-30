'use client';

import React from 'react';

export function ServiceRow({ name, description, duration, price, priceNote, tags=[], selected=false, onSelect, action='Agendar', style }) {
  const [hover,setHover] = React.useState(false);
  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={Object.assign({ display:'grid', gridTemplateColumns:'minmax(0,1fr) auto', gap:'20px', alignItems:'start',
        padding:'26px 4px', borderTop:'1px solid var(--border-hairline)',
        background: selected ? 'linear-gradient(90deg,rgba(235,207,208,.28),transparent 70%)' : 'transparent',
        transition:'background var(--dur-base) var(--ease-soft)' }, style)}>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        <h4 style={{ margin:0, fontFamily:'var(--font-serif-display)', fontWeight:400, fontSize:'1.5rem', lineHeight:1.2, color:'var(--text-heading)' }}>{name}</h4>
        {description && <p style={{ margin:0, fontSize:'var(--text-small)', color:'var(--text-muted)', maxWidth:'46ch', lineHeight:1.6 }}>{description}</p>}
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'14px', marginTop:'2px' }}>
          {duration && <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-caption)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-muted)' }}>{duration}</span>}
          {tags.map(t => (
            <span key={t} style={{ fontFamily:'var(--font-sans)', fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase',
              color:'var(--champagne-600)', borderBottom:'1px solid var(--champagne-500)', paddingBottom:'2px' }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'10px', textAlign:'right' }}>
        {price && <span style={{ fontFamily:'var(--font-serif-display)', fontSize:'1.375rem', color:'var(--cocoa-800)' }}>{price}</span>}
        {priceNote && <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-caption)', color:'var(--text-muted)' }}>{priceNote}</span>}
        {onSelect && (
          <button onClick={onSelect} style={{ background:'transparent', border:0, padding:0, cursor:'pointer',
            fontFamily:'var(--font-sans)', fontSize:'11px', fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase',
            color: selected ? 'var(--rose-500)' : (hover ? 'var(--rose-500)' : 'var(--cocoa-800)'),
            borderBottom:'1px solid '+(selected||hover ? 'var(--rose-500)' : 'var(--border-strong)'), paddingBottom:'3px',
            transition:'all var(--dur-base) var(--ease-soft)' }}>
            {selected ? 'Selecionado' : action}
          </button>
        )}
      </div>
    </div>
  );
}
