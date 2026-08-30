'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../core/Logo';
import { Button } from '../core/Button';
import { Icon } from '../core/Icon';
import { SITE } from '../../lib/site-config';

const NAV_ITEMS = [
  ['portfolio', 'Portfólio'],
  ['sobre', 'Sobre'],
  ['servicos', 'Serviços'],
  ['galeria', 'Galeria'],
  ['contato', 'Contato'],
];

export function Header() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!onHome) return;
    const sections = NAV_ITEMS.map(([id]) => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) return;
    const onScroll = () => {
      let current = null;
      for (const el of sections) {
        if (el.getBoundingClientRect().top < 140) current = el.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onHome]);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(250,247,243,.88)',
      backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-hairline)' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)', height: '86px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
        <Link href="/" style={{ border: 0 }}>
          <Logo size={0.52} align="left" descriptor={false} />
        </Link>
        <nav style={{ display: 'flex', gap: '34px' }}>
          {NAV_ITEMS.map(([id, label]) => (
            <Link key={id} href={`/#${id}`}
              style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: active === id ? 'var(--rose-500)' : 'var(--ink-500)',
                border: 0, borderBottom: '1px solid ' + (active === id ? 'var(--rose-500)' : 'transparent'), paddingBottom: '3px' }}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href={SITE.instagramHref} target="_blank" rel="noreferrer" style={{ border: 0, color: 'var(--cocoa-800)', lineHeight: 0 }} aria-label="Instagram">
            <Icon name="instagram" size={17} />
          </a>
          <Button href="/agendar" size="sm">Agendar</Button>
        </div>
      </div>
    </header>
  );
}
