'use client';

import Image from 'next/image';

export function TestimonialQuote({ quote, author, meta, avatar, align='left', size='md', style }) {
  const sizes = { md:'1.375rem', lg:'1.875rem' };
  return (
    <blockquote style={Object.assign({ margin:0, display:'flex', flexDirection:'column', gap:'20px',
      alignItems: align==='center' ? 'center' : 'flex-start', textAlign: align==='center' ? 'center' : 'left' }, style)}>
      <p style={{ margin:0, fontFamily:'var(--font-serif-display)', fontWeight:300, fontStyle:'italic',
        fontSize:sizes[size], lineHeight:1.45, color:'var(--text-heading)', maxWidth:'34ch' }}>{'\u201C'}{quote}{'\u201D'}</p>
      <footer style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        {avatar && <Image src={avatar} alt="" width={40} height={40} style={{ borderRadius:'var(--radius-pill)', objectFit:'cover' }} />}
        <span style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
          <cite style={{ fontStyle:'normal', fontFamily:'var(--font-sans)', fontSize:'var(--text-small)', fontWeight:500, color:'var(--cocoa-800)' }}>{author}</cite>
          {meta && <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-caption)', color:'var(--text-muted)' }}>{meta}</span>}
        </span>
      </footer>
    </blockquote>
  );
}
