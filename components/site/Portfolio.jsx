'use client';

import { useState } from 'react';
import { Icon } from '../core/Icon';
import { useMobile } from '../../lib/useMobile';
import { SITE } from '../../lib/site-config';

const WORKS = [
  { cls: 'ph-w1', cat: 'Alongamento em gel', note: 'Nude leitoso, formato amêndoa', area: 'a' },
  { cls: 'ph-w2', cat: 'Blindagem', note: 'Acabamento natural', area: 'b' },
  { cls: 'ph-w3', cat: 'Nail design', note: 'Detalhes minimalistas', area: 'c' },
  { cls: 'ph-w4', cat: 'Fibra de vidro', note: 'Formato amêndoa longo', area: 'd' },
  { cls: 'ph-w5', cat: 'Esmaltação', note: 'Tonalidade intensa', area: 'e' },
];

function Shot({ cls, cat, note, area, mobile }) {
  return (
    <figure className={'ph ' + cls} style={{ gridArea: area, position: 'relative', margin: 0, overflow: 'hidden', minWidth: 0 }}>
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(43,31,27,.56) 0%, rgba(43,31,27,.18) 36%, rgba(43,31,27,0) 64%)' }}></div>
      <figcaption style={{ position: 'absolute', left: mobile ? '14px' : '20px', right: mobile ? '14px' : '20px', bottom: mobile ? '14px' : '20px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'rgba(250,247,243,.86)' }}>{cat}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: mobile ? '12.5px' : '13.5px', color: 'var(--ivory-50)', marginTop: '5px' }}>{note}</div>
      </figcaption>
    </figure>
  );
}

export function Portfolio() {
  const m = useMobile();
  const filters = ['Todos', 'Alongamento', 'Nail design', 'Nude', 'Francesinha'];
  const [active, setActive] = useState('Todos');
  const pills = (
    <div className={m ? 'bm-scroller' : ''} style={m
      ? { margin: '0 calc(var(--gutter) * -1)', padding: '2px var(--gutter) 4px' }
      : { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '6px' }}>
      {filters.map((t) => (
        <button key={t} onClick={() => setActive(t)}
          style={{ cursor: 'pointer', borderRadius: '999px', padding: m ? '0 20px' : '13px 24px', minHeight: m ? '42px' : 'auto',
            fontFamily: 'var(--font-sans)', fontSize: '13px', whiteSpace: 'nowrap',
            background: active === t ? 'var(--espresso-900)' : 'transparent',
            color: active === t ? 'var(--ivory-100)' : 'var(--cocoa-700)',
            border: '1px solid ' + (active === t ? 'var(--espresso-900)' : 'var(--border-strong)') }}>{t}</button>
      ))}
    </div>
  );
  return (
    <section id="portfolio" style={{ background: 'var(--surface-page)', padding: 'var(--section-y) 0' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)' }}>
        <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', flexWrap: 'wrap',
          alignItems: m ? 'stretch' : 'flex-end', justifyContent: 'space-between',
          gap: m ? '22px' : 'clamp(24px,4vw,64px)', marginBottom: m ? '26px' : 'clamp(36px,4vw,58px)' }}>
          <div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: m ? '16px' : '22px' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: m ? '9.5px' : '10.5px', fontWeight: 600, letterSpacing: '0.26em',
                textTransform: 'uppercase', color: 'var(--ink-500)' }}>Portfólio</span>
              <span style={{ width: '32px', height: '1px', background: 'var(--border-strong)' }}></span>
            </span>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300,
              fontSize: m ? 'clamp(2.1rem,10vw,2.9rem)' : 'clamp(2.6rem,4.6vw,4.1rem)',
              lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--ink-900)' }}>
              Trabalhos{m ? ' ' : <br />}recentes
            </h2>
          </div>
          <p style={{ margin: m ? 0 : '0 0 8px', fontFamily: 'var(--font-sans)', fontSize: m ? '0.9375rem' : '1rem',
            lineHeight: 1.7, color: 'var(--ink-500)', maxWidth: '32ch' }}>
            Cada detalhe feito com intenção, para realçar o que já é <em style={{ fontFamily: 'var(--font-serif-display)', fontStyle: 'italic', fontSize: '1.14em', color: 'var(--rose-500)' }}>único em você</em>.
          </p>
          {pills}
        </div>

        <div style={m
          ? { display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '62vw 40vw 46vw', gridTemplateAreas: '"a a" "b c" "d e"' }
          : { display: 'grid', gap: '16px', gridTemplateColumns: '1.3fr 1.1fr .84fr .74fr',
              gridTemplateRows: 'clamp(200px,22vw,318px) clamp(196px,21.5vw,310px)',
              gridTemplateAreas: '"a b d ." "a c d e"' }}>
          {WORKS.map((w) => <Shot key={w.cat} {...w} mobile={m} />)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: m ? '30px' : 'clamp(40px,5vw,64px)' }}>
          <a href={SITE.instagramHref} style={{ border: '1px solid var(--blush-500)', borderRadius: '999px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            padding: m ? '19px 26px' : '20px 46px', width: m ? '100%' : 'auto', color: 'var(--rose-600)',
            fontFamily: 'var(--font-sans)', fontSize: m ? '10px' : '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            <Icon name="instagram" size={15} /> Ver mais no Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
