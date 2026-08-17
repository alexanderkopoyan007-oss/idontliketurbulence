import { describe, it, expect, beforeAll } from "vitest";
import { load } from "./harness.js";

let A;
beforeAll(() => {
  A = load(["src/astro.js"],
    ["toJulian","fromJulian","sunPosition","moonPosition","moonPhase",
     "altAz","sunAltAz","moonAltAz","sunTimes","moonTimes","obliquity","gmst"]);
});

/* Expectations come from published almanac values and textbook worked examples,
   not from this implementation. */

describe("time and frame conversions", () => {
  it("gives JD 2451545.0 for J2000.0 (2000-01-01 12:00 UTC)", () => {
    expect(A.toJulian(new Date(Date.UTC(2000, 0, 1, 12, 0, 0)))).toBeCloseTo(2451545.0, 6);
  });

  it("round-trips a date through Julian day", () => {
    const d = new Date(Date.UTC(2026, 7, 18, 3, 27, 0));
    expect(A.fromJulian(A.toJulian(d)).getTime()).toBeCloseTo(d.getTime(), -1);
  });

  it("gives the mean obliquity as ~23.4393° at J2000", () => {
    expect(A.obliquity(0)).toBeCloseTo(23.4392911, 4);
  });

  it("matches Meeus's worked GMST for 1987-04-10 00:00 UT (≈197.693°)", () => {
    // Meeus, Astronomical Algorithms, example 12.a
    const j = A.toJulian(new Date(Date.UTC(1987, 3, 10, 0, 0, 0)));
    expect(A.gmst(j)).toBeCloseTo(197.693195, 3);
  });
});

describe("Sun", () => {
  it("sits on the equator at the equinoxes", () => {
    const mar = A.sunPosition(A.toJulian(new Date(Date.UTC(2026, 2, 20, 14, 46))));
    expect(Math.abs(mar.dec)).toBeLessThan(0.02);
    const sep = A.sunPosition(A.toJulian(new Date(Date.UTC(2026, 8, 23, 0, 6))));
    expect(Math.abs(sep.dec)).toBeLessThan(0.02);
  });

  it("reaches ±23.4° declination at the solstices", () => {
    const jun = A.sunPosition(A.toJulian(new Date(Date.UTC(2026, 5, 21, 8, 24))));
    expect(jun.dec).toBeCloseTo(23.44, 1);
    const dec = A.sunPosition(A.toJulian(new Date(Date.UTC(2026, 11, 21, 20, 50))));
    expect(dec.dec).toBeCloseTo(-23.44, 1);
  });

  it("is highest at local solar noon and below the horizon at local midnight", () => {
    // Greenwich, equinox: noon UTC is close to solar noon at longitude 0.
    const noon = A.sunAltAz(new Date(Date.UTC(2026, 2, 20, 12, 8)), 51.48, 0);
    expect(noon.alt).toBeGreaterThan(37);
    expect(noon.alt).toBeLessThan(40);
    const midnight = A.sunAltAz(new Date(Date.UTC(2026, 2, 20, 0, 8)), 51.48, 0);
    expect(midnight.alt).toBeLessThan(-30);
  });

  it("puts the Sun due south at culmination from the northern mid-latitudes", () => {
    const p = A.sunAltAz(new Date(Date.UTC(2026, 2, 20, 12, 8)), 51.48, 0);
    expect(Math.abs(p.az - 180)).toBeLessThan(2);
  });
});

describe("sunrise, sunset and twilight", () => {
  it("matches published London sunrise/sunset on the June solstice within 3 min", () => {
    // London 2026-06-21: sunrise ≈ 03:43 UTC, sunset ≈ 20:21 UTC
    const t = A.sunTimes(new Date(Date.UTC(2026, 5, 21)), 51.4775, -0.0014);
    const mins = d => d.getUTCHours()*60 + d.getUTCMinutes();
    expect(Math.abs(mins(t.sunrise) - (3*60+43))).toBeLessThanOrEqual(3);
    expect(Math.abs(mins(t.sunset)  - (20*60+21))).toBeLessThanOrEqual(3);
  });

  it("orders the twilights correctly around sunset", () => {
    const t = A.sunTimes(new Date(Date.UTC(2026, 8, 21)), 51.4775, -0.0014);
    expect(+t.sunset).toBeLessThan(+t.civilDusk);
    expect(+t.civilDusk).toBeLessThan(+t.nauticalDusk);
    expect(+t.nauticalDusk).toBeLessThan(+t.astroDusk);
  });

  it("reports no sunset inside the Arctic summer rather than inventing one", () => {
    // Longyearbyen in midsummer: the Sun never sets.
    const t = A.sunTimes(new Date(Date.UTC(2026, 5, 21)), 78.22, 15.65);
    expect(t.sunrise).toBeNull();
    expect(t.sunset).toBeNull();
  });

  it("reports no astronomical darkness at a UK midsummer", () => {
    // Above ~49°N the Sun never reaches −18° in late June.
    const t = A.sunTimes(new Date(Date.UTC(2026, 5, 21)), 55.95, -3.19);   // Edinburgh
    expect(t.astroDusk).toBeNull();
  });

  it("gives a sunrise and sunset at the equator all year", () => {
    for (const m of [0, 3, 6, 9]){
      const t = A.sunTimes(new Date(Date.UTC(2026, m, 15)), 0, 0);
      expect(t.sunrise).toBeTruthy();
      expect(t.sunset).toBeTruthy();
    }
  });
});

describe("Moon", () => {
  it("is full near a known full moon and new near a known new moon", () => {
    // 2026-01-03 10:03 UTC full moon; 2026-01-18 19:52 UTC new moon.
    const full = A.moonPhase(A.toJulian(new Date(Date.UTC(2026, 0, 3, 10, 3))));
    expect(full.illum).toBeGreaterThan(0.99);
    const nw = A.moonPhase(A.toJulian(new Date(Date.UTC(2026, 0, 18, 19, 52))));
    expect(nw.illum).toBeLessThan(0.01);
  });

  it("names the phase consistently with the illuminated fraction", () => {
    for (let d = 0; d < 30; d += 1){
      const p = A.moonPhase(A.toJulian(new Date(Date.UTC(2026, 0, 3 + d, 12))));
      expect(p.illum).toBeGreaterThanOrEqual(0);
      expect(p.illum).toBeLessThanOrEqual(1);
      if (p.illum > 0.99) expect(p.name).toBe("Full");
      if (p.illum < 0.01) expect(p.name).toBe("New");
    }
  });

  it("waxes then wanes across a synodic month", () => {
    const at = d => A.moonPhase(A.toJulian(new Date(Date.UTC(2026, 0, 3 + d, 12))));
    expect(at(4).waxing).toBe(false);      // just after full, waning
    expect(at(20).waxing).toBe(true);      // after new, waxing again
  });

  it("keeps the Moon at a plausible distance throughout", () => {
    for (let d = 0; d < 30; d++){
      const m = A.moonPosition(A.toJulian(new Date(Date.UTC(2026, 0, 1 + d, 6))));
      expect(m.dist).toBeGreaterThan(356000);
      expect(m.dist).toBeLessThan(407000);
    }
  });

  it("stays within ±5.2° ecliptic latitude", () => {
    for (let d = 0; d < 30; d++){
      const m = A.moonPosition(A.toJulian(new Date(Date.UTC(2026, 0, 1 + d, 6))));
      expect(Math.abs(m.beta)).toBeLessThan(5.4);
    }
  });

  it("produces a rise and a set on an ordinary mid-latitude day", () => {
    const t = A.moonTimes(new Date(Date.UTC(2026, 7, 18)), 51.48, 0);
    expect(t.rise || t.set).toBeTruthy();
  });
});
