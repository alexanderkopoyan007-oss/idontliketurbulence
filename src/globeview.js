"use strict";
/* ══════════ AREA MAP VIEW ═══════════════════════════════════════════════
   A raster overlay of the turbulence field, not thousands of DOM markers: the
   field is drawn once into an ImageData buffer with bilinear interpolation and
   handed to Leaflet as a single image. At these grid sizes a canvas raster is
   the right tool — a WebGL context per pan would cost more than it saves, and
   the requirement that mattered was "one raster, not a marker per cell". */

let GMAP = null, GLAYER = null, GFIELD = null, GWHEN = null;

function gStatus(html, cls){
  const el = $("#gStatus"); if (el) el.innerHTML = html ? `<div class="note ${cls||""}">${html}</div>` : "";
}

function mountGlobe(){
  if (!$("#gGo")) return;
  $("#gGo").addEventListener("click", loadArea);
  const tb = $("#gTrafficBtn"); if (tb) tb.addEventListener("click", toggleTraffic);
  const fl = $("#gFL"), tm = $("#gTime");
  if (fl) fl.addEventListener("input", () => { $("#gFLv").textContent = "FL" + fl.value; redrawArea(); });
  if (tm) tm.addEventListener("input", () => {
    const h = +tm.value;
    GWHEN = new Date(Date.now() + h*3600e3);
    $("#gTimev").textContent = h === 0 ? "now" : `+${h} h · ${hhmmUTC(GWHEN)}`;
    redrawArea();
  });
}

function ensureGMap(){
  if (GMAP) return GMAP;
  GMAP = L.map("gmap", { zoomControl: true, worldCopyJump: false }).setView([48, 5], 4);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd", maxZoom: 9,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(GMAP);
  GMAP.on("moveend", () => {
    const p = areaPlan();
    $("#gCost").textContent = `${p.points} grid points · ${p.chunks} request${p.chunks===1?"":"s"} for this view`;
  });
  return GMAP;
}

function areaPlan(){
  const b = ensureGMap().getBounds();
  return globePlan({ south:b.getSouth(), north:b.getNorth(), west:b.getWest(), east:b.getEast() },
                   GMAP.getZoom());
}

async function loadArea(){
  const plan = areaPlan();
  const ok = confirm(
    `Fetch turbulence data for this view?\n\n` +
    `${plan.points} grid points at ${plan.step}° spacing, ${plan.chunks} request` +
    `${plan.chunks===1?"":"s"} covering 3 days.\n\n` +
    `Roughly ${(plan.chunks/4).toFixed(1)}× the cost of one route briefing. ` +
    `Zoom out for a coarser, cheaper grid.`);
  if (!ok) return;

  $("#gGo").disabled = true;
  $("#gStatus").innerHTML = `<div class="loading"><p id="gMsg">Starting…</p><div class="bar"><i id="gBar"></i></div></div>`;
  const prog = (pct, msg) => { const b=$("#gBar"), m=$("#gMsg"); if(b) b.style.width=pct+"%"; if(m) m.textContent=msg; };
  try{
    GWHEN = GWHEN || new Date();
    GFIELD = await globeFetch(plan, GWHEN, prog);
    prog(90, "Computing the field…");
    redrawArea();
    gStatus("");
  }catch(e){
    console.error(e);
    gStatus(`<span>Can't load it</span><div>${(e && e.message) || "Something went wrong."}</div>`, "err");
  }finally{ $("#gGo").disabled = false; }
}

function redrawArea(){
  if (!GFIELD) return;
  const fl = +($("#gFL") ? $("#gFL").value : 340);
  const f = globeField(GFIELD, fl*100, GWHEN || new Date());
  drawAreaRaster(f);
  const vals = [...f.values].filter(v => !isNaN(v));
  $("#gMeta").textContent = vals.length
    ? `${f.nx}×${f.ny} cells · EDR ${Math.min(...vals).toFixed(2)}–${Math.max(...vals).toFixed(2)} at FL${fl}`
    : "no cells could be computed for this view";
}

/* Bilinear raster of the grid, drawn once and overlaid as an image. */
function drawAreaRaster(f){
  const W = 512, H = 512;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const img = ctx.createImageData(W, H);

  const sample = (gx, gy) => {
    const x0 = Math.floor(gx), y0 = Math.floor(gy);
    const x1 = Math.min(f.nx-1, x0+1), y1 = Math.min(f.ny-1, y0+1);
    const tx = gx-x0, ty = gy-y0;
    const v = (yy,xx) => f.values[yy*f.nx + xx];
    const a = v(y0,x0), b = v(y0,x1), c = v(y1,x0), d = v(y1,x1);
    if (isNaN(a)||isNaN(b)||isNaN(c)||isNaN(d)) return NaN;
    return lerp(lerp(a,b,tx), lerp(c,d,tx), ty);
  };

  for (let py=0; py<H; py++){
    /* image row 0 is the north edge; grid row 0 is the south edge */
    const gy = (1 - py/(H-1)) * (f.ny-1);
    for (let px=0; px<W; px++){
      const gx = px/(W-1) * (f.nx-1);
      const e = sample(gx, gy);
      const i = 4*(py*W+px);
      if (isNaN(e)){ img.data[i+3] = 0; continue; }
      const rgb = rampCol(e).match(/\d+/g);
      if (!rgb){ img.data[i+3] = 0; continue; }
      img.data[i]   = +rgb[0];
      img.data[i+1] = +rgb[1];
      img.data[i+2] = +rgb[2];
      /* smooth air is transparent so the basemap shows through */
      img.data[i+3] = Math.round(clamp((e-0.04)/0.30, 0, 1) * 205);
    }
  }
  ctx.putImageData(img, 0, 0);

  const bounds = [[f.lats[0], f.lons[0]], [f.lats[f.ny-1], f.lons[f.nx-1]]];
  if (GLAYER) GMAP.removeLayer(GLAYER);
  GLAYER = L.imageOverlay(cv.toDataURL(), bounds, { opacity: 0.78, interactive: false }).addTo(GMAP);
}
mountGlobe();

/* ══════════ LIVE TRAFFIC ════════════════════════════════════════════════
   Aircraft visibly routing around a red patch is the forecast validating itself
   in public, which is the whole point of putting traffic on this map.

   It needs a server-side hop, because no free ADS-B source sends CORS headers.
   The Cloudflare Worker was the obvious home for that and does not work — every
   source refuses Cloudflare's shared egress — so the proxy lives in serve.rb and
   this works when the site is served locally. On a static host there is no /adsb
   route, and the UI says so instead of quietly showing an empty sky. */

let TRAFFIC = [], TRAFFIC_LAYERS = [], TRAFFIC_TIMER = 0, TRAFFIC_AGE = null;

/* Where the ADS-B proxy lives.

   It cannot be same-origin on the deployed site: no free ADS-B source sends CORS
   headers, and every one of them refuses Cloudflare's egress addresses, so the
   Worker cannot do it either. An HTTPS page also cannot reach http://localhost —
   that is blocked outright, whatever the service worker appears to say.

   What does work is a tunnel: a public HTTPS address that forwards to the proxy
   running on this machine, so the outbound request leaves from an ordinary
   residential address that the ADS-B services are happy to serve. ./start.sh
   --tunnel prints the URL; paste it in once and it is remembered. */
function trafficBase(){
  try{
    const saved = localStorage.getItem("adsbProxy");
    if (saved) return saved.replace(/\/+$/, "");
  }catch{}
  return "";                      // same origin — correct when run locally
}
function setTrafficBase(v){
  try{
    if (v) localStorage.setItem("adsbProxy", v.trim().replace(/\/+$/, ""));
    else localStorage.removeItem("adsbProxy");
  }catch{}
}

/* Two sources, chosen by how much of the world you are looking at.

   Zoomed in, adsb.lol answers a radius query cheaply and carries richer fields.
   Zoomed out, no radius query covers the planet, so OpenSky's unbounded
   /states/all is the only option — 10,000-odd aircraft in about 1.4 MB.

   OpenSky's anonymous budget is the binding constraint and is stated in the UI
   rather than hidden: 400 credits a day, and an unbounded global query costs 4,
   so roughly 100 global refreshes per day. Global therefore refreshes on a much
   slower timer than regional, and the panel says how many are left. */
const OSKY_GLOBAL_COST = 4, OSKY_DAILY_CREDITS = 400;

/* Published global feed. A scheduled GitHub Action fetches the world every 15
   minutes and force-pushes it to a data branch; raw.githubusercontent.com sends
   access-control-allow-origin: *, so the browser reads it directly and no proxy
   exists in this path at all. Nothing has to be running for it to work.

   The trade is staleness: cron fires every 15 minutes at best and often late,
   so positions can be a quarter-hour old. That is fine for seeing who is flying
   through which weather and wrong for watching one aircraft turn, which is why
   a live proxy still takes priority when one is configured. */
const TRAFFIC_FEED =
  "https://raw.githubusercontent.com/alexanderkopoyan007-oss/idontliketurbulence/traffic-data/data/traffic.json";

async function fetchPublishedTraffic(){
  const r = await fetch(TRAFFIC_FEED, { cache: "no-store" });
  if (!r.ok) throw new Error("published feed unavailable (" + r.status + ")");
  const j = await r.json();
  const age = Date.now()/1000 - (j.t || 0);
  return {
    ageSec: Math.max(0, Math.round(age)),
    aircraft: (j.ac || []).map(a => ({
      flight: a[0], lat: a[1], lon: a[2],
      alt_baro: a[3] === null ? null : a[3]*100,
      gs: a[4], track: a[5], hex: a[6] || null, src: "published feed",
    })),
  };
}

function trafficBudget(){
  let st;
  try { st = JSON.parse(localStorage.getItem("oskyBudget") || "{}"); } catch { st = {}; }
  const today = new Date().toISOString().slice(0,10);
  if (st.day !== today) st = { day: today, used: 0 };
  return st;
}
function spendBudget(n){
  const st = trafficBudget();
  st.used += n;
  try { localStorage.setItem("oskyBudget", JSON.stringify(st)); } catch {}
  return st;
}

/* A view wider than this cannot be served by a radius query. */
const GLOBAL_ZOOM = 5;

async function fetchTraffic(){
  if (!GMAP) return null;
  const zoom = GMAP.getZoom();
  const base = trafficBase();
  const get = async (src, path) => {
    const r = await fetch(`${base}/adsb?src=${src}&path=${encodeURIComponent(path)}`)
      .catch(() => { throw new Error("no proxy on this host"); });
    const ct = (r.headers.get("content-type") || "").toLowerCase();
    if (!r.ok || !ct.includes("json")) throw new Error("no proxy on this host");
    return r.json().catch(() => { throw new Error("no proxy on this host"); });
  };

  if (!trafficBase()){
    /* No live proxy configured: use the published feed, whatever the zoom.

       This used to be gated on being zoomed out, which was simply wrong — the
       feed is global, so it serves a close-in view perfectly well. Gating it
       meant zooming in produced "point this at a proxy" on a site that already
       had the data, which is the opposite of degrading gracefully.

       Zoomed in, the world is trimmed to the visible area plus a margin, so a
       city view draws a few dozen aircraft instead of six thousand. */
    const pub = await fetchPublishedTraffic();
    TRAFFIC_AGE = pub.ageSec;
    if (zoom <= GLOBAL_ZOOM) return pub.aircraft;
    const b = GMAP.getBounds().pad(0.25);
    return pub.aircraft.filter(a =>
      a.lat >= b.getSouth() && a.lat <= b.getNorth() &&
      a.lon >= b.getWest()  && a.lon <= b.getEast());
  }

  if (zoom <= GLOBAL_ZOOM){
    const st = trafficBudget();
    if (st.used + OSKY_GLOBAL_COST > OSKY_DAILY_CREDITS)
      throw new Error("OpenSky's anonymous daily budget is spent. It resets at midnight UTC, or zoom in to use the regional source.");
    const j = await get("opensky", "states/all");
    spendBudget(OSKY_GLOBAL_COST);
    /* OpenSky returns positional arrays, not objects. Index order is fixed by
       their API: 0 icao24, 1 callsign, 5 lon, 6 lat, 7 baro alt (m), 8 on
       ground, 9 velocity (m/s), 10 true track, 13 geo alt (m). */
    return (j.states || [])
      .filter(s => s[5] !== null && s[6] !== null && !s[8])
      .map(s => ({
        hex: s[0], flight: (s[1] || "").trim(),
        lat: s[6], lon: s[5],
        alt_baro: s[7] !== null ? Math.round(s[7]/0.3048) : null,
        gs: s[9] !== null ? Math.round(s[9]*1.94384) : null,
        track: s[10],
        src: "opensky",
      }));
  }

  const c = GMAP.getCenter(), b = GMAP.getBounds();
  const km = Math.min(400, distance({lat:c.lat, lon:c.lng},
                                    {lat:b.getNorth(), lon:b.getEast()})/1000);
  const nm = Math.max(20, Math.round(km/1.852));
  TRAFFIC_AGE = null;
  const j = await get("adsblol", `v2/lat/${c.lat.toFixed(3)}/lon/${c.lng.toFixed(3)}/dist/${nm}`);
  return (j.ac || []).filter(a => isFinite(a.lat) && isFinite(a.lon))
                     .map(a => ({ ...a, src: "adsb.lol" }));
}

/* Above a few hundred aircraft the per-marker DOM node stops being viable, so
   those render into Leaflet's shared canvas as circles. Below it, the rotated
   glyph is worth having because heading is what shows an aircraft bending
   around weather. */
const TRAFFIC_DOM_LIMIT = 400;
let TRAFFIC_CANVAS = null;

function trafficColour(alt){
  if (alt === null) return "#607289";
  if (alt < 10000) return "#607289";
  if (alt < 20000) return "#8DA0B8";
  if (alt < 30000) return "#7FD8CE";
  return "#FFB03A";
}

function drawTraffic(){
  TRAFFIC_LAYERS.forEach(l => GMAP.removeLayer(l));
  TRAFFIC_LAYERS = [];
  const many = TRAFFIC.length > TRAFFIC_DOM_LIMIT;
  if (many && !TRAFFIC_CANVAS) TRAFFIC_CANVAS = L.canvas({ padding: 0.3 });

  for (const a of TRAFFIC){
    const alt = isFinite(a.alt_baro) ? a.alt_baro : null;
    const call = (a.flight || "").trim();
    let m;
    if (many){
      m = L.circleMarker([a.lat, a.lon], {
        renderer: TRAFFIC_CANVAS, radius: alt !== null && alt > 20000 ? 2.6 : 1.8,
        color: trafficColour(alt), weight: 0, fillColor: trafficColour(alt), fillOpacity: 0.85,
      }).addTo(GMAP);
    } else {
      const track = isFinite(a.track) ? a.track : 0;
      const cruising = alt !== null && alt > 20000;
      m = L.marker([a.lat, a.lon], {
        icon: L.divIcon({ className: "", iconSize: [0,0],
          html: `<div class="ac-live${cruising ? "" : " low"}" style="transform:rotate(${track}deg)">✈</div>` }),
        zIndexOffset: 800,
      }).addTo(GMAP);
    }
    /* The popup opens immediately with what the feed knows, then fills in what
       it does not: the route and the actual aeroplane. Both come from adsbdb,
       which is free, keyless and CORS-open, so the lookups happen straight from
       the browser. They are only fired on click — doing 5,000 of them up front
       would be absurd and would get the app blocked. */
    m.bindPopup(() => aircraftPopupHTML(a), { minWidth: 240 });
    m.on("popupopen", ev => fillAircraftPopup(a, ev.popup));
    TRAFFIC_LAYERS.push(m);
  }

  const st = trafficBudget();
  const tag = $("#gTraffic");
  if (tag){
    let note = "";
    if (TRAFFIC_AGE !== null){
      const m = Math.round(TRAFFIC_AGE/60);
      const scope = GMAP.getZoom() <= GLOBAL_ZOOM ? "global" : "this view";
      note = ` · ${scope} · published feed, ${m < 1 ? "under a minute" : m + " min"} old`;
    } else if (GMAP.getZoom() <= GLOBAL_ZOOM){
      note = ` · global · ${Math.max(0, Math.floor((OSKY_DAILY_CREDITS - st.used)/OSKY_GLOBAL_COST))} refreshes left today`;
    } else {
      note = " · this view";
    }
    tag.textContent = TRAFFIC.length ? `${TRAFFIC.length.toLocaleString()} aircraft` + note : "";
  }

  GMAP.off("popupopen").on("popupopen", e => {
    const link = e.popup.getElement() && e.popup.getElement().querySelector(".ac-brief");
    if (!link) return;
    link.onclick = ev => {
      ev.preventDefault();
      goView("ride"); tab("flight");
      $("#fnum").value = link.dataset.call;
      $("#goFlight").click();
    };
  });
}

async function toggleTraffic(){
  const btn = $("#gTrafficBtn"); if (!btn) return;
  if (TRAFFIC_TIMER){
    clearInterval(TRAFFIC_TIMER); TRAFFIC_TIMER = 0;
    TRAFFIC_LAYERS.forEach(l => GMAP.removeLayer(l)); TRAFFIC_LAYERS = [];
    TRAFFIC = [];
    btn.textContent = "Show live traffic";
    const tag = $("#gTraffic"); if (tag) tag.textContent = "";
    return;
  }
  const load = async () => {
    try{
      TRAFFIC = await fetchTraffic();
      drawTraffic();
    }catch(e){
      clearInterval(TRAFFIC_TIMER); TRAFFIC_TIMER = 0;
      btn.textContent = "Show live traffic";
      const hint = `<div style="margin-top:8px">
          <input id="gProxy" placeholder="https://something.trycloudflare.com" style="width:100%"
                 value="${trafficBase()}">
          <button class="act" id="gProxySave" style="margin-top:6px">Use this proxy</button>
        </div>`;
      gStatus(e.message === "no proxy on this host"
        ? `<span>Point this at a proxy</span><div>No free ADS-B source sends CORS headers, so live
           traffic needs a server-side hop — and it has to run somewhere with an ordinary address,
           because every source refuses Cloudflare's. Run <span class="mono">./start.sh --tunnel</span>
           on the machine with this project, then paste the printed URL here. It is remembered.${hint}</div>`
        : `<span>Traffic unavailable</span><div>${e.message}</div>`, "err");
      const save = $("#gProxySave");
      if (save) save.onclick = () => { setTrafficBase($("#gProxy").value); gStatus(""); toggleTraffic(); };
    }
  };
  ensureGMap();
  btn.textContent = "Hide live traffic";
  await load();
  /* Regional is cheap, so 20 s. Global costs 4 of 400 daily credits per call,
     so it goes on a 3-minute timer — 100 refreshes is not many. */
  const period = () => GMAP.getZoom() > GLOBAL_ZOOM ? 20000
                     : trafficBase() ? 180000
                     : 300000;   /* published feed only changes every 15 min */
  TRAFFIC_TIMER = setInterval(load, period());
}


/* ══════════ AIRCRAFT POPUP ══════════════════════════════════════════════ */

const AC_INFO = new Map();          // hex/callsign -> resolved details, cached

function aircraftPopupHTML(a){
  const call = (a.flight || "").trim();
  const alt = isFinite(a.alt_baro) ? a.alt_baro : null;
  return `<div class="acpop" data-key="${call || a.hex || ""}">
    <b class="mono">${call || a.hex || "unknown"}</b>
    <div class="acpop-now">${[
      alt !== null ? fmtFL(alt) : null,
      isFinite(a.gs) ? Math.round(a.gs) + " kt" : null,
      isFinite(a.track) ? "track " + Math.round(a.track) + "°" : null,
    ].filter(Boolean).join(" · ")}</div>
    <div class="acpop-info">Looking up…</div>
  </div>`;
}

async function lookupAircraft(a){
  const call = (a.flight || "").trim();
  const key = call || a.hex || "";
  if (AC_INFO.has(key)) return AC_INFO.get(key);

  const info = { call, hex: a.hex || null };
  /* Route by callsign, aeroplane by hex. Either can be absent — a private
     flight has no published route, and OpenSky sometimes has no callsign —
     so each is attempted independently and missing ones are simply not shown. */
  const jobs = [];
  if (call) jobs.push(
    getJSON(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(call)}`, 1)
      .then(j => {
        const f = j && j.response && j.response.flightroute;
        if (!f) return;
        info.airline = f.airline && f.airline.name;
        info.from = f.origin && { iata: f.origin.iata_code, city: f.origin.municipality, icao: f.origin.icao_code };
        info.to   = f.destination && { iata: f.destination.iata_code, city: f.destination.municipality, icao: f.destination.icao_code };
      }).catch(() => {}));
  if (a.hex) jobs.push(
    getJSON(`https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(a.hex)}`, 1)
      .then(j => {
        const ac = j && j.response && j.response.aircraft;
        if (!ac) return;
        info.type = ac.type;
        info.icaoType = ac.icao_type;
        info.manufacturer = ac.manufacturer;
        info.registration = ac.registration;
        info.owner = ac.registered_owner;
      }).catch(() => {}));

  await Promise.all(jobs);
  AC_INFO.set(key, info);
  return info;
}

async function fillAircraftPopup(a, popup){
  const el = popup.getElement && popup.getElement();
  if (!el) return;
  const box = el.querySelector(".acpop-info");
  if (!box) return;

  let info;
  try { info = await lookupAircraft(a); }
  catch { info = null; }

  const stillOpen = popup.getElement && popup.getElement();
  if (!stillOpen) return;
  const target = stillOpen.querySelector(".acpop-info");
  if (!target) return;

  const call = (a.flight || "").trim();
  const rows = [];
  if (info && info.from && info.to){
    rows.push(`<div class="acpop-route"><b>${info.from.iata || "?"}</b>
      <span>${info.from.city || ""}</span> → <b>${info.to.iata || "?"}</b>
      <span>${info.to.city || ""}</span></div>`);
  }
  if (info && info.airline)  rows.push(`<div><em>Airline</em> ${info.airline}</div>`);
  if (info && (info.manufacturer || info.type))
    rows.push(`<div><em>Aircraft</em> ${[info.manufacturer, info.type].filter(Boolean).join(" ")}${info.icaoType ? " (" + info.icaoType + ")" : ""}</div>`);
  if (info && info.registration) rows.push(`<div><em>Registration</em> ${info.registration}</div>`);
  if (info && info.owner && info.owner !== info.airline)
    rows.push(`<div><em>Operator</em> ${info.owner}</div>`);

  const canBrief = !!(info && info.from && info.to);
  const briefBtn = canBrief
    ? `<button class="act ac-brief" data-call="${call}">Turbulence report for this flight</button>`
    : call
      ? `<button class="act ac-brief" data-call="${call}">Try a turbulence report</button>`
      : "";

  target.innerHTML = (rows.length ? rows.join("") : `<div class="acpop-none">No published route or airframe
      record for this one — often a private, military or positioning flight.</div>`)
    + `<div class="acpop-src">${a.src}</div>`
    + briefBtn;

  const btn = target.querySelector(".ac-brief");
  if (btn) btn.onclick = ev => {
    ev.preventDefault();
    goView("ride"); tab("flight");
    $("#fnum").value = btn.dataset.call;
    $("#goFlight").click();
  };
}
