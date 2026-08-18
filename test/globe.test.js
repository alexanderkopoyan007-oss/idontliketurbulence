import { describe, it, expect, beforeAll } from "vitest";
import { load } from "./harness.js";

let G;
beforeAll(() => {
  G = load(["src/data/airports.js","src/data/airlines.js","src/data/features.js","src/data/runways.js",
            "src/core.js","src/engine.js","src/globe.js"],
           ["globeStep","globePlan","GLOBE_LEVELS","GLOBE_VARS"]);
});

describe("grid spacing", () => {
  it("coarsens as you zoom out", () => {
    expect(G.globeStep(3)).toBeGreaterThan(G.globeStep(7));
    for (let z=2; z<9; z++) expect(G.globeStep(z)).toBeGreaterThan(0);
  });
  it("is monotonic in zoom", () => {
    let prev = Infinity;
    for (let z=2; z<=8; z++){ const s = G.globeStep(z); expect(s).toBeLessThanOrEqual(prev); prev = s; }
  });
});

describe("globePlan", () => {
  const bounds = (s,n,w,e) => ({ south:s, north:n, west:w, east:e });

  it("covers the requested bounds", () => {
    const p = G.globePlan(bounds(45, 55, 0, 15), 5);
    expect(p.lats[0]).toBeLessThanOrEqual(45);
    expect(p.lats[p.lats.length-1]).toBeGreaterThanOrEqual(55);
    expect(p.lons[0]).toBeLessThanOrEqual(0);
    expect(p.lons[p.lons.length-1]).toBeGreaterThanOrEqual(15);
  });

  it("caps the grid so one view stays one round trip", () => {
    // a whole hemisphere at fine zoom would be enormous without the cap
    const p = G.globePlan(bounds(-60, 60, -170, 170), 8);
    expect(p.points).toBeLessThanOrEqual(240);
    expect(p.chunks).toBeLessThanOrEqual(10);
  });

  it("reports a cost that matches the point count", () => {
    const p = G.globePlan(bounds(40, 50, 0, 10), 5);
    expect(p.points).toBe(p.lats.length * p.lons.length);
    expect(p.chunks).toBe(Math.ceil(p.points/25));
  });

  it("gives the same key for the same view, so the cache hits", () => {
    const a = G.globePlan(bounds(45, 55, 0, 15), 5);
    const b = G.globePlan(bounds(45, 55, 0, 15), 5);
    expect(a.key).toBe(b.key);
  });

  it("gives a different key when the view changes", () => {
    const a = G.globePlan(bounds(45, 55, 0, 15), 5);
    const b = G.globePlan(bounds(20, 30, 0, 15), 5);
    expect(a.key).not.toBe(b.key);
  });

  it("stays affordable at every zoom level", () => {
    for (let z=2; z<=8; z++){
      const p = G.globePlan(bounds(30, 60, -10, 30), z);
      expect(p.chunks).toBeLessThanOrEqual(10);
    }
  });
});

describe("level coverage is not oversold", () => {
  it("requests four levels bracketing cruise", () => {
    expect(G.GLOBE_LEVELS).toEqual([400, 300, 250, 200]);
  });
  it("asks for the four fields the physics needs at each level", () => {
    expect(G.GLOBE_VARS.length).toBe(G.GLOBE_LEVELS.length * 4);
    for (const p of G.GLOBE_LEVELS){
      expect(G.GLOBE_VARS).toContain(`temperature_${p}hPa`);
      expect(G.GLOBE_VARS).toContain(`wind_speed_${p}hPa`);
      expect(G.GLOBE_VARS).toContain(`wind_direction_${p}hPa`);
      expect(G.GLOBE_VARS).toContain(`geopotential_height_${p}hPa`);
    }
  });
});
