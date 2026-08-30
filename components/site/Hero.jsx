'use client';

import Link from 'next/link';
import { useMobile } from '../../lib/useMobile';

function SideNote({ lines, style }) {
  return (
    <div style={Object.assign({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }, style)}>
      <div style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 500,
        letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(250,247,243,.86)', lineHeight: 1.9 }}>
        {lines.map((l) => <div key={l}>{l}</div>)}
      </div>
      <span style={{ width: '112px', height: '1px', background: 'rgba(250,247,243,.4)' }}></span>
    </div>
  );
}

export function Hero() {
  const m = useMobile();
  const btn = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-sans)', fontSize: m ? '11px' : '11.5px', fontWeight: 600, letterSpacing: '0.2em',
    textTransform: 'uppercase', padding: m ? '20px 24px' : '23px 34px', minHeight: '52px', width: m ? '100%' : 'auto',
    textDecoration: 'none' };
  return (
    <section style={{ position: 'relative', minHeight: m ? '640px' : '100vh', display: 'flex', alignItems: m ? 'flex-end' : 'center',
      overflow: 'hidden', background: '#2B1F1B' }}>
      <div className="ph ph-hero" style={{ position: 'absolute', inset: 0,
        backgroundPosition: m ? '58% 30%' : '62% 42%' }}></div>
      <div style={{ position: 'absolute', inset: 0,
        background: m
          ? 'linear-gradient(178deg, rgba(43,31,27,.72) 0%, rgba(43,31,27,.42) 34%, rgba(43,31,27,.86) 72%, rgba(43,31,27,.96) 100%)'
          : 'linear-gradient(97deg, rgba(43,31,27,.95) 0%, rgba(43,31,27,.86) 26%, rgba(56,40,34,.5) 50%, rgba(70,50,42,.22) 72%, rgba(70,50,42,.14) 100%)' }}></div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 'var(--container)', margin: '0 auto',
        padding: m ? '104px var(--gutter) 34px' : '150px var(--gutter) 128px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: m ? '100%' : '660px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: m ? '22px' : '34px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: m ? '9.5px' : '11px', fontWeight: 600, letterSpacing: '0.26em',
              textTransform: 'uppercase', color: 'var(--ivory-100)' }}>Beleza que expressa</span>
            <span style={{ width: '38px', height: '1px', background: 'rgba(250,247,243,.5)' }}></span>
          </span>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontWeight: 300,
            fontSize: m ? 'clamp(2.5rem,12.5vw,3.4rem)' : 'clamp(3.2rem,6.2vw,5.6rem)',
            lineHeight: 1.06, letterSpacing: '-0.012em', color: 'var(--ivory-50)' }}>
            Unhas que<br />combinam com<br />
            <span style={{ fontFamily: 'var(--font-script)', color: '#EBD3C6', fontSize: '1.04em', lineHeight: 1.5 }}>você</span>
            <span style={{ color: '#EBD3C6' }}>.</span>
          </h1>
          <p style={{ margin: m ? '24px 0 0' : '38px 0 0', fontFamily: 'var(--font-sans)', fontSize: m ? '1rem' : '1.125rem',
            lineHeight: 1.7, color: 'rgba(250,247,243,.9)', maxWidth: m ? '32ch' : '40ch' }}>
            Cuidado técnico com alma, para realçar sua elegância de forma natural e única.
          </p>
          <div style={{ display: 'flex', flexDirection: m ? 'column' : 'row', flexWrap: 'wrap', gap: m ? '12px' : '18px',
            marginTop: m ? '30px' : '46px', width: m ? '100%' : 'auto' }}>
            <Link href="/agendar" style={Object.assign({}, btn, { background: '#2B1F1B', color: 'var(--ivory-100)', border: '1px solid rgba(250,247,243,.24)' })}>
              Agendar horário
            </Link>
            <Link href="#portfolio" style={Object.assign({}, btn, { background: 'transparent', color: 'var(--ivory-100)', border: '1px solid rgba(250,247,243,.5)' })}>
              Ver portfólio
            </Link>
          </div>

          {m && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '34px',
              paddingTop: '22px', borderTop: '1px solid rgba(250,247,243,.18)', width: '100%' }}>
              <span style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(250,247,243,.42)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif-display)',
                fontSize: '12.5px', letterSpacing: '0.12em', color: 'var(--ivory-100)', flexShrink: 0 }}>BM</span>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9.5px', fontWeight: 500, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'rgba(250,247,243,.88)', lineHeight: 1.9 }}>
                <div>Estúdio premium de unhas</div>
                <div>Tatuí · SP</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!m && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'clamp(28px,5vh,54px)' }}>
            <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ width: '52px', height: '52px', borderRadius: '50%', border: '1px solid rgba(250,247,243,.42)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif-display)',
                  fontSize: '14px', letterSpacing: '0.12em', color: 'var(--ivory-100)', flexShrink: 0 }}>BM</span>
                <span style={{ width: '1px', height: '40px', background: 'rgba(250,247,243,.3)' }}></span>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: 'rgba(250,247,243,.88)', lineHeight: 2 }}>
                  <div>Estúdio premium de unhas</div>
                  <div>Tatuí · SP</div>
                </div>
              </div>
              <SideNote lines={['Saúde e beleza', 'em cada detalhe']} />
            </div>
          </div>
          <div style={{ position: 'absolute', right: 'var(--gutter)', top: '22vh' }}>
            <SideNote lines={['Acabamento', 'impecável']} />
          </div>
        </>
      )}
    </section>
  );
}
