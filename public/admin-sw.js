// Service worker da área administrativa (PWA "Bell Miranda Gestão").
//
// Deliberadamente mínimo: existe para tornar o app instalável e para dar uma
// tela honesta quando não há conexão. NÃO faz cache de agenda, clientes,
// financeiro ou qualquer resposta de API — dado de agenda desatualizado
// apresentado como atual é pior do que dizer "sem conexão".
//
// Só intercepta navegações GET. Todo o resto (APIs, assets, POSTs) vai direto
// para a rede, exatamente como sem service worker.

const OFFLINE_PAGE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Sem conexão — Bell Miranda Gestão</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 32px calc(24px + env(safe-area-inset-right)) calc(32px + env(safe-area-inset-bottom)) calc(24px + env(safe-area-inset-left));
    background: #FAF7F3; color: #221D1B;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    text-align: center;
  }
  .card { max-width: 340px; }
  .mark {
    width: 68px; height: 68px; margin: 0 auto 22px; border-radius: 50%;
    background: #F3E9E2; display: flex; align-items: center; justify-content: center;
  }
  svg { width: 30px; height: 30px; stroke: #4A342D; fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  h1 { margin: 0 0 10px; font-family: Georgia, "Times New Roman", serif; font-weight: 400; font-size: 1.5rem; color: #221D1B; }
  p { margin: 0; font-size: 0.9375rem; line-height: 1.6; color: #746762; }
  button {
    margin-top: 26px; width: 100%; height: 46px; border: 0; border-radius: 10px;
    background: #2B1F1B; color: #FAF7F3; cursor: pointer;
    font-family: inherit; font-size: 12px; font-weight: 500;
    letter-spacing: 0.14em; text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="mark">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M1 1l22 22"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
    </div>
    <h1>Sem conexão</h1>
    <p>A agenda, os clientes e o financeiro vêm do servidor em tempo real. Para não mostrar informação desatualizada, nada é exibido enquanto você estiver offline.</p>
    <button onclick="location.reload()">Tentar de novo</button>
  </div>
</body>
</html>`;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.mode !== 'navigate') return;

  event.respondWith(
    fetch(request).catch(
      () =>
        new Response(OFFLINE_PAGE, {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
        }),
    ),
  );
});
