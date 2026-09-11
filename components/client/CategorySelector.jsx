'use client';

import Link from 'next/link';
import { slugify } from '../../lib/studio';

// Category chips — real groupings from lib/serviceCategories.js, never
// professionals. Each links straight to its section on /agendar/servicos.
export function CategorySelector({ categories }) {
  return (
    <div className="bm-scroller" style={{ display: 'flex', gap: '8px', padding: '2px 0 4px' }}>
      {categories.map(({ category, items }) => (
        <Link key={category} href={`/agendar/servicos#${slugify(category)}`} style={{ flex: '0 0 auto',
          display: 'flex', alignItems: 'baseline', gap: '7px', padding: '10px 16px', borderRadius: 'var(--radius-pill)',
          background: 'var(--surface-card)', border: '1px solid var(--border-hairline)' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-900)' }}>{category}</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{items.length}</span>
        </Link>
      ))}
    </div>
  );
}
