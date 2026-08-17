import { describe, it, expect, beforeAll } from "vitest";
import { load, PHYSICS_FILES } from "./harness.js";

let S;
beforeAll(() => {
  S = load([...PHYSICS_FILES, "src/seeing.js"],
    ["seeingFrom", "buftonWind", "cn2At", "transparency", "seeingBand", "SEE", "SEEING_BANDS"]);
});

/* A synthetic column with a controllable jet, shaped like profileAt() output. */
function column({ jetSpeed = 20, jetZ = 11000, base = 10, shearPerKm = 4 } = {}){
  const out = [];
  for (let z = 0; z <= 24000; z += 1500){
    // Gaussian jet centred on jetZ, on top of a slowly increasing background.
    const spd = base + jetSpeed*Math.exp(-Math.pow((z - jetZ)/3500, 2)) + shearPerKm*(z/1000)*0.1;
    out.push({ z, spd, u: spd, v: 0, theta: 300 + 4*(z/1000), ft: z/0.3048, p: 1000 - z/30 });
  }
  return out;
}

describe("Bufton wind", () => {
  it("is the RMS wind through the 5–20 km slab only", () => {
    // Uniform 30 m/s everywhere ⇒ RMS is 30 regardless of the slab limits.
    const flat = column({ jetSpeed: 0, base: 30, shearPerKm: 0 });
    expect(S.buftonWind(flat)).toBeCloseTo(30, 6);
  });

  it("ignores wind well outside the 5–20 km slab", () => {
    // Levels that bound a segment straddling 5 km or 20 km legitimately affect
    // the interpolation onto the boundary, so this varies only the far field:
    // at or below 3 km and at or above 22.5 km, which bound no slab segment.
    const c = column({ jetSpeed: 0, base: 10, shearPerKm: 0 });
    const far = z => z <= 3000 || z >= 22500;
    const loud = c.map(l => far(l.z) ? { ...l, spd: 200, u: 200 } : l);
    expect(S.buftonWind(loud)).toBeCloseTo(S.buftonWind(c), 9);
  });

  it("does let a level bounding the slab edge influence the boundary wind", () => {
    // The complement of the above: this is correct physics, not a leak — the
    // wind at exactly 5 km is interpolated between the levels either side.
    const c = column({ jetSpeed: 0, base: 10, shearPerKm: 0 });
    const edge = c.map(l => l.z === 4500 ? { ...l, spd: 120, u: 120 } : l);
    expect(S.buftonWind(edge)).toBeGreaterThan(S.buftonWind(c));
  });

  it("rises when a jet sits in the slab", () => {
    expect(S.buftonWind(column({ jetSpeed: 60 }))).toBeGreaterThan(S.buftonWind(column({ jetSpeed: 0 })));
  });
});

describe("Cn² profile", () => {
  it("falls off with height above the ground layer", () => {
    const c = column();
    const v = S.buftonWind(c);
    const at = h => S.cn2At(h, v, c, S.SEE.GROUND_A);
    expect(at(50)).toBeGreaterThan(at(500));
    expect(at(2000)).toBeGreaterThan(at(20000));
  });

  it("is dominated by the ground term at the surface", () => {
    const c = column();
    const v = S.buftonWind(c);
    const withGround = S.cn2At(0, v, c, S.SEE.GROUND_A);
    const noGround   = S.cn2At(0, v, c, 0);
    expect(withGround).toBeGreaterThan(noGround*10);
  });

  it("scales the upper term with the square of the Bufton wind", () => {
    const c = column();
    // Same profile, different v passed in: the h^10 upper term ∝ v².
    const a = S.cn2At(11000, 20, c, 0), b = S.cn2At(11000, 40, c, 0);
    // The shear weight is identical for both, so the ratio is the v² ratio.
    expect(b/a).toBeGreaterThan(3.5);
    expect(b/a).toBeLessThan(4.5);
  });

  it("never returns a negative or non-finite Cn²", () => {
    const c = column();
    const v = S.buftonWind(c);
    for (let h = 0; h <= 25000; h += 250){
      const x = S.cn2At(h, v, c, S.SEE.GROUND_A);
      expect(Number.isFinite(x)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("seeing from a column", () => {
  it("returns null for a column too sparse to integrate", () => {
    expect(S.seeingFrom([null, null, null])).toBeNull();
  });

  it("puts free-atmosphere seeing in the arcsecond range", () => {
    const r = S.seeingFrom(column(), 0);
    expect(r.seeingFree).toBeGreaterThan(0.1);
    expect(r.seeingFree).toBeLessThan(5);
  });

  it("makes total seeing worse than free-atmosphere seeing", () => {
    // Adding the ground layer can only add turbulence, never remove it.
    const r = S.seeingFrom(column(), 0);
    expect(r.seeingTotal).toBeGreaterThan(r.seeingFree);
    expect(r.r0Total).toBeLessThan(r.r0Free);
  });

  it("degrades the seeing when the jet strengthens — the whole point", () => {
    const calm = S.seeingFrom(column({ jetSpeed: 5 }), 0);
    const jet  = S.seeingFrom(column({ jetSpeed: 70 }), 0);
    expect(jet.bufton).toBeGreaterThan(calm.bufton);
    expect(jet.seeingFree).toBeGreaterThan(calm.seeingFree);
  });

  it("improves the seeing from a higher site", () => {
    const low  = S.seeingFrom(column(), 0);
    const high = S.seeingFrom(column(), 2400);
    expect(high.seeingTotal).toBeLessThan(low.seeingTotal);
  });

  it("keeps r0 physically plausible (centimetres, not metres)", () => {
    const r = S.seeingFrom(column(), 0);
    expect(r.r0Total).toBeGreaterThan(0.01);
    expect(r.r0Total).toBeLessThan(0.5);
  });
});

describe("seeing bands", () => {
  it("orders from excellent to very poor", () => {
    expect(S.seeingBand(0.5).name).toBe("Excellent");
    expect(S.seeingBand(0.9).name).toBe("Good");
    expect(S.seeingBand(1.2).name).toBe("Average");
    expect(S.seeingBand(2.0).name).toBe("Poor");
    expect(S.seeingBand(4.0).name).toBe("Very poor");
  });
  it("always returns a band, however bad the night", () => {
    expect(S.seeingBand(1e6)).toBeTruthy();
  });
});

describe("transparency", () => {
  it("returns null rather than guessing when a cloud layer is missing", () => {
    expect(S.transparency(10, null, 0, 8)).toBeNull();
  });

  it("scores a clear dry night near perfect", () => {
    const t = S.transparency(0, 0, 0, 5);
    expect(t.score).toBeGreaterThan(95);
    expect(t.blocked).toBeCloseTo(0, 6);
  });

  it("scores overcast at essentially zero", () => {
    expect(S.transparency(100, 0, 0, 5).score).toBeLessThan(1);
  });

  it("treats high cirrus as damaging but not opaque", () => {
    const cirrus = S.transparency(0, 0, 100, 5);
    const low    = S.transparency(100, 0, 0, 5);
    expect(cirrus.score).toBeGreaterThan(low.score);
    expect(cirrus.score).toBeLessThan(30);
  });

  it("penalises a humid column", () => {
    expect(S.transparency(0, 0, 0, 40).score).toBeLessThan(S.transparency(0, 0, 0, 3).score);
  });

  it("combines layers multiplicatively, not additively", () => {
    // Three layers at 50% must not sum past 100% blocked.
    const t = S.transparency(50, 50, 50, 5);
    expect(t.blocked).toBeLessThan(100);
    expect(t.blocked).toBeGreaterThan(50);
  });
});
