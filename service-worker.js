self.addEventListener('install', e => {
  e.waitUntil(caches.open('aut').then(c => c.addAll(['/', '/index.html', '/product.html', '/cart.html', '/login.html', '/admin.html', '/logo.jpg'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
