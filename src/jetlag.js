"use strict";
/* ══════════ JET LAG PLANNER ═════════════════════════════════════════════
   A light-exposure schedule for shifting the body clock across a time zone
   change. Unlike the ride briefing, this one changes what someone does.

   The mechanism, and why the direction matters more than anything else:

   The circadian clock is entrained by light, and the response depends entirely
   on WHEN the light lands relative to the core body temperature minimum
   (CBTmin), which sits roughly two hours before habitual wake. This is the human
   light phase-response curve (Khalsa et al., J Physiol 2003; Burgess et al.,
   J Clin Sleep Med 2008):

     light AFTER  CBTmin  →  phase ADVANCE (clock moves earlier)
     light BEFORE CBTmin  →  phase DELAY   (clock moves later)

   Eastward travel needs an advance. Westward needs a delay. Get the timing
   backwards and you push the clock the wrong way — bright light at the wrong
   hour makes jet lag worse, not neutral, which is why this module refuses to
   emit a schedule it cannot place relative to a CBTmin estimate.

   Rates are conservative and asymmetric because the human circadian period is
   slightly longer than 24 h: delays come more easily than advances. About
   1.0 h/day advancing, 1.5 h/day delaying (Eastman & Burgess, Sleep Med Clin
   2009, "How to travel the world without jet lag").

   Not medical advice. No melatonin dosing — that is a clinical decision and
   deliberately out of scope here. */

const JL = {
  ADVANCE_PER_DAY: 1.0,     // hours of phase advance achievable per day
  DELAY_PER_DAY:   1.5,     // delays come easier
  CBTMIN_BEFORE_WAKE: 2.0,  // CBTmin ≈ habitual wake − 2 h
  MAX_ADVANCE: 9,           // beyond this, going the long way round is easier
};

const hmod = h => ((h % 24) + 24) % 24;
const hhmm = h => {
  const t = hmod(h);
  const H = Math.floor(t), M = Math.round((t - H)*60);
  return M === 60 ? `${pad2(hmod(H+1))}:00` : `${pad2(H)}:${pad2(M)}`;
};
const parseHM = s => {
  const m = /^(\d{1,2}):(\d{2})$/.exec((s||"").trim());
  if (!m) return null;
  const h = +m[1], mi = +m[2];
  if (h > 23 || mi > 59) return null;
  return h + mi/60;
};

/* Zone offsets come from the airport table's IANA names, evaluated on the
   actual travel date so DST is handled rather than assumed. */
function zoneOffsetHours(tz, date){ return tzOffsetMin(tz, date)/60; }

/**
 * @param {object} o
 * @param {string} o.fromTz  IANA zone of origin
 * @param {string} o.toTz    IANA zone of destination
 * @param {Date}   o.dep     departure instant
 * @param {Date}   o.arr     arrival instant
 * @param {number} o.bed     habitual bedtime, hours (origin local)
 * @param {number} o.wake    habitual wake time, hours (origin local)
 * @param {number} [o.daysBefore]  days of pre-travel shifting to plan
 */
function jetlagPlan(o){
  const offFrom = zoneOffsetHours(o.fromTz, o.dep);
  const offTo   = zoneOffsetHours(o.toTz,   o.arr);

  /* Raw zone difference, wrapped into (−12, +12]. Positive = destination clock
     is ahead = eastward = an advance is required. */
  let raw = offTo - offFrom;
  while (raw > 12)  raw -= 24;
  while (raw <= -12) raw += 24;

  /* A large eastward jump is usually easier taken the long way round, as a
     delay. 10 h east and 14 h of delay are both awful; 9 h east is the point
     where the arithmetic stops favouring the advance. */
  let shift = raw, viaLongWay = false;
  if (raw > JL.MAX_ADVANCE){ shift = raw - 24; viaLongWay = true; }

  const advancing = shift > 0;
  const magnitude = Math.abs(shift);
  const perDay = advancing ? JL.ADVANCE_PER_DAY : JL.DELAY_PER_DAY;
  const daysNeeded = magnitude < 0.5 ? 0 : Math.ceil(magnitude / perDay);

  /* CBTmin in origin local time, before any shifting. */
  const cbt0 = hmod(o.wake - JL.CBTMIN_BEFORE_WAKE);

  const daysBefore = Math.max(0, Math.min(o.daysBefore ?? 3, daysNeeded));
  const daysAfter  = Math.max(0, daysNeeded - daysBefore);

  /* Walk day by day. `done` is cumulative achieved shift in hours, signed the
     same way as `shift`. CBTmin moves with it, and so do the light windows —
     that is the whole point: yesterday's advance changes where today's light
     has to land. */
  const days = [];
  let done = 0;
  const step = advancing ? JL.ADVANCE_PER_DAY : -JL.DELAY_PER_DAY;

  for (let d = -daysBefore; d <= daysAfter; d++){
    const arrived = d >= 0;
    const remaining = shift - done;
    const todayStep = Math.abs(remaining) < Math.abs(step) ? remaining : step;

    /* Reference zone for display: origin before the flight, destination after.
       `done` is the achieved shift, signed positive for an advance. An advance
       moves body-clock events to an EARLIER local clock time, so it subtracts.
       Converting origin-local to destination-local adds the zone difference.
       At full adjustment (done === shift === raw) the two cancel and CBTmin
       lands back on its home clock time — which is what being adjusted means. */
    const zoneShift = arrived ? raw : 0;
    const cbtLocalRef = hmod(cbt0 - done + zoneShift);

    const seek = advancing
      ? [cbtLocalRef + 0.5, cbtLocalRef + 3.5]
      : [cbtLocalRef - 5.0, cbtLocalRef - 1.0];
    const avoid = advancing
      ? [cbtLocalRef - 4.0, cbtLocalRef - 0.5]
      : [cbtLocalRef + 0.5, cbtLocalRef + 4.0];

    const bed  = hmod(o.bed  - done + zoneShift);
    const wake = hmod(o.wake - done + zoneShift);

    days.push({
      offset: d, arrived,
      zone: arrived ? o.toTz : o.fromTz,
      cbtmin: cbtLocalRef,
      seekLight:  [hmod(seek[0]),  hmod(seek[1])],
      avoidLight: [hmod(avoid[0]), hmod(avoid[1])],
      bed, wake,
      shiftedSoFar: done,
      /* Caffeine: useful in the biological morning, counterproductive within
         ~8 h of target sleep (half-life ~5 h). */
      caffeineUntil: hmod(bed - 8),
      /* Largest meal in the biological day; avoid heavy food in biological night. */
      mealsFrom: hmod(wake + 0.5),
      mealsUntil: hmod(bed - 3),
    });
    done += todayStep;
  }

  return {
    rawShift: raw, shift, advancing, viaLongWay,
    magnitude, perDay, daysNeeded, daysBefore, daysAfter,
    cbtOrigin: cbt0, offFrom, offTo,
    days,
    habitual: { bed: o.bed, wake: o.wake },
    sleepHours: hmod(o.wake - o.bed) || 8,
  };
}

/* ── rendering ────────────────────────────────────────────────────────── */

function jetlagHeadline(P){
  if (P.daysNeeded === 0)
    return `<b>No meaningful shift.</b> The clocks differ by under half an hour, so there is nothing for your body to adjust to. Sleep normally.`;
  const dir = P.advancing ? "earlier" : "later";
  const way = P.viaLongWay
    ? ` Because that is more than ${JL.MAX_ADVANCE} hours to advance, the plan below shifts you <b>the long way round</b> — ${P.magnitude.toFixed(0)} h later instead of ${P.rawShift.toFixed(0)} h earlier. Going that direction is the easier arithmetic even though you are flying east.`
    : "";
  return `Your body clock needs to move <b>${P.magnitude.toFixed(1)} h ${dir}</b> ` +
    `(${P.advancing ? "a phase advance, the harder direction" : "a phase delay, the easier direction"}).${way} ` +
    `At about ${P.perDay} h a day that is <b>${P.daysNeeded} day${P.daysNeeded===1?"":"s"}</b> of adjustment.`;
}

function jetlagDayLabel(d){
  if (d.offset < 0) return `${Math.abs(d.offset)} day${Math.abs(d.offset)===1?"":"s"} before`;
  if (d.offset === 0) return "Travel day";
  return `Day ${d.offset} after`;
}

function drawJetlag(P){
  const host = $("#jlOut"); if (!host) return;
  if (!P){ host.innerHTML = ""; return; }

  const rows = P.days.map(d => `
    <tr>
      <td><div class="cell t"><b>${jetlagDayLabel(d)}</b><em>${d.zone.split("/").pop().replace(/_/g," ")} time</em></div></td>
      <td><div class="cell"><span class="jl-pill seek">${hhmm(d.seekLight[0])}–${hhmm(d.seekLight[1])}</span></div></td>
      <td><div class="cell"><span class="jl-pill avoid">${hhmm(d.avoidLight[0])}–${hhmm(d.avoidLight[1])}</span></div></td>
      <td class="hideS"><div class="cell mono">${hhmm(d.bed)} – ${hhmm(d.wake)}</div></td>
      <td class="hideS"><div class="cell mono">${hhmm(d.caffeineUntil)}</div></td>
    </tr>`).join("");

  host.innerHTML = `
    <section class="panel jl-panel">
      <h3>Your adjustment plan</h3>
      <p class="jl-head">${jetlagHeadline(P)}</p>
      ${P.daysNeeded === 0 ? "" : `
      <div class="jl-key">
        <span><i class="seek"></i> Seek bright light</span>
        <span><i class="avoid"></i> Avoid bright light</span>
        <span class="jl-cbt">Estimated body-clock low point: ${hhmm(P.cbtOrigin)} at home</span>
      </div>
      <table class="log jl-table">
        <thead><tr><th>Day</th><th>Bright light</th><th>Darkness / shades</th>
          <th class="hideS">Sleep window</th><th class="hideS">Last caffeine</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="jl-note">
        <b>Bright light</b> means outdoors if at all possible — an overcast day is still
        ten times brighter than a lit room. <b>Avoid</b> means sunglasses outdoors and dim
        light indoors, not darkness. Times are in the local zone named on each row.
        Eat your largest meals inside the sleep-window's waking hours and keep heavy food
        out of your biological night.
      </p>`}
      <details class="jl-method">
        <summary>How this is worked out, and what it assumes</summary>
        <p>The circadian clock is set by light, and whether light advances or delays it
        depends entirely on when it lands relative to your <b>core body temperature
        minimum</b> (CBTmin) — the low point of the daily cycle, roughly two hours before
        you normally wake. Light after CBTmin advances the clock; light before it delays
        the clock. That is the human light phase-response curve
        (Khalsa et al., <i>J Physiol</i> 2003; Burgess et al., <i>J Clin Sleep Med</i> 2008).</p>
        <p>Eastward travel needs an advance, westward a delay. This matters more than
        anything else on the page: light at the wrong hour pushes your clock the wrong
        way and makes jet lag worse rather than leaving it unchanged.</p>
        <p>Rates are asymmetric because the intrinsic human circadian period runs slightly
        longer than 24 hours, so delaying is easier than advancing — about
        ${JL.DELAY_PER_DAY} h a day delaying against ${JL.ADVANCE_PER_DAY} h advancing
        (Eastman &amp; Burgess, <i>Sleep Med Clin</i> 2009). Shifts of more than
        ${JL.MAX_ADVANCE} h eastward are planned as a delay the long way round, which is
        the easier arithmetic.</p>
        <p><b>Assumptions and limits.</b> CBTmin is <i>estimated</i> from the sleep times you
        entered, not measured — an actual determination needs melatonin or temperature
        sampling. The rates are population averages; individual response varies widely,
        and chronotype, age and sleep debt all move it. Pre-flight shifting assumes you can
        actually control your light exposure and sleep timing, which work and family often
        prevent. This is general guidance built on published population data, <b>not
        medical advice</b>, and it deliberately makes no melatonin recommendation — dosing
        and timing there are a clinical decision.</p>
      </details>
    </section>`;
}

/* ── wiring ───────────────────────────────────────────────────────────── */

function runJetlag(){
  const dep = AC_JL_DEP.get(), arr = AC_JL_ARR.get();
  const bed = parseHM($("#jlBed").value), wake = parseHM($("#jlWake").value);
  const err = m => { $("#jlStatus").innerHTML = `<div class="note err"><span>Can't plan it</span><div>${m}</div></div>`; drawJetlag(null); };

  if (!dep || !arr) return err("Pick a departure and an arrival airport.");
  if (bed === null)  return err("Enter your usual bedtime as HH:MM, for example 23:30.");
  if (wake === null) return err("Enter your usual wake time as HH:MM, for example 07:00.");
  if (hmod(wake - bed) < 3) return err("That gives you under three hours in bed. Check the two times.");

  const when = $("#jlDate").value ? localToUTC($("#jlDate").value, dep.tz) : new Date();
  if (!when || isNaN(+when)) return err("Pick a departure date and time.");

  $("#jlStatus").innerHTML = "";
  const P = jetlagPlan({
    fromTz: dep.tz, toTz: arr.tz, dep: when, arr: when,
    bed, wake, daysBefore: +$("#jlPrep").value,
  });
  JL_LAST = P;
  drawJetlag(P);
  $("#jlOut").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth", block:"start" });
}

let JL_LAST = null;
let AC_JL_DEP = null, AC_JL_ARR = null;

/* Two views in one file. The ride briefing stays the default entry point; the
   planner is a sibling, reachable at #/jetlag so it can be linked directly
   without colliding with the query-state hash. */
const VIEWS = {
  ride:   { nav:"#vRide", section:null,          hash:"" },
  jetlag: { nav:"#vJet",  section:"#jetlagView", hash:"#/jetlag" },
  seeing: { nav:"#vSee",  section:"#seeingView", hash:"#/seeing" },
  heat:   { nav:"#vHeat", section:"#heatView",   hash:"#/heat" },
  record: { nav:"#vRec",  section:"#recordView", hash:"#/record" },
};

function showView(which){
  const view = VIEWS[which] ? which : "ride";
  const ride = view === "ride";
  for (const [name, v] of Object.entries(VIEWS)){
    if (v.section){ const el = $(v.section); if (el) el.hidden = name !== view; }
    const nav = $(v.nav);
    if (nav){
      nav.classList.toggle("on", name === view);
      nav.setAttribute("aria-current", name === view ? "page" : "false");
    }
  }
  /* The briefing's own strip and output belong to the ride view. */
  const strip = $("#pRoute") && $("#pRoute").closest(".strip");
  if (strip) strip.hidden = !ride;
  const out = $("#out");        if (out) out.hidden = !ride;
  const fs  = $("#footStatic"); if (fs)  fs.hidden  = !ride;
}

function goView(which){
  showView(which);
  HASH_SELF_WRITE = true;
  const h = VIEWS[which] ? VIEWS[which].hash : "";
  history.replaceState(null, "", location.pathname + h);
}

function mountJetlag(){
  if (!$("#jlDep")) return;
  $("#vRide").addEventListener("click", () => goView("ride"));
  if ($("#vHeat")) $("#vHeat").addEventListener("click", () => goView("heat"));
  if ($("#vRec"))  $("#vRec").addEventListener("click",  () => goView("record"));
  $("#vJet").addEventListener("click",  () => goView("jetlag"));
  const se = $("#vSee"); if (se) se.addEventListener("click", () => goView("seeing"));
  AC_JL_DEP = makeAC("jlDep", "acJlDep");
  AC_JL_ARR = makeAC("jlArr", "acJlArr");
  const d = new Date(Date.now() + 3*3600e3); d.setMinutes(0,0,0);
  $("#jlDate").value = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:00`;
  $("#jlGo").addEventListener("click", runJetlag);
  [$("#jlBed"), $("#jlWake")].forEach(el =>
    el.addEventListener("keydown", e => { if (e.key === "Enter") runJetlag(); }));
}
