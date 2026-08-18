import { describe, it, expect, beforeAll } from "vitest";
import { load } from "./harness.js";

let W;
beforeAll(() => {
  W = load(
    ["src/data/airports.js","src/data/airlines.js","src/data/features.js",
     "src/core.js","src/engine.js","src/astro.js","src/window.js"],
    ["FEATURES","CELL_INDEX","cellId","cellCentre","featuresAt","horizonKm","sideOf",
     "featuresNear","geomagLat","auroraBoundary","KP_BOUNDARY","kpAt","terminatorEvents",
     "SEAT_LETTERS"]
  );
});

describe("gazetteer", () => {
  it("parses every row of the embedded table", () => {
    expect(W.FEATURES.length).toBeGreaterThan(350);
    expect(W.FEATURES.every(f => f.name && f.cls && isFinite(f.lat) && isFinite(f.lon))).toBe(true);
  });
  it("gives every feature a non-empty cell mask", () => {
    for (const f of W.FEATURES){
      expect(f.cells.length).toBeGreaterThan(0);
      expect(Math.abs(f.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(f.lon)).toBeLessThanOrEqual(180);
    }
  });
  it("indexes every cell of every feature", () => {
    let n = 0;
    for (const f of W.FEATURES) n += f.cells.length;
    let indexed = 0;
    for (const [, ids] of W.CELL_INDEX) indexed += ids.length;
    expect(indexed).toBe(n);
  });
  it("carries the ranges and ice sheets the headline depends on", () => {
    const names = W.FEATURES.map(f => f.name);
    expect(names).toContain("Alps");
    expect(names).toContain("Rocky Mountains");
    expect(names).toContain("Himalayas");
    expect(W.FEATURES.filter(f => f.cls === "range").length).toBeGreaterThan(100);
    // no mask may be absurdly large — that was the region-outline symptom
    expect(Math.max(...W.FEATURES.map(f=>f.cells.length))).toBeLessThan(1200);
    expect(W.FEATURES.filter(f => f.cls === "ice").length).toBeGreaterThan(0);
  });
});

describe("horizonKm", () => {
  it("is zero on the ground", () => expect(W.horizonKm(0)).toBe(0));
  it("gives ~370 km from FL350", () => {
    // 3.57·√10668 = 368.7 km
    expect(W.horizonKm(35000)).toBeGreaterThan(360);
    expect(W.horizonKm(35000)).toBeLessThan(375);
  });
  it("grows with the square root of height", () => {
    expect(W.horizonKm(40000)/W.horizonKm(10000)).toBeCloseTo(2, 1);
  });
});

describe("sideOf — which window", () => {
  it("puts 090 relative on the right and 270 on the left", () => {
    expect(W.sideOf(90).side).toBe("right");
    expect(W.sideOf(270).side).toBe("left");
  });
  it("calls dead ahead and dead astern out rather than guessing a side", () => {
    expect(W.sideOf(0).side).toBe("ahead");
    expect(W.sideOf(180).side).toBe("behind");
    expect(W.sideOf(359).side).toBe("ahead");
  });
  it("normalises out-of-range bearings", () => {
    expect(W.sideOf(450).side).toBe("right");   // 450 → 90
    expect(W.sideOf(-90).side).toBe("left");    // -90 → 270
  });
  it("names seat letters for both sides", () => {
    expect(W.SEAT_LETTERS.left).toMatch(/A/);
    expect(W.SEAT_LETTERS.right).toBeTruthy();
  });
});

describe("featuresNear", () => {
  it("finds the Alps from overhead Switzerland", () => {
    const near = W.featuresNear({lat:46.5, lon:8.2}, 90, 35000, 300);
    expect(near.map(f=>f.name)).toContain("Alps");
    expect(near.find(f=>f.name==="Alps").km).toBeLessThan(50);
  });
  it("finds nothing in the middle of the South Pacific", () => {
    const near = W.featuresNear({lat:-35, lon:-140}, 90, 35000, 300);
    expect(near.length).toBe(0);
  });
  it("returns results ordered by distance", () => {
    const near = W.featuresNear({lat:46.5, lon:8.2}, 90, 35000, 300);
    for (let i=1;i<near.length;i++) expect(near[i].km).toBeGreaterThanOrEqual(near[i-1].km);
  });
  it("assigns a side relative to the track, so reversing course swaps sides", () => {
    const east = W.featuresNear({lat:43, lon:8.2}, 90, 35000, 300).find(f=>f.name==="Alps");
    const west = W.featuresNear({lat:43, lon:8.2}, 270, 35000, 300).find(f=>f.name==="Alps");
    expect(east && west).toBeTruthy();
    expect(east.side).not.toBe(west.side);
  });
});

describe("geomagnetic latitude", () => {
  it("is 90° at the geomagnetic pole itself", () => {
    expect(W.geomagLat(80.7, -72.7)).toBeCloseTo(90, 4);
  });
  it("explains why Scotland beats Moscow at the same latitude", () => {
    // Both near 56°N, but Scotland sits much closer to the geomagnetic pole.
    const edinburgh = W.geomagLat(55.95, -3.19);
    const moscow    = W.geomagLat(55.75, 37.62);
    expect(edinburgh).toBeGreaterThan(moscow);
  });
  it("stays within ±90", () => {
    for (let lat=-90; lat<=90; lat+=15)
      for (let lon=-180; lon<180; lon+=45)
        expect(Math.abs(W.geomagLat(lat, lon))).toBeLessThanOrEqual(90.0001);
  });
});

describe("auroraBoundary", () => {
  it("matches NOAA's tabulated values at integer Kp", () => {
    W.KP_BOUNDARY.forEach((v,i) => expect(W.auroraBoundary(i)).toBeCloseTo(v, 6));
  });
  it("moves equatorward as Kp rises", () => {
    for (let k=0;k<9;k++) expect(W.auroraBoundary(k+1)).toBeLessThan(W.auroraBoundary(k));
  });
  it("interpolates between integers", () => {
    expect(W.auroraBoundary(2.5)).toBeCloseTo((62.4+60.4)/2, 6);
  });
  it("clamps outside 0–9", () => {
    expect(W.auroraBoundary(-3)).toBe(66.5);
    expect(W.auroraBoundary(99)).toBe(48.0);
  });
});

describe("kpAt", () => {
  const series = [
    { t: Date.UTC(2026,7,18, 0,0), kp: 2 },
    { t: Date.UTC(2026,7,18, 3,0), kp: 5 },
  ];
  it("picks the nearest 3-hourly sample", () => {
    expect(W.kpAt(series, new Date(Date.UTC(2026,7,18,2,0)))).toBe(5);
    expect(W.kpAt(series, new Date(Date.UTC(2026,7,18,0,30)))).toBe(2);
  });
  it("refuses to extrapolate far beyond the series", () => {
    expect(W.kpAt(series, new Date(Date.UTC(2026,7,19,12,0)))).toBeNull();
  });
  it("returns null for an empty series rather than a made-up value", () => {
    expect(W.kpAt(null, new Date())).toBeNull();
    expect(W.kpAt([], new Date())).toBeNull();
  });
});

describe("terminatorEvents", () => {
  const tl = (alts) => alts.map((a,i) => ({
    time: new Date(Date.UTC(2026,7,18, 0, i*2)), sunAlt:a, sunAz:270,
    sunSide:{side:"left"}, lat:50, lon:0, brg:270,
  }));
  it("detects a sunset when the sun crosses -0.833 downward", () => {
    const ev = W.terminatorEvents(tl([5, 2, 0, -2, -5]));
    expect(ev.some(e => e.kind === "sunset")).toBe(true);
  });
  it("detects a sunrise on the way up", () => {
    const ev = W.terminatorEvents(tl([-5, -2, 0, 2, 5]));
    expect(ev.some(e => e.kind === "sunrise")).toBe(true);
  });
  it("finds nothing when the sun never crosses", () => {
    expect(W.terminatorEvents(tl([20,21,22,23])).length).toBe(0);
  });
  it("interpolates the crossing time between samples", () => {
    const ev = W.terminatorEvents(tl([5, -5])).find(e => e.kind === "sunset");
    expect(ev).toBeTruthy();
    // crossing sits between the two samples
    expect(ev.time.getTime()).toBeGreaterThan(Date.UTC(2026,7,18,0,0));
    expect(ev.time.getTime()).toBeLessThan(Date.UTC(2026,7,18,0,2));
  });
});

describe("cell masks answer containment honestly", () => {
  const at = (lon, lat) => W.featuresAt({lat, lon}).map(f => f.name);

  it("does NOT put Greenland under a London–Reykjavik track", () => {
    // The regression this mask exists for: Greenland's bounding box has open
    // Atlantic in its south-east corner, and the bbox build reported it as
    // directly below at 0 km.
    expect(at(-15, 62)).not.toContain("Greenland");
    expect(at(-22, 63)).not.toContain("Greenland");
  });
  it("still puts Greenland under Greenland", () => {
    expect(at(-40, 72)).toContain("Greenland");
  });
  it("finds the Alps over Switzerland and the Sahara over Algeria", () => {
    expect(at(8.2, 46.5)).toContain("Alps");
    expect(at(10, 25)).toContain("Sahara");
  });
  it("finds nothing in the open South Pacific", () => {
    expect(at(-140, -35)).toEqual([]);
  });
  it("handles the antimeridian with no special case", () => {
    // Two observers 110 km apart across the seam must see the same things.
    // No feature in the filtered set straddles 180 any more, so this tests the
    // property that matters: the cell scan does not fall off the edge.
    const near = lon => W.featuresNear({lat:66.0, lon}, 90, 35000, 300)
                         .map(f=>f.name).sort();
    const east = near(179.5), west = near(-179.5);
    expect(east.length).toBeGreaterThan(0);
    expect(west).toEqual(east);
  });
  it("scans across the seam rather than clipping at it", () => {
    // A point just west of the dateline must still reach Chukotka to its east.
    const names = W.featuresNear({lat:66.0, lon:-179.0}, 90, 35000, 300).map(f=>f.name);
    expect(names).toContain("Chukchi Peninsula");
  });
  it("excludes region-outline classes that are not land", () => {
    // Natural Earth draws island groups and geoareas as regions enclosing open
    // ocean, so their masks are meaningless as "what is below you".
    const names = W.FEATURES.map(f=>f.name);
    expect(names).not.toContain("Polynesia");
    expect(names).not.toContain("Siberia");
    // the real land inside them is still named, and more usefully
    expect(names).toContain("Great Britain");
    expect(names).toContain("Greenland");
  });
});

describe("cellId / cellCentre", () => {
  it("round-trips a point to within half a cell", () => {
    for (const [lon,lat] of [[0,0],[-179.9,89.9],[179.9,-89.9],[8.2,46.5],[-73,40.6]]){
      const c = W.cellCentre(W.cellId(lon, lat));
      expect(Math.abs(c.lat - lat)).toBeLessThanOrEqual(1.0);
      let dl = Math.abs(c.lon - lon); if (dl > 180) dl = 360 - dl;
      expect(dl).toBeLessThanOrEqual(1.0);
    }
  });
  it("maps ±180 to the same column", () => {
    expect(W.cellId(-180, 0)).toBe(W.cellId(180, 0));
  });
});
