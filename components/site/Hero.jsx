import { Button } from '../core/Button';
import { Ornament } from '../core/Ornament';
import { ImageFrame } from '../core/ImageFrame';
import { Icon } from '../core/Icon';

export function Hero() {
  return (
    <section style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'clamp(48px,7vw,96px) var(--gutter) var(--section-y)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 'clamp(32px,6vw,80px)', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '26px' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)',
            textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nail designer · Tatuí — SP</span>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300, fontSize: 'var(--text-display-1)',
            lineHeight: 1.02, letterSpacing: '-0.01em', color: 'var(--ink-900)' }}>
            Unhas que<br />combinam com<br /><span style={{ fontFamily: 'var(--font-script)', color: 'var(--champagne-500)', fontSize: '1.02em', lineHeight: 1.2 }}>você</span>
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--text-lead)', color: 'var(--text-muted)', maxWidth: '42ch' }}>
            Cuidado técnico com a cutícula, alongamento em gel e fibra, e design feito à mão — um horário por cliente, sem pressa.
          </p>
          <Ornament width={200} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Button size="lg" href="/agendar">Agendar horário</Button>
            <Button size="lg" variant="secondary" href="#portfolio" iconRight={<Icon name="arrow-up-right" size={15} />}>Ver portfólio</Button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr .62fr', gap: '18px', alignItems: 'end' }}>
          <ImageFrame src="/assets/photo-hand-nails.png" ratio="3/4.4" crop="arch" alt="Unhas em nude natural" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <ImageFrame src="/assets/photo-studio-detail.png" ratio="1/1" crop="soft" alt="Detalhe do estúdio" />
            <div style={{ padding: '18px 0 4px', borderTop: '1px solid var(--border-hairline)' }}>
              <div style={{ fontFamily: 'var(--font-serif-display)', fontSize: '2rem', color: 'var(--cocoa-800)', lineHeight: 1 }}>+400</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--text-muted)', marginTop: '6px' }}>clientes atendidas desde 2021</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
