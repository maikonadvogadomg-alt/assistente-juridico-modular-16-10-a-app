// service-worker.js — gerado pelo Mini SK em 16/10/2026, 18:02:09
// Não precisa mexer: ele guarda sozinho o que o app usa.
const PREFIXO = 'sk-assistente-juridico-modular-';
const CACHE = PREFIXO + 'mvbge93o';
// Lista feita automaticamente (para funcionar sem internet logo após instalar)
const GUARDAR = [
  "./",
  "./css/app.css",
  "./electron/main.cjs",
  "./favicon.ico",
  "./ferramentas/comunicacoes.html",
  "./ferramentas/extrator.html",
  "./ferramentas/juntador.html",
  "./ferramentas/limpador.html",
  "./ferramentas/organizador.html",
  "./ferramentas/perito.html",
  "./icons/apple-touch-icon.png",
  "./icons/icon-16.png",
  "./icons/icon-32.png",
  "./icons/icon-48.png",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png",
  "./icons/icon.svg",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
  "./icons/maskable.svg",
  "./index.html",
  "./js/00-core.js",
  "./js/10-ia.js",
  "./js/12-voz.js",
  "./js/15-importar.js",
  "./js/18-texto.js",
  "./js/20-processar.js",
  "./js/25-regras.js",
  "./js/30-editor.js",
  "./js/35-docx.js",
  "./js/40-conversa.js",
  "./js/50-documentos.js",
  "./js/55-biblioteca.js",
  "./js/70-ferramentas.js",
  "./js/80-config.js",
  "./js/99-app.js",
  "./LEIA-ME.md",
  "./lib/jszip-LICENSE.md",
  "./lib/jszip.min.js",
  "./manifest.json",
  "./package.json",
  "./PLANO.md",
  "./sw.js"
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(GUARDAR.map((u) => c.add(u).catch(() => null)))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith(PREFIXO) && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primeiro a internet (sempre a versão nova); sem internet, a cópia guardada.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      // Igual ao Workbox da Replit: página que não existe (rota do app) abre o index
      if (res.status === 404 && req.mode === 'navigate') return caches.match('./').then((r) => r || fetch('./'));
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === 'navigate' ? caches.match('./') : undefined)))
  );
});
