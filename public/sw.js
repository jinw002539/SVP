/* Service Worker: poupa dados móveis e deixa o site funcionar com rede fraca.
   Regras de segurança: NUNCA guarda em cache a área restrita, login, definições
   nem pedidos que não sejam GET do mesmo domínio. */
const VERSAO = 'sv-v2';
const CACHE_ESTATICO = `${VERSAO}-estatico`;
const CACHE_PAGINAS = `${VERSAO}-paginas`;
const CACHE_FOTOS = `${VERSAO}-fotos`;
const PAGINAS_PUBLICAS = ['/', '/hoje', '/calendario', '/memorias', '/arquivo'];
const MAX_FOTOS = 60;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_ESTATICO).then((c) => c.addAll(['/offline.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => !n.startsWith(VERSAO)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

async function limitar(nome, max) {
  const cache = await caches.open(nome);
  const chaves = await cache.keys();
  if (chaves.length > max) await cache.delete(chaves[0]);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.headers.get('X-Inertia')) return; // navegação interna do Inertia: sempre rede

  // Ficheiros com hash do Vite: nunca mudam, cache primeiro.
  if (url.pathname.startsWith('/build/')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copia = res.clone(); caches.open(CACHE_ESTATICO).then((c) => c.put(req, copia)); }
        return res;
      }))
    );
    return;
  }

  // Fotos das memórias: cache primeiro (poupa muitos dados), com limite.
  if (url.pathname.startsWith('/uploads/')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copia = res.clone(); caches.open(CACHE_FOTOS).then((c) => c.put(req, copia)).then(() => limitar(CACHE_FOTOS, MAX_FOTOS)); }
        return res;
      }))
    );
    return;
  }

  // Páginas públicas: rede primeiro; se falhar, a última cópia; senão página offline.
  if (req.mode === 'navigate') {
    if (!PAGINAS_PUBLICAS.includes(url.pathname)) return; // admin, login, settings: nunca em cache
    e.respondWith(
      fetch(req)
        .then((res) => {
          const cc = res.headers.get('Cache-Control') || '';
          if (res.ok && !cc.includes('no-store')) { const copia = res.clone(); caches.open(CACHE_PAGINAS).then((c) => c.put(req, copia)); }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/offline.html')))
    );
  }
});
