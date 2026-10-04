'use strict';
// Offline support. Bump VERSION when files are renamed or removed; ordinary edits are picked up automatically
// because app files are served from the cache and refreshed in the background (stale-while-revalidate).
const VERSION='v1';
const APP_CACHE='sefer-app-'+VERSION,PHOTO_CACHE='sefer-photos-'+VERSION,TILE_CACHE='sefer-tiles-'+VERSION;
const MAX_TILES=400;
const APP_FILES=[
 './','index.html','styles.css','manifest.webmanifest',
 'i18n.js','nl.js','prayers-data.js','prayer-pronunciation-nl.js','places-data.js','place-photos.js',
 'app.js','hotel.js','pages.js','prayer-library.js','visits.js','tracker.js','map-points.js','visit-map.js',
 'vendor/leaflet.js','vendor/leaflet.css',
 'fonts/dm-sans-latin.woff2','fonts/dm-sans-latin-ext.woff2','fonts/manrope-latin.woff2','fonts/manrope-latin-ext.woff2',
 'icons/icon.svg','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png',
 'images/thumbs/kaaba.jpg',
 ...['medine-16','medine-17','medine-20','medine-22','medine-24','medine-25','medine-29','medine-31',
  'mekke-35','mekke-36','mekke-37','mekke-38','mekke-39','mekke-41','mekke-47','mekke-48'].map(name=>`images/thumbs/${name}.jpg`)
];

// Query strings such as ?v=20260920-30 only bust HTTP caches; one cached copy per file is enough.
const appKey=url=>url.origin+url.pathname;

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(APP_CACHE).then(cache=>Promise.all(APP_FILES.map(file=>{
  const url=new URL(file,self.registration.scope);
  // A single missing optional file must not block offline support for everything else.
  return fetch(url,{cache:'reload'}).then(response=>response.ok&&cache.put(appKey(url),response)).catch(()=>{});
 }))).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
 const current=[APP_CACHE,PHOTO_CACHE,TILE_CACHE];
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('sefer-')&&!current.includes(key)).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

async function appFile(request,url){
 const cache=await caches.open(APP_CACHE);
 const key=request.mode==='navigate'&&url.pathname.endsWith('/')?appKey(url)+'index.html':appKey(url);
 const cached=await cache.match(key)||(request.mode==='navigate'?await cache.match(new URL('index.html',self.registration.scope).href):undefined);
 const refresh=fetch(request).then(response=>{if(response.ok)cache.put(key,response.clone());return response;});
 if(cached){refresh.catch(()=>{});return cached;}
 return refresh;
}

async function photo(request){
 const cache=await caches.open(PHOTO_CACHE);
 const cached=await cache.match(request);
 if(cached)return cached;
 const response=await fetch(request);
 if(response.ok)cache.put(request,response.clone());
 return response;
}

// Map tiles follow the provider's caching rules while online; stored tiles are only a fallback when offline.
async function tile(request){
 const cache=await caches.open(TILE_CACHE);
 try{
  const response=await fetch(request);
  if(response.ok){await cache.put(request,response.clone());trimTiles(cache);}
  return response;
 }catch(error){
  const cached=await cache.match(request);
  if(cached)return cached;
  throw error;
 }
}
async function trimTiles(cache){const keys=await cache.keys();await Promise.all(keys.slice(0,Math.max(0,keys.length-MAX_TILES)).map(key=>cache.delete(key)));}

self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin===self.location.origin)event.respondWith(appFile(request,url));
 else if(url.hostname==='upload.wikimedia.org')event.respondWith(photo(request));
 else if(url.hostname==='tile.openstreetmap.org')event.respondWith(tile(request));
});
