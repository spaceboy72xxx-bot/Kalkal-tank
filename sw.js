const C='tangke-v4';
const PRE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>Promise.all(PRE.map(u=>fetch(u,{cache:'reload'}).then(r=>r.ok&&c.put(u,r)))))
    .catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const q=e.request;
  if(q.method!=='GET')return;
  const same=new URL(q.url).origin===location.origin;
  if(same){
    // network-first: laging bagong bersyon kapag may internet, cache lang kapag offline
    e.respondWith(fetch(new Request(q.url,{cache:'no-cache'})).then(r=>{
      if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(q,cp))}
      return r}).catch(()=>caches.match(q).then(h=>h||caches.match('./index.html'))));
  }else{
    // three.js sa CDN: cache-first
    e.respondWith(caches.match(q).then(hit=>hit||fetch(q).then(r=>{
      if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(C).then(c=>c.put(q,cp))}
      return r})));
  }
});
