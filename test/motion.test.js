import { describe, it, expect, beforeAll } from "vitest";
import { load } from "./harness.js";

let M;
beforeAll(() => {
  M = load(
    ["src/data/airports.js","src/data/airlines.js","src/data/features.js",
     "src/core.js","src/engine.js","src/motion.js"],
    ["fftRadix2","welchPSD","spectralSlope","bandRMS","windowQuality","motionIndex",
     "analyseWindow","MOTION_HZ_MIN","MOTION_HZ_MAX","MOTION_ANCHOR_LO","MOTION_ANCHOR_HI"]
  );
});

/* A reproducible generator, so a failure is a real failure and not a bad seed. */
function rng(seed){
  let s = seed >>> 0;
  return () => { s ^= s<<13; s>>>=0; s ^= s>>17; s ^= s<<5; s>>>=0; return s/4294967296; };
}
function gauss(r){
  let u=0, v=0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}

/* Synthesise a signal whose one-sided PSD follows f^exponent by summing
   sinusoids with the right amplitudes and random phases. For a PSD S(f) ~ f^b,
   a component at f gets amplitude sqrt(2·S(f)·df). */
function powerLawSignal({ n, fs, exponent, scale = 1, seed = 12345, fLo = 0.2, fHi = null }){
  const r = rng(seed);
  const hi = fHi || fs/2*0.9;
  const out = new Float64Array(n);
  const df = fs/n;
  for (let f = fLo; f <= hi; f += df){
    const amp = scale*Math.sqrt(2*Math.pow(f, exponent)*df);
    const ph  = r()*2*Math.PI;
    const w = 2*Math.PI*f/fs;
    for (let i=0;i<n;i++) out[i] += amp*Math.cos(w*i + ph);
  }
  return out;
}
const flat = (n, fs, sigma, seed=7) => {
  const r = rng(seed); const o = new Float64Array(n);
  for (let i=0;i<n;i++) o[i] = sigma*gauss(r);
  return o;
};

describe("FFT", () => {
  it("recovers a pure tone in the right bin", () => {
    const n = 256, fs = 64, f0 = 8;
    const re = new Float64Array(n), im = new Float64Array(n);
    for (let i=0;i<n;i++) re[i] = Math.cos(2*Math.PI*f0*i/fs);
    M.fftRadix2(re, im);
    let peak = 1, best = 0;
    for (let k=1;k<n/2;k++){ const m = Math.hypot(re[k], im[k]); if (m > best){ best = m; peak = k; } }
    expect(peak*fs/n).toBeCloseTo(f0, 6);
  });
  it("rejects non-power-of-two lengths rather than returning nonsense", () => {
    expect(() => M.fftRadix2(new Float64Array(100), new Float64Array(100))).toThrow(/power of two/);
  });
  it("satisfies Parseval within rounding", () => {
    const n = 512; const re = new Float64Array(n), im = new Float64Array(n);
    const r = rng(3); for (let i=0;i<n;i++) re[i] = gauss(r);
    const timeE = re.reduce((s,v)=>s+v*v, 0);
    M.fftRadix2(re, im);
    let freqE = 0; for (let k=0;k<n;k++) freqE += re[k]*re[k] + im[k]*im[k];
    expect(freqE/n).toBeCloseTo(timeE, 6);
  });
});

describe("welchPSD", () => {
  it("puts white noise at a flat level matching its variance", () => {
    const fs = 64, n = 8192, sigma = 0.5;
    const p = M.welchPSD(flat(n, fs, sigma), fs);
    expect(p).toBeTruthy();
    // one-sided white PSD = 2·σ²/fs
    const expected = 2*sigma*sigma/fs;
    const mid = [];
    for (let k=0;k<p.bins;k++) if (p.freq[k] > 5 && p.freq[k] < 25) mid.push(p.psd[k]);
    const mean = mid.reduce((a,b)=>a+b,0)/mid.length;
    expect(mean).toBeGreaterThan(expected*0.7);
    expect(mean).toBeLessThan(expected*1.4);
  });
  it("returns null for a segment too short to transform", () => {
    expect(M.welchPSD(new Float64Array(8), 64)).toBeNull();
  });
  it("recovers band-limited RMS via Parseval", () => {
    const fs = 64, n = 8192, sigma = 0.4;
    const sig = flat(n, fs, sigma);
    const p = M.welchPSD(sig, fs);
    const rms = M.bandRMS(p.freq, p.psd, 0.5, 30);
    // most of a white signal's power lies in that band
    expect(rms).toBeGreaterThan(sigma*0.7);
    expect(rms).toBeLessThan(sigma*1.2);
  });
});

describe("spectralSlope — the -5/3 test", () => {
  it("recovers a -5/3 slope from a synthetic Kolmogorov spectrum", () => {
    const fs = 64, n = 16384;
    const sig = powerLawSignal({ n, fs, exponent: -5/3, seed: 99 });
    const p = M.welchPSD(sig, fs);
    const s = M.spectralSlope(p.freq, p.psd, 0.3, 8);
    expect(s.slope).toBeGreaterThan(-2.0);
    expect(s.slope).toBeLessThan(-1.35);
    expect(s.r2).toBeGreaterThan(0.8);
  });
  it("recovers a flat slope from white noise, and does not claim -5/3", () => {
    const fs = 64, n = 16384;
    const p = M.welchPSD(flat(n, fs, 0.3, 21), fs);
    const s = M.spectralSlope(p.freq, p.psd, 0.3, 8);
    expect(Math.abs(s.slope)).toBeLessThan(0.5);
  });
  it("recovers other exponents too, so it is fitting rather than guessing", () => {
    const fs = 64, n = 16384;
    for (const b of [-1, -2, -3]){
      const p = M.welchPSD(powerLawSignal({ n, fs, exponent:b, seed:5 }), fs);
      const s = M.spectralSlope(p.freq, p.psd, 0.3, 8);
      expect(s.slope).toBeGreaterThan(b - 0.45);
      expect(s.slope).toBeLessThan(b + 0.45);
    }
  });
  it("reports low confidence when too few bins fall in the band", () => {
    const fs = 64, n = 128;
    const p = M.welchPSD(flat(n, fs, 0.3), fs);
    const s = M.spectralSlope(p.freq, p.psd, 0.3, 0.35);
    expect(s.slope).toBeNull();
    expect(s.r2).toBe(0);
  });
});

describe("motionIndex", () => {
  it("is 0 for silence and 100 at the top anchor", () => {
    expect(M.motionIndex(0)).toBe(0);
    expect(M.motionIndex(M.MOTION_ANCHOR_HI)).toBe(100);
  });
  it("is monotonic in amplitude", () => {
    let prev = -1;
    for (let r=0.005; r<4; r*=1.3){ const v = M.motionIndex(r); expect(v).toBeGreaterThanOrEqual(prev); prev = v; }
  });
  it("is logarithmic, so a tenfold rise is a fixed step", () => {
    const a = M.motionIndex(0.02), b = M.motionIndex(0.2), c = M.motionIndex(2.0);
    expect(b - a).toBeCloseTo(c - b, 0);
  });
  it("clamps rather than exceeding 100 on violent input", () => {
    expect(M.motionIndex(50)).toBe(100);
  });
});

describe("windowQuality — rejecting what is not turbulence", () => {
  const fs = 60, n = 1024;
  const level = () => ({ gx:new Array(n).fill(0), gy:new Array(n).fill(0), gz:new Array(n).fill(9.81), fs });

  it("accepts a quiet, flat, power-law window", () => {
    const az = powerLawSignal({ n, fs, exponent:-5/3, scale:0.05, seed:4 });
    expect(M.windowQuality({ az, ...level() }).ok).toBe(true);
  });
  it("rejects a window where the phone was picked up and tilted", () => {
    const az = powerLawSignal({ n, fs, exponent:-5/3, scale:0.05, seed:4 });
    const gx = new Array(n).fill(0).map((_,i)=> i > n/2 ? 5 : 0);
    const gy = new Array(n).fill(0), gz = new Array(n).fill(9.81);
    const q = M.windowQuality({ az, gx, gy, gz, fs });
    expect(q.ok).toBe(false);
    expect(q.reasons).toContain("moved");
  });
  it("rejects an excursion beyond anything the air produces", () => {
    const az = powerLawSignal({ n, fs, exponent:-5/3, scale:0.05, seed:4 });
    az[500] = 25;                        // 2.5 g — dropped, not flown
    const q = M.windowQuality({ az, ...level() });
    expect(q.ok).toBe(false);
    expect(q.reasons).toContain("handled");
  });
  it("rejects a sharp mid-size spike as an impulse rather than weather", () => {
    // 12 m/s2 sits under the 1.5 g gate but its crest factor gives it away.
    const az = powerLawSignal({ n, fs, exponent:-5/3, scale:0.05, seed:4 });
    az[500] = 12;
    const q = M.windowQuality({ az, ...level() });
    expect(q.ok).toBe(false);
    expect(q.reasons).toContain("tapped");
  });
  it("rejects a tap by its crest factor", () => {
    const az = new Float64Array(n);
    const r = rng(11); for (let i=0;i<n;i++) az[i] = 0.01*gauss(r);
    az[300] = 1.2;                       // sharp impulse, well under the 6 m/s2 gate
    const q = M.windowQuality({ az, ...level() });
    expect(q.ok).toBe(false);
    expect(q.reasons).toContain("tapped");
  });
  it("rejects footsteps by their narrow 2 Hz peak", () => {
    const az = new Float64Array(n);
    for (let i=0;i<n;i++) az[i] = 0.4*Math.sin(2*Math.PI*2.0*i/fs);
    const q = M.windowQuality({ az, ...level() });
    expect(q.ok).toBe(false);
    expect(q.reasons).toContain("footsteps");
  });
});

describe("analyseWindow — end to end", () => {
  const fs = 60, n = 2048;
  const level = () => ({ gx:new Array(n).fill(0), gy:new Array(n).fill(0), gz:new Array(n).fill(9.81), fs });

  it("scores a Kolmogorov window and flags it as such", () => {
    const az = powerLawSignal({ n, fs, exponent:-5/3, scale:0.08, seed:31 });
    const a = M.analyseWindow({ az, ...level() });
    expect(a.ok).toBe(true);
    expect(a.slope).toBeLessThan(-1.2);
    expect(a.kolmogorov).toBeGreaterThan(0.4);
    expect(a.index).toBeGreaterThan(0);
  });

  it("gives white noise a low Kolmogorov score even when it is loud", () => {
    const a = M.analyseWindow({ az: flat(n, fs, 0.5, 8), ...level() });
    expect(a.ok).toBe(true);
    expect(a.kolmogorov).toBeLessThan(0.35);   // loud, but not turbulence-shaped
    expect(a.index).toBeGreaterThan(20);
  });

  it("keeps the fit band below Nyquist whatever the sample rate", () => {
    for (const rate of [20, 30, 60, 100]){
      const m = 2048;
      const az = powerLawSignal({ n:m, fs:rate, exponent:-5/3, scale:0.05, seed:2 });
      const a = M.analyseWindow({ az, gx:new Array(m).fill(0), gy:new Array(m).fill(0),
                                  gz:new Array(m).fill(9.81), fs:rate });
      expect(a.fitHi).toBeLessThanOrEqual(rate/2*0.8 + 1e-9);
      expect(a.nyquist).toBeCloseTo(rate/2, 9);
    }
  });

  it("rises monotonically with amplitude at a fixed spectral shape", () => {
    let prev = -1;
    for (const scale of [0.01, 0.05, 0.2, 0.8]){
      const az = powerLawSignal({ n, fs, exponent:-5/3, scale, seed:77 });
      const a = M.analyseWindow({ az, ...level() });
      expect(a.index).toBeGreaterThan(prev);
      prev = a.index;
    }
  });

  it("refuses a contaminated window instead of scoring it", () => {
    const az = powerLawSignal({ n, fs, exponent:-5/3, scale:0.05, seed:4 });
    az[100] = 15;
    const a = M.analyseWindow({ az, ...level() });
    expect(a.ok).toBe(false);
  });
});

describe("severe turbulence must survive the quality gates", () => {
  /* The regression: a 0.6 g amplitude gate rejected a synthetic severe window as
     "handled", discarding exactly the observations the network exists to collect.
     Severe turbulence reaches about ±1 g in the cabin. */
  const fs = 60, n = 1024;
  const level = () => ({ gx:new Array(n).fill(0), gy:new Array(n).fill(0), gz:new Array(n).fill(9.81), fs });

  function powerLaw(n, fs, exponent, scale, seed){
    let s0 = seed>>>0;
    const r = () => { s0^=s0<<13; s0>>>=0; s0^=s0>>17; s0^=s0<<5; s0>>>=0; return s0/4294967296; };
    const out = new Float64Array(n), df = fs/n;
    for (let f=0.2; f<=fs/2*0.9; f+=df){
      const amp = scale*Math.sqrt(2*Math.pow(f,exponent)*df), ph = r()*2*Math.PI, w = 2*Math.PI*f/fs;
      for (let i=0;i<n;i++) out[i] += amp*Math.cos(w*i+ph);
    }
    return out;
  }

  it("accepts a violent but physically plausible window", () => {
    const az = powerLaw(n, fs, -5/3, 0.9, 2);
    const peak = Math.max(...az.map(Math.abs));
    expect(peak).toBeGreaterThan(4);          // genuinely rough
    expect(peak).toBeLessThan(15);            // still within what air can do
    const q = M.windowQuality({ az, ...level() });
    expect(q.ok).toBe(true);
  });

  it("scores that window high rather than discarding it", () => {
    const a = M.analyseWindow({ az: powerLaw(n, fs, -5/3, 0.9, 2), ...level() });
    expect(a.ok).toBe(true);
    expect(a.index).toBeGreaterThan(60);
    expect(a.kolmogorov).toBeGreaterThan(0.4);
  });

  it("still rejects an excursion no atmosphere produces", () => {
    const az = powerLaw(n, fs, -5/3, 0.05, 4);
    az[400] = 25;                             // 2.5 g spike: dropped, not flown
    expect(M.windowQuality({ az, ...level() }).ok).toBe(false);
  });

  it("still catches a pickup by tilt even when it is gentle", () => {
    const az = powerLaw(n, fs, -5/3, 0.05, 4);
    const gx = new Array(n).fill(0).map((_,i)=> i>n/2 ? 4 : 0);
    const q = M.windowQuality({ az, gx, gy:new Array(n).fill(0), gz:new Array(n).fill(9.0), fs });
    expect(q.ok).toBe(false);
    expect(q.reasons).toContain("moved");
  });
});
