"use strict";
/* ══════════ SEEING VIEW ═════════════════════════════════════════════════
   Hour-by-hour observing conditions for tonight at one location. Reuses the
   pressure-level fetch, the profile reader and the airport table; the only new
   physics is in seeing.js and astro.js. */

let SEE_LAST = null;
let AC_SEE = null;

function seeingNightWindow(date, lat, lon){
  /* The observing night runs from this evening's dusk to tomorrow's dawn, so it
     straddles midnight. Prefer astronomical darkness; fall back to nautical and
     then civil at latitudes or seasons where the Sun never gets low enough —
     and say which one was used rather than silently substituting. */
  const t0 = sunTimes(date, lat, lon);
  const t1 = sunTimes(new Date(date.getTime() + 86400e3), lat, lon);
  for (const [k, label] of [["astro","astronomical"], ["nautical","nautical"], ["civil","civil"]]){
    const dusk = t0[k === "astro" ? "astroDusk" : k === "nautical" ? "nauticalDusk" : "civilDusk"];
    const dawn = t1[k === "astro" ? "astroDawn" : k === "nautical" ? "nauticalDawn" : "civilDawn"];
    if (dusk && dawn && +dawn > +dusk) return { from: dusk, to: dawn, kind: label, sun: t0 };
  }
  return { from: null, to: null, kind: null, sun: t0 };
}

async function runSeeing(){
  const site = AC_SEE.get();
  const err = m => { $("#seStatus").innerHTML = `<div class="note err"><span>Can't build it</span><div>${m}</div></div>`; $("#seOut").innerHTML = ""; };
  if (!site) return err("Pick a location. Any airport works as a nearby reference point.");

  const dateStr = $("#seDate").value;
  if (!dateStr) return err("Pick a night.");
  const night = new Date(dateStr + "T12:00:00Z");

  const win = seeingNightWindow(night, site.lat, site.lon);
  if (!win.from) return err(`The Sun never sets far enough at ${site.iata} on that date for a dark window — no astronomical, nautical or civil night exists there tonight.`);

  const prog = (pct, msg) => { $("#seStatus").innerHTML = `<div class="loading"><p>${msg}</p><div class="bar"><i style="width:${pct}%"></i></div></div>`; };
  prog(10, "Requesting pressure-level winds…");

  const h0 = hourISO(new Date(win.from.getTime() - 3600e3));
  const h1 = hourISO(new Date(win.to.getTime()   + 3600e3));

  let rec, sfc;
  try{
    FETCH_DEADLINE = Date.now() + 45000;
    [rec] = await fetchModel([{lat:site.lat, lon:site.lon}], "", h0, h1);
    prog(60, "Requesting cloud and water vapour…");
    const q = new URLSearchParams({
      latitude: site.lat.toFixed(4), longitude: site.lon.toFixed(4),
      hourly: "cloud_cover_low,cloud_cover_mid,cloud_cover_high",
      start_hour: h0, end_hour: h1,
      timeformat: "unixtime", timezone: "UTC", cell_selection: "nearest",
    });
    sfc = await getJSON(`${OM}?${q}`);
  }catch(e){
    return err(`The weather service did not answer (${e.message.slice(0,90)}). It rate-limits per minute — wait a moment and try again.`);
  }
  if (!rec || !rec.hourly) return err("The forecast came back empty for that location.");

  /* Hourly walk through the dark window. */
  const rows = [];
  for (let t = +win.from; t <= +win.to; t += 3600e3){
    const when = new Date(t), tSec = t/1000;
    const levels = profileAt(rec, tSec);
    const see = levels ? seeingFrom(levels, site.elev*FT) : null;
    const cl = k => sfc && sfc.hourly ? atTime(sfc.hourly[k], sfc.hourly.time, tSec) : null;
    const trans = transparency(cl("cloud_cover_low"), cl("cloud_cover_mid"), cl("cloud_cover_high"), null);
    const mp = moonPhase(toJulian(when));
    const ma = moonAltAz(when, site.lat, site.lon);
    rows.push({ when, see, trans, moonAlt: ma.alt, moonAz: ma.az, illum: mp.illum, phase: mp.name });
  }

  const mt = moonTimes(night, site.lat, site.lon);
  SEE_LAST = { site, win, rows, moon: { ...moonPhase(toJulian(win.from)), rise: mt.rise, set: mt.set } };
  $("#seStatus").innerHTML = "";
  drawSeeing(SEE_LAST);
  $("#seOut").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth", block:"start" });
}

function drawSeeing(S){
  const host = $("#seOut"); if (!host) return;
  const tz = S.site.tz;
  const lt = d => localTime(d, tz);
  const usable = S.rows.filter(r => r.see);
  const best = usable.slice().sort((a,b) => a.see.seeingFree - b.see.seeingFree)[0];

  const rows = S.rows.map(r => {
    const b = r.see ? seeingBand(r.see.seeingFree) : null;
    return `<tr>
      <td><div class="cell t">${lt(r.when)}<em>${hhmmUTC(r.when)}</em></div></td>
      <td><div class="cell">${r.see
        ? `<span class="pill" style="background:${b.col}">${r.see.seeingFree.toFixed(2)}″ ${b.name}</span>`
        : `<span class="pill" style="background:var(--panel-3)">no data</span>`}</div></td>
      <td class="hideS"><div class="cell mono">${r.see ? kt(r.see.bufton) + " kt" : "—"}</div></td>
      <td><div class="cell">${r.trans
        ? `<span class="mono">${Math.round(r.trans.score)}%</span> <em style="color:var(--dim-2)">${Math.round(r.trans.blocked)}% cloud</em>`
        : `<span style="color:var(--dim-2)">unavailable</span>`}</div></td>
      <td class="hideS"><div class="cell mono">${r.moonAlt > 0
        ? `${r.moonAlt.toFixed(0)}° · ${Math.round(r.illum*100)}%`
        : `<span style="color:var(--dim-2)">down</span>`}</div></td>
    </tr>`;
  }).join("");

  host.innerHTML = `
  <section class="panel">
    <h3>Tonight at ${S.site.iata} — ${S.site.label}</h3>
    <p class="jl-head">
      ${best
        ? `Best free-atmosphere seeing is <b>${best.see.seeingFree.toFixed(2)}″</b> around
           <b>${lt(best.when)}</b> local — ${seeingBand(best.see.seeingFree).name.toLowerCase()},
           ${seeingBand(best.see.seeingFree).say}.`
        : `No usable upper-air profile came back for this site.`}
      Dark window (${S.win.kind} night) runs <b>${lt(S.win.from)} – ${lt(S.win.to)}</b> local.
      Moon is <b>${S.moon.name.toLowerCase()}</b>, ${Math.round(S.moon.illum*100)}% lit${
        S.moon.rise ? `, rising ${lt(S.moon.rise)}` : ""}${S.moon.set ? `, setting ${lt(S.moon.set)}` : ""}.
    </p>
    <table class="log">
      <thead><tr><th>Local</th><th>Seeing (free atmos.)</th><th class="hideS">Jet-slab wind</th>
        <th>Transparency</th><th class="hideS">Moon alt · lit</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="jl-note">
      <b>Free-atmosphere seeing only.</b> The ground layer — the first few tens of metres —
      usually contributes more than the entire atmosphere above it, and it depends on what you
      are standing on. A rooftop, a car park and a mountain ridge behave completely differently
      and none of that is resolved by a 25 km model grid. Expect your actual seeing to be
      <i>worse</i> than the figure above, by an amount that is a property of your site rather
      than of tonight.
    </p>
    <details class="jl-method">
      <summary>How this is worked out</summary>
      <p>Seeing and clear-air turbulence are two consequences of the same mechanism, which is
      why this page shares an engine with the flight briefing. Optical turbulence is described
      by the refractive-index structure constant Cn², integrated through the column to give the
      Fried parameter r₀ = (0.423·k²·∫Cn²dh)^(−3/5), from which the seeing disc is
      0.98·λ/r₀ at λ = 500 nm.</p>
      <p>Cn²(h) uses the <b>Hufnagel-Valley</b> functional form, but driven by the actual
      forecast wind rather than HV's fixed climatological profile. The upper term scales with
      the square of the <b>Bufton wind</b> — the RMS wind speed between 5 and 20 km — computed
      here from the forecast pressure-level winds. That is what makes it a forecast: when the
      jet moves overhead, that term rises and the seeing degrades. Each layer is additionally
      weighted by its local vertical wind shear relative to a reference value, since optical
      turbulence is generated where the flow shears. That weighting is a bounded heuristic,
      not a first-principles derivation.</p>
      <p>Transparency combines the three forecast cloud layers multiplicatively, with high
      cirrus weighted slightly less per unit coverage than low cloud — thin enough to look
      clear and still enough to kill contrast. Sun and Moon positions, rise and set times and
      lunar phase are computed from Meeus's algorithms; no API is involved and no value on
      this page is cached.</p>
      <p><b>Worth cross-checking.</b> Compare a few nights against Meteoblue's seeing product
      before trusting this for anything that matters. Expect broad agreement on which nights
      are good and disagreement on absolute arcseconds, since their model includes a
      site-specific ground layer this one deliberately refuses to guess at.</p>
    </details>
  </section>`;
}

function mountSeeing(){
  if (!$("#seLoc")) return;
  AC_SEE = makeAC("seLoc", "acSee");
  const d = new Date();
  $("#seDate").value = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  $("#seGo").addEventListener("click", runSeeing);
  $("#seLoc").addEventListener("keydown", e => {
    if (e.key === "Enter" && !$("#acSee").classList.contains("on")) runSeeing();
  });
}
