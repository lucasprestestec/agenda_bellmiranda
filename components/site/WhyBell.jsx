'use client';

import { Icon } from '../core/Icon';
import { useMobile } from '../../lib/useMobile';

const PILLARS = [
  { n: '01', icon: 'sparkles', label: ['Cutícula', 'é técnica'], note: 'Material esterilizado a cada atendimento.' },
  { n: '02', icon: 'shield-check', label: ['Um horário', 'por cliente'], note: 'Você não divide atenção nem espera.' },
  { n: '03', icon: 'gem', label: ['Durabilidade', 'real'], note: 'Acabamento pensado para 3 semanas.' },
  { n: '04', icon: 'user-round', label: ['Design', 'combinado'], note: 'Formato, comprimento e cor junto com você.' },
];

export function WhyBell() {
  const m = useMobile();
  const line = 'rgba(235,207,196,.22)';
  return (
    <section id="valores" style={{ background: '#2B1F1B', color: 'var(--ivory-100)', padding: 'var(--section-y) 0' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)',
        display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: m ? '40px' : 'clamp(40px,7vw,110px)', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: m ? '9.5px' : '10.5px', fontWeight: 600, letterSpacing: '0.26em',
              textTransform: 'uppercase', color: 'var(--nude-400)' }}>Nossos valores</span>
            <span style={{ width: '32px', height: '1px', background: line }}></span>
          </span>
          <h2 style={{ margin: m ? '20px 0 0' : 'clamp(32px,3.6vw,52px) 0 0', fontFamily: 'var(--font-serif-display)', fontWeight: 300,
            fontSize: m ? 'clamp(2.1rem,10vw,3rem)' : 'clamp(2.6rem,4.8vw,4.3rem)',
            lineHeight: 1.08, letterSpacing: '-0.012em', color: 'var(--ivory-50)' }}>
            Confiança se constrói na{' '}
            <span style={{ fontStyle: 'italic', color: '#EBD3C6' }}>técnica.</span>
          </h2>
          <span style={{ width: m ? '100%' : 'clamp(200px,24vw,330px)', maxWidth: '330px', height: '1px', background: line,
            margin: m ? '24px 0' : 'clamp(32px,3.6vw,50px) 0' }}></span>
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: m ? '0.9375rem' : '1rem', lineHeight: 1.8,
            color: 'var(--nude-300)', maxWidth: '36ch' }}>
            Mais do que beleza, entregamos cuidado, precisão e excelência em cada detalhe.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr' }}>
          {PILLARS.map((p, i) => (
            <div key={p.n} style={m
              ? { display: 'grid', gridTemplateColumns: '40px 1fr', gap: '0 18px', alignItems: 'center',
                  padding: '24px 0', borderBottom: i < 3 ? '1px solid ' + line : 'none' }
              : { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px',
                  padding: 'clamp(30px,3.4vw,48px) clamp(14px,2vw,30px)',
                  borderRight: i % 2 === 0 ? '1px solid ' + line : 'none',
                  borderBottom: i < 2 ? '1px solid ' + line : 'none' }}>
              {m ? (
                <span style={{ color: '#E4C2B0', lineHeight: 0, display: 'flex', justifyContent: 'center' }}><Icon name={p.icon} size={26} /></span>
              ) : (
                <>
                  <span style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid ' + line,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)',
                    fontSize: '10.5px', letterSpacing: '0.14em', color: 'var(--nude-400)' }}>{p.n}</span>
                  <span style={{ color: '#E4C2B0', lineHeight: 0 }}><Icon name={p.icon} size={30} /></span>
                </>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: m ? '10.5px' : '11px', fontWeight: 500,
                  letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ivory-100)', lineHeight: 1.9 }}>
                  {m ? p.label.join(' ') : p.label.map((l) => <div key={l}>{l}</div>)}
                </div>
                <p style={{ margin: m ? '6px 0 0' : '0', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem',
                  lineHeight: 1.7, color: 'rgba(243,233,226,.6)', maxWidth: m ? '34ch' : '24ch',
                  marginLeft: m ? 0 : 'auto', marginRight: m ? 0 : 'auto', paddingTop: m ? 0 : '14px' }}>{p.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
