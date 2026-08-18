"use strict";
/* ══════════ IN-CABIN MOTION ═════════════════════════════════════════════
   Estimating turbulence from the phone in your hand, honestly.

   The physics: in the inertial subrange of a turbulent flow the velocity
   spectrum follows Kolmogorov's -5/3 law, and the acceleration a rigid body
   experiences inherits a spectral slope from it. Fitting that slope over a band
   where the law should hold is the standard way in-situ EDR is estimated from
   aircraft accelerometers (Cornman et al., 1995), and the fit quality doubles as
   a check that we are looking at turbulence rather than at somebody's footsteps.

   WHAT THIS CANNOT BE. A phone on a tray table measures the CABIN's response,
   not the atmosphere. Between the eddies outside and the glass under your palm
   sit the wing, the fuselage, the seat rails and the tray hinge — an unknown
   transfer function that differs by aircraft type, by loading, and by where in
   the cabin you are sitting. Converting that back to an atmospheric EDR would
   require the aircraft's frequency response, which we do not have and cannot
   guess. So this module reports a RELATIVE index and says so everywhere. It is
   comparable between flights only in the loose sense that a 60 is rougher than
   a 20; it is not an EDR and must never be labelled as one.

   Sampling. Phones deliver DeviceMotion at roughly 60 Hz, some at 100. Nyquist
   is therefore ~30 Hz, and the fit band stops well below it. Energy above
   Nyquist aliases down into the band rather than disappearing, which is one more
   reason the absolute level is untrustworthy while the slope is informative. */

const MOTION_HZ_MIN = 0.30;    // below this, aircraft manoeuvring dominates
const MOTION_HZ_MAX = 8.0;     // above this, phone/tray resonances take over
const MOTION_BIN_S  = 10;      // one observation per ten seconds

/* ─── FFT: iterative radix-2, in place, real input via complex arrays ─── */
function fftRadix2(re, im){
  const n = re.length;
  if (n & (n-1)) throw new Error("fft: length must be a power of two");
  for (let i=1, j=0; i<n; i++){
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j){ [re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]; }
  }
  for (let len=2; len<=n; len<<=1){
    const ang = -2*Math.PI/len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i=0; i<n; i+=len){
      let cr = 1, ci = 0;
      for (let k=0; k<len/2; k++){
        const ur = re[i+k],        ui = im[i+k];
        const vr = re[i+k+len/2]*cr - im[i+k+len/2]*ci;
        const vi = re[i+k+len/2]*ci + im[i+k+len/2]*cr;
        re[i+k]        = ur+vr; im[i+k]        = ui+vi;
        re[i+k+len/2]  = ur-vr; im[i+k+len/2]  = ui-vi;
        const ncr = cr*wr - ci*wi;
        ci = cr*wi + ci*wr; cr = ncr;
      }
    }
  }
}

const hann = n => Array.from({length:n}, (_,i) => 0.5*(1 - Math.cos(2*Math.PI*i/(n-1))));

/* Welch's method: overlapping Hann-windowed segments, periodograms averaged.
   Returns one-sided PSD in units²/Hz against frequency in Hz. */
function welchPSD(samples, fs, segLen){
  const n = samples.length;
  let L = segLen || 1 << Math.floor(Math.log2(Math.max(16, n/4)));
  while (L > n) L >>= 1;
  if (L < 16) return null;
  const step = L >> 1;                       // 50% overlap
  const win = hann(L);
  const winPow = win.reduce((s,w) => s + w*w, 0);
  const bins = L>>1;
  const acc = new Float64Array(bins);
  let segs = 0;

  for (let start=0; start + L <= n; start += step){
    let mean = 0;
    for (let i=0;i<L;i++) mean += samples[start+i];
    mean /= L;
    const re = new Float64Array(L), im = new Float64Array(L);
    for (let i=0;i<L;i++) re[i] = (samples[start+i]-mean)*win[i];
    fftRadix2(re, im);
    for (let k=1;k<bins;k++) acc[k] += (re[k]*re[k] + im[k]*im[k]);
    segs++;
  }
  if (!segs) return null;
  const freq = new Float64Array(bins), psd = new Float64Array(bins);
  const norm = 2/(fs*winPow*segs);           // one-sided, window-compensated
  for (let k=1;k<bins;k++){ freq[k] = k*fs/L; psd[k] = acc[k]*norm; }
  return { freq, psd, bins, segs, segLen: L };
}

/* Least-squares slope of log10(PSD) against log10(f) across the fit band.
   Kolmogorov gives -5/3 for the velocity spectrum; the acceleration spectrum a
   body sees in that subrange carries the same power-law character, so a slope
   near -5/3 is the signature we are looking for. Returns the slope, the
   coefficient of determination, and the number of bins used. */
function spectralSlope(freq, psd, fLo, fHi){
  const xs = [], ys = [];
  for (let k=0;k<freq.length;k++){
    const f = freq[k];
    if (f < fLo || f > fHi) continue;
    if (!(psd[k] > 0)) continue;
    xs.push(Math.log10(f)); ys.push(Math.log10(psd[k]));
  }
  const n = xs.length;
  if (n < 6) return { slope:null, r2:0, n };
  const mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n;
  let sxy=0, sxx=0, syy=0;
  for (let i=0;i<n;i++){ const dx=xs[i]-mx, dy=ys[i]-my; sxy+=dx*dy; sxx+=dx*dx; syy+=dy*dy; }
  if (sxx === 0) return { slope:null, r2:0, n };
  const slope = sxy/sxx;
  const r2 = syy === 0 ? 0 : (sxy*sxy)/(sxx*syy);
  return { slope, r2, n, intercept: my - slope*mx };
}

/* Band-limited RMS acceleration — the amplitude half of the picture, in m/s².
   Integrating the PSD over the band is Parseval's theorem and is far more
   robust than a raw time-domain RMS, which would be dominated by whatever
   low-frequency drift the phone's sensor fusion is doing. */
function bandRMS(freq, psd, fLo, fHi){
  let sum = 0, df = freq[1] - freq[0];
  for (let k=0;k<freq.length;k++){
    if (freq[k] < fLo || freq[k] > fHi) continue;
    sum += psd[k]*df;
  }
  return Math.sqrt(Math.max(0, sum));
}

/* Was the phone being held, tapped or picked up during this window?

   These are the dominant false positives and none of them look like turbulence:
   a pickup is a large low-frequency excursion plus a change in which way gravity
   points; a tap is a broadband impulse; walking is a strong 1.5-2.5 Hz peak.
   Windows that fail any of these are discarded rather than down-weighted,
   because a contaminated sample is worse than a missing one. */
function windowQuality(w){
  const { az, gx, gy, gz, fs } = w;
  const reasons = [];

  /* 1. gravity direction must stay put — a flat phone reads ~9.81 on one axis */
  if (gx && gx.length){
    const tilt = gx.map((_,i) => Math.atan2(Math.hypot(gx[i], gy[i]), Math.abs(gz[i])));
    const tMin = Math.min(...tilt), tMax = Math.max(...tilt);
    if (deg(tMax - tMin) > 12) reasons.push("moved");
  }
  /* 2. Excursions beyond anything the air can do. Severe turbulence genuinely
     reaches about +/-1 g in the cabin, so this gate sits at 1.5 g: set any lower
     and the filter throws away precisely the observations worth having. A first
     cut used 0.6 g and silently discarded a synthetic severe window as
     "handled". Picking the phone up is caught by the tilt test above, and
     tapping by the crest factor below — neither needs a low amplitude gate. */
  const peak = Math.max(...az.map(Math.abs));
  if (peak > 15) reasons.push("handled");
  /* 3. crest factor catches taps: an impulse has a high peak against its RMS */
  const rms = Math.sqrt(az.reduce((s,v)=>s+v*v,0)/az.length);
  if (rms > 0 && peak/rms > 9) reasons.push("tapped");
  /* 4. a strong narrow peak in the walking band is footsteps, not weather */
  const p = welchPSD(az, fs);
  if (p){
    const walk = bandRMS(p.freq, p.psd, 1.4, 2.6);
    const wide = bandRMS(p.freq, p.psd, MOTION_HZ_MIN, MOTION_HZ_MAX);
    if (wide > 0 && walk/wide > 0.72) reasons.push("footsteps");
  }
  return { ok: reasons.length === 0, reasons, rms, peak };
}

/* Turn one window of vertical acceleration into an observation.

   The index is deliberately NOT an EDR. It is a log-scaled map of band-limited
   RMS cabin acceleration onto 0-100, anchored so that the values a passenger
   would call smooth, noticeable and rough land near 10, 40 and 70. The anchors
   come from the amplitude ranges quoted for cabin response in the literature,
   not from a calibration against this app's forecast — calibrating the
   observation against the thing it is meant to check would defeat the point. */
const MOTION_ANCHOR_LO = 0.02;   // m/s² band-limited RMS: imperceptible
const MOTION_ANCHOR_HI = 2.0;    // m/s²: firmly rough

function motionIndex(rms){
  if (!(rms > 0)) return 0;
  const t = (Math.log10(rms) - Math.log10(MOTION_ANCHOR_LO)) /
            (Math.log10(MOTION_ANCHOR_HI) - Math.log10(MOTION_ANCHOR_LO));
  return Math.round(clamp(t, 0, 1) * 100);
}

function analyseWindow(w){
  const q = windowQuality(w);
  if (!q.ok) return { ok:false, reasons:q.reasons };
  const p = welchPSD(w.az, w.fs);
  if (!p) return { ok:false, reasons:["too short"] };
  const nyq = w.fs/2;
  const fHi = Math.min(MOTION_HZ_MAX, nyq*0.8);
  const s = spectralSlope(p.freq, p.psd, MOTION_HZ_MIN, fHi);
  const rms = bandRMS(p.freq, p.psd, MOTION_HZ_MIN, fHi);
  /* How well the band actually follows a power law. A clean -5/3 with a good
     fit is turbulence; a flat or erratic spectrum is something else, and the
     UI shows this rather than hiding it. */
  const kolm = s.slope === null ? 0
             : clamp(1 - Math.abs(s.slope - (-5/3))/1.5, 0, 1) * s.r2;
  return {
    ok: true, fs: w.fs, n: w.az.length,
    slope: s.slope, r2: s.r2, bins: s.n,
    rms, index: motionIndex(rms), kolmogorov: kolm,
    nyquist: nyq, fitHi: fHi,
  };
}
