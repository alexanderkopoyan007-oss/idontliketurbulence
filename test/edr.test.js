import { describe, it, expect, beforeAll } from "vitest";
import { load, PHYSICS_FILES } from "./harness.js";

let E;
beforeAll(() => {
  E = load(PHYSICS_FILES, ["edrFromTI1", "edrFromVWS", "edrFromRi", "band", "bandCol", "rampCol", "BANDS"]);
});

/* The three remappings are power laws anchored on the conventional light /
 * moderate / severe thresholds. The expectations below are the closed forms
 * evaluated by hand, so a changed coefficient fails the test rather than
 * silently re-tuning the forecast. */

describe("edrFromTI1 — Ellrod index → EDR", () => {
  it("is zero at and below zero", () => {
    expect(E.edrFromTI1(0)).toBe(0);
    expect(E.edrFromTI1(-3)).toBe(0);
  });

  it("matches 0.0473·TI1^0.729 at the moderate-CAT threshold of TI1 = 8", () => {
    // 8^0.729 = e^(0.729·ln8) = e^1.51586 = 4.55346 → ×0.0473 = 0.21538
    expect(E.edrFromTI1(8)).toBeCloseTo(0.0473 * Math.pow(8, 0.729), 12);
    expect(E.edrFromTI1(8)).toBeCloseTo(0.2154, 4);
  });

  it("climbs through the bands as TI1 crosses its operational thresholds", () => {
    // Ellrod flags moderate CAT above TI1 ≈ 8. Taken alone the remapping puts
    // TI1 = 8 at 0.215 (light) and TI1 = 12 at 0.289 (moderate); the forecast
    // blends this with shear and Ri, so the band here is the mapping's own, not
    // the final verdict's.
    expect(E.band(E.edrFromTI1(4)).name).toBe("Light chop");     // 0.133
    expect(E.band(E.edrFromTI1(8)).name).toBe("Light");          // 0.215
    expect(E.band(E.edrFromTI1(12)).name).toBe("Moderate");      // 0.289
    expect(E.edrFromTI1(12)).toBeGreaterThan(E.edrFromTI1(4));
  });

  it("increases monotonically", () => {
    let prev = -1;
    for (let ti = 0; ti <= 60; ti += 0.5){
      const v = E.edrFromTI1(ti);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it("never exceeds 1 however extreme the input", () => {
    expect(E.edrFromTI1(1e6)).toBe(1);
    expect(E.edrFromTI1(Number.MAX_SAFE_INTEGER)).toBe(1);
  });
});

describe("edrFromVWS — vertical wind shear → EDR", () => {
  it("is zero at and below zero shear", () => {
    expect(E.edrFromVWS(0)).toBe(0);
    expect(E.edrFromVWS(-1)).toBe(0);
  });

  it("matches 0.0214·shear^1.28", () => {
    for (const s of [1, 4, 7.5, 12]) expect(E.edrFromVWS(s)).toBeCloseTo(0.0214 * Math.pow(s, 1.28), 12);
  });

  it("treats a shear of 1 m/s/km as essentially smooth", () => {
    expect(E.edrFromVWS(1)).toBeCloseTo(0.0214, 6);
    expect(E.band(E.edrFromVWS(1)).name).toBe("Smooth");
  });

  it("is superlinear — doubling the shear more than doubles the EDR", () => {
    expect(E.edrFromVWS(10)).toBeGreaterThan(2 * E.edrFromVWS(5));
  });

  it("clamps at 1", () => {
    expect(E.edrFromVWS(1e5)).toBe(1);
  });
});

describe("edrFromRi — gradient Richardson number → EDR", () => {
  it("returns 0 for a null Richardson number rather than guessing", () => {
    expect(E.edrFromRi(null)).toBe(0);
  });

  it("returns a fixed elevated value when the layer is statically unstable", () => {
    expect(E.edrFromRi(-0.1)).toBe(0.52);
    expect(E.edrFromRi(-50)).toBe(0.52);
  });

  it("matches 0.50/(1+Ri)^0.9 for stable layers", () => {
    for (const ri of [0, 0.25, 1, 2, 10]) expect(E.edrFromRi(ri)).toBeCloseTo(0.50/Math.pow(1+ri, 0.9), 12);
  });

  it("peaks at Ri = 0 and decays with increasing stability", () => {
    expect(E.edrFromRi(0)).toBeCloseTo(0.5, 12);
    // 0.5/2^0.9 = 0.5/1.86607 = 0.26794
    expect(E.edrFromRi(1)).toBeCloseTo(0.26794, 5);
    expect(E.edrFromRi(100)).toBeLessThan(0.01);
  });

  it("decreases monotonically over the stable range", () => {
    let prev = Infinity;
    for (let ri = 0; ri <= 50; ri += 0.25){
      const v = E.edrFromRi(ri);
      expect(v).toBeLessThanOrEqual(prev);
      prev = v;
    }
  });

  it("crosses the classic Ri < 1 instability threshold into light-or-worse", () => {
    expect(E.band(E.edrFromRi(0.9)).key).toBeGreaterThanOrEqual(2);
    expect(E.band(E.edrFromRi(8)).key).toBe(0);
  });
});

describe("band — EDR to intensity category", () => {
  it("puts each band's lower bound in that band", () => {
    for (const b of E.BANDS) expect(E.band(b.min).name).toBe(b.name);
  });

  it("puts a value just under a boundary in the band below", () => {
    expect(E.band(0.2599).name).toBe("Light");
    expect(E.band(0.26).name).toBe("Moderate");
  });

  it("handles 0 and 1", () => {
    expect(E.band(0).name).toBe("Smooth");
    expect(E.band(1).name).toBe("Severe");
  });

  it("returns the documented colours", () => {
    expect(E.bandCol(0.00)).toBe("#1FC8B4");
    expect(E.bandCol(0.08)).toBe("#9BD93F");
    expect(E.bandCol(0.16)).toBe("#FFC93C");
    expect(E.bandCol(0.26)).toBe("#FF8A3D");
    expect(E.bandCol(0.40)).toBe("#F04A63");
    expect(E.bandCol(0.58)).toBe("#C766FF");
  });
});

describe("rampCol — continuous colour scale", () => {
  it("returns a parseable rgb() triple across the range", () => {
    for (let e = 0; e <= 1.0001; e += 0.05){
      const c = E.rampCol(e);
      expect(c).toMatch(/^(rgb\(\d{1,3},\d{1,3},\d{1,3}\)|#[0-9A-F]{6})$/i);
    }
  });
  it("clamps above the top anchor instead of returning undefined", () => {
    expect(E.rampCol(5)).toBeTruthy();
  });
});
