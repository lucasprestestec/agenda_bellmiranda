'use client';

import { Icon } from '../core/Icon';
import { Button } from '../core/Button';

// Content-driven, not a generic "coming soon" — each screen that uses this
// explains what's actually true today (no client accounts yet, everything
// runs through WhatsApp) and gives a real next step instead of a dead end.
export function EmptyState({ icon = 'sparkles', title, message, actions = [] }) {
  return (
    <div style={{ padding: '56px 24px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '18px' }}>
      <span style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--nude-300)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-600)' }}>
        <Icon name={icon} size={24} />
      </span>
      <div>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: '1.375rem', color: 'var(--ink-900)' }}>{title}</h2>
        <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: 1.65,
          color: 'var(--ink-500)', maxWidth: '32ch' }}>{message}</p>
      </div>
      {actions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '280px', marginTop: '6px' }}>
          {actions.map((a) => (
            <Button key={a.label} variant={a.variant || 'secondary'} fullWidth href={a.href}
              iconLeft={a.icon ? <Icon name={a.icon} size={15} /> : undefined}>{a.label}</Button>
          ))}
        </div>
      )}
    </div>
  );
}
