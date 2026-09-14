import { ServiceWorkerRegistrar } from '../../components/admin/ServiceWorkerRegistrar';

// O PWA "Bell Miranda Gestão" é só da área administrativa: manifest, service
// worker e viewport-fit ficam neste layout para que o site institucional e o
// app do cliente continuem exatamente como estão.
export const metadata = {
  title: 'Bell Miranda Gestão',
  manifest: '/admin.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'BM Gestão',
    statusBarStyle: 'default',
  },
  // Declarar `icons` aqui substitui o favicon que o Next deriva de app/icon.png,
  // e sem <link rel="icon"> o navegador cai no /favicon.ico inexistente (404).
  // Por isso o favicon do site é repetido explicitamente.
  icons: {
    icon: '/icon.png',
    apple: '/icons/apple-touch-icon.png',
  },
  // O Next emite apenas o `mobile-web-app-capable` moderno; o iOS anterior ao
  // 16.4 só entra em standalone com a variante `apple-` legada.
  other: {
    'apple-mobile-web-app-capable': 'yes',
  },
};

// viewport-fit=cover é o que faz env(safe-area-inset-*) devolver valores reais
// no iPhone em modo standalone — sem ele o shell encosta no notch e na barra
// de gestos.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAF7F3',
};

export default function AdminLayout({ children }) {
  return (
    <>
      {children}
      <ServiceWorkerRegistrar />
    </>
  );
}
