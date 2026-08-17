"use strict";
/* ══════════════════════════════════════════════════════════════════════════
   RIDE REPORT — pre-flight turbulence briefing
   Forecast engine: Open-Meteo pressure-level output (GFS 0.25° + ECMWF IFS 0.25°)
   Diagnostics: Ellrod TI1/TI2, vertical wind shear, gradient Richardson number,
                mountain-wave proxy, convective proxy → blended EDR estimate.
   ══════════════════════════════════════════════════════════════════════════ */

/* ─── 1. reference data ─────────────────────────────────────────────────── */
const APORTS = [], BY_IATA = new Map(), BY_ICAO = new Map();
AP_RAW.split("\n").forEach(l => {
  const p = l.split("|");
  if (p.length < 10) return;
  const a = { iata:p[0], icao:p[1], name:p[2], city:p[3], cc:p[4],
              lat:+p[5], lon:+p[6], elev:+p[7], tz:TZ[+p[8]] || "UTC", rank:+p[9] };
  a.label = a.city ? `${a.name}, ${a.city}` : a.name;
  a.search = (a.iata + " " + a.icao + " " + a.name + " " + a.city + " " + a.cc).toLowerCase();
  APORTS.push(a); BY_IATA.set(a.iata, a); if (a.icao) BY_ICAO.set(a.icao, a);
});
const AIRLINES = new Map();
AL_RAW.split("\n").forEach(l => { const p = l.split("|"); if (p.length===3) AIRLINES.set(p[0], {icao:p[1], name:p[2]}); });

const COUNTRY = {US:"United States",GB:"United Kingdom",IT:"Italy",FR:"France",DE:"Germany",ES:"Spain",NL:"Netherlands",
 CH:"Switzerland",AT:"Austria",BE:"Belgium",PT:"Portugal",GR:"Greece",IE:"Ireland",DK:"Denmark",SE:"Sweden",NO:"Norway",
 FI:"Finland",PL:"Poland",CZ:"Czechia",HU:"Hungary",RO:"Romania",TR:"Türkiye",RU:"Russia",UA:"Ukraine",CA:"Canada",
 MX:"Mexico",BR:"Brazil",AR:"Argentina",CL:"Chile",CO:"Colombia",PE:"Peru",JP:"Japan",CN:"China",HK:"Hong Kong",
 KR:"South Korea",TW:"Taiwan",SG:"Singapore",MY:"Malaysia",TH:"Thailand",VN:"Vietnam",PH:"Philippines",ID:"Indonesia",
 IN:"India",PK:"Pakistan",AE:"UAE",QA:"Qatar",SA:"Saudi Arabia",IL:"Israel",EG:"Egypt",ZA:"South Africa",KE:"Kenya",
 MA:"Morocco",NG:"Nigeria",ET:"Ethiopia",AU:"Australia",NZ:"New Zealand",IS:"Iceland",HR:"Croatia",RS:"Serbia"};
const cName = c => COUNTRY[c] || c;

/* ─── 2. geodesy ────────────────────────────────────────────────────────── */
const R_E = 6371008.8, D2R = Math.PI/180, R2D = 180/Math.PI;
const rad = d => d*D2R, deg = r => r*R2D;
const clamp = (v,a,b) => v<a?a:v>b?b:v;
const lerp = (a,b,t) => a + (b-a)*t;

function distance(a, b){                       // great-circle metres (haversine)
  const p1=rad(a.lat), p2=rad(b.lat), dp=rad(b.lat-a.lat), dl=rad(b.lon-a.lon);
  const h = Math.sin(dp/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2*R_E*Math.asin(Math.min(1, Math.sqrt(h)));
}
function bearing(a, b){                        // initial true course, degrees
  const p1=rad(a.lat), p2=rad(b.lat), dl=rad(b.lon-a.lon);
  const y = Math.sin(dl)*Math.cos(p2);
  const x = Math.cos(p1)*Math.sin(p2) - Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return (deg(Math.atan2(y,x)) + 360) % 360;
}
function destPoint(p, brgDeg, distM){          // move distM along bearing
  const d = distM/R_E, th = rad(brgDeg), p1 = rad(p.lat), l1 = rad(p.lon);
  const p2 = Math.asin(Math.sin(p1)*Math.cos(d) + Math.cos(p1)*Math.sin(d)*Math.cos(th));
  const l2 = l1 + Math.atan2(Math.sin(th)*Math.sin(d)*Math.cos(p1), Math.cos(d) - Math.sin(p1)*Math.sin(p2));
  return { lat: deg(p2), lon: ((deg(l2)+540)%360)-180 };
}
function interp(a, b, f){                      // point at fraction f along great circle
  const d = distance(a,b)/R_E;
  if (d < 1e-9) return {lat:a.lat, lon:a.lon};
  const A = Math.sin((1-f)*d)/Math.sin(d), B = Math.sin(f*d)/Math.sin(d);
  const p1=rad(a.lat), l1=rad(a.lon), p2=rad(b.lat), l2=rad(b.lon);
  const x = A*Math.cos(p1)*Math.cos(l1) + B*Math.cos(p2)*Math.cos(l2);
  const y = A*Math.cos(p1)*Math.sin(l1) + B*Math.cos(p2)*Math.sin(l2);
  const z = A*Math.sin(p1) + B*Math.sin(p2);
  return { lat: deg(Math.atan2(z, Math.hypot(x,y))), lon: deg(Math.atan2(y,x)) };
}
const NM = 1852, FT = 0.3048;

/* ─── 3. standard atmosphere & pressure levels ──────────────────────────── */
/* Pressure levels requested from the models and their ISA altitude, in feet. */
const LEVELS = [
  {p:850, fl: 48}, {p:700, fl:100}, {p:600, fl:140}, {p:500, fl:185},
  {p:400, fl:235}, {p:300, fl:304}, {p:250, fl:341}, {p:200, fl:385},
  {p:150, fl:445}, {p:100, fl:531}
];
const CRUISE_LEVELS = LEVELS.filter(l => l.fl >= 140);
const KAPPA = 0.2857, G = 9.80665;

/* ─── 4. EDR scale ──────────────────────────────────────────────────────── */
/* Eddy Dissipation Rate, m^(2/3)/s — the ICAO standard turbulence metric.
   Bands follow the widely used EDR intensity categories for a medium jet. */
/* `say` is the short gloss used in tables. `feel` describes what your body
   actually registers, `cabin` what you would see happening around you — the
   two questions everyone is really asking when they open an app like this. */
const BANDS = [
  {min:0.00, key:0, name:"Smooth",      short:"Smooth",  col:"#1FC8B4", say:"barely a ripple",
   feel:"nothing you would notice. The surface of a drink stays flat and you could write neatly.",
   cabin:"service runs normally; the seatbelt sign is off unless the crew are being cautious."},
  {min:0.08, key:1, name:"Light chop",  short:"Chop",    col:"#9BD93F", say:"a light, steady jiggle",
   feel:"a continuous fine vibration, like a car on coarse tarmac. Rhythmic rather than sudden, and easy to read or sleep through.",
   cabin:"nothing changes. Carts stay out, coffee stays in the cup."},
  {min:0.16, key:2, name:"Light",       short:"Light",   col:"#FFC93C", say:"noticeable bumps, drinks stay put",
   feel:"distinct individual bumps with quiet air between them. You feel the seat move under you but stay firmly in it.",
   cabin:"the seatbelt sign usually comes on. Crew keep working; drinks ripple but do not spill."},
  {min:0.26, key:3, name:"Moderate",    short:"Moderate",col:"#FF8A3D", say:"firm jolts, seatbelt sign on",
   feel:"firm, definite jolts. You are pushed into the belt and then back into the seat; loose items shift and walking is awkward.",
   cabin:"seatbelt sign on, service normally paused, crew seated. This is the level most passengers call “bad turbulence”."},
  {min:0.40, key:4, name:"Strong",      short:"Strong",  col:"#F04A63", say:"sharp jolts, service stops",
   feel:"sharp, abrupt changes. Unsecured objects leave the tray table and the aircraft attitude visibly changes.",
   cabin:"service stopped and crew seated. Crews normally request a level or heading change rather than sit in it."},
  {min:0.58, key:5, name:"Severe",      short:"Severe",  col:"#C766FF", say:"large abrupt changes — rare",
   feel:"violent, large changes in altitude and attitude; the aircraft is momentarily hard to control in the vertical sense.",
   cabin:"genuinely rare — most career pilots see it a handful of times. Forecast severe is very often moderate in reality."}
];
function band(edr){ let b = BANDS[0]; for (const x of BANDS) if (edr >= x.min) b = x; return b; }
function bandCol(edr){ return band(edr).col; }
/* smooth colour ramp between band anchors, for the tape and cross-section */
function hex2rgb(h){ return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]; }
const RAMP = [[0.00,"#0E1B2B"],[0.05,"#12695F"],[0.11,"#1FC8B4"],[0.18,"#9BD93F"],[0.24,"#FFC93C"],
              [0.33,"#FF8A3D"],[0.46,"#F04A63"],[0.62,"#C766FF"],[0.85,"#F2D9FF"]].map(([s,c])=>[s,hex2rgb(c)]);
function rampCol(edr){
  const v = clamp(edr, 0, 0.85);
  for (let i=0;i<RAMP.length-1;i++){
    const [s0,c0] = RAMP[i], [s1,c1] = RAMP[i+1];
    if (v <= s1){
      const t = (v - s0) / (s1 - s0 || 1);
      return `rgb(${Math.round(lerp(c0[0],c1[0],t))},${Math.round(lerp(c0[1],c1[1],t))},${Math.round(lerp(c0[2],c1[2],t))})`;
    }
  }
  return "#F2D9FF";
}
/* Aircraft sensitivity. EDR itself is aircraft-independent; what a passenger feels
   is not. Lower wing loading + lower mass = more response to the same eddies. */
const ACFT = {
  jumbo:   {f:0.80, label:"A380 / 747"},
  wide:    {f:0.88, label:"widebody"},
  narrow:  {f:1.00, label:"narrowbody"},
  regional:{f:1.18, label:"regional jet"},
  bizjet:  {f:1.30, label:"light jet"}
};

/* ─── 5. formatting ─────────────────────────────────────────────────────── */
const pad2 = n => String(n).padStart(2,"0");
const hhmmUTC = d => `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}Z`;
function localTime(d, tz){
  try { return new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:tz,hour12:false}).format(d); }
  catch { return hhmmUTC(d); }
}
function tzOffsetMin(tz, date){
  try{
    const f = new Intl.DateTimeFormat("en-US",{timeZone:tz,hour12:false,year:"numeric",month:"2-digit",
      day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const p = {}; for (const x of f.formatToParts(date)) p[x.type] = x.value;
    const asUTC = Date.UTC(+p.year, +p.month-1, +p.day, +p.hour%24, +p.minute, +p.second);
    return Math.round((asUTC - date.getTime())/60000);
  } catch { return 0; }
}
const fmtDur = m => `${Math.floor(m/60)}h ${pad2(Math.round(m%60))}m`;
const fmtFL  = ft => ft < 10000 ? Math.round(ft/100)*100 === 0 ? "on the ground"
                     : (Math.round(ft/500)*500).toLocaleString() + " ft"
                     : "FL" + Math.round(ft/100);
const kt     = ms => Math.round(ms*1.94384);
const dateISO = d => `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`;
const hourISO = d => `${dateISO(d)}T${pad2(d.getUTCHours())}:00`;
const $ = s => document.querySelector(s);
