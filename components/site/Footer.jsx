'use client';

import Link from 'next/link';
import { Logo } from '../core/Logo';
import { Icon } from '../core/Icon';
import { useMobile } from '../../lib/useMobile';
import { SITE } from '../../lib/site-config';

function Column({ title, lines }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--nude-400)' }}>{title}</span>
      {lines.map((l, i) => <span key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-small)', color: 'var(--nude-300)', lineHeight: 1.7 }}>{l}</span>)}
    </div>
  );
}

export function Footer() {
  const m = useMobile();
  return (
    <footer id="contato" style={{ background: 'var(--espresso-900)', color: 'var(--text-on-inverse)', padding: 'var(--section-y-tight) 0 34px' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1.2fr 1fr 1fr 1fr', gap: m ? '34px' : '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
            <Logo size={m ? 0.52 : 0.62} tone="ivory" align="left" />
            <span style={{ fontFamily: 'var(--font-script)', fontSize: m ? '1.3rem' : '1.5rem', color: 'var(--nude-400)' }}>Seu momento. Suas unhas.</span>
          </div>
          <Column title="Estúdio" lines={[SITE.address, SITE.city, SITE.hours]} />
          <Column title="Contato" lines={[`WhatsApp ${SITE.whatsappDisplay}`, SITE.instagramHandle]} />
          <Column title="Atendimento" lines={['Somente com hora marcada', 'Remarque até 24h antes']} />
        </div>
        <div style={{ marginTop: m ? '34px' : '46px', paddingTop: '22px', borderTop: '1px solid rgba(250,247,243,.14)',
          display: 'flex', flexDirection: m ? 'column-reverse' : 'row', justifyContent: 'space-between',
          alignItems: m ? 'flex-start' : 'center', gap: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: m ? '18px' : '28px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--taupe-500)' }}>© 2026 Bell Miranda · Nail Designer</span>
            <Link href="/admin" style={{ border: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)',
              letterSpacing: '0.08em', color: 'var(--taupe-500)', opacity: 0.8 }}>Área administrativa</Link>
          </span>
          <span style={{ display: 'flex', gap: '18px', color: 'var(--nude-400)' }}>
            <a href={SITE.instagramHref} aria-label="Instagram" style={{ border: 0, color: 'inherit', lineHeight: 0 }}><Icon name="instagram" size={18} /></a>
            <a href={SITE.whatsappHref} aria-label="WhatsApp" style={{ border: 0, color: 'inherit', lineHeight: 0 }}><Icon name="message-circle" size={18} /></a>
            <a href={SITE.mapsHref} aria-label="Localização" style={{ border: 0, color: 'inherit', lineHeight: 0 }}><Icon name="map-pin" size={18} /></a>
          </span>
        </div>
      </div>
    </footer>
  );
}
