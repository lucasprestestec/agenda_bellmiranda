'use client';

import { useRouter } from 'next/navigation';
import { ServiceRow } from '../booking/ServiceRow';

export function ServiceList({ services }) {
  const router = useRouter();
  return (
    <div style={{ borderBottom: '1px solid var(--border-hairline)' }}>
      {services.map((s) => (
        <ServiceRow key={s.slug} name={s.name} description={s.description} duration={s.duration}
          price={s.price} priceNote={s.priceNote} tags={s.tags}
          onSelect={() => router.push(`/agendar?servico=${s.slug}`)} />
      ))}
    </div>
  );
}
