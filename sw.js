const CACHE="jahan-shimi-offline-lab-v3";
const BASE="/jahan-shimi/";
const THREE_URLS=[
 "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js",
 "https://unpkg.com/three@0.160.0/build/three.min.js"
];
const CORE=[
 BASE,BASE+"index.html",BASE+"manifest.webmanifest",BASE+"icons/tari-world-192.png",
 BASE+"chapter-1-questions.html",BASE+"membership.html",
 BASE+"games/periodic-world.html",BASE+"games/periodic-table-challenge.html",
 BASE+"games/vr-chemistry-lab.html"
];
self.addEventListener("install",event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(CORE);
 for(const url of THREE_URLS){try{const response=await fetch(url,{mode:"no-cors",cache:"reload"});await cache.put(url,response.clone());}catch(e){}}
 await self.skipWaiting();
})()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET")return;
 const url=req.url;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const cached=await cache.match(req)||await cache.match(url);
  if(cached)return cached;
  try{
   const response=await fetch(req);
   if(response.ok||response.type==="opaque")cache.put(req,response.clone()).catch(()=>{});
   return response;
  }catch(error){
   if(new URL(url).origin===self.location.origin)return (await cache.match(BASE+"index.html"))||Response.error();
   return Response.error();
  }
 })());
});