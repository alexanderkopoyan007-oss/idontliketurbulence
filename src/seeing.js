"use strict";
/* ══════════ ASTRONOMICAL SEEING ═════════════════════════════════════════
   Seeing is caused by the same thing this app already forecasts for aircraft:
   wind shear in the upper troposphere near the jet stream. Optical turbulence
   and clear-air turbulence are two consequences of one mechanism, so the engine
   points at a fixed location instead of a flight path and the same shear and
   stability fields come back out as arcseconds instead of EDR.

   THE CHAIN
   ---------
   Refractive-index structure constant Cn²(h) → integrate over the column → the
   Fried parameter r0 → seeing FWHM.

     r0    = (0.423 · k² · ∫Cn² dh)^(−3/5),   k = 2π/λ
     FWHM  = 0.98 · λ / r0                    (radians)

   Cn²(h) uses the Hufnagel-Valley functional form, but driven by the actual
   forecast wind rather than HV's fixed climatological profile:

     Cn²(h) = 0.00594·(v/27)²·(10⁻⁵h)^10·e^(−h/1000)     upper, wind-driven
            + 2.7e−16·e^(−h/1500)                        mid troposphere
            + A·e^(−h/100)                               ground layer

   where v is the Bufton wind — the RMS wind speed between 5 and 20 km — computed
   here from the forecast pressure-level winds. That is what makes this a forecast
   rather than a climatology: when the jet is overhead, v rises, the upper term
   rises as v², and the seeing degrades.

   Each layer is additionally weighted by its local vertical wind shear relative
   to a reference shear, since optical turbulence is generated where the flow is
   shearing (Tatarski). This is a heuristic scaling, not a first-principles
   derivation, and the panel says so.

   WHAT THIS CANNOT KNOW — stated because it is the dominant term at most sites
   -------------------------------------------------------------------------
   The ground layer, the first few tens of metres, usually contributes MORE than
   the whole free atmosphere above it, and it depends on the ground you are
   standing on: a rooftop, a car park, a grass field and a mountain ridge behave
   completely differently and none of it is resolved by a 25 km model grid. So
   this page reports FREE-ATMOSPHERE seeing — the part that genuinely varies from
   night to night with the jet — and states an assumed ground term separately
   rather than pretending to predict what your own back garden is doing. */

const SEE = {
  LAMBDA: 500e-9,          // metres, V band
  ARCSEC: 206264.806,      // radians → arcseconds
  GROUND_A: 1.7e-14,       // HV5/7 ground-layer coefficient, m^(-2/3)
  FREE_FLOOR: 1000,        // integrate the "free atmosphere" above this height, m
  TOP: 25000,              // integration ceiling, m
  REF_SHEAR: 0.004,        // reference vertical shear, s^-1 (~4 m/s per km)
};

/* Bufton wind: RMS wind speed through the 5–20 km slab, the quantity the
   Hufnagel-Valley upper term is defined against. */
function buftonWind(levels){
  let sum = 0, span = 0;
  for (let k = 0; k < levels.length - 1; k++){
    const a = levels[k], b = levels[k+1];
    if (!a || !b) continue;
    const z0 = Math.max(a.z, 5000), z1 = Math.min(b.z, 20000);
    if (z1 <= z0) continue;
    /* Interpolate the wind to the clamped bounds. Using the raw level speeds
       would let a level outside the slab contribute to a segment that only
       partly overlaps it — a 200 m/s surface wind leaking into the 5 km edge. */
    const dz = b.z - a.z;
    const at = z => dz > 0 ? a.spd + (b.spd - a.spd)*((z - a.z)/dz) : a.spd;
    const s0 = at(z0), s1 = at(z1);
    sum += (s0*s0 + s1*s1)/2*(z1 - z0);      // trapezoidal integral of V²
    span += (z1 - z0);
  }
  return span > 0 ? Math.sqrt(sum/span) : 0;
}

/* Local vertical wind shear at height h, interpolated from the level stack. */
function shearAt(levels, h){
  for (let k = 0; k < levels.length - 1; k++){
    const a = levels[k], b = levels[k+1];
    if (!a || !b) continue;
    if (h >= a.z && h <= b.z){
      const dz = b.z - a.z;
      if (!(dz > 1)) continue;
      return Math.hypot(b.u - a.u, b.v - a.v)/dz;
    }
  }
  return null;
}

/** Cn² at height h (metres above sea level), m^(-2/3). */
function cn2At(h, v, levels, groundA){
  const upper = 0.00594*Math.pow(v/27, 2)*Math.pow(1e-5*h, 10)*Math.exp(-h/1000);
  const mid   = 2.7e-16*Math.exp(-h/1500);
  const grd   = groundA*Math.exp(-h/100);
  /* Shear weighting: layers shearing harder than the reference generate more
     optical turbulence. Bounded so a single noisy level cannot dominate. */
  const s = shearAt(levels, h);
  const w = s === null ? 1 : clamp(Math.pow(s/SEE.REF_SHEAR, 2/3), 0.5, 2.5);
  return (upper + mid)*w + grd;
}

/**
 * @param {Array} levels  profileAt() output for the site (z, u, v, spd, theta)
 * @param {number} siteElevM
 * @returns {{seeingFree:number, seeingTotal:number, r0Free:number, bufton:number, mu:number}}
 */
function seeingFrom(levels, siteElevM = 0){
  const usable = levels.filter(Boolean);
  if (usable.length < 4) return null;
  const v = buftonWind(usable);

  const k = 2*Math.PI/SEE.LAMBDA;
  /* Trapezoidal integration of Cn² in 50 m steps. Fine enough that the ground
     term's 100 m scale height is resolved. */
  const step = 50;
  let muFree = 0, muTotal = 0;
  for (let h = siteElevM; h < SEE.TOP; h += step){
    const c0 = cn2At(h, v, usable, SEE.GROUND_A);
    const c1 = cn2At(h + step, v, usable, SEE.GROUND_A);
    const seg = (c0 + c1)/2*step;
    muTotal += seg;
    if (h >= siteElevM + SEE.FREE_FLOOR) muFree += seg;
  }
  const r0 = mu => Math.pow(0.423*k*k*mu, -3/5);
  const fwhm = r0v => 0.98*SEE.LAMBDA/r0v*SEE.ARCSEC;

  return {
    bufton: v,
    muFree, muTotal,
    r0Free:  r0(muFree),
    r0Total: r0(muTotal),
    seeingFree:  fwhm(r0(muFree)),
    seeingTotal: fwhm(r0(muTotal)),
  };
}

/* Qualitative bands, matching how observers actually talk about a night. */
const SEEING_BANDS = [
  { max:0.7, name:"Excellent", col:"#1FC8B4", say:"planetary detail holds steady; high magnification is worth it" },
  { max:1.0, name:"Good",      col:"#9BD93F", say:"crisp for most targets, occasional soft moments" },
  { max:1.5, name:"Average",   col:"#FFC93C", say:"usable. Deep-sky is fine; planets will boil at high power" },
  { max:2.5, name:"Poor",      col:"#FF8A3D", say:"soft. Stick to low power and large targets" },
  { max:99,  name:"Very poor", col:"#F04A63", say:"the atmosphere is doing the observing tonight, not you" },
];
const seeingBand = a => SEEING_BANDS.find(b => a < b.max) || SEEING_BANDS[SEEING_BANDS.length-1];

/* Transparency from layered cloud plus precipitable water. Cloud dominates
   utterly — no amount of dry air rescues an overcast sky. */
function transparency(cloudLow, cloudMid, cloudHigh, pwvMm){
  const c = [cloudLow, cloudMid, cloudHigh].map(x => (x == null ? null : clamp(x/100, 0, 1)));
  if (c.some(x => x === null)) return null;
  /* High cirrus is the observer's real enemy per unit coverage: it is thin
     enough to look clear and still kills contrast. */
  const blocked = 1 - (1 - c[0])*(1 - c[1])*(1 - 0.85*c[2]);
  let score = (1 - blocked)*100;
  if (pwvMm != null) score *= clamp(1 - (pwvMm - 5)/60, 0.55, 1);   // damp for humid columns
  return { blocked: blocked*100, score: clamp(score, 0, 100), pwv: pwvMm };
}
