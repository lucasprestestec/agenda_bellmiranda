'use client';

import { Icon } from '../core/Icon';
import { useMobile } from '../../lib/useMobile';

export function About() {
  const m = useMobile();
  return (
    <section id="sobre" style={{ background: '#FAE7DF', padding: 'var(--section-y) 0 0' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: m ? '0' : '0 var(--gutter)',
        display: 'grid', gridTemplateColumns: m ? '1fr' : '.88fr 1.12fr',
        gap: m ? '32px' : 'clamp(36px,7vw,110px)', alignItems: m ? 'stretch' : 'end' }}>
        <div className="ph ph-portrait" style={{ height: m ? 'clamp(340px,86vw,430px)' : 'clamp(460px,58vw,820px)',
          margin: m ? '0 var(--gutter)' : 0, overflow: 'hidden',
          borderRadius: m ? '50% 50% 0 0 / 22% 22% 0 0' : '50% 50% 0 0 / 30% 30% 0 0',
          backgroundPosition: 'center top' }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          padding: m ? '0 var(--gutter) var(--section-y)' : '0 0 clamp(64px,8vw,120px)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: m ? '20px' : 'clamp(28px,3vw,44px)' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: m ? '9.5px' : '10.5px', fontWeight: 600, letterSpacing: '0.26em',
              textTransform: 'uppercase', color: 'var(--cocoa-700)' }}>Sobre</span>
            <span style={{ width: '32px', height: '1px', background: 'rgba(74,52,45,.35)' }}></span>
          </span>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300,
            fontSize: m ? 'clamp(2rem,9.4vw,2.75rem)' : 'clamp(2.4rem,4.2vw,3.7rem)',
            lineHeight: 1.12, letterSpacing: '-0.01em', color: 'var(--ink-900)' }}>
            Eu cuido das suas mãos como cuido do meu{' '}
            <span style={{ fontFamily: 'var(--font-serif-display)', fontStyle: 'italic', color: 'var(--cocoa-700)' }}>trabalho.</span>
          </h2>
          <p style={{ margin: m ? '22px 0 0' : 'clamp(26px,3vw,38px) 0 0', fontFamily: 'var(--font-sans)',
            fontSize: m ? '1rem' : '1.0625rem', lineHeight: 1.78, color: 'var(--cocoa-700)', maxWidth: '48ch' }}>
            Sou a Bell. Comecei atendendo amigas em casa e hoje recebo minhas clientes num estúdio só nosso, em Tatuí. Estudo técnica de cutícula, alongamento e design porque acredito que unha bonita é, antes de tudo, unha saudável.
          </p>
          <span style={{ display: 'flex', alignItems: 'center', gap: '18px', margin: m ? '28px 0 0' : 'clamp(34px,4vw,50px) 0 0' }}>
            <span style={{ fontFamily: 'var(--font-script)', fontSize: m ? '2rem' : '2.5rem', color: 'var(--cocoa-800)', lineHeight: 1 }}>Bell Miranda</span>
            <span style={{ width: '44px', height: '1px', background: 'rgba(74,52,45,.4)' }}></span>
          </span>
          <div style={{ marginTop: '18px', fontFamily: 'var(--font-sans)', fontSize: m ? '9.5px' : '10.5px', fontWeight: 500,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cocoa-700)', lineHeight: 2.1 }}>
            <div>Atendimento personalizado</div>
            <div>para realçar quem você é.</div>
          </div>
          <a href="#servicos" style={{ marginTop: m ? '30px' : 'clamp(34px,4vw,48px)', border: '1px solid var(--cocoa-800)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
            padding: m ? '20px 24px' : '22px 40px', width: m ? '100%' : 'auto', color: 'var(--cocoa-800)',
            fontFamily: 'var(--font-sans)', fontSize: m ? '10px' : '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Conheça o estúdio <Icon name="arrow-right" size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
