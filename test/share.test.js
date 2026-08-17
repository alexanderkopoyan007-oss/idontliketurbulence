import { describe, it, expect, beforeAll } from "vitest";
import { load, PHYSICS_FILES } from "./harness.js";

/* share.js reads the global RES and the DOM, so the harness loads it on top of
 * the physics modules and the test swaps RES in. render.js supplies verdictFor. */
let S;
beforeAll(() => {
  S = load([...PHYSICS_FILES, "src/render.js", "src/share.js"],
           ["shareState", "shareSummary", "verdictFor", "VERDICTS"],
           { settable: ["RES"] });
});

function fakeResult(over = {}){
  return {
    route: {
      dep: { iata:"LHR" }, arr: { iata:"JFK" },
      opts: { acft:"narrow", fl:"auto", scaleKm:90 },
      distNM: 3045, topFt: 35000,
    },
    live: [{ time: new Date(Date.UTC(2026, 7, 17, 21, 30)) }],
    felt: 0.12, score: 97, confidence: 88, totalMin: 480, roughMin: 0,
    flightNo: null, whenLocal: "2026-08-17T22:00",
    ...over,
  };
}

/* shareState reads the sandbox's own `RES`, so the write must happen in there. */
function withResult(R, fn){
  S.set.RES(R);
  try { return fn(); } finally { S.set.RES(null); }
}

describe("shareSummary", () => {
  it("reads as the intended preview line", () => {
    const s = withResult(fakeResult(), () => S.shareSummary(fakeResult()));
    expect(s).toBe("LHR→JFK, 17 Aug — mostly smooth, ride score 97/100");
  });

  it("tracks the verdict as the ride worsens", () => {
    const rough = fakeResult({ felt: 0.45, score: 38 });
    const s = S.shareSummary(rough);
    expect(s).toContain("LHR→JFK");
    expect(s).toContain("ride score 38/100");
    expect(s).not.toContain("mostly smooth");
  });

  it("uses the first live waypoint's date, not today's", () => {
    const r = fakeResult({ live: [{ time: new Date(Date.UTC(2026, 0, 3, 6, 0)) }] });
    expect(S.shareSummary(r)).toContain("3 Jan");
  });
});

describe("shareState — URL encoding", () => {
  it("encodes a route query and omits every default", () => {
    const p = withResult(fakeResult(), S.shareState);
    expect(p).toBe("r=LHR-JFK&t=2026-08-17T22%3A00");
  });

  it("encodes non-default aircraft, level and scale", () => {
    const R = fakeResult();
    R.route.opts = { acft:"regional", fl:"360", scaleKm:40 };
    const p = new URLSearchParams(withResult(R, S.shareState));
    expect(p.get("a")).toBe("regional");
    expect(p.get("fl")).toBe("360");
    expect(p.get("s")).toBe("40");
  });

  it("prefers the flight number over the airport pair when there is one", () => {
    const R = fakeResult({ flightNo: "BA117" });
    const p = new URLSearchParams(withResult(R, S.shareState));
    expect(p.get("f")).toBe("BA117");
    expect(p.get("r")).toBeNull();
  });

  it("round-trips through URLSearchParams without losing the time", () => {
    const R = fakeResult();
    const p = new URLSearchParams(withResult(R, S.shareState));
    expect(p.get("t")).toBe("2026-08-17T22:00");
    expect(p.get("r")).toBe("LHR-JFK");
  });

  it("returns null when there is no result to describe", () => {
    expect(S.shareState()).toBeNull();
  });
});
