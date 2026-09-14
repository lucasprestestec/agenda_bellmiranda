'use client';

import Link from 'next/link';
import { Icon } from '../core/Icon';
import { slugify } from '../../lib/studio';

// Real categories only — never invents a 4th/5th icon for a category with
// no services (see lib/serviceCategories.js's CATEGORY_ORDER: Unhas,
// Sobrancelha, Depilação are the only ones that exist in the catalog).
const CATEGORY_ICONS = {
  Unhas: 'hand',
  Sobrancelha: 'eye',
  Depilação: 'droplet',
};

// Icon-circle categories — the app-shell equivalent of the reference's
// category row, not text chips. Each links to its section on
// /agendar/servicos.
export function CategorySelector({ categories }) {
  return (
    <div className="bm-scroller" style={{ display: 'flex', gap: '18px', padding: '4px 2px 6px' }}>
      {categories.map(({ category }) => (
        <Link key={category} href={`/agendar/servicos#${slugify(category)}`} style={{ flex: '0 0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '64px' }}>
          <span style={{ width: '54px', height: '54px', borderRadius: '50%', flexShrink: 0,
            background: 'var(--surface-card)', border: '1px solid var(--border-hairline)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cocoa-800)' }}>
            <Icon name={CATEGORY_ICONS[category] || 'sparkles'} size={21} stroke={1.4} />
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--ink-900)',
            textAlign: 'center', lineHeight: 1.2 }}>{category}</span>
        </Link>
      ))}
    </div>
  );
}
