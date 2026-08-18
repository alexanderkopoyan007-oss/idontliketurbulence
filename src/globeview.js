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

let TRAFFIC = [], TRAFFIC_LAYERS = [], TRAFFIC_TIMER = 0;

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

async function fetchTraffic(){
  if (!GMAP) return null;
  const c = GMAP.getCenter();
  const b = GMAP.getBounds();
  /* radius that covers the view, capped at what the source will serve */
  const km = Math.min(400, distance({lat:c.lat, lon:c.lng},
                                    {lat:b.getNorth(), lon:b.getEast()})/1000);
  const nm = Math.max(20, Math.round(km/1.852));
  const url = `${trafficBase()}/adsb?src=adsblol&path=${encodeURIComponent(`v2/lat/${c.lat.toFixed(3)}/lon/${c.lng.toFixed(3)}/dist/${nm}`)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status === 404 || r.status === 400
    ? "no proxy on this host" : `proxy said ${r.status}`);
  const j = await r.json();
  return (j.ac || []).filter(a => isFinite(a.lat) && isFinite(a.lon));
}

function drawTraffic(){
  TRAFFIC_LAYERS.forEach(l => GMAP.removeLayer(l));
  TRAFFIC_LAYERS = [];
  for (const a of TRAFFIC){
    const track = isFinite(a.track) ? a.track : 0;
    const alt = isFinite(a.alt_baro) ? a.alt_baro : null;
    /* Dim anything well below cruise: it is climbing or descending and is not
       the thing this map is about. */
    const cruising = alt !== null && alt > 20000;
    const m = L.marker([a.lat, a.lon], {
      icon: L.divIcon({ className: "", iconSize: [0,0],
        html: `<div class="ac-live${cruising ? "" : " low"}" style="transform:rotate(${track}deg)">✈</div>` }),
      zIndexOffset: 800,
    }).addTo(GMAP);
    const call = (a.flight || "").trim();
    m.bindPopup(
      `<b style="font-family:var(--mono)">${call || a.hex}</b><br>` +
      (alt !== null ? `${fmtFL(alt)} · ` : "") +
      (isFinite(a.gs) ? `${Math.round(a.gs)} kt · ` : "") +
      `track ${Math.round(track)}°<br>` +
      (call ? `<a href="#" class="ac-brief" data-call="${call}">Briefing for this flight</a>`
            : `<span style="color:#8DA0B8">no callsign</span>`));
    TRAFFIC_LAYERS.push(m);
  }
  const tag = $("#gTraffic");
  if (tag) tag.textContent = `${TRAFFIC.length} aircraft`;

  /* Clicking through to a briefing reuses the existing flight-number path. */
  GMAP.off("popupopen").on("popupopen", e => {
    const link = e.popup.getElement() && e.popup.getElement().querySelector(".ac-brief");
    if (!link) return;
    link.onclick = ev => {
      ev.preventDefault();
      const call = link.dataset.call;
      goView("ride");
      tab("flight");
      $("#fnum").value = call;
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
  /* 20 s is polite to a free service and fast enough to watch a deviation. */
  TRAFFIC_TIMER = setInterval(load, 20000);
}
