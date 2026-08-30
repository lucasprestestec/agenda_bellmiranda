'use client';

import Link from 'next/link';
import { Icon } from '../core/Icon';
import { useMobile } from '../../lib/useMobile';

export function ServicesIntro() {
  const m = useMobile();
  return (
    <div style={{ position: m ? 'static' : 'sticky', top: '128px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: m ? '9.5px' : '10.5px', fontWeight: 600, letterSpacing: '0.26em',
        textTransform: 'uppercase', color: 'var(--champagne-600)' }}>Serviços</span>
      <h2 style={{ margin: m ? '18px 0 0' : 'clamp(26px,3vw,42px) 0 0', fontFamily: 'var(--font-serif-display)', fontWeight: 300,
        fontSize: m ? 'clamp(2.1rem,10vw,2.9rem)' : 'clamp(2.4rem,4.2vw,3.8rem)',
        lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--ink-900)' }}>
        Cada detalhe{m ? ' ' : <br />}tem seu tempo
      </h2>
      <span style={{ width: m ? '80px' : '104px', height: '1px', background: 'var(--champagne-500)',
        margin: m ? '22px 0' : 'clamp(28px,3vw,42px) 0' }}></span>
      <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: m ? '0.9375rem' : '1rem', lineHeight: 1.78,
        color: 'var(--ink-500)', maxWidth: '40ch' }}>
        Valores válidos para atendimento no estúdio, com hora marcada — um horário por cliente, sem pressa.
      </p>
      <Link href="/agendar"
        style={{ marginTop: m ? '26px' : 'clamp(32px,3.6vw,48px)', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', gap: '14px', width: m ? '100%' : 'auto',
          background: 'var(--espresso-900)', color: 'var(--ivory-100)', border: '1px solid var(--espresso-900)',
          padding: m ? '20px 24px' : '23px 36px', fontFamily: 'var(--font-sans)', fontSize: m ? '10px' : '11px',
          fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Agendar horário <Icon name="arrow-right" size={14} />
      </Link>
      {!m && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: 'clamp(48px,7vw,110px)' }}>
          <span style={{ width: '52px', height: '52px', borderRadius: '50%', border: '1px solid var(--border-strong)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif-display)',
            fontSize: '14px', letterSpacing: '0.1em', color: 'var(--taupe-500)', flexShrink: 0 }}>BM</span>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--taupe-500)', lineHeight: 2.1 }}>
            <div>Bell Miranda Nails</div>
            <div>Beleza que expressa</div>
          </div>
        </div>
      )}
    </div>
  );
}
