'use client';

import { useState } from 'react';
import { SectionHeading } from '../core/SectionHeading';
import { ImageFrame } from '../core/ImageFrame';
import { Tag } from '../core/Tag';
import { Button } from '../core/Button';
import { SITE } from '../../lib/site-config';

const FILTERS = ['Todos', 'Alongamento', 'Nail design', 'Nude', 'Francesinha'];

const SHOTS = [
  { src: '/assets/photo-hand-nails.png', ratio: '3/4', crop: 'soft', label: 'Gel · nude leitoso' },
  { src: '/assets/photo-studio-detail.png', ratio: '3/4', crop: 'soft', label: 'Cuidado com a cutícula' },
  { src: null, ratio: '3/4', crop: 'soft', label: 'Francesinha invertida' },
  { src: '/assets/photo-dried-flowers.png', ratio: '3/4', crop: 'soft', label: 'Estúdio' },
  { src: null, ratio: '3/4', crop: 'soft', label: 'Fibra de vidro' },
  { src: null, ratio: '3/4', crop: 'soft', label: 'Nail art delicada' },
];

export function Portfolio() {
  const [active, setActive] = useState('Todos');
  return (
    <section id="portfolio" style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter) var(--section-y)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', marginBottom: '40px' }}>
        <SectionHeading eyebrow="Portfólio" title={<>Trabalhos recentes</>} maxWidth={420} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {FILTERS.map((t) => <Tag key={t} selected={active === t} onClick={() => setActive(t)}>{t}</Tag>)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px' }}>
        {SHOTS.map((s, i) => (
          <ImageFrame key={i} src={s.src} ratio={s.ratio} crop={s.crop} alt={s.label} caption={s.label}
            style={{ marginTop: i % 3 === 1 ? '38px' : 0 }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '52px' }}>
        <Button variant="secondary" href={SITE.instagramHref}>Ver mais no Instagram</Button>
      </div>
    </section>
  );
}
