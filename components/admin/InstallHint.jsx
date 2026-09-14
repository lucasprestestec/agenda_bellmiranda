'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Icon } from '../core/Icon';

const DISMISS_KEY = 'bm-gestao-install-dismissed';

// Ambiente é lido uma única vez e memoizado no módulo: useSyncExternalStore
// exige um snapshot estável, e nada aqui muda durante a sessão.
let cachedEnv = null;
function readEnv() {
  if (cachedEnv) return cachedEnv;
  let wasDismissed = false;
  try {
    wasDismissed = localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    wasDismissed = false; // modo privado: mostra a dica normalmente
  }
  cachedEnv = {
    standalone:
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
    // iOS não dispara beforeinstallprompt — lá a instalação é manual pelo Safari.
    ios: /iphone|ipad|ipod/i.test(navigator.userAgent),
    wasDismissed,
  };
  return cachedEnv;
}
const subscribe = () => () => {};

// Card discreto dentro de /admin/mais — não é banner e não aparece por cima
// do conteúdo. Some quando o app já está instalado, quando o navegador não
// oferece instalação, ou quando a pessoa dispensa.
export function InstallHint() {
  const env = useSyncExternalStore(subscribe, readEnv, () => null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      setDismissed(true); // sem localStorage a dica volta na próxima visita
    }
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setDismissed(true);
  }

  if (!env || env.standalone || env.wasDismissed || dismissed) return null;
  if (!env.ios && !deferredPrompt) return null;

  return (
    <div style={{ border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)',
      background: 'var(--surface-card)', padding: '16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--nude-300)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--champagne-600)', flexShrink: 0 }}>
          <Icon name="arrow-down-to-line" size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink-900)' }}>
            Instalar no celular
          </span>
          <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
            {env.ios
              ? 'No Safari, toque em Compartilhar e escolha “Adicionar à Tela de Início” para abrir a agenda como um app.'
              : 'Deixe a agenda na tela inicial e abra como um app, sem a barra do navegador.'}
          </p>
        </div>
        <button onClick={dismiss} aria-label="Dispensar" style={{ border: 0, background: 'none', padding: '2px',
          cursor: 'pointer', color: 'var(--taupe-500)', flexShrink: 0 }}>
          <Icon name="x" size={16} />
        </button>
      </div>
      {deferredPrompt && (
        <button onClick={install} style={{ marginTop: '14px', width: '100%', height: '40px', border: 0,
          borderRadius: 'var(--radius-sm)', background: 'var(--action-primary-bg)', color: 'var(--action-primary-text)',
          cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Instalar
        </button>
      )}
    </div>
  );
}
