// Responde los listados dinámicos del sitio con las respuestas guardadas en c22cache/.
const P = '/c22-prueba';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;
  if (!u.pathname.startsWith(P + '/wp-admin/admin-ajax.php') && !u.pathname.startsWith(P + '/wp-json/')) return;
  e.respondWith((async () => {
    const orig = u.pathname.slice(P.length) + u.search;
    const d = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(orig));
    const key = [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
    const r = await fetch(P + '/c22cache/' + key + '.txt');
    if (!r.ok) return new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } });
    const t = (await r.text()).split('https:\\/\\/c22cepchile.cl\\/').join('\\/c22-prueba\\/')
      .split('https://c22cepchile.cl/').join('/c22-prueba/');
    return new Response(t, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  })());
});
