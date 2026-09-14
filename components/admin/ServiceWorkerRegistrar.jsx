'use client';

import { useEffect } from 'react';

// Registra o service worker do PWA administrativo. Escopo restrito a /admin
// para que o site institucional e o app do cliente sigam sem service worker.
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin' }).catch(() => {
      // Instalação do PWA é um plus: se o registro falhar (modo privado,
      // permissões), a área administrativa continua funcionando pelo navegador.
    });
  }, []);

  return null;
}
