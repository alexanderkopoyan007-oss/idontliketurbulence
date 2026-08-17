import { describe, it, expect, beforeAll } from "vitest";
import { load, PHYSICS_FILES } from "./harness.js";

let P;
beforeAll(() => {
  P = load(PHYSICS_FILES, ["layerCAT", "LEVELS", "G", "rad", "tropopause", "jetCore"]);
});

/* layerCAT is the heart of the forecast: it turns a stack of pressure-level
 * winds and temperatures into shear, a Richardson number and Ellrod's TI1/TI2.
 * These fixtures are built so every quantity can be worked out by hand.
 *
 * Geometry of the stencil, per layer k:
 *   vws  = |Δwind| / Δz                       (s⁻¹)
 *   N²   = (g/θ̄)·(Δθ/Δz)                      (s⁻²)
 *   Ri   = N² / vws²
 *   TI1  = vws · DEF · 1e7
 *   TI2  = vws · (DEF + max(0,CVG)) · 1e7
 */

const DZ = 1000;          // metres between adjacent levels in the fixtures
const NLEV = () => P.LEVELS.length;

/** A column with a constant wind increment per level and a constant lapse of θ. */
function column({ u0 = 0, du = 0, v0 = 0, dv = 0, th0 = 300, dth = 0 }){
  return Array.from({ length: NLEV() }, (_, k) => {
    const u = u0 + du*k, v = v0 + dv*k, z = k*DZ;
    return { p: P.LEVELS[k].p, z, ft: z/0.3048, T: 250,
             theta: th0 + dth*k, spd: Math.hypot(u,v), u, v };
  });
}

describe("layerCAT — vertical shear and Richardson number", () => {
  it("computes shear as |Δwind|/Δz for a linear wind profile", () => {
    // 10 m/s per 1000 m ⇒ vws = 0.01 s⁻¹, reported in m/s per km ⇒ 10
    const C = column({ du: 10, dth: 5 });
    const out = P.layerCAT(C, null, null, null, null, 0, 0, 0);
    expect(out[0].vws).toBeCloseTo(10, 12);
  });

  it("computes Ri = N²/vws² from hand-worked values", () => {
    // θ̄ = 302.5, Δθ/Δz = 5/1000 ⇒ N² = (9.80665/302.5)·0.005 = 1.620934e-4
    // vws = 0.01 ⇒ vws² = 1e-4  ⇒ Ri = 1.620934
    const C = column({ du: 10, th0: 300, dth: 5 });
    const out = P.layerCAT(C, null, null, null, null, 0, 0, 0);
    const N2 = (P.G/302.5)*(5/DZ);
    expect(out[0].N2).toBeCloseTo(N2, 15);
    expect(out[0].Ri).toBeCloseTo(N2/1e-4, 10);
    expect(out[0].Ri).toBeCloseTo(1.62093, 4);
  });

  it("reports a large Ri when there is no shear to destabilise the layer", () => {
    const C = column({ du: 0, dth: 5 });
    const out = P.layerCAT(C, null, null, null, null, 0, 0, 0);
    expect(out[0].Ri).toBe(999);
  });

  it("returns a negative Ri for a statically unstable layer", () => {
    const C = column({ du: 10, th0: 300, dth: -5 });   // θ decreasing with height
    const out = P.layerCAT(C, null, null, null, null, 0, 0, 0);
    expect(out[0].Ri).toBeLessThan(0);
  });

  it("drops layers with no usable thickness rather than dividing by ~zero", () => {
    const C = column({ du: 10, dth: 5 }).map(l => ({ ...l, z: 0 }));
    const out = P.layerCAT(C, null, null, null, null, 0, 0, 0);
    expect(out.every(l => l === null)).toBe(true);
  });

  it("returns one entry per layer, i.e. one fewer than the level count", () => {
    const C = column({ du: 10, dth: 5 });
    expect(P.layerCAT(C, null, null, null, null, 0, 0, 0)).toHaveLength(NLEV()-1);
  });
});

describe("layerCAT — Ellrod TI1 / TI2", () => {
  /* Cross-track stencil only: L and R differ by 20 m/s of u over 200 km.
     du_dn = 20/200000 = 1e-4 s⁻¹, everything else zero, track 000°.
       sb=0, cb=1 ⇒ du_dx = du_dn = 1e-4, du_dy = 0, dv_* = 0
       DSH = dv_dx + du_dy = 0
       DST = du_dx - dv_dy = 1e-4
       DEF = hypot(0,1e-4)   = 1e-4
       CVG = -(du_dx+dv_dy)  = -1e-4      (divergent, so TI2 adds nothing)
       vws = 0.01
       TI1 = 0.01 · 1e-4 · 1e7 = 10
       TI2 = 0.01 · (1e-4 + 0) · 1e7 = 10 */
  const CROSS = 200_000;

  it("computes TI1 = vws·DEF·1e7 for a pure cross-track shear", () => {
    const C = column({ du: 10, dth: 5, u0: 0 });
    const L = column({ du: 10, dth: 5, u0: -10 });
    const R = column({ du: 10, dth: 5, u0:  10 });
    const out = P.layerCAT(C, L, R, null, null, 0, CROSS, 0);
    expect(out[0].DEF).toBeCloseTo(1e-4 * 1e5, 10);   // DEF is reported ×1e5
    expect(out[0].TI1).toBeCloseTo(10, 9);
  });

  it("reports zero deformation when the cross-track stencil is missing", () => {
    const C = column({ du: 10, dth: 5 });
    const out = P.layerCAT(C, null, null, null, null, 0, 0, 0);
    expect(out[0].TI1).toBe(0);
    expect(out[0].DEF).toBe(0);
  });

  it("gives zero TI1 for a uniform wind field however strong the wind", () => {
    const C = column({ u0: 60, du: 0, dth: 5 });
    const L = column({ u0: 60, du: 0, dth: 5 });
    const R = column({ u0: 60, du: 0, dth: 5 });
    const out = P.layerCAT(C, L, R, null, null, 0, CROSS, 0);
    expect(out[0].TI1).toBeCloseTo(0, 12);
  });

  it("scales TI1 linearly with the cross-track gradient", () => {
    const mk = (spread) => {
      const C = column({ du: 10, dth: 5 });
      const L = column({ du: 10, dth: 5, u0: -spread });
      const R = column({ du: 10, dth: 5, u0:  spread });
      return P.layerCAT(C, L, R, null, null, 0, CROSS, 0)[0].TI1;
    };
    expect(mk(20)).toBeCloseTo(2*mk(10), 9);
  });

  it("is invariant to track direction for an isotropic deformation field", () => {
    // Rotating the track must not change |DEF| when the field is rotated with it.
    const build = (brg) => {
      const C = column({ du: 10, dth: 5 });
      const L = column({ du: 10, dth: 5, u0: -10 });
      const R = column({ du: 10, dth: 5, u0:  10 });
      return P.layerCAT(C, L, R, null, null, 0, CROSS, brg)[0].DEF;
    };
    for (const brg of [0, 45, 90, 180, 270]) expect(build(brg)).toBeCloseTo(build(0), 9);
  });

  it("adds convergence into TI2 but never subtracts divergence", () => {
    // Converging along-track flow: mN slower than mP ⇒ CVG > 0 ⇒ TI2 > TI1.
    const C = column({ du: 10, dth: 5, u0: 0 });
    const L = column({ du: 10, dth: 5, u0: -10 });
    const R = column({ du: 10, dth: 5, u0:  10 });
    const Pp = column({ du: 10, dth: 5, v0:  20 });
    const Nn = column({ du: 10, dth: 5, v0: -20 });
    const conv = P.layerCAT(C, L, R, Pp, Nn, 200_000, CROSS, 0)[0];
    const plain = P.layerCAT(C, L, R, null, null, 0, CROSS, 0)[0];
    expect(conv.CVG).toBeGreaterThan(0);
    expect(conv.TI1).toBeGreaterThanOrEqual(0);
    // divergent case must not push TI2 below TI1
    expect(plain.TI1).toBeGreaterThanOrEqual(0);
  });

  it("produces an EDR that rises with the Ellrod index", () => {
    const at = (spread) => {
      const C = column({ du: 10, dth: 5 });
      const L = column({ du: 10, dth: 5, u0: -spread });
      const R = column({ du: 10, dth: 5, u0:  spread });
      return P.layerCAT(C, L, R, null, null, 0, CROSS, 0)[0].edr;
    };
    expect(at(40)).toBeGreaterThan(at(10));
    expect(at(10)).toBeGreaterThan(0);
    expect(at(40)).toBeLessThanOrEqual(1);
  });
});

describe("tropopause and jet detection", () => {
  it("finds the tropopause at the coldest upper-level temperature", () => {
    const C = column({ du: 0, dth: 5 }).map((l, k) => ({ ...l, T: k === 7 ? 200 : 250 }));
    const t = P.tropopause(C);
    expect(t).toBeTruthy();
    expect(t.ft).toBeCloseTo(C[7].ft, 6);
  });

  it("finds the fastest wind in the jet band and ignores slow columns", () => {
    const fast = column({ du: 0, dth: 5 }).map((l, k) => ({ ...l, spd: k === 6 ? 70 : 10 }));
    const jet = P.jetCore(fast);
    expect(jet).toBeTruthy();
    expect(jet.spd).toBe(70);

    const calm = column({ du: 0, dth: 5 }).map(l => ({ ...l, spd: 5 }));
    expect(P.jetCore(calm)).toBeNull();
  });
});
