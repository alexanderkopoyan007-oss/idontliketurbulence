"use strict";
/* ══════════ TYPEAHEAD ══════════════════════════════════════════════════ */
function makeAC(inputId, boxId){
  const inp = $("#"+inputId), box = $("#"+boxId);
  let items = [], sel = -1, chosen = null;

  const score = (a, q) => {
    let s = 0;
    if (a.iata === q) s += 1000;
    if (a.icao === q) s += 900;
    if (a.iata.startsWith(q)) s += 400;
    const nm = a.name.toLowerCase(), ct = (a.city||"").toLowerCase();
    if (ct.startsWith(q)) s += 300; else if (ct.includes(q)) s += 120;
    if (nm.startsWith(q)) s += 260; else if (nm.includes(q)) s += 100;
    if (!s && a.search.includes(q)) s += 40;
    return s ? s + (2-a.rank)*45 : 0;
  };
  const search = q => {
    q = q.trim().toLowerCase(); if (q.length < 2) return [];
    const out = [];
    for (const a of APORTS){ const s = score(a,q); if (s) out.push([s,a]); }
    return out.sort((x,y)=>y[0]-x[0]).slice(0,8).map(x=>x[1]);
  };
  const paint = () => {
    if (!items.length){ box.classList.remove("on"); return; }
    box.innerHTML = items.map((a,i) =>
      `<b class="${i===sel?"sel":""}" data-i="${i}"><i>${a.iata}</i><s>${a.name}<em>${a.city?" · "+a.city:""}</em></s><u>${cName(a.cc)}</u></b>`).join("");
    box.classList.add("on");
    box.querySelectorAll("b").forEach(el => el.addEventListener("mousedown", e => { e.preventDefault(); pick(items[+el.dataset.i]); }));
  };
  const pick = a => { chosen = a; inp.value = `${a.iata} — ${a.name}${a.city?", "+a.city:""}`; box.classList.remove("on"); items=[]; sel=-1; };

  inp.addEventListener("input", () => { chosen = null; items = search(inp.value); sel = items.length?0:-1; paint(); });
  inp.addEventListener("focus", () => { if (!chosen && inp.value.trim().length>1){ items = search(inp.value); sel = 0; paint(); } });
  inp.addEventListener("blur",  () => setTimeout(()=>box.classList.remove("on"), 130));
  inp.addEventListener("keydown", e => {
    if (!box.classList.contains("on")) return;
    if (e.key === "ArrowDown"){ e.preventDefault(); sel = Math.min(items.length-1, sel+1); paint(); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); sel = Math.max(0, sel-1); paint(); }
    else if (e.key === "Enter" && sel >= 0){ e.preventDefault(); pick(items[sel]); }
    else if (e.key === "Escape"){ box.classList.remove("on"); }
  });
  return {
    get(){
      if (chosen) return chosen;
      const raw = inp.value.trim().toUpperCase().split(/[\s—,]/)[0];
      if (BY_IATA.has(raw)) return BY_IATA.get(raw);
      if (BY_ICAO.has(raw)) return BY_ICAO.get(raw);
      const r = search(inp.value); return r.length ? r[0] : null;
    },
    set(a){ if (a) pick(a); },
    el: inp
  };
}
const AC_DEP = makeAC("dep","acDep"), AC_ARR = makeAC("arr","acArr");

/* ══════════ FLIGHT NUMBER ══════════════════════════════════════════════ */
function parseFlight(raw){
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g,"");
  let m = s.match(/^([A-Z]{3})(\d{1,4})[A-Z]?$/);
  if (m && !AIRLINES.has(m[1].slice(0,2))) return { icao:m[1], num:m[2], name:m[1] };
  m = s.match(/^([A-Z0-9]{2})(\d{1,4})[A-Z]?$/);
  if (m){
    const al = AIRLINES.get(m[1]);
    if (al) return { icao:al.icao, num:m[2], name:al.name, iata:m[1] };
    return { icao:m[1], num:m[2], name:m[1], iata:m[1] };
  }
  m = s.match(/^([A-Z]{3})(\d{1,4})[A-Z]?$/);
  if (m) return { icao:m[1], num:m[2], name:m[1] };
  return null;
}
async function lookupFlight(raw){
  const p = parseFlight(raw);
  if (!p) throw new Error(`"${raw}" doesn't look like a flight number. Try something like BA117, AZ610 or FR8145.`);
  const n = p.num.replace(/^0+/,"") || "0";
  const tries = [...new Set([p.icao+n, p.icao+n.padStart(3,"0"), p.icao+n.padStart(4,"0"),
                             p.iata ? p.iata+n : null, raw.toUpperCase().replace(/\s/g,"")].filter(Boolean))];
  for (const cs of tries){
    try{
      const j = await getJSON(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(cs)}`, 1);
      const fr = j && j.response && j.response.flightroute;
      if (!fr || !fr.origin || !fr.destination) continue;
      const conv = o => BY_IATA.get(o.iata_code) || BY_ICAO.get(o.icao_code) || {
        iata:o.iata_code||"???", icao:o.icao_code||"", name:(o.name||"").replace(/ Airport$/,""),
        city:o.municipality||"", cc:o.country_iso_name||"", lat:+o.latitude, lon:+o.longitude,
        elev:+(o.elevation||0), tz:"UTC", rank:0
      };
      return { dep: conv(fr.origin), arr: conv(fr.destination), callsign: fr.callsign || cs,
               airline: (fr.airline && fr.airline.name) || p.name };
    }catch(e){ /* try the next form */ }
  }
  throw new Error(`No published route for ${raw.toUpperCase()}. The callsign database may not carry this flight — switch to Airports and enter the pair by hand.`);
}

/* ══════════ RUN ════════════════════════════════════════════════════════ */
let BUSY = false;
function status(html, cls){ $("#status").innerHTML = html ? `<div class="note ${cls||""}">${html}</div>` : ""; }
function loading(){
  $("#status").innerHTML = `<div class="loading"><p id="lmsg">Starting…</p><div class="bar"><i id="lbar"></i></div></div>`;
  return (pct, msg) => { const b=$("#lbar"), m=$("#lmsg"); if(b) b.style.width=pct+"%"; if(m) m.textContent=msg; };
}
function localToUTC(value, tz){
  if (!value) return null;
  const [d,t] = value.split("T"); const [Y,M,D] = d.split("-").map(Number); const [h,mi] = t.split(":").map(Number);
  let guess = Date.UTC(Y, M-1, D, h, mi);
  for (let k=0;k<3;k++) guess = Date.UTC(Y, M-1, D, h, mi) - tzOffsetMin(tz, new Date(guess))*60000;
  return new Date(guess);
}

async function run(dep, arr, whenLocalValue, opts, extra, flightNo){
  if (BUSY) return; BUSY = true;
  document.querySelectorAll(".go").forEach(b => b.disabled = true);
  const prog = loading();
  try{
    if (!dep || !arr) throw new Error("Pick a departure and an arrival airport.");
    if (dep.iata === arr.iata) throw new Error("Departure and arrival are the same airport.");
    const when = localToUTC(whenLocalValue, dep.tz) || new Date(Date.now()+3600e3);
    if (distance(dep,arr) < 60000) throw new Error("Those airports are less than 60 km apart — too short to build a cruise profile.");

    prog(4, "Looking for the filed route…");
    const filed = await fetchFiledRoute(dep, arr, flightNo).catch(() => null);
    prog(8, filed
      ? `Following a filed route — ${filed.nWpt} waypoints…`
      : "No filed route available; laying out the great-circle track…");
    const route = buildRoute(dep, arr, when, opts, filed);
    RES = await analyse(route, prog);
    RES.extra = extra || null;
    RES.flightNo = flightNo || null;        // for the shareable URL
    RES.whenLocal = whenLocalValue || null;
    prog(100, "Done");
    $("#out").classList.add("on");   // must be visible before anything measures itself
    paint();
    mountActions();
    writeShareHash();
    updateShareMeta();
    status("");
    $("#out").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth", block:"start"});
  }catch(e){
    console.error(e);
    status(`<span>Can't build it</span><div>${(e && e.message) || "Something went wrong. Try again in a moment."}</div>`, "err");
  }finally{
    BUSY = false; document.querySelectorAll(".go").forEach(b => b.disabled = false);
  }
}

function paint(){
  const R = RES, rt = R.route;
  const v = verdictFor(R.felt);
  $("#vDep").textContent = rt.dep.iata; $("#vArr").textContent = rt.arr.iata;
  $("#vMeta").innerHTML = `${Math.round(rt.distNM).toLocaleString()} nm · ${fmtDur(R.totalMin)} · ${fmtFL(rt.topFt)}` +
    (R.extra ? ` · ${R.extra}` : "");
  $("#vWord").textContent = v[1];
  $("#vWord").style.color = R.felt < 0.17 ? "var(--s0)" : bandCol(R.felt);
  $("#vSay").innerHTML = narrative(R);
  $("#vScore").textContent = R.score;
  $("#vScore").style.color = R.score > 78 ? "var(--s0)" : R.score > 55 ? "var(--s2)" : R.score > 35 ? "var(--s3)" : "var(--s4)";
  $("#vRough").innerHTML = R.roughMin >= 3
    ? `${Math.round(R.roughMin)} min of ${fmtDur(R.totalMin)}<br>at light or above`
    : `smooth for<br>essentially all of it`;

  $("#legend").innerHTML = BANDS.map(b => `<i style="background:${b.col}">${b.name}</i>`).join("");
  $("#tapeA").innerHTML = `<b>${hhmmUTC(R.live[0].time)}</b> ${rt.dep.iata}`;
  $("#tapeB").textContent = `${fmtDur(R.totalMin)} en route`;
  $("#tapeC2").innerHTML = `${rt.arr.iata} <b>${hhmmUTC(R.live[R.live.length-1].time)}</b>`;

  drawTape(); drawMap(); drawXS(); drawLog(); drawBlocks(); drawMethod();
  setCursor(0);
  $("#foot").innerHTML = `Built ${new Date().toISOString().slice(0,16).replace("T"," ")}Z from ${R.models.join(" + ")}. ` +
    `Peak EDR ${R.peak.toFixed(2)} at ${hhmmUTC(R.worst.time)} · ${R.worst.place.text}. Refresh closer to departure — beyond a day or two, turbulence forecasts move around a lot.`;
}

/* ══════════ WIRING ═════════════════════════════════════════════════════ */
const tape = $("#tape");
function tapeFrac(e){
  const r = tape.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
  return clamp(x/r.width, 0, 1);
}
let dragging = false;
tape.addEventListener("pointerdown", e => { if(!RES) return; dragging = true; tape.setPointerCapture(e.pointerId); setCursor(tapeFrac(e)); });
tape.addEventListener("pointermove", e => { if (dragging && RES) setCursor(tapeFrac(e)); });
tape.addEventListener("pointerup",   e => { dragging = false; });
tape.addEventListener("pointercancel", () => { dragging = false; });
tape.addEventListener("keydown", e => {
  if (!RES) return;
  const step = e.shiftKey ? 0.1 : 0.02;
  if (e.key === "ArrowRight"){ e.preventDefault(); setCursor(CUR+step); }
  if (e.key === "ArrowLeft"){ e.preventDefault(); setCursor(CUR-step); }
  if (e.key === "Home"){ e.preventDefault(); setCursor(0); }
  if (e.key === "End"){ e.preventDefault(); setCursor(1); }
});
$("#xs").addEventListener("mousemove", xsHover);
$("#xs").addEventListener("mouseleave", () => { $("#xsTip").style.display = "none"; });
$("#xs").addEventListener("touchstart", xsHover, {passive:true});
$("#xs").addEventListener("touchmove", xsHover, {passive:true});

let rt = null;
addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (RES){ drawTape(); drawXS(CUR); setCursor(CUR); } if (MAP) MAP.invalidateSize(); }, 160); });

/* tabs */
function tab(which){
  const r = which === "route";
  $("#tabRoute").setAttribute("aria-selected", r); $("#tabFlight").setAttribute("aria-selected", !r);
  $("#pRoute").hidden = !r; $("#pFlight").hidden = r;
}
$("#tabRoute").addEventListener("click", () => tab("route"));
$("#tabFlight").addEventListener("click", () => tab("flight"));
$("#swap").addEventListener("click", () => {
  const a = AC_DEP.get(), b = AC_ARR.get();
  AC_DEP.el.value = ""; AC_ARR.el.value = "";
  if (b) AC_DEP.set(b); if (a) AC_ARR.set(a);
});
$("#goRoute").addEventListener("click", () => run(
  AC_DEP.get(), AC_ARR.get(), $("#dt1").value,
  { acft: $("#acft").value, fl: $("#fl").value, scaleKm: +$("#scale").value }
));
$("#goFlight").addEventListener("click", async () => {
  const raw = $("#fnum").value.trim();
  if (!raw) return status("<span>Missing</span><div>Enter a flight number, for example BA117.</div>", "err");
  if (BUSY) return;
  BUSY = true; document.querySelectorAll(".go").forEach(b=>b.disabled=true);
  const prog = loading(); prog(4, `Looking up ${raw.toUpperCase()}…`);
  let f;
  try { f = await lookupFlight(raw); }
  catch(e){
    status(`<span>Not found</span><div>${e.message}</div>`, "err");
    BUSY = false; document.querySelectorAll(".go").forEach(b=>b.disabled=false); return;
  }
  BUSY = false; document.querySelectorAll(".go").forEach(b=>b.disabled=false);
  AC_DEP.set(f.dep); AC_ARR.set(f.arr);
  run(f.dep, f.arr, $("#dt2").value, { acft: $("#acft2").value, fl:"auto", scaleKm: +$("#scale").value },
      `${f.callsign}${f.airline ? " · "+f.airline : ""}`, raw.toUpperCase().replace(/\s/g,""));
});
[$("#dep"),$("#arr")].forEach(el => el.addEventListener("keydown", e => { if (e.key==="Enter" && !$("#acDep").classList.contains("on") && !$("#acArr").classList.contains("on")) $("#goRoute").click(); }));
$("#fnum").addEventListener("keydown", e => { if (e.key==="Enter") $("#goFlight").click(); });

/* Keep the scale hint honest about what the slider actually buys you. */
(function scaleHint(){
  const el = $("#scale"), sub = $("#scaleSub");
  const upd = () => {
    const km = +el.value;
    const at = nm => clamp(Math.round(nm / Math.max(20, km*1.05)), 16, 44);
    const word = km <= 35 ? "fine — slower, more requests" : km <= 120 ? "balanced" : "broad — fast, smoothed";
    sub.textContent = `±${km} km stencil · ${word} · ${at(3000)} points on a transatlantic leg, ${at(400)} on a short hop`;
  };
  el.addEventListener("input", upd); upd();
})();

/* clock + defaults */
function tick(){ const d = new Date(); $("#clock").textContent = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`; }
tick(); setInterval(tick, 20000);
(function defaults(){
  const d = new Date(Date.now() + 3*3600e3); d.setMinutes(0,0,0);
  const v = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:00`;
  $("#dt1").value = v; $("#dt2").value = v;
  const max = new Date(Date.now() + 6.5*24*3600e3);
  const mv = `${max.getFullYear()}-${pad2(max.getMonth()+1)}-${pad2(max.getDate())}T23:00`;
  $("#dt1").max = mv; $("#dt2").max = mv;

  const SAMPLES = [["LHR","JFK"],["MXP","LHR"],["DEN","LAX"],["SIN","SYD"],["ZRH","CTA"],["EZE","SCL"]];
  $("#chips").innerHTML = SAMPLES.map(([a,b]) => `<button class="chip" data-a="${a}" data-b="${b}">${a} → ${b}</button>`).join("");
  $("#chips").addEventListener("click", e => {
    const c = e.target.closest(".chip"); if (!c) return;
    AC_DEP.set(BY_IATA.get(c.dataset.a)); AC_ARR.set(BY_IATA.get(c.dataset.b)); $("#goRoute").click();
  });
  $("#chips2").innerHTML = ["BA117","AZ610","FR8145","UA900","EK202"].map(f=>`<button class="chip" data-f="${f}">${f}</button>`).join("");
  $("#chips2").addEventListener("click", e => {
    const c = e.target.closest(".chip"); if (!c) return;
    $("#fnum").value = c.dataset.f; $("#goFlight").click();
  });
})();


