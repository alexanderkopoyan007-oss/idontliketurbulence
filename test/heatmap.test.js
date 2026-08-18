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

describe("blendColumn / columnAt — shared with the full briefing", () => {
  let E;
  beforeAll(() => {
    E = load(["src/data/airports.js","src/data/airlines.js","src/data/features.js",
              "src/core.js","src/engine.js"],
             ["blendColumn","columnAt","lowLevelTaper","LEVELS"]);
  });

  const gridFL = () => { const g=[]; for (let k=0;k<12;k++) g.push(100+k*30); return g; };
  const col = edrs => edrs.map((e,i) => e === null ? null : ({ ft:(100+i*30)*100, edr:e }));
  const src = v => ({ edrAt: () => v });

  it("lets the strongest source dominate with partial credit for the others", () => {
    // 0.4 CAT, 0.2 wave, 0.1 convection -> 0.4 + 0.35*0.2 + 0.2*0.1 = 0.49
    const c = E.blendColumn(col([0.4]), src(0.2), src(0.1), gridFL(), null);
    expect(c[0].edr).toBeCloseTo(0.4 + 0.35*0.2 + 0.2*0.1, 10);
  });

  it("does not care which source is the strongest", () => {
    const a = E.blendColumn(col([0.4]), src(0.1), src(0.2), gridFL(), null)[0].edr;
    const b = E.blendColumn(col([0.1]), src(0.4), src(0.2), gridFL(), null)[0].edr;
    expect(a).toBeCloseTo(b, 10);
  });

  it("is the regression the heatmap needed: wave and convection are not ignored", () => {
    // The first heatmap build read only the CAT term, which is how a slot scored
    // 93 on the grid and 42 in the briefing.
    const catOnly  = E.blendColumn(col([0.05]), src(0), src(0), gridFL(), null)[0].edr;
    const withConv = E.blendColumn(col([0.05]), src(0), src(0.55), gridFL(), null)[0].edr;
    expect(catOnly).toBeCloseTo(0.05, 10);
    expect(withConv).toBeGreaterThan(0.5);
  });

  it("clamps the blend to 1", () => {
    expect(E.blendColumn(col([0.9]), src(0.9), src(0.9), gridFL(), null)[0].edr).toBe(1);
  });

  it("treats missing sources as zero rather than throwing", () => {
    const c = E.blendColumn(col([0.3]), null, null, gridFL(), null);
    expect(c[0].edr).toBeCloseTo(0.3, 10);
  });

  it("interpolates between levels in columnAt", () => {
    const c = E.blendColumn(col([0.2, 0.6]), null, null, gridFL(), null);
    const mid = E.columnAt(c, (c[0].ft + c[1].ft)/2);
    expect(mid.edr).toBeCloseTo(0.4, 6);
  });

  it("tapers only the lowest levels", () => {
    expect(E.lowLevelTaper(35000)).toBe(1);
    expect(E.lowLevelTaper(8000)).toBe(1);
    expect(E.lowLevelTaper(0)).toBeCloseTo(0.45, 10);
    expect(E.lowLevelTaper(4000)).toBeGreaterThan(0.45);
    expect(E.lowLevelTaper(4000)).toBeLessThan(1);
  });
});

describe("stencil width is a calibration constant, not a cost knob", () => {
  let B;
  beforeAll(() => {
    B = load(["src/data/airports.js","src/data/airlines.js","src/data/features.js",
              "src/core.js","src/engine.js"],
             ["buildRoute","BY_IATA"]);
  });
  const mk = opts => B.buildRoute(B.BY_IATA.get("LHR"), B.BY_IATA.get("JFK"),
                                  new Date(Date.now()+3*3600e3),
                                  { acft:"narrow", fl:"auto", ...opts }, null);

  it("defaults the stencil to the analysis scale", () => {
    const r = mk({ scaleKm: 90 });
    expect(r.stencilKm).toBe(90);
    expect(r.offM).toBe(90000);
  });

  it("lets the two be set independently", () => {
    // What the heatmap needs: coarse spacing, calibrated stencil.
    const r = mk({ scaleKm: 200, stencilKm: 90 });
    expect(r.scaleKm).toBe(200);
    expect(r.stencilKm).toBe(90);
    expect(r.offM).toBe(90000);
    expect(r.wp.length).toBe(16);            // still the cheap waypoint count
  });

  it("puts the stencil points at the stencil width, not the scale", () => {
    const r = mk({ scaleKm: 200, stencilKm: 90 });
    const w = r.wp[5];
    // left and right should be ~180 km apart, i.e. 2 x 90
    const R = 6371008.8, D = Math.PI/180;
    const hav = (a,b) => {
      const p1=a.lat*D, p2=b.lat*D, dp=(b.lat-a.lat)*D, dl=(b.lon-a.lon)*D;
      const h = Math.sin(dp/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
      return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
    };
    expect(hav(w.left, w.right)/1000).toBeGreaterThan(178);
    expect(hav(w.left, w.right)/1000).toBeLessThan(182);
  });

  it("keeps offM and the divisor consistent at every slider position", () => {
    // The bug: analyse divided by a hardcoded 180 km whatever the slider said,
    // so a 20 km stencil under-reported shear by 4.5x.
    for (const km of [20, 45, 90, 140, 200]){
      const r = mk({ scaleKm: km });
      expect(r.offM*2).toBe(km*2000);
    }
  });
});
