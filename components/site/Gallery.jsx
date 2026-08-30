'use client';

import { Icon } from '../core/Icon';
import { useMobile } from '../../lib/useMobile';
import { SITE } from '../../lib/site-config';

const STRIP = ['ph-w2', 'ph-w1', 'ph-w5', 'ph-w3', 'ph-w4'];

export function Gallery() {
  const m = useMobile();
  return (
    <section id="galeria" style={{ background: 'var(--surface-page)', padding: 'var(--section-y) 0' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)' }}>
        <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', flexWrap: 'wrap',
          alignItems: m ? 'stretch' : 'flex-end', justifyContent: 'space-between', gap: m ? '20px' : '28px' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: m ? '9.5px' : '10.5px', fontWeight: 600, letterSpacing: '0.26em',
              textTransform: 'uppercase', color: 'var(--ink-500)' }}>No Instagram</span>
            <h2 style={{ margin: m ? '14px 0 0' : '20px 0 0', fontFamily: 'var(--font-serif-display)', fontWeight: 300,
              fontSize: m ? 'clamp(1.6rem,7.6vw,2.2rem)' : 'clamp(2rem,3.2vw,2.9rem)', lineHeight: 1.12,
              color: 'var(--ink-900)', wordBreak: 'break-word' }}>{SITE.instagramHandle}</h2>
          </div>
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', lineHeight: 1.7,
            color: 'var(--ink-500)', maxWidth: '34ch' }}>
            Novidades, disponibilidade de horários e antes-e-depois toda semana.
          </p>
          <a href={SITE.instagramHref} style={{ border: '1px solid var(--cocoa-800)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', gap: '12px', padding: m ? '19px 24px' : '19px 32px',
            width: m ? '100%' : 'auto', color: 'var(--cocoa-800)', fontFamily: 'var(--font-sans)',
            fontSize: m ? '10px' : '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Seguir <Icon name="arrow-up-right" size={14} />
          </a>
        </div>
        {m ? (
          <div className="bm-scroller" style={{ margin: '26px calc(var(--gutter) * -1) 0', padding: '0 var(--gutter)' }}>
            {STRIP.map((p) => (
              <span key={p} className={'ph ' + p} style={{ width: '46vw', maxWidth: '220px', aspectRatio: '1/1', display: 'block' }}></span>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '14px', marginTop: 'clamp(36px,4vw,56px)' }}>
            {STRIP.map((p) => <span key={p} className={'ph ' + p} style={{ aspectRatio: '1/1' }}></span>)}
          </div>
        )}
      </div>
    </section>
  );
}
