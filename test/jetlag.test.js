import { describe, it, expect, beforeAll } from "vitest";
import { load, PHYSICS_FILES } from "./harness.js";

let J;
beforeAll(() => {
  J = load([...PHYSICS_FILES, "src/jetlag.js"], ["jetlagPlan", "JL"]);
});

/* Real zones, evaluated on a real date so DST is exercised rather than assumed.
   August: London BST (+1), Tokyo JST (+9), Los Angeles PDT (−7), Delhi IST (+5.5). */
const AUG = new Date(Date.UTC(2026, 7, 18, 12, 0));
const plan = (fromTz, toTz, over = {}) => J.jetlagPlan({
  fromTz, toTz, dep: AUG, arr: AUG,
  bed: 23.5, wake: 7, daysBefore: 3, ...over,
});

const near = (a, b, tol = 1e-9) => Math.abs(a - b) < tol;

describe("direction of travel", () => {
  it("calls an eastward trip an advance", () => {
    const P = plan("Europe/London", "Asia/Tokyo");
    expect(P.rawShift).toBeCloseTo(8, 6);
    expect(P.advancing).toBe(true);
  });

  it("calls a westward trip a delay", () => {
    const P = plan("Europe/London", "America/Los_Angeles");
    expect(P.rawShift).toBeCloseTo(-8, 6);
    expect(P.advancing).toBe(false);
  });

  it("handles a half-hour zone", () => {
    const P = plan("Europe/London", "Asia/Kolkata");
    expect(P.rawShift).toBeCloseTo(4.5, 6);
    expect(P.advancing).toBe(true);
  });

  it("reports no adjustment for a north–south trip in the same zone", () => {
    const P = plan("Europe/London", "Europe/Lisbon");
    expect(P.daysNeeded).toBe(0);
  });

  it("takes a very large eastward jump the long way round, as a delay", () => {
    // Auckland is +12 from London in August: advancing 12 h is worse than
    // delaying 12 h, and beyond MAX_ADVANCE the plan should flip.
    const P = plan("Europe/London", "Pacific/Auckland");
    expect(P.rawShift).toBeGreaterThan(J.JL.MAX_ADVANCE);
    expect(P.viaLongWay).toBe(true);
    expect(P.advancing).toBe(false);
    expect(P.shift).toBeCloseTo(P.rawShift - 24, 6);
  });

  it("does not flip a moderate eastward shift", () => {
    const P = plan("Europe/London", "Asia/Tokyo");
    expect(P.viaLongWay).toBe(false);
  });
});

describe("the phase-response curve — light on the correct side of CBTmin", () => {
  /* This is the test that matters. Light after CBTmin advances the clock, light
     before it delays. Getting this backwards actively worsens jet lag, so the
     windows must sit on the right side for the direction of travel. */
  const after = (win, cbt) => {
    const rel = ((win[0] - cbt) % 24 + 24) % 24;
    return rel < 12;                     // window starts within 12 h AFTER cbtmin
  };

  it("puts SEEK light after CBTmin when advancing (eastward)", () => {
    for (const d of plan("Europe/London", "Asia/Tokyo").days){
      expect(after(d.seekLight, d.cbtmin)).toBe(true);
      expect(after(d.avoidLight, d.cbtmin)).toBe(false);
    }
  });

  it("puts SEEK light before CBTmin when delaying (westward)", () => {
    for (const d of plan("Europe/London", "America/Los_Angeles").days){
      expect(after(d.seekLight, d.cbtmin)).toBe(false);
      expect(after(d.avoidLight, d.cbtmin)).toBe(true);
    }
  });

  it("never overlaps the seek and avoid windows", () => {
    for (const tz of ["Asia/Tokyo", "America/Los_Angeles", "Asia/Kolkata"]){
      for (const d of plan("Europe/London", tz).days){
        const span = w => {
          const a = w[0], b = w[1] < w[0] ? w[1] + 24 : w[1];
          return [a, b];
        };
        const [s0, s1] = span(d.seekLight), [a0, a1] = span(d.avoidLight);
        const overlap = Math.min(s1, a1) - Math.max(s0, a0);
        expect(overlap).toBeLessThanOrEqual(0);
      }
    }
  });
});

describe("the schedule marches in the right direction", () => {
  it("moves bedtime EARLIER each day when advancing", () => {
    const days = plan("Europe/London", "Asia/Tokyo").days.filter(d => !d.arrived);
    for (let i = 1; i < days.length; i++){
      const delta = ((days[i-1].bed - days[i].bed) % 24 + 24) % 24;
      expect(delta).toBeCloseTo(J.JL.ADVANCE_PER_DAY, 6);   // earlier by one step
    }
  });

  it("moves bedtime LATER each day when delaying", () => {
    const days = plan("Europe/London", "America/Los_Angeles").days.filter(d => !d.arrived);
    for (let i = 1; i < days.length; i++){
      const delta = ((days[i].bed - days[i-1].bed) % 24 + 24) % 24;
      expect(delta).toBeCloseTo(J.JL.DELAY_PER_DAY, 6);     // later by one step
    }
  });

  it("lands fully adjusted: CBTmin returns to its home clock time", () => {
    for (const tz of ["Asia/Tokyo", "America/Los_Angeles", "Asia/Kolkata"]){
      const P = plan("Europe/London", tz);
      const last = P.days[P.days.length - 1];
      expect(last.arrived).toBe(true);
      // Within one day's step of the habitual CBTmin, in destination local time.
      const diff = Math.abs(((last.cbtmin - P.cbtOrigin + 12) % 24) - 12);
      expect(diff).toBeLessThanOrEqual(P.perDay + 1e-6);
    }
  });

  it("keeps sleep duration constant while shifting it", () => {
    const P = plan("Europe/London", "Asia/Tokyo");
    for (const d of P.days){
      const dur = ((d.wake - d.bed) % 24 + 24) % 24;
      expect(dur).toBeCloseTo(P.sleepHours, 6);
    }
  });

  it("needs more days for a bigger shift, and delays go faster than advances", () => {
    const east = plan("Europe/London", "Asia/Tokyo");        // 8 h advance
    const west = plan("Europe/London", "America/Los_Angeles"); // 8 h delay
    expect(east.magnitude).toBeCloseTo(west.magnitude, 6);
    expect(east.daysNeeded).toBeGreaterThan(west.daysNeeded);
  });

  it("respects a request for no pre-travel preparation", () => {
    const P = plan("Europe/London", "Asia/Tokyo", { daysBefore: 0 });
    expect(P.days.every(d => d.offset >= 0)).toBe(true);
  });

  it("switches the reference zone on the travel day", () => {
    const P = plan("Europe/London", "Asia/Tokyo");
    expect(P.days.find(d => d.offset === -1).zone).toBe("Europe/London");
    expect(P.days.find(d => d.offset === 0).zone).toBe("Asia/Tokyo");
  });

  it("stops caffeine a clear margin before target sleep", () => {
    for (const d of plan("Europe/London", "Asia/Tokyo").days){
      const gap = ((d.bed - d.caffeineUntil) % 24 + 24) % 24;
      expect(gap).toBeCloseTo(8, 6);
    }
  });
});
