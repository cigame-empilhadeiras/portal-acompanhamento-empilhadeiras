/* Service worker do app do checklist.
   Arquivos do portal: busca na rede primeiro (para receber atualizações) e usa a cópia guardada se estiver sem internet.
   Bibliotecas do Firebase e fontes: usa a cópia guardada (não mudam). Dados do Firebase nunca passam por aqui. */
const VERSAO = "portal-v2";
const BASE = ["./", "./index.html", "./fb-adapter.js", "./firebase-config.js", "./portal.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const fixo = url.hostname === "www.gstatic.com" || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  const local = url.origin === self.location.origin;
  if (!fixo && !local) return;

  if (fixo) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const cp = res.clone(); caches.open(VERSAO).then((c) => c.put(req, cp)); return res;
    })));
    return;
  }
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const cp = res.clone(); caches.open(VERSAO).then((c) => c.put(req, cp)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("./index.html"))));
});
