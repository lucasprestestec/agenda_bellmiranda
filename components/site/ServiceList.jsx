'use client';

import { useRouter } from 'next/navigation';
import { useMobile } from '../../lib/useMobile';

function ServiceLine({ index, name, description, duration, price, last, mobile, onSelect }) {
  const [cur, val] = price.split(/\s+/);
  const priceBlock = (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: mobile ? '12px' : '14px',
      paddingTop: mobile ? 0 : '10px', whiteSpace: 'nowrap' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-500)' }}>{duration}</span>
      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--taupe-500)' }}></span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1rem', color: 'var(--champagne-600)' }}>{cur}</span>
        <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: mobile ? '1.75rem' : 'clamp(1.9rem,2.6vw,2.5rem)',
          fontWeight: 300, lineHeight: 1, color: 'var(--champagne-600)' }}>{val}</span>
      </span>
    </div>
  );
  const content = mobile ? (
    <div style={{ padding: '24px 0', borderBottom: last ? 'none' : '1px solid var(--border-hairline)', cursor: 'pointer' }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.0625rem', color: 'var(--champagne-500)' }}>{index}</span>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400,
          fontSize: '1.4375rem', lineHeight: 1.22, color: 'var(--ink-900)' }}>{name}</h3>
      </div>
      <p style={{ margin: '10px 0 0', paddingLeft: '32px', fontFamily: 'var(--font-sans)', fontSize: '0.9375rem',
        lineHeight: 1.7, color: 'var(--ink-500)' }}>{description}</p>
      <div style={{ paddingLeft: '32px', marginTop: '14px' }}>{priceBlock}</div>
    </div>
  ) : (
    <div style={{ display: 'grid', gridTemplateColumns: '62px 1fr auto', alignItems: 'start',
      gap: '0 clamp(12px,2vw,28px)', padding: 'clamp(24px,2.6vw,34px) 0', cursor: 'pointer',
      borderBottom: last ? 'none' : '1px solid var(--border-hairline)' }}>
      <span style={{ fontFamily: 'var(--font-serif-display)', fontSize: '1.25rem', color: 'var(--champagne-500)',
        paddingTop: '6px', letterSpacing: '0.02em' }}>{index}</span>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400,
          fontSize: 'clamp(1.45rem,2vw,1.85rem)', lineHeight: 1.2, color: 'var(--ink-900)' }}>{name}</h3>
        <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', lineHeight: 1.7,
          color: 'var(--ink-500)', maxWidth: '42ch' }}>{description}</p>
      </div>
      {priceBlock}
    </div>
  );
  return <div onClick={onSelect}>{content}</div>;
}

export function ServiceList({ services }) {
  const router = useRouter();
  const m = useMobile();
  return (
    <div>
      {services.map((s, i) => (
        <ServiceLine key={s.slug} index={'0' + (i + 1)} name={s.name} description={s.description}
          duration={s.duration} price={s.price} mobile={m} last={i === services.length - 1}
          onSelect={() => router.push(`/agendar?servico=${s.slug}`)} />
      ))}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingTop: '22px',
        borderTop: '1px solid var(--border-hairline)' }}>
        <span style={{ color: 'var(--champagne-500)', fontSize: '13px', lineHeight: 1.6 }}>✦</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: m ? '9.5px' : '10.5px', fontWeight: 500, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'var(--ink-500)', lineHeight: 1.8 }}>Consulte disponibilidade para mais opções personalizadas.</span>
      </div>
    </div>
  );
}
