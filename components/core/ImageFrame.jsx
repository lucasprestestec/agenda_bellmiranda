import Image from 'next/image';

const RADII = { soft: 'var(--radius-image)', arch: 'var(--radius-arch)', square: '2px', circle: 'var(--radius-pill)' };

export function ImageFrame({ src, alt = '', ratio = '3/4', crop = 'soft', caption, tone = 'nude', objectPosition = 'center', sizes = '(max-width: 768px) 100vw, 50vw', style, ...rest }) {
  return (
    <figure style={Object.assign({ margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }, style)} {...rest}>
      <div style={{ position: 'relative', aspectRatio: ratio, borderRadius: RADII[crop], overflow: 'hidden',
        background: tone === 'nude' ? 'var(--nude-300)' : 'var(--ivory-200)', boxShadow: 'var(--shadow-image)' }}>
        {src
          ? <Image src={src} alt={alt} fill sizes={sizes} style={{ objectFit: 'cover', objectPosition }} />
          : <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--text-eyebrow)', letterSpacing: 'var(--tracking-eyebrow)',
              textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', padding: '0 16px' }}>{alt || 'Foto'}</span>}
      </div>
      {caption && <figcaption style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--text-muted)' }}>{caption}</figcaption>}
    </figure>
  );
}
