'use client';

import React from 'react';

/* Shared label + hint + error scaffold for every form control. */
export function Field({ label, hint, error, required=false, htmlFor, children, style }) {
  return (
    <div style={Object.assign({ display:'flex', flexDirection:'column', gap:'8px' }, style)}>
      {label && (
        <label htmlFor={htmlFor} style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-eyebrow)',
          letterSpacing:'var(--tracking-eyebrow)', textTransform:'uppercase', fontWeight:500, color:'var(--text-muted)' }}>
          {label}{required && <span style={{ color:'var(--rose-500)' }}> *</span>}
        </label>
      )}
      {children}
      {(hint || error) && (
        <span style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-caption)', color: error ? 'var(--danger-500)' : 'var(--text-muted)' }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
