import { Logo } from '../core/Logo';
import { Icon } from '../core/Icon';
import { SITE } from '../../lib/site-config';

function Column({ title, lines }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--nude-400)' }}>{title}</span>
      {lines.map((l, i) => <span key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-small)', color: 'var(--nude-300)', lineHeight: 1.7 }}>{l}</span>)}
    </div>
  );
}

export function Footer() {
  return (
    <footer id="contato" style={{ background: 'var(--surface-inverse)', color: 'var(--text-on-inverse)', padding: 'var(--section-y-tight) 0 34px' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'flex-start' }}>
            <Logo size={0.62} tone="ivory" align="left" />
            <span style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem', color: 'var(--nude-400)' }}>Seu momento. Suas unhas.</span>
          </div>
          <Column title="Estúdio" lines={[SITE.address, SITE.city, SITE.hours]} />
          <Column title="Contato" lines={[`WhatsApp (15) 99999-0000`, SITE.email, SITE.instagramHandle]} />
          <Column title="Atendimento" lines={['Somente com hora marcada', 'Sinal de 20% confirma o horário', 'Remarque até 24h antes']} />
        </div>
        <div style={{ marginTop: '46px', paddingTop: '22px', borderTop: '1px solid rgba(250,247,243,.14)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--taupe-500)' }}>© 2026 Bell Miranda · Nail Designer</span>
          <span style={{ display: 'flex', gap: '16px', color: 'var(--nude-400)' }}>
            <a href={SITE.instagramHref} aria-label="Instagram" style={{ border: 0, color: 'inherit', lineHeight: 0 }}><Icon name="instagram" size={17} /></a>
            <a href={SITE.whatsappHref} aria-label="WhatsApp" style={{ border: 0, color: 'inherit', lineHeight: 0 }}><Icon name="message-circle" size={17} /></a>
            <a href={SITE.mapsHref} aria-label="Localização" style={{ border: 0, color: 'inherit', lineHeight: 0 }}><Icon name="map-pin" size={17} /></a>
          </span>
        </div>
      </div>
    </footer>
  );
}
