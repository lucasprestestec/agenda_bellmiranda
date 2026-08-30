'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../core/Logo';
import { Icon } from '../core/Icon';
import { useMobile } from '../../lib/useMobile';
import { SITE } from '../../lib/site-config';

const NAV_ITEMS = [
  ['sobre', 'Sobre'],
  ['servicos', 'Serviços'],
  ['portfolio', 'Portfólio'],
  ['valores', 'Experiência'],
  ['contato', 'Contato'],
];

export function Header({ overlay = false }) {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const m = useMobile();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!m) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- close mobile menu on breakpoint change
      setOpen(false);
    }
  }, [m]);

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

  const light = overlay && !scrolled && !open;
  const linkColor = (id) => light
    ? (active === id ? 'var(--white)' : 'rgba(250,247,243,.82)')
    : (active === id ? 'var(--cocoa-800)' : 'var(--ink-500)');

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
      background: light ? 'transparent' : 'rgba(250,247,243,.96)',
      backdropFilter: light ? 'none' : 'blur(12px)',
      borderBottom: '1px solid ' + (light ? 'rgba(250,247,243,.16)' : 'var(--border-hairline)'),
      transition: 'background .4s ease, border-color .4s ease' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)', height: m ? '72px' : '92px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: m ? '14px' : '32px' }}>
        <Link href="/" onClick={() => setOpen(false)} style={{ border: 0, flexShrink: 0 }}>
          <Logo size={m ? 0.4 : 0.5} align="left" descriptor={!m} tone={light ? 'ivory' : 'cocoa'} />
        </Link>

        {!m && (
          <nav style={{ display: 'flex', gap: 'clamp(20px,3vw,44px)' }}>
            {NAV_ITEMS.map(([id, label]) => (
              <Link key={id} href={`/#${id}`}
                style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em',
                  textTransform: 'uppercase', border: 0, paddingBottom: '3px', color: linkColor(id),
                  borderBottom: '1px solid ' + (active === id ? (light ? 'rgba(250,247,243,.7)' : 'var(--champagne-500)') : 'transparent') }}>
                {label}
              </Link>
            ))}
          </nav>
        )}

        {m ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/agendar" onClick={() => setOpen(false)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px',
                background: 'var(--espresso-900)', color: 'var(--ivory-100)', border: '1px solid var(--espresso-900)',
                padding: '0 16px', fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase' }}>Agendar</Link>
            <button onClick={() => setOpen(!open)} aria-label="Menu"
              style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', background: 'transparent', border: '1px solid ' + (light ? 'rgba(250,247,243,.4)' : 'var(--border-strong)'),
                color: light ? 'var(--ivory-100)' : 'var(--cocoa-800)' }}>
              <Icon name={open ? 'x' : 'menu'} size={18} />
            </button>
          </div>
        ) : (
          <Link href="/agendar"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', flexShrink: 0,
              background: 'var(--espresso-900)', color: 'var(--ivory-100)', border: '1px solid ' + (light ? 'rgba(250,247,243,.24)' : 'var(--espresso-900)'),
              padding: '16px 26px', fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Agendar <Icon name="arrow-right" size={14} />
          </Link>
        )}
      </div>

      {m && open && (
        <nav style={{ borderTop: '1px solid var(--border-hairline)', background: 'var(--ivory-100)',
          padding: '8px var(--gutter) 22px', display: 'flex', flexDirection: 'column' }}>
          {NAV_ITEMS.map(([id, label]) => (
            <Link key={id} href={`/#${id}`} onClick={() => setOpen(false)}
              style={{ border: 0, borderBottom: '1px solid var(--border-hairline)', padding: '17px 0',
                fontFamily: 'var(--font-serif-display)', fontSize: '1.375rem', color: 'var(--ink-900)' }}>{label}</Link>
          ))}
          <a href={SITE.instagramHref} style={{ border: 0, marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '10px',
            fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--ink-500)' }}>
            <Icon name="instagram" size={15} /> {SITE.instagramHandle}
          </a>
        </nav>
      )}
    </header>
  );
}
