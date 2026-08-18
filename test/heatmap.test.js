import { describe, it, expect, beforeAll } from "vitest";
import { load } from "./harness.js";

let H;
beforeAll(() => {
  H = load(
    ["src/data/airports.js","src/data/airlines.js","src/data/features.js",
     "src/core.js","src/engine.js"],
    ["rideScore","clamp"]
  );
});

/* rideScore is shared between the heatmap and the full briefing precisely so a
   cell that says 82 means the same as the briefing you get by clicking it. If
   this drifts, the grid starts lying about what it links to. */
describe("rideScore", () => {
  it("is 100 for perfectly still air", () => {
    expect(H.rideScore(0, 0, 0)).toBe(100);
  });
  it("ignores EDR below the smooth thresholds", () => {
    // mean under 0.04 and peak under 0.10 cost nothing
    expect(H.rideScore(0.03, 0.09, 0)).toBe(100);
  });
  it("matches the published penalty formula", () => {
    const f = (m,p,r) => Math.round(Math.max(0, Math.min(100,
      100 - (145*Math.max(0,m-0.04) + 74*Math.max(0,p-0.10) + 22*r))));
    for (const [m,p,r] of [[0.05,0.2,0.1],[0.12,0.45,0.4],[0.02,0.05,0],[0.3,0.8,0.9]])
      expect(H.rideScore(m,p,r)).toBe(f(m,p,r));
  });
  it("falls as any of the three inputs rises", () => {
    const base = H.rideScore(0.08, 0.3, 0.2);
    expect(H.rideScore(0.12, 0.3,  0.2)).toBeLessThan(base);
    expect(H.rideScore(0.08, 0.45, 0.2)).toBeLessThan(base);
    expect(H.rideScore(0.08, 0.3,  0.6)).toBeLessThan(base);
  });
  it("clamps to 0 rather than going negative on extreme input", () => {
    expect(H.rideScore(1, 1, 1)).toBe(0);
    expect(H.rideScore(5, 5, 5)).toBe(0);
  });
  it("returns a whole number, since it is rendered in a small cell", () => {
    for (let m=0; m<0.3; m+=0.017)
      expect(Number.isInteger(H.rideScore(m, m*2, m))).toBe(true);
  });
  it("orders slots the way a passenger would", () => {
    const calm  = H.rideScore(0.03, 0.08, 0);
    const light = H.rideScore(0.10, 0.20, 0.25);
    const rough = H.rideScore(0.22, 0.50, 0.70);
    expect(calm).toBeGreaterThan(light);
    expect(light).toBeGreaterThan(rough);
  });
});
