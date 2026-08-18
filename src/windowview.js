"use strict";
/* ══════════ WINDOW VIEW ═════════════════════════════════════════════════
   Renders the "what's out the window" timeline into the ride briefing and keeps
   it locked to the same scrubber as the ride tape. */

let WIN = null;          // the computed timeline for the current briefing
let KP_SERIES = null;    // planetary K index, fetched once per briefing

async function buildWindow(R){
  const tl = windowTimeline(R, 2);
  if (!tl.length) return null;
  const events = terminatorEvents(tl);

  /* Aurora only matters if the route actually goes somewhere dark and far
     enough north or south. Skip the fetch entirely otherwise — no point
     spending a request to tell someone in the tropics there is no aurora. */
  const highLat = tl.some(p => Math.abs(geomagLat(p.lat, p.lon)) > 45 && p.dark);
  if (highLat && !KP_SERIES) KP_SERIES = await fetchKp();
  const aurora = highLat ? auroraAlong(tl, KP_SERIES) : { best:null, hits:[], minutes:0 };

  /* Features are expensive to scan per timeline step, so sample coarsely and
     de-duplicate: passing the Alps for 20 minutes is one sighting, not ten. */
  const seen = new Map();
  for (let i=0; i<tl.length; i += 3){
    const p = tl[i];
    for (const f of featuresNear(p, p.brg, p.altFt, 300)){
      const prev = seen.get(f.name);
      if (!prev || f.km < prev.km) seen.set(f.name, { ...f, time:p.time, minsIn:(p.time - tl[0].time)/60000 });
    }
  }
  const feats = [...seen.values()].sort((a,b) => a.minsIn - b.minsIn);

  return { tl, events, aurora, feats, highLat };
}

/* The one line people want. */
function windowHeadline(W, R){
  const bits = [];
  const cloudAt = mins => {
    const t = R.live[0].time.getTime() + mins*60000;
    let best = R.live[0], bd = Infinity;
    for (const w of R.live){ const d = Math.abs(w.time - t); if (d < bd){ bd = d; best = w; } }
    return best.cloud || null;
  };

  /* A sunrise or sunset in flight beats everything else. */
  const solar = W.events.filter(e => e.kind === "sunset" || e.kind === "sunrise");
  if (solar.length){
    const e = solar[0];
    const c = cloudAt(e.minsIn);
    const blocked = c && c.high !== null && c.high > 70;
    bits.push(
      `Sit on <b>${e.side.side === "left" ? "the left" : e.side.side === "right" ? "the right" : "either side"}</b>` +
      (e.side.side === "left" || e.side.side === "right" ? ` — ${SEAT_LETTERS[e.side.side]}` : "") +
      ` for <b>${e.kind}</b> about <b>${fmtDur(Math.max(1, e.minsIn))}</b> in, at ${hhmmUTC(e.time)}.` +
      (blocked ? ` High cloud is forecast at ${Math.round(c.high)}%, so it may be a glow rather than a view.` : "")
    );
  }

  if (W.aurora.best){
    const a = W.aurora.best;
    const c = cloudAt((a.time - W.tl[0].time)/60000);
    /* Promising an aurora under a solid deck would be exactly the kind of
       confident-but-wrong claim this app refuses to make elsewhere. */
    const over = c && c.high !== null && c.high > 65
      ? ` High cloud is forecast at ${Math.round(c.high)}% though, which would hide it — worth a look, not a plan.`
      : "";
    bits.push(`Aurora is <b>${a.chance}</b> around ${hhmmUTC(a.time)} — Kp ${a.kp.toFixed(1)}, ` +
              `${a.gm.toFixed(0)}° geomagnetic against an oval edge at ${a.bound.toFixed(0)}°. ` +
              `Look ${a.lat > 0 ? "north" : "south"}, and give your eyes twenty minutes to adapt.` + over);
  }

  const dark = W.tl.filter(p => p.dark).length / W.tl.length;
  if (!solar.length){
    if (dark > 0.85)      bits.push("The whole flight is in darkness — this is a sleeping flight, not a sightseeing one.");
    else if (dark < 0.05) bits.push("Daylight the whole way.");
  }

  const big = W.feats.filter(f => f.km < 120 && (f.cls === "range" || f.cls === "ice" || f.cls === "desert")).slice(0,3);
  if (big.length) bits.push(`Overflying ${big.map(f=>`<b>${f.name}</b>`).join(", ")}.`);

  return bits.length ? bits.join(" ") : "Nothing remarkable out of the window on this one — cloud, water and the dark.";
}

function pct(v){ return v === null || v === undefined ? "—" : Math.round(v) + "%"; }

function drawWindow(){
  const host = $("#winOut"); if (!host || !RES) return;
  const W = WIN;
  if (!W){ host.innerHTML = ""; return; }
  const R = RES;

  const rows = [];
  /* One row per notable thing, in time order: terminator events, features,
     aurora windows. */
  const items = [];
  for (const e of W.events) items.push({ t:e.time, minsIn:e.minsIn, kind:"sun", e });
  for (const f of W.feats)  items.push({ t:f.time, minsIn:f.minsIn, kind:"feat", f });
  if (W.aurora.best) items.push({ t:W.aurora.best.time, minsIn:(W.aurora.best.time - W.tl[0].time)/60000, kind:"aur", a:W.aurora.best });
  items.sort((a,b) => a.minsIn - b.minsIn);

  for (const it of items.slice(0, 40)){
    const frac = clamp(it.minsIn / Math.max(1, R.totalMin), 0, 1);
    if (it.kind === "sun"){
      const e = it.e;
      rows.push(`<tr class="wrow" data-frac="${frac.toFixed(4)}" tabindex="0">
        <td><div class="cell t">${hhmmUTC(e.time)}<em>${fmtDur(Math.max(0,e.minsIn))} in</em></div></td>
        <td><div class="cell"><span class="wtag sun">${e.kind}</span></div></td>
        <td><div class="cell place"><b>${e.kind[0].toUpperCase()+e.kind.slice(1)}</b><em>bearing ${Math.round(e.az)}°</em></div></td>
        <td><div class="cell side ${e.side.side}">${e.side.side}</div></td></tr>`);
    } else if (it.kind === "feat"){
      const f = it.f;
      rows.push(`<tr class="wrow" data-frac="${frac.toFixed(4)}" tabindex="0">
        <td><div class="cell t">${hhmmUTC(f.time)}<em>${fmtDur(Math.max(0,f.minsIn))} in</em></div></td>
        <td><div class="cell"><span class="wtag ${f.cls}">${f.cls}</span></div></td>
        <td><div class="cell place"><b>${f.name}</b><em>${f.km < 25 ? "directly below" : `${Math.round(f.km)} km`}</em></div></td>
        <td><div class="cell side ${f.side}">${f.side}</div></td></tr>`);
    } else {
      const a = it.a;
      rows.push(`<tr class="wrow" data-frac="${frac.toFixed(4)}" tabindex="0">
        <td><div class="cell t">${hhmmUTC(a.time)}<em>${fmtDur(Math.max(0,(a.time-W.tl[0].time)/60000))} in</em></div></td>
        <td><div class="cell"><span class="wtag aur">aurora</span></div></td>
        <td><div class="cell place"><b>Aurora ${a.chance}</b><em>Kp ${a.kp.toFixed(1)} · ${a.gm.toFixed(0)}° geomag</em></div></td>
        <td><div class="cell side ${a.lat>0?"left":"right"}">${a.lat>0?"north":"south"}</div></td></tr>`);
    }
  }

  const mid = W.tl[Math.floor(W.tl.length/2)];
  const moonPct = Math.round((mid.moonIllum || 0)*100);

  host.innerHTML = `
    <div class="win-head">${windowHeadline(W, R)}</div>
    <div class="win-sum">
      <div><span>Dark for</span><u>${Math.round(100*W.tl.filter(p=>p.dark).length/W.tl.length)}% of the flight</u></div>
      <div><span>Moon</span><u>${moonPct}% lit${mid.moonAlt > 0 ? ", up" : ", below the horizon"}</u></div>
      <div><span>Cloud below at mid-point</span><u>${pct(midCloud(R,"low"))} low · ${pct(midCloud(R,"mid"))} mid</u></div>
      <div><span>High cloud</span><u>${pct(midCloud(R,"high"))}</u></div>
    </div>
    ${rows.length ? `<div class="tblwrap"><table class="wtable"><thead><tr>
        <th>Time</th><th>What</th><th>Detail</th><th>Side</th></tr></thead>
      <tbody>${rows.join("")}</tbody></table></div>`
      : `<p class="sub">Nothing named along this track — open ocean or unmapped ground the whole way.</p>`}
    <p class="win-note">Sides assume you are facing forward. Seat letters vary by cabin, so the side is
      the reliable part. Sunrise and sunset are computed for the moving aircraft, not for either airport —
      at cruise speed those differ by a lot. Cloud is forecast cover, not a guarantee either way.</p>`;

  host.querySelectorAll(".wrow").forEach(r => {
    const go = () => setCursor(+r.dataset.frac);
    r.addEventListener("click", go);
    r.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); go(); } });
  });
}

function midCloud(R, key){
  const w = R.live[Math.floor(R.live.length/2)];
  return w && w.cloud ? w.cloud[key] : null;
}

/* Highlight the timeline row nearest the scrubber. */
function windowCursor(frac){
  const host = $("#winOut"); if (!host) return;
  let best = null, bd = Infinity;
  host.querySelectorAll(".wrow").forEach(r => {
    const d = Math.abs(+r.dataset.frac - frac);
    if (d < bd){ bd = d; best = r; }
    r.classList.remove("hot");
  });
  if (best && bd < 0.06) best.classList.add("hot");
}
