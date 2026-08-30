import { ImageFrame } from '../core/ImageFrame';
import { Ornament } from '../core/Ornament';

export function About() {
  return (
    <section id="sobre" style={{ background: 'var(--surface-alt)', padding: 'var(--section-y) 0' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)',
        display: 'grid', gridTemplateColumns: '.85fr 1.15fr', gap: 'clamp(32px,6vw,86px)', alignItems: 'center' }}>
        <ImageFrame src="/assets/photo-dried-flowers.png" ratio="4/5" crop="arch" alt="Retrato da Bell" tone="ivory" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sobre a Bell</span>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: 'var(--text-display-2)', lineHeight: 1.06, color: 'var(--ink-900)' }}>
            Eu cuido das suas mãos<br />como cuido do meu trabalho
          </h2>
          <p style={{ margin: 0, fontSize: 'var(--text-lead)', color: 'var(--text-muted)', maxWidth: '50ch' }}>
            Sou a Bell. Comecei atendendo amigas em casa e hoje recebo minhas clientes num estúdio só nosso, em Tatuí. Estudo técnica de cutícula, alongamento e design porque acredito que unha bonita é, antes de tudo, unha saudável.
          </p>
          <p style={{ margin: 0, fontSize: 'var(--text-body)', color: 'var(--text-muted)', maxWidth: '50ch' }}>
            Trabalho com material esterilizado, um horário por cliente e conversa de verdade sobre o que combina com a sua rotina.
          </p>
          <Ornament width={160} />
          <span style={{ fontFamily: 'var(--font-script)', fontSize: '2.25rem', color: 'var(--champagne-500)', lineHeight: 1 }}>Bell Miranda</span>
        </div>
      </div>
    </section>
  );
}
