"use strict";
/* ══════════ HEATMAP VIEW ════════════════════════════════════════════════ */

let HEAT = null;
const AC_HDEP = makeAC("hdep","acHDep"), AC_HARR = makeAC("harr","acHArr");

function heatCellCol(score){
  /* Reuse the EDR ramp so the grid speaks the same colour language as the rest
     of the app: high score = smooth = teal, low = rough = red. */
  return rampCol(clamp((100 - score)/100 * 0.62, 0, 0.85));
}

function mountHeatmap(){
  if (!$("#hmGo")) return;
  $("#hmGo").addEventListener("click", async () => {
    const dep = AC_HDEP.get(), arr = AC_HARR.get();
    const box = $("#hmOut");
    if (!dep || !arr) return heatStatus("<span>Pick a pair</span><div>Choose a departure and arrival airport.</div>", "err");
    if (dep.iata === arr.iata) return heatStatus("<span>Same airport</span><div>Departure and arrival match.</div>", "err");
    if (distance(dep, arr) < 60000) return heatStatus("<span>Too short</span><div>Those airports are under 60 km apart.</div>", "err");

    const opts = { acft:"narrow", fl:"auto", scaleKm:200 };
    const plan = heatmapPlan(dep, arr, opts);

    /* Show the bill before running it — this is the one screen in the app that
       can spend a large slice of an hourly quota in a single click. */
    const ok = await heatConfirm(plan, dep, arr);
    if (!ok) return;

    $("#hmGo").disabled = true;
    const prog = heatLoading();
    try{
      HEAT = await buildHeatmap(dep, arr, opts, prog);
      drawHeatmap();
      heatStatus("");
    }catch(e){
      console.error(e);
      heatStatus(`<span>Can't build it</span><div>${(e && e.message) || "Something went wrong."}</div>`, "err");
    }finally{ $("#hmGo").disabled = false; }
  });
}

function heatStatus(html, cls){
  $("#hmStatus").innerHTML = html ? `<div class="note ${cls||""}">${html}</div>` : "";
}
function heatLoading(){
  $("#hmStatus").innerHTML = `<div class="loading"><p id="hmMsg">Starting…</p><div class="bar"><i id="hmBar"></i></div></div>`;
  return (pct, msg) => { const b=$("#hmBar"), m=$("#hmMsg"); if(b) b.style.width=pct+"%"; if(m) m.textContent=msg; };
}

function heatConfirm(plan, dep, arr){
  return new Promise(resolve => {
    $("#hmStatus").innerHTML = `
      <div class="note">
        <span>Before it runs</span>
        <div>Scoring <b>${plan.slots} departure slots</b> for ${dep.iata}→${arr.iata} across the next
        ${HEAT_DAYS} days. It fetches the week once rather than per slot, so it costs about
        <b>${plan.requests} requests</b> covering ${plan.hours} hours — roughly
        <b>${plan.relativeCost.toFixed(0)}×</b> a single briefing, in place of ${plan.slots} of them.
        One model and the coarse ${plan.nWpt}-waypoint scale are used to keep it affordable.
        <div class="hm-acts">
          <button class="act" id="hmYes">Run it</button>
          <button class="act ghost" id="hmNo">Cancel</button>
        </div></div>
      </div>`;
    $("#hmYes").onclick = () => resolve(true);
    $("#hmNo").onclick  = () => { heatStatus(""); resolve(false); };
  });
}

function drawHeatmap(){
  const H = HEAT, host = $("#hmOut");
  if (!H){ host.innerHTML = ""; return; }
  const tz = H.dep.tz;

  /* Group cells into columns by local date at the origin. */
  const dayKey = d => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year:"numeric", month:"2-digit", day:"2-digit" }).format(d);
  const hourOf = d => +new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour:"2-digit", hour12:false }).format(d);

  const days = [];
  const byDay = new Map();
  for (const c of H.cells){
    const k = dayKey(c.depart);
    if (!byDay.has(k)){ byDay.set(k, new Map()); days.push(k); }
    byDay.get(k).set(hourOf(c.depart), c);
  }
  /* Rows are the local hours that actually occur, not an assumed 0,3,6,… set.
     Slots are aligned to UTC boundaries, so at UTC+1 the local hours are
     22:00, 01:00, 04:00 — and a fixed row set matched none of them, rendering
     every cell empty. Deriving them also handles half-hour zones like IST. */
  const hours = [...new Set(H.cells.map(c => hourOf(c.depart)))].sort((a,b) => a-b);

  const dayLabel = k => {
    const d = new Date(k + "T12:00:00Z");
    return `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getUTCDay()]}<em>${d.getUTCDate()}/${d.getUTCMonth()+1}</em>`;
  };

  const rows = hours.map(h => {
    const tds = days.map(k => {
      const c = byDay.get(k).get(h);
      if (!c) return `<td class="hm-cell empty"></td>`;
      return `<td class="hm-cell" style="background:${heatCellCol(c.score)}"
        data-iso="${c.depart.toISOString()}" data-score="${c.score}" tabindex="0"
        title="${hhmmUTC(c.depart)} · score ${c.score}">${c.score}</td>`;
    }).join("");
    return `<tr><th>${pad2(h)}:00</th>${tds}</tr>`;
  }).join("");

  const b = H.best, w = H.worst;
  host.innerHTML = `
    <p class="hm-head">
      Smoothest departure in the next ${HEAT_DAYS} days is
      <b>${localTime(b.depart, tz)} on ${new Intl.DateTimeFormat("en-GB",{timeZone:tz,weekday:"long",day:"numeric",month:"long"}).format(b.depart)}</b>
      — score <b>${b.score}</b>. The worst is ${localTime(w.depart, tz)}
      ${new Intl.DateTimeFormat("en-GB",{timeZone:tz,weekday:"long"}).format(w.depart)} at ${w.score}.
      ${b.score - w.score < 8 ? "The spread is small, so timing will not change this flight much." : ""}
    </p>
    <div class="tblwrap"><table class="hm">
      <thead><tr><th></th>${days.map(k=>`<th>${dayLabel(k)}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody></table></div>
    <p class="hm-note">Times are local at ${H.dep.iata}. Click any cell for the full briefing at that
      departure. Scores come from one model at the coarse scale, so treat them as a ranking between
      slots rather than a final figure — the briefing you open will be computed properly, with both
      models, and may differ by a few points.</p>`;

  host.querySelectorAll(".hm-cell[data-iso]").forEach(td => {
    const open = () => {
      const iso = td.dataset.iso;
      const d = new Date(iso);
      /* the datetime-local field wants origin-local wall time */
      const p = new Intl.DateTimeFormat("en-CA",{ timeZone:tz, year:"numeric", month:"2-digit",
        day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false }).formatToParts(d);
      const g = t => (p.find(x=>x.type===t)||{}).value;
      goView("ride");
      tab("route");
      AC_DEP.set(H.dep); AC_ARR.set(H.arr);
      $("#dt1").value = `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
      $("#goRoute").click();
    };
    td.addEventListener("click", open);
    td.addEventListener("keydown", e => { if (e.key==="Enter"||e.key===" "){ e.preventDefault(); open(); } });
  });
}

mountHeatmap();
