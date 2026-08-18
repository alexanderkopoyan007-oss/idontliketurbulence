/* Ride Report — observation network Worker.
 *
 * Deploy-ready, not deployed: it needs a Cloudflare account, which is yours to
 * provide. `wrangler d1 create ride-report && wrangler deploy` is the whole
 * process once you have one.
 *
 * What it does NOT do, deliberately:
 *   - no accounts, no device ids, no session cookies
 *   - no IP logging (the rate-limit bucket is a salted, truncated hash that
 *     expires within the hour and cannot be reversed to an address)
 *   - no storage of anything at finer than 0.1 degrees
 *
 * It also serves as the CORS proxy the rest of the app needs: OpenSky, adsb.lol
 * and airplanes.live all refuse browser origins, which is what blocks aircraft
 * rotation in the delay estimate and live traffic on a map. Those routes are
 * here and disabled by default — turn them on when you deploy.
 */

const CORS = origin => ({
  "access-control-allow-origin": origin || "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
});
const json = (obj, status, origin) => new Response(JSON.stringify(obj), {
  status: status || 200,
  headers: { "content-type": "application/json", ...CORS(origin) },
});

const coarse = v => v === null || v === undefined ? null : Math.round(v*10)/10;
const round500 = v => v === null || v === undefined ? null : Math.round(v/500)*500;

/* A bucket key that rate-limits without identifying: hash the address with a
   per-deployment secret and a time window, keep 10 hex chars, expire it. The
   address is never written anywhere. */
async function bucketKey(request, env){
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const window = Math.floor(Date.now()/3600000);
  const data = new TextEncoder().encode(`${env.SALT || "ride-report"}:${ip}:${window}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].slice(0,5).map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function underQuota(env, key, limit = 2000){
  const now = Date.now(), expires = now + 3600000;
  const row = await env.DB.prepare("SELECT n, expires FROM quota WHERE bucket = ?").bind(key).first();
  if (!row || row.expires < now){
    await env.DB.prepare("INSERT OR REPLACE INTO quota (bucket, n, expires) VALUES (?, 1, ?)")
                .bind(key, expires).run();
    return true;
  }
  if (row.n >= limit) return false;
  await env.DB.prepare("UPDATE quota SET n = n + 1 WHERE bucket = ?").bind(key).run();
  return true;
}

/* POST /observations — a landed flight's batch. Never called in flight: the
   client holds everything until the aircraft is on the ground. */
async function postObservations(request, env, origin){
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.observations))
    return json({ error: "expected { observations: [...] }" }, 400, origin);
  if (body.observations.length > 2000)
    return json({ error: "batch too large; split it" }, 413, origin);

  const now = Date.now();
  const stmt = env.DB.prepare(
    `INSERT INTO observations (t, lat, lon, alt_ft, idx, slope, r2, kolm, rms, fs, ac_class, received_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const batch = [];
  for (const o of body.observations){
    if (typeof o.index !== "number" || o.index < 0 || o.index > 100) continue;
    batch.push(stmt.bind(
      /* round the timestamp to the minute: a 10-second-resolution track of where
         somebody was is more identifying than it needs to be */
      Math.round((+o.t || now)/60000)*60000,
      coarse(o.lat), coarse(o.lon), round500(o.alt),
      Math.round(o.index),
      typeof o.slope === "number" ? +o.slope.toFixed(3) : null,
      typeof o.r2    === "number" ? +o.r2.toFixed(3)    : null,
      typeof o.kolm  === "number" ? +o.kolm.toFixed(3)  : null,
      typeof o.rms   === "number" ? +o.rms.toFixed(5)   : null,
      typeof o.fs    === "number" ? +o.fs.toFixed(1)    : null,
      ["narrow","wide","jumbo","regional","bizjet"].includes(o.acClass) ? o.acClass : null,
      now));
  }
  if (!batch.length) return json({ stored: 0 }, 200, origin);
  await env.DB.batch(batch);
  return json({ stored: batch.length }, 200, origin);
}

/* POST /forecasts — what we predicted, logged at briefing time so the
   comparison cannot be made after the fact. */
async function postForecasts(request, env, origin){
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.points))
    return json({ error: "expected { points: [...] }" }, 400, origin);
  const now = Date.now();
  const stmt = env.DB.prepare(
    `INSERT INTO forecasts (t, lat, lon, alt_ft, edr, band, models, confidence, issued_at, received_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const batch = body.points.slice(0, 200).filter(p => typeof p.edr === "number").map(p => stmt.bind(
    Math.round((+p.t || now)/60000)*60000,
    coarse(p.lat), coarse(p.lon), round500(p.alt),
    +p.edr.toFixed(4), p.band|0,
    typeof body.models === "string" ? body.models.slice(0,80) : null,
    body.confidence|0, +body.issuedAt || now, now));
  if (!batch.length) return json({ stored: 0 }, 200, origin);
  await env.DB.batch(batch);
  return json({ stored: batch.length }, 200, origin);
}

/* GET /verification — forecast against observed, binned by forecast EDR.
   This is the whole point of the network: publish where the model over- and
   under-calls, including when that is unflattering. */
async function getVerification(env, origin){
  const rows = await env.DB.prepare(`
    SELECT f.band AS band,
           COUNT(*) AS n,
           AVG(f.edr) AS mean_forecast_edr,
           AVG(o.idx) AS mean_observed_index,
           AVG(o.kolm) AS mean_kolmogorov
    FROM forecasts f
    JOIN observations o
      ON  o.lat = f.lat AND o.lon = f.lon
      AND ABS(o.t - f.t) <= 1800000
      AND ABS(o.alt_ft - f.alt_ft) <= 4000
    WHERE o.kolm >= 0.35
    GROUP BY f.band
    ORDER BY f.band
  `).all();
  return json({
    bins: rows.results || [],
    note: "Observed index is a relative cabin-response measure, not an EDR. " +
          "The comparison shows whether forecast severity ORDERS the observations " +
          "correctly, not whether the two numbers agree in magnitude — they are " +
          "different quantities and always will be.",
  }, 200, origin);
}

/* CORS proxy for the ADS-B sources that refuse browsers.

   MEASURED RESULT: this does not currently work, and the reason is worth
   recording. The CORS problem it was built for is genuinely solved — the proxy
   returns the right headers. But every free ADS-B source then refuses
   Cloudflare egress, which comes from shared addresses that public APIs
   throttle by default:

     OpenSky         522, connection timed out after ~20s
     adsb.lol        429, rate limited
     airplanes.live  403, asks you to contact them describing your project

   All three answer in under a second from an ordinary machine. So the blocker
   moved from CORS to IP reputation, and no code change fixes it. The ways
   forward are: email airplanes.live for access, run this proxy somewhere with a
   normal address, or leave live traffic out. Disabled by default accordingly. */
const PROXY_HOSTS = {
  opensky: "https://opensky-network.org/api/",
  adsbfi:  "https://opendata.adsb.fi/api/",
  adsblol: "https://api.adsb.lol/",
  planeslive: "https://api.airplanes.live/",
};
async function proxy(request, env, url, origin){
  if (env.ENABLE_PROXY !== "1") return json({ error: "proxy disabled" }, 403, origin);
  const which = url.searchParams.get("src");
  const path  = url.searchParams.get("path") || "";
  const base  = PROXY_HOSTS[which];
  if (!base) return json({ error: "unknown source" }, 400, origin);
  if (path.includes("..")) return json({ error: "bad path" }, 400, origin);
  const upstream = await fetch(base + path.replace(/^\/+/, ""), { headers: { accept: "application/json", "user-agent": "IDontLikeTurbulence/1.0 (personal, non-commercial)" } });
  const text = await upstream.text();
  return new Response(text, { status: upstream.status,
    headers: { "content-type": "application/json", "cache-control": "public, max-age=20", ...CORS(origin) } });
}

export default {
  async fetch(request, env){
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS(origin) });

    const key = await bucketKey(request, env);
    if (!(await underQuota(env, key))) return json({ error: "rate limited" }, 429, origin);

    try{
      if (url.pathname === "/observations" && request.method === "POST") return await postObservations(request, env, origin);
      if (url.pathname === "/forecasts"    && request.method === "POST") return await postForecasts(request, env, origin);
      if (url.pathname === "/verification" && request.method === "GET")  return await getVerification(env, origin);
      if (url.pathname === "/proxy"        && request.method === "GET")  return await proxy(request, env, url, origin);
      return json({ error: "not found" }, 404, origin);
    }catch(e){
      return json({ error: "server error", detail: String(e && e.message).slice(0,200) }, 500, origin);
    }
  },
};
