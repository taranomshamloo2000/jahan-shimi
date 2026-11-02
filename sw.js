const CACHE="jahan-shimi-offline-lab-v4";
const BASE="/jahan-shimi/";
const CORE=[BASE,BASE+"index.html",BASE+"manifest.webmanifest",BASE+"games/periodic-world.html",BASE+"games/periodic-table-challenge.html",BASE+"games/vr-chemistry-lab.html"];
const LIBS=["https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js","https://unpkg.com/three@0.160.0/build/three.min.js"];
self.addEventListener("install",event=>event.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 for(const url of CORE){try{const r=await fetch(url,{cache:"reload"});if(r.ok)await c.put(url,r);}catch(e){}}
 for(const url of LIBS){try{const r=await fetch(url,{mode:"no-cors",cache:"reload"});if(r.ok||r.type==="opaque")await c.put(url,r);}catch(e){}}
 await self.skipWaiting();
})()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("jahan-shimi-offline-")&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();
})()));
self.addEventListener("fetch",event=>{
 const req=event.request;if(req.method!=="GET")return;
 event.respondWith((async()=>{
  const c=await caches.open(CACHE);const hit=await c.match(req)||await c.match(req.url);if(hit)return hit;
  try{const r=await fetch(req);if(r.ok||r.type==="opaque")c.put(req,r.clone()).catch(()=>{});return r;}
  catch(e){if(new URL(req.url).origin===self.location.origin){const page=await c.match(BASE+"games/vr-chemistry-lab.html");return page||await c.match(BASE+"index.html")||Response.error();}return Response.error();}
 })());
});