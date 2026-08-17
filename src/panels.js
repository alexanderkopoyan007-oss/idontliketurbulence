"use strict";
const MONO = '"JetBrains Mono",ui-monospace,monospace';

/* ══════════ SEGMENT LOG ════════════════════════════════════════════════ */
function reasonFor(w, R){
  const bits = [], nums = [];
  const d = w.diag;
  if (d){
    if (d.vws > 3)  bits.push(`Vertical wind shear of <b>${d.vws.toFixed(1)} m/s per km</b> between air layers — ${d.vws>8?"well above":"above"} the usual value at this height.`);
    if (d.Ri < 3 && d.Ri >= 0) bits.push(`Richardson number <b>${d.Ri.toFixed(1)}</b>. Below about 1 the layering stops resisting the shear and the flow starts breaking into eddies.`);
    if (d.Ri < 0) bits.push(`The layer is <b>statically unstable</b> — warmer air sitting under colder air, which overturns.`);
    if (d.TI1 > 4)  bits.push(`Ellrod index <b>${d.TI1.toFixed(1)}</b> (moderate turbulence is usually flagged above 8) — shear plus stretching of the wind field.`);
    nums.push(["Shear", d.vws.toFixed(1)+" m/s/km"], ["Ri", d.Ri>99?"—":d.Ri.toFixed(1)],
              ["Ellrod TI1", d.TI1.toFixed(1)], ["Wind", `${kt(d.spd)} kt / ${Math.round(d.dir)}°`]);
  }
  if (w.jet){
    const dv = Math.round((w.altFt - w.jet.ft)/100)*100;
    bits.push(`A jet core of <b>${kt(w.jet.spd)} kt</b> sits near ${fmtFL(w.jet.ft)}, ${Math.abs(dv)<600?"right at your level":`about ${Math.abs(dv).toLocaleString()} ft ${dv>0?"below":"above"} you`}. The shear zone on the edge of a jet is the classic clear-air turbulence spot.`);
  }
  if (w.mwt > 0.08 && w.ts){
    bits.push(`Ground below rises <b>${Math.round(w.ts.relief).toLocaleString()} m</b> within 90 km, with <b>${kt(w.mw.Ucross)} kt</b> flowing across it in stable air. That launches mountain waves which can reach cruise height${w.mw.critical?", though a wind reversal aloft should damp them":""}.`);
    nums.push(["Terrain relief", Math.round(w.ts.relief)+" m"], ["Cross-ridge wind", kt(w.mw.Ucross)+" kt"]);
  }
  if (w.con > 0.06 && w.cape > 250){
    bits.push(`<b>${Math.round(w.cape)} J/kg</b> of convective energy beneath the route, with storm tops estimated near <b>${fmtFL(w.cv.topFt)}</b>. Crews normally deviate around cells, so treat this as "storms in the area", not "you will fly through one".`);
    nums.push(["CAPE", Math.round(w.cape)+" J/kg"]);
  }
  if (w.trop){
    const dv = (w.altFt - w.trop.ft)/1000;
    if (Math.abs(dv) < 4) bits.push(`You are cruising within ${Math.abs(dv).toFixed(1)},000 ft of the <b>tropopause</b> (${fmtFL(w.trop.ft)}), where wind shear concentrates.`);
    nums.push(["Tropopause", fmtFL(w.trop.ft)]);
  }
  if (!bits.length) bits.push("Wind shear, stability and deformation are all unremarkable here. The model sees no reason for the air to break up.");
  /* Lead with the experience, then the physics behind it. */
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  bits.unshift(`<b>${w.band.name}</b> — ${feelText(w.band)} ${w.band.key >= 2 ? cap(cabinText(w.band)) : ""}`);
  if (w.windComp) nums.push([w.windComp>0?"Tailwind":"Headwind", Math.abs(w.windComp)+" kt"]);
  return { bits, nums };
}

function drawLog(){
  const R = RES, tb = $("#logBody"); tb.innerHTML = "";
  R.live.forEach(w => {
    const bd = w.band, pct = clamp(w.edr/0.6,0,1)*100;
    const tr = document.createElement("tr");
    tr.className = "row"; tr.dataset.i = w.i; tr.tabIndex = 0;
    tr.innerHTML =
      `<td><div class="cell t">${hhmmUTC(w.time)}<em>${localTime(w.time, w.i < R.live.length/2 ? R.route.dep.tz : R.route.arr.tz)} local</em></div></td>
       <td><div class="cell place"><b>${w.place.text}</b><em>${w.fix ? `<span class="mono" style="color:var(--amber-2)">${w.fix}</span> · ` : ""}${w.lat.toFixed(2)}°, ${w.lon.toFixed(2)}° · ${Math.round(w.nm)} nm</em></div></td>
       <td class="hideS"><div class="cell fl">${fmtFL(w.altFt)}<br><span style="color:var(--dim-2);font-size:10.5px">${w.phase}</span></div></td>
       <td><div class="cell"><span class="pill" style="background:${bd.col}">${bd.name}</span></div></td>
       <td class="hideS"><div class="cell" style="display:flex;align-items:center;gap:9px">
            <span class="mini"><i style="width:${pct}%;background:${bd.col}"></i></span>
            <span class="mono" style="font-size:12px;color:var(--dim)">${w.edr.toFixed(2)}</span></div></td>`;
    const det = document.createElement("tr");
    det.hidden = true;
    const { bits, nums } = reasonFor(w, R);
    det.innerHTML = `<td colspan="5"><div class="why">
        <ul>${bits.map(b=>`<li>${b}</li>`).join("")}</ul>
        <div class="nums">${nums.map(([k,v])=>`<div>${k}<u>${v}</u></div>`).join("")}</div></div></td>`;
    const toggle = () => {
      det.hidden = !det.hidden;
      setCursor(clamp((w.time - R.live[0].time)/(R.live[R.live.length-1].time - R.live[0].time || 1),0,1));
    };
    tr.addEventListener("click", toggle);
    tr.addEventListener("keydown", e => { if (e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(); } });
    tb.append(tr, det);
  });
}

/* ══════════ SIDE BLOCKS ════════════════════════════════════════════════ */
function drawBlocks(){
  const R = RES;

  /* smoother levels */
  const cur = Math.round(R.route.topFt/100);
  const worstMean = Math.max(...R.levelScores.map(l=>l.mean), 0.05);
  $("#levels").innerHTML = R.levelScores.filter(l=>l.fl>=R.showLo && l.fl<=R.showHi).map(l => {
    const isBest = R.bestFL && l.fl === R.bestFL.fl, isCur = Math.abs(l.fl-cur) < 6;
    return `<div class="lvl ${isBest?"best":""} ${isCur?"now":""}">
      <b>FL${l.fl}</b>
      <span class="mini" style="height:8px"><i style="width:${clamp(l.mean/Math.max(worstMean,0.12),0,1)*100}%;background:${bandCol(l.mean)}"></i></span>
      <u>${l.mean.toFixed(2)}</u></div>`;
  }).join("") + `<p class="hint" style="margin-top:12px">Average EDR across the cruise, by level. <b>Amber</b> is the smoothest level within a realistic step change of your assumed one (<b>◂</b>). Real level choice depends on weight, traffic and fuel — this is what the air is doing, not what ATC will give you.</p>`;

  /* confidence */
  const on = Math.round(R.confidence/10);
  $("#confTag").textContent = R.lead < 1 ? "departing now" : `${Math.round(R.lead)} h ahead`;
  $("#conf").innerHTML =
    `<div style="display:flex;align-items:baseline;gap:10px">
       <span class="mono" style="font-size:34px;font-weight:700">${R.confidence}</span>
       <span class="eyebrow">percent</span></div>
     <div class="conf">${Array.from({length:10},(_,i)=>`<i class="${i<on?"on":""}"></i>`).join("")}</div>
     <div class="kv"><span>Lead time</span><b>${R.lead<1?"now":Math.round(R.lead)+" h"}</b></div>
     <div class="kv"><span>Model agreement</span><b>${R.models.length>1 ? (R.meanSpread<0.05?"close":R.meanSpread<0.11?"fair":"divided") : "single model"}</b></div>
     <div class="kv"><span>Models used</span><b style="font-size:11px">${R.models.join("<br>")}</b></div>
     <p class="hint" style="margin-top:12px">Turbulence forecasting is genuinely hard: the eddies that shake an aircraft are far smaller than any model grid box, so every value here is inferred from the larger-scale flow. Beyond about three days, treat this as a tendency rather than a timetable.</p>`;

  /* drivers */
  const pk = {cat:0, mwt:0, con:0};
  R.live.forEach(w => { pk.cat=Math.max(pk.cat,w.cat||0); pk.mwt=Math.max(pk.mwt,w.mwt||0); pk.con=Math.max(pk.con,w.con||0); });
  const mx = Math.max(pk.cat, pk.mwt, pk.con, 0.1);
  const rows = [
    ["Clear-air turbulence", pk.cat, "Wind shear between layers, usually near a jet stream. Invisible — no cloud, no radar return."],
    ["Mountain wave", pk.mwt, "Air forced over high ground carries on rippling for hundreds of miles downwind and upward."],
    ["Convective", pk.con, "Thunderstorms and unstable air. The one crews can see and steer around."]
  ];
  $("#drivers").innerHTML = rows.map(([n,v,d]) => `
    <div style="padding:9px 0;border-bottom:1px solid var(--rule)">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px">
        <b style="font-size:13.5px">${n}</b>
        <span class="mono" style="font-size:12px;color:${v>0.08?bandCol(v):"var(--dim-2)"}">${v<0.03?"—":v.toFixed(2)}</span></div>
      <span class="mini" style="display:block;margin:7px 0 6px"><i style="width:${clamp(v/mx,0,1)*100}%;background:${v>0.08?bandCol(v):"var(--rule-2)"}"></i></span>
      <span style="font-size:12px;color:var(--dim-2);line-height:1.5">${d}</span>
    </div>`).join("") +
    (R.sigHit ? `<div class="note warn" style="margin-top:14px"><span>SIGMET</span><div>${R.sigHit.length} active turbulence SIGMET${R.sigHit.length>1?"s":""} intersect this route: ${R.sigHit.map(s=>`<b>${s.hazard||"TURB"}</b> ${s.firName||s.isigmetId||""}`).join("; ")}. Issued by the responsible meteorological office — these outrank anything computed here.</div></div>` : "");
}

/* ══════════ METHOD ═════════════════════════════════════════════════════ */
function drawMethod(){
  const R = RES;
  $("#method").innerHTML = `
  <h4>Where the numbers come from</h4>
  <p>Every value on this page is derived from public numerical weather prediction output. Nothing is invented, and nothing is cached from a previous flight.</p>
  <ul>
    <li><b>Upper-air fields</b> — temperature, wind speed and direction, and geopotential height at ten pressure levels from 850&nbsp;hPa to 100&nbsp;hPa (roughly FL050 to FL530), read from <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>'s pressure-level API. This run used <b>${R.models.join("</b> and <b>")}</b>.</li>
    <li><b>Convective fields</b> — CAPE and precipitation on the surface grid, same source.</li>
    <li><b>Terrain</b> — 90&nbsp;m Copernicus DEM sampled along the ground track via the Open-Meteo elevation API, used for the mountain-wave check and the cross-section silhouette.</li>
    <li><b>Airports</b> — <a href="https://ourairports.com/data/" target="_blank" rel="noopener">OurAirports</a> (public domain), filtered to scheduled-service and large airports.</li>
    <li><b>Flight numbers</b> — resolved to an airport pair through the free <a href="https://www.adsbdb.com/" target="_blank" rel="noopener">adsbdb</a> callsign database. It knows the usual route for a callsign, not today's specific tail or routing.</li>
    <li><b>Route</b> — ${R.route.filed
      ? `a filed flight plan from <a href="https://flightplandatabase.com/plan/${R.route.filed.id}" target="_blank" rel="noopener">Flight Plan Database</a>, matched by ${R.route.filed.how} and carrying <b>${R.route.filed.nWpt} named waypoints</b> (SIDs, airways, oceanic entry points and the STAR). It runs <b>${Math.round(R.route.extraNM)} nm longer</b> than the straight line, a ${(100*R.route.extraNM/R.route.gcNM).toFixed(1)}% detour, and departs from it by up to <b>${Math.round(R.maxOffNM||0)} nm</b> — which is the point: the straight line samples air the aircraft never flies through.`
      : `no usable filed plan was found for this pair, so the ground track is the <b>great circle</b>. Expect the real aircraft to be off this line, sometimes by a hundred miles.`}</li>
    <li><b>SIGMETs</b> — international turbulence SIGMETs from <a href="https://aviationweather.gov/data/api/" target="_blank" rel="noopener">NOAA Aviation Weather Center</a>, when the service is reachable from your browser.</li>
    <li><b>Basemap</b> — OpenStreetMap data, CARTO tiles.</li>
  </ul>

  <h4>How the ride is computed</h4>
  <p>The ${R.route.filed ? "filed ground track" : "great-circle track"} is split into <b>${R.live.length} sample points</b>, each with its own full vertical profile. At every one the app also samples two points ${Math.round(R.route.scaleKm)}&nbsp;km either side of track, so it can measure how the wind field changes horizontally, not just vertically — ${R.live.length*3} profiles in total. Timings start from a standard climb and descent profile, then get corrected using the forecast head- or tailwind at each stage.</p>
  <p>For every layer between two pressure levels the app computes:</p>
  <ul>
    <li><b>Vertical wind shear</b> — how fast the wind vector changes with height. The single most reliable pointer to clear-air turbulence.</li>
    <li><b>Gradient Richardson number</b> — the tug of war between stable layering (which resists mixing) and shear (which forces it). Ri&nbsp;&lt;&nbsp;1 on a coarse model grid means the layer is prone to breaking down.</li>
    <li><b>Analysis scale</b> — the slider sets how far either side of track the wind field is sampled, and how closely
      waypoints are spaced. Tightening it resolves narrower features such as a single mountain ridge or the sharp edge of a
      jet, at the cost of more requests and a longer wait. It changes the wind field only — the terrain window feeding the mountain-wave term is held at 90 km,
      because relief measured over a wider window is automatically larger and would inflate that term rather than sharpen it.
      The slider also cannot manufacture detail the models do not hold: the source
      grids are about 25 km across, so anything below roughly 25–30 km is interpolation rather than new information.</li>
    <li><b>Ellrod's turbulence index</b> — shear multiplied by the deformation of the horizontal wind field, the standard operational clear-air-turbulence diagnostic, computed here from the cross-track and along-track stencil.</li>
    <li><b>Mountain-wave proxy</b> — terrain relief within 90&nbsp;km, the wind component blowing across it, and the low-level stability, with an amplitude that peaks near the tropopause and dies out if the wind reverses aloft.</li>
    <li><b>Convective proxy</b> — CAPE and precipitation, with an estimated storm-top height, including the gravity-wave layer just above the anvil.</li>
  </ul>
  <p>Each diagnostic is remapped onto the <b>eddy dissipation rate</b> (EDR, in m<sup>2/3</sup>&thinsp;s<sup>−1</sup>) — the metric ICAO adopted for turbulence reporting, because unlike "moderate chop" it does not depend on who is describing it. The remapping is a power law anchored on the conventional light, moderate and severe thresholds for each quantity. The diagnostics are then blended (70&nbsp;% weighted mean, 30&nbsp;% peak, so a single strong signal is not averaged away), and the strongest of the three turbulence sources dominates with a partial contribution from the others.</p>
  <p>Where two models are available the app runs the whole calculation twice and averages, then uses the disagreement between them as part of the confidence figure.</p>

  <h4>What it cannot know</h4>
  <ul>
    <li><b>Your exact routing.</b> ${R.route.filed
      ? "This is a plan filed for this city pair — the right airways and the right shape — but not the plan filed for your flight on your day. Oceanic track structure is rebuilt daily around the jet, and dispatch re-routes for wind and weather right up to pushback."
      : "No filed plan was available, so this is the great circle. Real flights follow airways, tracks and radar vectors and can be a hundred miles off this line."} Radar vectors and weather deviations are never in any plan.</li>
    <li><b>Your actual flight levels.</b> Cruise level is inferred from distance and the semicircular rule, and aircraft usually step-climb as they burn fuel.</li>
    <li><b>Small-scale eddies.</b> A model grid box is around 25&nbsp;km across. The gusts that spill your coffee are metres to hundreds of metres. Everything here is an inference from the large-scale flow to the small-scale ride.</li>
    <li><b>Avoidance.</b> Crews get turbulence forecasts, ride reports from aircraft ahead, and radar. They route around the worst of it. A moderate patch on this map is often a smooth flight in practice.</li>
    <li><b>Convection in detail.</b> Storms are small, fast, and only crudely represented. The convective term flags "unstable air here", not "your aircraft will hit a cell".</li>
  </ul>

  <h4>Reading the EDR scale</h4>
  <ul>${BANDS.map((b,i)=>`<li><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${b.col};margin-right:7px"></span><b>${b.name}</b> — EDR ${b.min.toFixed(2)}${BANDS[i+1]?"–"+BANDS[i+1].min.toFixed(2):"+"} — ${b.say}.</li>`).join("")}</ul>
  <p>The banner verdict is adjusted for aircraft type (${(ACFT[R.route.opts.acft]||ACFT.narrow).label}, factor ${R.aFactor.toFixed(2)}): the same air feels stronger in a regional jet than in a 777. The EDR figures in the table and cross-section are not adjusted — they describe the air itself.</p>`;
}
