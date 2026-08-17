"use strict";
let RES = null, MAP = null, MAPLAYERS = [], ACMARK = null, CUR = 0;

/* ══════════ VERDICT COPY ═══════════════════════════════════════════════ */
const VERDICTS = [
  [0.10, "Smooth all the way",      "Nothing in the model suggests a bumpy ride."],
  [0.17, "Mostly smooth",           "A little light movement, the kind you stop noticing."],
  [0.26, "A few light bumps",       "Light turbulence in places. Drinks stay in the cup."],
  [0.36, "Bumpy in places",         "Moderate patches. Expect the seatbelt sign and a paused service."],
  [0.48, "A rough patch or two",    "Moderate turbulence with firm jolts through the worst of it."],
  [0.62, "A rough ride expected",   "Sustained moderate-to-strong turbulence. Keep the belt fastened."],
  [9.99, "Strong turbulence likely","The model is flagging strong to severe conditions on this route."]
];
function verdictFor(felt){ for (const v of VERDICTS) if (felt < v[0]) return v; return VERDICTS[VERDICTS.length-1]; }

/* Contiguous spans of the track where a test holds, with the peak of each. */
function spansOf(list, pred){
  const out = []; let cur = null;
  list.forEach(w => {
    if (pred(w)){
      if (!cur){ cur = {a:w, b:w, pk:w}; out.push(cur); }
      else { cur.b = w; if (w.edr > cur.pk.edr) cur.pk = w; }
    } else cur = null;
  });
  return out;
}
const phaseWord = p => p === "climb" || p === "takeoff" ? "during the climb"
                     : p === "descent" || p === "landing" ? "on the way down" : "in the cruise";

function narrative(R){
  const { worst, route, roughMin, bumpyMin, totalMin } = R;
  const dep = route.dep, arr = route.arr;
  const out = [];
  const live = R.live;
  const rough = live.filter(w => w.edr >= 0.16);
  const spanMin = s => Math.max(2, Math.round((s.b.time - s.a.time)/60000));

  if (!rough.length){
    out.push(`The whole ${fmtDur(totalMin)} looks quiet at ${fmtFL(route.topFt)}, from ${dep.iata} through to ${arr.iata}.`);
    const w2 = worst;
    if (w2 && w2.edr > 0.05){
      out.push(`The busiest moment is around <b>${hhmmUTC(w2.time)}</b>, ${w2.place.text.replace(/^(Over|Near) /, m => m.toLowerCase())} — still only ${w2.band.name.toLowerCase()}: ${feelText(w2.band)}`);
    } else {
      out.push(`Expect ${feelText(BANDS[0])}`);
    }
    const j = R.jet;
    if (j && j.spd >= 45) out.push(`There is a ${kt(j.spd)} kt jet near ${fmtFL(j.ft)}, but the route stays clear of the sheared air on its edges.`);
  } else {
    /* Lead with the worst patch: when, where, how high, how long, how it feels. */
    const spans = spansOf(live, w => w.edr >= 0.16).sort((x,y) => y.pk.edr - x.pk.edr);
    const main  = spans[0];
    const where = worst.place ? worst.place.text.replace(/^(Over|Near) /, m => m.toLowerCase()) : "en route";
    out.push(`The roughest stretch runs <b>${hhmmUTC(main.a.time)}–${hhmmUTC(main.b.time)}</b>, about <b>${spanMin(main)} min</b> ${phaseWord(worst.phase)} — ${where}, at ${fmtFL(worst.altFt)}${worst.fix ? ` near ${worst.fix}` : ""}.`);
    out.push(`Peak is <b>${worst.band.name.toLowerCase()}</b>: ${feelText(worst.band)}`);
    if (worst.band.key >= 3){ const c = cabinText(worst.band); out.push(c.charAt(0).toUpperCase() + c.slice(1)); }

    /* Then the shape of the rest of the flight. */
    if (spans.length > 1){
      const others = spans.slice(1).filter(s => spanMin(s) >= 4).slice(0, 2);
      if (others.length)
        out.push(`${others.length === 1 ? "There is one more patch" : "There are further patches"} around ${others.map(s => `<b>${hhmmUTC(s.a.time)}–${hhmmUTC(s.b.time)}</b> (${s.pk.band.name.toLowerCase()})`).join(" and ")}.`);
    }
    if (bumpyMin >= 8)      out.push(`In total about <b>${Math.round(bumpyMin)} min</b> of the ${fmtDur(totalMin)} is moderate or worse, and <b>${Math.round(roughMin)} min</b> is light or above; the remaining ${fmtDur(Math.max(0,totalMin-roughMin))} should be quiet.`);
    else if (roughMin >= 8) out.push(`In total about <b>${Math.round(roughMin)} min</b> of the ${fmtDur(totalMin)} sits at light turbulence or above — the other ${fmtDur(Math.max(0,totalMin-roughMin))} should be quiet.`);
    else                    out.push(`It is brief — under ten minutes of noticeable movement in ${fmtDur(totalMin)}.`);

    /* A long smooth opening is worth saying out loud: it is when to move about. */
    const firstRough = rough[0];
    const quietLead = (firstRough.time - live[0].time)/60000;
    if (quietLead > 45) out.push(`The first <b>${fmtDur(quietLead)}</b> after ${dep.iata} looks smooth, so that is the time to be up and about.`);
  }

  const drv = dominantDriver(R);
  if (drv) out.push(drv);

  if (R.bestFL && Math.abs(R.bestFL.fl - route.topFt/100) >= 20){
    const cur = R.levelScores.find(l => Math.abs(l.fl - route.topFt/100) < 6);
    if (cur && cur.mean - R.bestFL.mean > 0.035)
      out.push(`FL${R.bestFL.fl} looks measurably smoother than FL${Math.round(route.topFt/100)} — crews often ask for a level change when that gap opens up.`);
  }
  return out.join(" ");
}
function dominantDriver(R){
  const pk = { cat:0, mwt:0, con:0 };
  R.live.forEach(w => { pk.cat = Math.max(pk.cat, w.cat||0); pk.mwt = Math.max(pk.mwt, w.mwt||0); pk.con = Math.max(pk.con, w.con||0); });
  const top = Object.entries(pk).sort((a,b)=>b[1]-a[1])[0];
  if (!top || top[1] < 0.14) return "";
  if (top[0] === "mwt"){
    const w = R.live.reduce((a,x)=> (x.mwt||0) > (a.mwt||0) ? x : a, R.live[0]);
    return `The cause is <b>mountain wave</b> — wind spilling over high ground ${w.place ? w.place.text.replace(/^(Over|Near) /, m => m.toLowerCase()) : "below the route"} and rippling up to cruise height.`;
  }
  if (top[0] === "con"){
    const w = R.live.reduce((a,x)=> (x.con||0) > (a.con||0) ? x : a, R.live[0]);
    return `The cause is <b>convection</b> — unstable air and storm tops ${w.place ? w.place.text.replace(/^(Over|Near) /, m => m.toLowerCase()) : "under the route"}. Crews usually steer around cells, so the real ride may be smoother than this.`;
  }
  const w = R.live.reduce((a,x)=> (x.cat||0) > (a.cat||0) ? x : a, R.live[0]);
  const j = w.jet;
  return j
    ? `The cause is <b>clear-air turbulence</b> in the shear under a ${kt(j.spd)} kt jet core near ${fmtFL(j.ft)}.`
    : `The cause is <b>clear-air turbulence</b> — wind shear between air layers, invisible on radar and on a clear day.`;
}

/* ══════════ RIDE TAPE ══════════════════════════════════════════════════ */
function drawTape(){
  const R = RES; if (!R) return;
  const box = $("#tape"), c = $("#tapeC"), dpr = Math.min(2, devicePixelRatio||1);
  const W = box.clientWidth, H = box.clientHeight;
  c.width = W*dpr; c.height = H*dpr;
  const g = c.getContext("2d"); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,W,H);

  const t0 = R.live[0].time.getTime(), t1 = R.live[R.live.length-1].time.getTime(), span = t1-t0 || 1;
  const MAXE = 0.50;
  const xOf = t => (t - t0)/span*W;
  const at = x => {                                   // interpolate the ride at a pixel column
    const t = t0 + x/W*span;
    const L = R.live;
    if (t <= L[0].time) return L[0];
    for (let i=1;i<L.length;i++){
      if (t <= L[i].time){
        const f = (t - L[i-1].time)/(L[i].time - L[i-1].time || 1);
        return { edr: lerp(L[i-1].edr, L[i].edr, f), altFt: lerp(L[i-1].altFt, L[i].altFt, f), ref: f<0.5?L[i-1]:L[i] };
      }
    }
    return L[L.length-1];
  };

  /* graticule and band thresholds */
  g.strokeStyle = "rgba(120,160,210,.10)"; g.lineWidth = 1;
  for (let h=0; h<=span/3600e3; h++){ const x = Math.round(xOf(t0+h*3600e3))+.5; g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); }
  g.font = "500 8.5px "+MONO;
  const roomy = W >= 430 && H >= 96;              // narrow tapes rely on the legend instead
  BANDS.slice(1,5).forEach(b => {
    const y = Math.round(H - b.min/MAXE*H)+.5; if (y<10||y>H-2) return;
    g.strokeStyle = "rgba(120,160,210,.20)"; g.setLineDash([2,4]);
    g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); g.setLineDash([]);
    if (!roomy) return;
    g.fillStyle = "rgba(141,160,184,.55)";
    const lab = b.name.toUpperCase();
    g.fillText(lab, W-6-g.measureText(lab).width, y-3);
  });

  /* filled trace, coloured left-to-right by intensity */
  const step = 2;
  for (let x=0; x<W; x+=step){
    const s = at(x+step/2), h = clamp(s.edr/MAXE, 0, 1)*(H-6);
    g.fillStyle = rampCol(s.edr);
    g.globalAlpha = .92;
    g.fillRect(x, H-h, step+.6, h);
  }
  g.globalAlpha = 1;
  /* crisp top line */
  g.beginPath();
  for (let x=0; x<=W; x+=2){ const s = at(x), y = H - clamp(s.edr/MAXE,0,1)*(H-6); x?g.lineTo(x,y):g.moveTo(x,y); }
  g.strokeStyle = "rgba(233,239,247,.85)"; g.lineWidth = 1.4; g.stroke();

  /* phase ticks */
  g.fillStyle = "rgba(233,239,247,.5)"; g.font = "500 9px "+MONO;
  const toc = R.live.find(w=>w.phase==="cruise"), tod = [...R.live].reverse().find(w=>w.phase==="cruise");
  [[toc,"TOC"],[tod,"TOD"]].forEach(([w,lab]) => {
    if (!w) return; const x = xOf(w.time);
    g.strokeStyle="rgba(233,239,247,.28)"; g.beginPath(); g.moveTo(x,0); g.lineTo(x,10); g.stroke();
    g.fillText(lab, x+3, 9);
  });
}
function setCursor(frac, fromTape){
  const R = RES; if (!R) return;
  CUR = clamp(frac,0,1);
  const box = $("#tape");
  $("#tapeCur").style.left = (CUR*box.clientWidth) + "px";
  box.setAttribute("aria-valuenow", Math.round(CUR*100));
  const t0 = R.live[0].time.getTime(), t1 = R.live[R.live.length-1].time.getTime();
  const t = t0 + CUR*(t1-t0);
  if (fromTape && typeof Native !== "undefined"){
    const k = R.live.reduce((a,p,i)=> Math.abs(p.time-t) < Math.abs(R.live[a].time-t) ? i : a, 0);
    Native.bump(BANDS.indexOf(R.live[k].band));
  }
  let a = R.live[0], b = R.live[R.live.length-1], f = 0;
  for (let i=1;i<R.live.length;i++){ if (t <= R.live[i].time){ a=R.live[i-1]; b=R.live[i]; f=(t-a.time)/(b.time-a.time||1); break; } }
  const edr = lerp(a.edr, b.edr, f), alt = lerp(a.altFt, b.altFt, f), bd = band(edr);
  const pl = (f<0.5?a:b).place;
  $("#tapeRead").innerHTML =
    `${hhmmUTC(new Date(t))} <em>·</em> ${fmtFL(alt)} <em>·</em> <span style="color:${bd.col}">${bd.name}</span> <em>·</em> EDR ${edr.toFixed(2)} <em>·</em> ${pl?pl.short:""}`;
  /* move the aircraft on the map and the cursor on the cross-section */
  const p = interp(a, b, f);
  if (ACMARK) ACMARK.setLatLng([p.lat, unwrapLon(p.lon)]);
  drawXS(CUR);
  const rows = document.querySelectorAll("#logBody tr.row");
  rows.forEach(r => r.classList.toggle("hot", +r.dataset.i === (f<0.5?a.i:b.i)));
}

/* ══════════ MAP ════════════════════════════════════════════════════════ */
let LON_REF = 0;
function unwrapLon(lon){ let d = lon - LON_REF; while (d > 180) lon -= 360, d -= 360; while (d < -180) lon += 360, d += 360; return lon; }
function drawMap(){
  const R = RES;
  if (typeof L === "undefined"){ document.getElementById("map").innerHTML =
    '<div style="padding:26px;color:#8DA0B8;font-size:13.5px">The map library did not load. Everything else on this page still works — the cross-section and segment log carry the same forecast.</div>'; return; }
  if (!MAP){
    MAP = L.map("map", { zoomControl:true, attributionControl:true, worldCopyJump:false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains:"abcd", maxZoom:16,
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(MAP);
  }
  MAPLAYERS.forEach(l => MAP.removeLayer(l)); MAPLAYERS = [];
  LON_REF = R.route.dep.lon;

  /* route, subdivided so the colour follows the forecast */
  const pts = [];
  for (let i=0;i<R.live.length-1;i++){
    const a = R.live[i], b = R.live[i+1];
    for (let s=0;s<8;s++){
      const f = s/8, p = interp(a,b,f);
      pts.push({ lat:p.lat, lon:unwrapLon(p.lon), edr: lerp(a.edr,b.edr,f) });
    }
  }
  const lastW = R.live[R.live.length-1];
  pts.push({ lat:lastW.lat, lon:unwrapLon(lastW.lon), edr:lastW.edr });

  const shadow = L.polyline(pts.map(p=>[p.lat,p.lon]), {color:"#000", weight:9, opacity:.5}).addTo(MAP);
  MAPLAYERS.push(shadow);
  for (let i=0;i<pts.length-1;i++){
    const e = (pts[i].edr + pts[i+1].edr)/2;
    const seg = L.polyline([[pts[i].lat,pts[i].lon],[pts[i+1].lat,pts[i+1].lon]],
      { color: rampCol(e), weight: 4.5, opacity: .95, lineCap:"round" }).addTo(MAP);
    MAPLAYERS.push(seg);
  }
  /* hotspots */
  R.live.filter(w => w.edr >= 0.24).forEach(w => {
    const c = L.circleMarker([w.lat, unwrapLon(w.lon)], {
      radius: 6 + w.edr*22, color: bandCol(w.edr), weight:1.5, opacity:.85,
      fillColor: bandCol(w.edr), fillOpacity:.16
    }).addTo(MAP);
    c.bindPopup(`<b style="font-family:var(--mono)">${hhmmUTC(w.time)} · ${fmtFL(w.altFt)}</b><br>${w.place.text}<br>${w.band.name} — EDR ${w.edr.toFixed(2)}`);
    MAPLAYERS.push(c);
  });
  /* endpoints */
  [[R.route.dep, R.live[0]], [R.route.arr, R.live[R.live.length-1]]].forEach(([ap, w]) => {
    const m = L.marker([ap.lat, unwrapLon(ap.lon)], {
      icon: L.divIcon({className:"", html:`<div class="ap-marker">${ap.iata}</div>`, iconSize:[0,0]})
    }).addTo(MAP);
    MAPLAYERS.push(m);
  });
  ACMARK = L.marker([R.live[0].lat, unwrapLon(R.live[0].lon)], {
    icon: L.divIcon({className:"", html:'<div class="ac-marker"></div>', iconSize:[0,0]}), interactive:false, zIndexOffset:900
  }).addTo(MAP);
  MAPLAYERS.push(ACMARK);

  MAP.fitBounds(L.latLngBounds(pts.map(p=>[p.lat,p.lon])), {padding:[34,34]});
  setTimeout(()=>MAP.invalidateSize(), 60);
  $("#mapTag").textContent = R.route.filed
    ? `${Math.round(R.route.distNM).toLocaleString()} nm via ${R.route.filed.nWpt} filed waypoints · +${Math.round(R.route.extraNM)} nm vs direct · ${R.live.length} sample points`
    : `${Math.round(R.route.distNM).toLocaleString()} nm great circle · ${R.live.length} sample points`;
}
