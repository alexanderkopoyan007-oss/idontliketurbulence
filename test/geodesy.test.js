import { describe, it, expect, beforeAll } from "vitest";
import { load, PHYSICS_FILES } from "./harness.js";

let G;
beforeAll(() => {
  G = load(PHYSICS_FILES, ["distance", "bearing", "destPoint", "interp", "R_E", "NM", "clamp", "lerp"]);
});

/* Expected values are computed from the sphere's geometry, not from the code —
 * a quarter of a great circle is πR/2 whatever the implementation does. */
const quarterCircle = () => Math.PI * 6371008.8 / 2;

describe("distance — haversine", () => {
  it("is zero for a point against itself", () => {
    expect(G.distance({lat:51.47,lon:-0.46}, {lat:51.47,lon:-0.46})).toBe(0);
  });

  it("gives a quarter of the great circle from the equator to the pole", () => {
    expect(G.distance({lat:0,lon:0}, {lat:90,lon:0})).toBeCloseTo(quarterCircle(), 1);
  });

  it("gives a quarter of the great circle along 90° of equator", () => {
    expect(G.distance({lat:0,lon:0}, {lat:0,lon:90})).toBeCloseTo(quarterCircle(), 1);
  });

  it("gives one degree of latitude as R·π/180", () => {
    const oneDeg = 6371008.8 * Math.PI / 180;
    expect(G.distance({lat:0,lon:0}, {lat:1,lon:0})).toBeCloseTo(oneDeg, 3);
  });

  it("is symmetric", () => {
    const a = {lat:51.4706,lon:-0.4619}, b = {lat:40.6413,lon:-73.7781};
    expect(G.distance(a,b)).toBeCloseTo(G.distance(b,a), 6);
  });

  it("matches the published LHR–JFK great-circle distance", () => {
    // ~5,539 km / ~2,991 nm between the two runway-complex centroids. Published
    // figures vary by a few km with the exact reference point chosen.
    const d = G.distance({lat:51.4706,lon:-0.4619}, {lat:40.6413,lon:-73.7781});
    expect(d/1000).toBeGreaterThan(5530);
    expect(d/1000).toBeLessThan(5550);
    expect(d/G.NM).toBeGreaterThan(2980);
    expect(d/G.NM).toBeLessThan(3010);
  });

  it("takes the short way across the antimeridian, not the long way round", () => {
    // 179°E to 179°W is two degrees apart, not 358.
    const d = G.distance({lat:0,lon:179}, {lat:0,lon:-179});
    const twoDeg = 2 * 6371008.8 * Math.PI / 180;
    expect(d).toBeCloseTo(twoDeg, 3);
    expect(d).toBeLessThan(250_000);
  });
});

describe("bearing", () => {
  it("reads due north", () => {
    expect(G.bearing({lat:0,lon:0}, {lat:10,lon:0})).toBeCloseTo(0, 9);
  });
  it("reads due south as 180", () => {
    expect(G.bearing({lat:0,lon:0}, {lat:-10,lon:0})).toBeCloseTo(180, 9);
  });
  it("reads due east along the equator", () => {
    expect(G.bearing({lat:0,lon:0}, {lat:0,lon:10})).toBeCloseTo(90, 9);
  });
  it("reads due west along the equator", () => {
    expect(G.bearing({lat:0,lon:0}, {lat:0,lon:-10})).toBeCloseTo(270, 9);
  });
  it("always returns 0–360, never negative", () => {
    for (const lon of [-170, -90, -1, 1, 90, 170]){
      const b = G.bearing({lat:10,lon:0}, {lat:-10,lon});
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(360);
    }
  });
  it("crosses the antimeridian eastbound rather than doubling back", () => {
    // From 179°E to 179°W the short way is east, i.e. a bearing near 090.
    expect(G.bearing({lat:0,lon:179}, {lat:0,lon:-179})).toBeCloseTo(90, 6);
  });
});

describe("destPoint", () => {
  it("walks a quarter circle east from the origin onto 90°E", () => {
    const p = G.destPoint({lat:0,lon:0}, 90, quarterCircle());
    expect(p.lat).toBeCloseTo(0, 6);
    expect(p.lon).toBeCloseTo(90, 6);
  });

  it("walks north onto the pole", () => {
    const p = G.destPoint({lat:0,lon:0}, 0, quarterCircle());
    expect(p.lat).toBeCloseTo(90, 6);
  });

  it("round-trips against bearing and distance", () => {
    const a = {lat:51.4706,lon:-0.4619}, b = {lat:40.6413,lon:-73.7781};
    const p = G.destPoint(a, G.bearing(a,b), G.distance(a,b));
    expect(p.lat).toBeCloseTo(b.lat, 6);
    expect(p.lon).toBeCloseTo(b.lon, 6);
  });

  it("normalises longitude into −180…180 when it steps over the antimeridian", () => {
    const p = G.destPoint({lat:0,lon:179}, 90, 400_000);   // ~3.6° further east
    expect(p.lon).toBeGreaterThanOrEqual(-180);
    expect(p.lon).toBeLessThanOrEqual(180);
    expect(p.lon).toBeLessThan(0);                          // wrapped to the western hemisphere
    expect(p.lon).toBeCloseTo(-177.4, 1);
  });
});

describe("interp — great-circle interpolation", () => {
  it("returns the endpoints at f=0 and f=1", () => {
    const a = {lat:51.47,lon:-0.46}, b = {lat:40.64,lon:-73.78};
    const p0 = G.interp(a,b,0), p1 = G.interp(a,b,1);
    expect(p0.lat).toBeCloseTo(a.lat, 9); expect(p0.lon).toBeCloseTo(a.lon, 9);
    expect(p1.lat).toBeCloseTo(b.lat, 9); expect(p1.lon).toBeCloseTo(b.lon, 9);
  });

  it("puts the midpoint of an equatorial leg halfway along it", () => {
    const m = G.interp({lat:0,lon:0}, {lat:0,lon:90}, 0.5);
    expect(m.lat).toBeCloseTo(0, 9);
    expect(m.lon).toBeCloseTo(45, 9);
  });

  it("is degenerate-safe when both ends coincide", () => {
    const p = G.interp({lat:12,lon:34}, {lat:12,lon:34}, 0.5);
    expect(p.lat).toBe(12); expect(p.lon).toBe(34);
  });

  it("stays near the antimeridian instead of crossing the globe", () => {
    // NRT–LAX style: the midpoint of 179E→179W must sit at ±180, not at 0.
    const m = G.interp({lat:0,lon:179}, {lat:0,lon:-179}, 0.5);
    expect(Math.abs(m.lon)).toBeCloseTo(180, 6);
    expect(Math.abs(m.lon)).toBeGreaterThan(179);
  });

  it("keeps every step of an antimeridian crossing on the short arc", () => {
    const a = {lat:35.55,lon:139.78}, b = {lat:33.94,lon:-118.41};   // NRT → LAX
    const total = G.distance(a,b);
    let walked = 0, prev = a;
    for (let i=1;i<=40;i++){
      const p = G.interp(a,b,i/40);
      walked += G.distance(prev, p);
      prev = p;
    }
    // A path that wrapped the wrong way would be far longer than the direct arc.
    expect(walked).toBeGreaterThan(total*0.999);
    expect(walked).toBeLessThan(total*1.001);
  });
});

describe("clamp / lerp", () => {
  it("clamps below, inside and above", () => {
    expect(G.clamp(-1, 0, 1)).toBe(0);
    expect(G.clamp(0.5, 0, 1)).toBe(0.5);
    expect(G.clamp(9, 0, 1)).toBe(1);
  });
  it("lerps endpoints and midpoint", () => {
    expect(G.lerp(10, 20, 0)).toBe(10);
    expect(G.lerp(10, 20, 1)).toBe(20);
    expect(G.lerp(10, 20, 0.5)).toBe(15);
  });
});
