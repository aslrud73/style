// 별쫑 화풍 라이브러리 서비스 워커
// 앱 껍데기(셸)만 캐시. 화풍 데이터는 Firestore에서 실시간으로 받음.
const CACHE = "byeoljjong-style-v2";
const SHELL = ["./index.html", "./manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  // Firebase / 외부 이미지 / 폰트는 항상 네트워크 우선
  if (url.includes("firestore") || url.includes("googleapis") || url.includes("gstatic") || url.includes("amazonaws") || url.includes("firebase")) {
    return; // 브라우저 기본 처리(네트워크)
  }
  // 앱 셸은 캐시 우선
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
