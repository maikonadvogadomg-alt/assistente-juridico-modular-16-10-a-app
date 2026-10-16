// Guarda o app para abrir sem internet. Páginas: busca a nova primeiro (atualiza sozinho);
// arquivos do app: usa o guardado e atualiza por trás. Chamadas da IA nunca passam por aqui.
const CACHE = 'juridico-modular-16-10-a';
const BASE = ['./', './index.html', './css/app.css', './manifest.json', './lib/jszip.min.js', './icons/icon-192.png', './icons/icon-512.png',
  './js/00-core.js', './js/10-ia.js', './js/12-voz.js', './js/15-importar.js', './js/18-texto.js', './js/25-regras.js', './js/20-processar.js', './js/30-editor.js', './js/35-docx.js',
  './js/40-conversa.js', './js/50-documentos.js', './js/55-biblioteca.js', './js/70-ferramentas.js', './js/80-config.js', './js/99-app.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const pagina = e.request.mode === 'navigate' || /\.html?$/.test(u.pathname);
  if (pagina) { e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(CACHE).then((k) => k.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))); return; }
  e.respondWith(caches.match(e.request).then((guardado) => { const rede = fetch(e.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then((k) => k.put(e.request, c)); } return r; }).catch(() => guardado); return guardado || rede; }));
});
