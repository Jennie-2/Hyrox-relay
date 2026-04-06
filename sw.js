const CACHE = 'hyrox-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap'
];

// 설치 - 핵심 파일 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 활성화 - 오래된 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 요청 처리 - 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', e => {
  // Firebase 요청은 캐시 안 함 (항상 실시간)
  if (e.request.url.includes('firebaseio.com') ||
      e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis.com/identitytoolkit')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 성공하면 캐시에도 저장
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
