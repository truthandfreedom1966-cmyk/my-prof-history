#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONFIG = {
  nominatimBaseUrl: 'https://nominatim.openstreetmap.org/search',
  userAgent: 'ProfHistory-Geocoder/2.0',
  requestDelayMs: 1100,
  placesDir: 'public/data',
  cacheFile: 'tools/geocode-cache.json',
  overridesFile: 'tools/geocode-overrides.json',
  logFile: 'tools/geocode-log.json',
  maxAcceptableDistanceM: 50
};

const allowedClasses = ['tourism', 'historic', 'amenity', 'building', 'leisure'];
const allowedTypes = [
  'museum','attraction','church','bridge','monument',
  'theatre','tower','square','castle','memorial'
];

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function readJson(p, def){
  try { return JSON.parse(fs.readFileSync(p,'utf8')); }
  catch { return def; }
}

function writeJson(p, data){
  fs.writeFileSync(p, JSON.stringify(data,null,2));
}

function haversineDistance(lat1,lng1,lat2,lng2){
  const R=6371000;
  const toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1);
  const dLng=toRad(lng2-lng1);
  const a=Math.sin(dLat/2)**2+
    Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*
    Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function sanitizeQuery(title){
  return title
    .replace(/&/g,' ')
    .replace(/\s+/g,' ')
    .replace(/[()]/g,'')
    .trim();
}

function generateFallbackQueries(title){
  const clean = sanitizeQuery(title);
  const variants = [clean];

  if(clean.includes(' ')){
    variants.push(clean.split(' ')[0]);
  }

  if(title.includes('&')){
    title.split('&').forEach(part=>{
      variants.push(sanitizeQuery(part));
    });
  }

  return [...new Set(variants)];
}

async function queryNominatim(query){
  const url=new URL(CONFIG.nominatimBaseUrl);
  url.searchParams.set('q',query);
  url.searchParams.set('format','json');
  url.searchParams.set('limit','5');

  const res=await fetch(url,{
    headers:{'User-Agent':CONFIG.userAgent}
  });

  if(!res.ok) return null;
  const data=await res.json();
  return data;
}

function pickBestResult(results){
  if(!results) return null;

  for(const r of results){
    if(
      allowedClasses.includes(r.class) ||
      allowedTypes.includes(r.type)
    ){
      return {
        lat:parseFloat(r.lat),
        lng:parseFloat(r.lon),
        displayName:r.display_name
      };
    }
  }

  return results[0]
    ? {
        lat:parseFloat(results[0].lat),
        lng:parseFloat(results[0].lon),
        displayName:results[0].display_name
      }
    : null;
}

async function geocodePlace(title, city){
  const queries = generateFallbackQueries(title);

  for(const q of queries){
    const fullQuery = `${q}, ${city}`;
    const results = await queryNominatim(fullQuery);
    await sleep(CONFIG.requestDelayMs);

    const best = pickBestResult(results);
    if(best) return best;
  }

  return null;
}

async function main(){
  const args=process.argv.slice(2);
  const dryRun=args.includes('--dry-run');

  const cache=readJson(CONFIG.cacheFile,{});
  const overrides=readJson(CONFIG.overridesFile,{});
  const log=readJson(CONFIG.logFile,[]);

  const files=fs.readdirSync(CONFIG.placesDir)
    .filter(f=>f.startsWith('places.')&&f.endsWith('.json'));

  for(const file of files){
    const citySlug=file.replace('places.','').replace('.json','');
    const city=citySlug.charAt(0).toUpperCase()+citySlug.slice(1);

    const filePath=path.join(CONFIG.placesDir,file);
    const data=readJson(filePath,null);

    if(!data?.places) continue;

    console.log(`\nProcessing ${city}`);

    for(const place of data.places){
      const title=place.title?.en||place.id;

      if(overrides[place.id]){
        place.lat=overrides[place.id].lat;
        place.lng=overrides[place.id].lng;
        continue;
      }

      const cacheKey=`${title}|${city}`;
      if(cache[cacheKey]){
        const c=cache[cacheKey];
        const dist=haversineDistance(place.lat,place.lng,c.lat,c.lng);
        if(dist<CONFIG.maxAcceptableDistanceM) continue;

        place.lat=c.lat;
        place.lng=c.lng;
        continue;
      }

      console.log(`Geocoding ${title}...`);
      const result=await geocodePlace(title,city);

      if(!result){
        console.log(`No result for ${title}`);
        continue;
      }

      cache[cacheKey]=result;

      const dist=haversineDistance(place.lat,place.lng,result.lat,result.lng);
      if(dist<CONFIG.maxAcceptableDistanceM) continue;

      place.lat=result.lat;
      place.lng=result.lng;
      console.log(`Updated ${title}`);
    }

    if(!dryRun){
      writeJson(filePath,data);
    }
  }

  if(!dryRun){
    writeJson(CONFIG.cacheFile,cache);
    writeJson(CONFIG.logFile,log);
  }

  console.log('\nDONE');
}

main();