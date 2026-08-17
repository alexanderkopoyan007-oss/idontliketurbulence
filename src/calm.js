"use strict";
/* ══════════ ANXIOUS-FLYER MODE ══════════════════════════════════════════
   Same numbers, calmer register.

   Most people who search for a turbulence forecast are frightened, and the
   instrument-panel voice the rest of this app uses makes an ordinary flight
   sound like an incident report. This mode changes the framing and adds
   context; it never changes, softens or hides a value. The EDR figures, the
   score, the confidence and the segment log are identical in both modes — if
   the forecast says strong, calm mode still says strong, and then explains what
   strong actually means to an aircraft.

   The reassurance here is factual, not therapeutic. Every claim below is about
   certification limits, structural design or standard crew procedure. */

let CALM = false;

/* Per-band reframing. `feel` stays honest about the sensation; `why` supplies
   the context that the ordinary voice leaves out. */
const CALM_BANDS = [
  { name:"Smooth",
    feel:"You are unlikely to notice anything at all.",
    why:"Nothing to do. This is the air behaving exactly as forecast." },
  { name:"Light chop",
    feel:"A steady fine vibration, like a car on a coarse road surface.",
    why:"This is the most common condition in flight. It is not a sign of anything developing." },
  { name:"Light",
    feel:"Individual bumps you can feel, with calm air between them.",
    why:"The aircraft is moving a few feet. Cabin crew keep working through this; the seatbelt sign is about people standing up, not about the aircraft." },
  { name:"Moderate",
    feel:"Firm jolts. You are pushed into the belt and back into the seat.",
    why:"This is the level most passengers call bad turbulence, and it is what the seatbelt sign exists for. The aircraft is well inside its design envelope — the discomfort scales up long before the loads do." },
  { name:"Strong",
    feel:"Sharp changes you would remember. Loose items move.",
    why:"Uncommon, and crews do not sit in it: they ask for a different level or heading, usually within minutes. Airliners are certified to withstand gust loads far beyond what this produces." },
  { name:"Severe",
    feel:"Large, abrupt changes in height and attitude.",
    why:"Genuinely rare — many career pilots see it a handful of times. Forecast severe very often turns out to be moderate in practice, because the forecast is resolving a 25 km grid box and the aircraft flies through a fraction of it." }
];

/* Verdict headlines, keyed to the same thresholds as VERDICTS. */
const CALM_VERDICTS = [
  [0.10, "This should be a smooth flight",  "The model finds nothing to flag along your route."],
  [0.17, "Mostly smooth",                   "A little light movement. The kind you stop noticing after a while."],
  [0.26, "Some light bumps",                "Light turbulence in places — the ordinary texture of the air, not a problem."],
  [0.36, "Bumpy in places",                 "Some moderate patches. Expect the seatbelt sign; the crew will be expecting this too."],
  [0.48, "A rough patch or two",            "Firm jolts through the worst of it, with calm air either side."],
  [0.62, "A bumpy one, in stretches",       "Sustained moderate turbulence is likely. Uncomfortable, and well within what the aircraft handles routinely."],
  [9.99, "A bumpy flight is likely",        "The model flags strong conditions. Crews normally change level or route to avoid the worst, so the ride you get is often better than this."]
];

const calmBand   = b => CALM_BANDS[b.key] || CALM_BANDS[0];
const calmVerdict = felt => { for (const v of CALM_VERDICTS) if (felt < v[0]) return v; return CALM_VERDICTS[CALM_VERDICTS.length-1]; };

/* The two hooks the rest of the app calls. In normal mode they hand back the
   original strings, so there is exactly one code path either way. */
function feelText(b){ return CALM ? calmBand(b).feel  : b.feel; }
function cabinText(b){ return CALM ? calmBand(b).why  : b.cabin; }
function verdictWords(felt){ return CALM ? calmVerdict(felt) : verdictFor(felt); }

/* The standing explainer — shown only in calm mode, under the verdict. */
function calmPanelHTML(R){
  const w = R.worst;
  const b = w ? calmBand(w.band) : CALM_BANDS[0];
  return `
  <div class="calmbox">
    <h4>What this actually means</h4>
    <p><b>${w ? w.band.name : "Smooth"} — ${b.feel}</b> ${b.why}</p>
    <ul>
      <li><b>Turbulence is a comfort problem, not a structural one.</b> Airliner wings are
        tested to bend far past anything flight produces — in certification the wing is loaded
        to 150% of the highest force expected in service, and held there. Structural failure
        from turbulence in a modern airliner is not something that happens.</li>
      <li><b>Wing flex is the wing working.</b> A wing that moves is absorbing the load instead
        of resisting it, exactly as designed. A rigid wing would be the worrying one.</li>
      <li><b>The aircraft is not falling.</b> What feels like a drop is usually a few feet of
        altitude — the sensation comes from the rate of change, not the distance. The autopilot
        stays engaged through all of this.</li>
      <li><b>The crew saw this coming.</b> They get turbulence forecasts, reports from aircraft
        ahead on the same track, and radar. The seatbelt sign going on is that system working,
        not a surprise.</li>
      <li><b>Injuries come from not being belted.</b> Essentially every turbulence injury is
        someone unrestrained. A loose lap belt removes almost all of the risk this page
        describes.</li>
    </ul>
    <p class="calmfoot">Every number on this page is the same in this mode. Only the wording
      changes.</p>
  </div>`;
}

/* Toggle wiring. Preference persists, because someone who wants this mode wants
   it every time and should not have to find the switch again. */
function mountCalmToggle(){
  const host = document.querySelector(".mast");
  if (!host || $("#calmT")) return;
  const b = document.createElement("button");
  b.id = "calmT"; b.className = "calmt"; b.type = "button";
  b.setAttribute("aria-pressed", "false");
  b.innerHTML = `<span>Calm mode</span>`;
  b.title = "Same forecast, calmer wording, plus context on what turbulence does to an aircraft";
  host.appendChild(b);
  b.onclick = async () => {
    CALM = !CALM;
    b.setAttribute("aria-pressed", String(CALM));
    b.classList.toggle("on", CALM);
    document.body.classList.toggle("calm", CALM);
    try { await Native.remember("calm", CALM); } catch {}
    if (RES) paint();
  };
  (async () => {
    let saved = null;
    try { saved = await Native.recall("calm"); } catch {}
    if (saved){
      CALM = true;
      b.setAttribute("aria-pressed", "true");
      b.classList.add("on");
      document.body.classList.add("calm");
      if (RES) paint();
    }
  })();
}
