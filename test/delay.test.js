import { describe, it, expect, beforeAll } from "vitest";
import { load } from "./harness.js";

let D;
beforeAll(() => {
  D = load(
    ["src/data/airports.js","src/data/airlines.js","src/data/features.js","src/data/runways.js",
     "src/core.js","src/engine.js","src/delay.js"],
    ["RUNWAYS","windComponents","crosswindPenalty","visibilityPenalty","convectivePenalty",
     "windDelayMinutes","delayEstimate","DELAY_BASE_RATE"]
  );
});

describe("runway table", () => {
  it("carries the major airports the crosswind term needs", () => {
    for (const icao of ["EGLL","KJFK","LFPG","EDDF","KLAX"]) expect(D.RUNWAYS.has(icao)).toBe(true);
  });
  it("stores plausible headings and lengths", () => {
    for (const [, r] of D.RUNWAYS){
      expect(r.hdg).toBeGreaterThanOrEqual(0);
      expect(r.hdg).toBeLessThan(360);
      expect(r.len).toBeGreaterThanOrEqual(3000);
    }
  });
  it("gets Heathrow's east-west runways about right", () => {
    // 09/27 — roughly 090 or 270 true
    const h = D.RUNWAYS.get("EGLL").hdg;
    expect(Math.min(Math.abs(h-90), Math.abs(h-270))).toBeLessThan(15);
  });
});

describe("windComponents", () => {
  it("is pure headwind when the wind is down the runway", () => {
    const c = D.windComponents(270, 30, 270);
    expect(c.cross).toBeCloseTo(0, 9);
    expect(c.head).toBeCloseTo(30, 9);
  });
  it("is pure crosswind at 90 degrees off", () => {
    const c = D.windComponents(180, 25, 270);
    expect(c.cross).toBeCloseTo(25, 9);
    expect(c.head).toBeCloseTo(0, 9);
  });
  it("reports a tailwind as negative headwind", () => {
    expect(D.windComponents(90, 20, 270).head).toBeCloseTo(-20, 9);
  });
  it("treats a runway as bidirectional — crosswind is a magnitude", () => {
    // Wind from either side gives the same crosswind magnitude.
    expect(D.windComponents(0, 20, 270).cross).toBeCloseTo(D.windComponents(180, 20, 270).cross, 9);
  });
  it("scales with wind speed", () => {
    expect(D.windComponents(180, 40, 270).cross).toBeCloseTo(2*D.windComponents(180, 20, 270).cross, 9);
  });
});

describe("penalty curves", () => {
  it("ignores crosswind below the point operations notice it", () => {
    expect(D.crosswindPenalty(0)).toBe(0);
    expect(D.crosswindPenalty(15)).toBe(0);
  });
  it("rises with crosswind and saturates at the certified end", () => {
    expect(D.crosswindPenalty(25)).toBeGreaterThan(0);
    expect(D.crosswindPenalty(35)).toBe(1);
    expect(D.crosswindPenalty(60)).toBe(1);
  });
  it("ignores good visibility and rises as minima approach", () => {
    expect(D.visibilityPenalty(9999)).toBe(0);
    expect(D.visibilityPenalty(5000)).toBe(0);
    expect(D.visibilityPenalty(1000)).toBeGreaterThan(0.5);
    expect(D.visibilityPenalty(200)).toBe(1);
  });
  it("returns 0 for missing visibility rather than inventing a value", () => {
    expect(D.visibilityPenalty(null)).toBe(0);
    expect(D.visibilityPenalty(undefined)).toBe(0);
  });
  it("ignores benign CAPE and rises with storm energy", () => {
    expect(D.convectivePenalty(0,0)).toBe(0);
    expect(D.convectivePenalty(200,0)).toBe(0);
    expect(D.convectivePenalty(1500,0)).toBeGreaterThan(0.2);
    expect(D.convectivePenalty(4000,5)).toBeCloseTo(1, 1);
  });
  it("keeps every penalty inside 0..1", () => {
    for (const v of [-50, 0, 12, 40, 999]){
      expect(D.crosswindPenalty(v)).toBeGreaterThanOrEqual(0);
      expect(D.crosswindPenalty(v)).toBeLessThanOrEqual(1);
    }
  });
});

/* A minimal fake result object, enough for the estimator. */
function fakeR({ windComp = 0, depWx = null, arrWx = null, dep = "EGLL", arr = "KJFK" } = {}){
  const A = { iata:"AAA", icao:dep, tz:"UTC" }, B = { iata:"BBB", icao:arr, tz:"UTC" };
  const mk = (nm, wx) => ({ nm, phase:"cruise", windComp, time:new Date(), surfaceWx:wx });
  return {
    route: { dep:A, arr:B, tas:450 },
    live: [ mk(0, depWx), mk(1500, null), mk(3000, arrWx) ],
  };
}

describe("windDelayMinutes", () => {
  it("is zero in still air", () => {
    expect(D.windDelayMinutes(fakeR({ windComp: 0 }))).toBeCloseTo(0, 9);
  });
  it("is positive into a headwind", () => {
    expect(D.windDelayMinutes(fakeR({ windComp: -60 }))).toBeGreaterThan(20);
  });
  it("is negative with a tailwind — the jet can make you early", () => {
    expect(D.windDelayMinutes(fakeR({ windComp: 60 }))).toBeLessThan(0);
  });
});

describe("delayEstimate", () => {
  const calm = { windMs: 2, windDir: 270, vis: 9999, cape: 0, precip: 0, cloudLow: 5 };
  const nasty = { windMs: 18, windDir: 180, vis: 900, cape: 2600, precip: 3, cloudLow: 95 };

  it("returns the base rate on a calm day rather than zero", () => {
    const e = D.delayEstimate(fakeR({ depWx: calm, arrWx: calm }), 0);
    expect(e.pDelay30).toBeGreaterThanOrEqual(D.DELAY_BASE_RATE);
    expect(e.pDelay30).toBeLessThan(0.35);
  });

  it("raises the probability substantially in bad conditions", () => {
    const good = D.delayEstimate(fakeR({ depWx: calm,  arrWx: calm  }), 0);
    const bad  = D.delayEstimate(fakeR({ depWx: nasty, arrWx: nasty }), 0);
    expect(bad.pDelay30).toBeGreaterThan(good.pDelay30 + 0.25);
    expect(bad.factors.length).toBeGreaterThan(good.factors.length);
  });

  it("breaks out the contributing factors, largest first", () => {
    const e = D.delayEstimate(fakeR({ depWx: nasty, arrWx: nasty }), 0);
    for (let i=1;i<e.factors.length;i++)
      expect(e.factors[i].minutes).toBeLessThanOrEqual(e.factors[i-1].minutes);
    expect(e.factors.some(f => /Crosswind/.test(f.label))).toBe(true);
    expect(e.factors.some(f => /visibility/i.test(f.label))).toBe(true);
  });

  it("never claims to know about rotation", () => {
    expect(D.delayEstimate(fakeR({ depWx: calm, arrWx: calm }), 0).rotationKnown).toBe(false);
  });

  it("keeps the probability inside a sane range however extreme the input", () => {
    const worse = { windMs: 40, windDir: 180, vis: 50, cape: 6000, precip: 20, cloudLow: 100 };
    const e = D.delayEstimate(fakeR({ depWx: worse, arrWx: worse }), 0);
    expect(e.pDelay30).toBeGreaterThan(0.5);
    expect(e.pDelay30).toBeLessThanOrEqual(0.97);
  });

  it("rates a generous connection comfortable and a short one risky", () => {
    const r = fakeR({ depWx: nasty, arrWx: nasty });
    expect(D.delayEstimate(r, 240).connection.verdict).toBe("comfortable");
    expect(D.delayEstimate(r, 30).connection.pMiss).toBeGreaterThan(0.5);
  });

  it("omits the connection block when none is given", () => {
    expect(D.delayEstimate(fakeR({ depWx: calm, arrWx: calm }), 0).connection).toBeNull();
  });

  it("degrades to the base rate when surface data is missing entirely", () => {
    const e = D.delayEstimate(fakeR({ depWx: null, arrWx: null }), 0);
    expect(e.factors.length).toBe(0);
    expect(e.pDelay30).toBeCloseTo(D.DELAY_BASE_RATE + (1-D.DELAY_BASE_RATE)/(1+Math.exp(30/12)), 6);
  });
});
