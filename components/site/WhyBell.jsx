import { SectionHeading } from '../core/SectionHeading';

const FEATURES = [
  ['01', 'Cutícula é técnica', 'Material esterilizado a cada atendimento, sem dor e sem sangrar.'],
  ['02', 'Um horário por cliente', 'Você não divide atenção nem espera na cadeira.'],
  ['03', 'Durabilidade real', 'Acabamento pensado para 3 semanas de rotina, casa e trabalho.'],
  ['04', 'Design combinado', 'Formato, comprimento e cor decididos junto com você.'],
];

export function WhyBell() {
  return (
    <section style={{ background: 'var(--surface-inverse)', color: 'var(--text-on-inverse)', padding: 'var(--section-y) 0' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)',
        display: 'grid', gridTemplateColumns: '.9fr 1.1fr', gap: 'clamp(32px,6vw,80px)', alignItems: 'start' }}>
        <SectionHeading tone="light" eyebrow="Por que a Bell" title={<>Confiança se<br />constrói na técnica</>} maxWidth={380} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '34px 40px' }}>
          {FEATURES.map(([i, t, d]) => (
            <div key={i} style={{ display: 'flex', gap: '16px' }}>
              <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.5rem', color: 'var(--nude-400)' }}>{i}</span>
              <div>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.25rem', color: 'var(--ivory-100)' }}>{t}</h4>
                <p style={{ margin: '8px 0 0', fontSize: 'var(--text-small)', lineHeight: 1.65, color: 'var(--nude-300)', maxWidth: '34ch' }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
