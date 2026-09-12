'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { Button } from '../core/Button';
import { Icon } from '../core/Icon';

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const WHATSAPP_CONFIG_ID = process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID;
const SDK_VERSION = process.env.NEXT_PUBLIC_META_SDK_VERSION || 'v21.0';

// Meta Embedded Signup, Coexistence mode: connects a WhatsApp number that's
// already live in the WhatsApp Business App, without disrupting it —
// featureType: 'whatsapp_business_app_onboarding' below is what selects
// that mode (a first-time-number flow would use a different featureType).
//
// This component only gets the popup open and captures the authorization
// code FB.login() returns. Exchanging that code for a token has to happen
// server-side (it needs the App Secret, which must never reach the
// browser) — that backend route doesn't exist yet, on purpose: this is
// step one, stopped right where the popup can start.
export function WhatsAppConnect() {
  const [sdkReady, setSdkReady] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | authorized | cancelled | error
  const [lastCode, setLastCode] = useState(null);

  useEffect(() => {
    // Meta posts WA_EMBEDDED_SIGNUP lifecycle events (step reached, phone
    // selected, finish) to the opener while the popup is open — the only
    // way to see progress before FB.login's own callback fires at the end.
    function onMessage(event) {
      if (!/\.facebook\.com$/.test(event.origin) && event.origin !== 'https://www.facebook.com') return;
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return; // Not every message on this origin is JSON meant for us.
      }
      if (data.type === 'WA_EMBEDDED_SIGNUP') {
        console.log('[WhatsApp Embedded Signup] session event:', data);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  function handleSdkLoad() {
    window.FB.init({ appId: META_APP_ID, autoLogAppEvents: true, xfbml: false, version: SDK_VERSION });
    setSdkReady(true);
  }

  function connect() {
    if (!window.FB) return;
    setStatus('connecting');
    window.FB.login((response) => {
      const code = response?.authResponse?.code;
      if (code) {
        setLastCode(code);
        setStatus('authorized');
        console.log('[WhatsApp Embedded Signup] authorization code received — next step: POST this to a backend route that exchanges it for a token server-side.', code);
      } else {
        setStatus('cancelled');
      }
    }, {
      config_id: WHATSAPP_CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: 'whatsapp_business_app_onboarding',
        sessionInfoVersion: '3',
      },
    });
  }

  if (!META_APP_ID || !WHATSAPP_CONFIG_ID) {
    return (
      <p style={{ margin: 0, color: 'var(--danger-500)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}>
        NEXT_PUBLIC_META_APP_ID / NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID não configurados (veja .env.example).
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start' }}>
      <Script src="https://connect.facebook.net/en_US/sdk.js" strategy="afterInteractive" onLoad={handleSdkLoad} />
      <Button onClick={connect} disabled={!sdkReady || status === 'connecting'} iconLeft={<Icon name="message-circle" size={15} />}>
        {status === 'connecting' ? 'Abrindo…' : status === 'authorized' ? 'Reconectar WhatsApp' : 'Conectar WhatsApp'}
      </Button>
      {status === 'authorized' && (
        <p style={{ margin: 0, color: 'var(--success-500)', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem' }}>
          Autorização recebida do Meta (código: {lastCode.slice(0, 8)}…). A troca desse código pelo token ainda não está implementada — próximo passo.
        </p>
      )}
      {status === 'cancelled' && (
        <p style={{ margin: 0, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem' }}>
          Janela fechada sem concluir a conexão.
        </p>
      )}
    </div>
  );
}
