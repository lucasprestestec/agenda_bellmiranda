'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getServiceImage } from '../../lib/serviceImages';

// Renders the photo for a service. Paths and alt text come from
// lib/serviceImages.js — never pass a src in by hand.
//
// Pass either `ratio` (fluid width, e.g. '4/5') or `size` (fixed square).
// `children` is layered on top of the photo for overlays such as the price
// pill or a gradient scrim.
export function ServiceImage({ service, ratio, size, radius = 'var(--radius-md)', sizes = '50vw', style, children }) {
  const image = getServiceImage(service);
  const [failed, setFailed] = useState(false);
  const showPhoto = image && !failed;

  return (
    <span style={{
      position: 'relative', display: 'block', overflow: 'hidden', borderRadius: radius, flexShrink: 0,
      width: size ? `${size}px` : '100%',
      height: size ? `${size}px` : undefined,
      aspectRatio: size ? undefined : ratio,
      // Discreet stand-in so a missing file never reads as a broken image.
      background: 'linear-gradient(145deg, var(--nude-300) 0%, var(--ivory-200) 100%)',
      ...style,
    }}>
      {showPhoto && (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={size ? `${size}px` : sizes}
          onError={() => setFailed(true)}
          style={{ objectFit: 'cover', objectPosition: image.position }}
        />
      )}
      {children}
    </span>
  );
}
