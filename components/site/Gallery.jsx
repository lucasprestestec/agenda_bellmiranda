import { SectionHeading } from '../core/SectionHeading';
import { ImageFrame } from '../core/ImageFrame';
import { Button } from '../core/Button';
import { Icon } from '../core/Icon';
import { SITE } from '../../lib/site-config';

export function Gallery() {
  return (
    <section id="galeria" style={{ background: 'var(--surface-alt)', padding: 'var(--section-y) 0' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)' }}>
        <SectionHeading eyebrow="No Instagram" title={SITE.instagramHandle} lead="Novidades, disponibilidade de horários e antes-e-depois toda semana." maxWidth={480} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '14px', margin: '44px 0 36px' }}>
          <ImageFrame src="/assets/photo-hand-nails.png" ratio="1/1" crop="soft" alt="" />
          <ImageFrame src="/assets/photo-studio-detail.png" ratio="1/1" crop="soft" alt="" />
          <ImageFrame src="/assets/photo-dried-flowers.png" ratio="1/1" crop="soft" alt="" />
          <ImageFrame ratio="1/1" crop="soft" alt="Foto" tone="ivory" />
          <ImageFrame ratio="1/1" crop="soft" alt="Foto" tone="ivory" />
        </div>
        <Button variant="secondary" href={SITE.instagramHref} iconRight={<Icon name="arrow-up-right" size={15} />}>Seguir no Instagram</Button>
      </div>
    </section>
  );
}
