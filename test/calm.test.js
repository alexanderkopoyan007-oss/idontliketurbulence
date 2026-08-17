import { describe, it, expect, beforeAll } from "vitest";
import { load, PHYSICS_FILES } from "./harness.js";

let C;
beforeAll(() => {
  C = load([...PHYSICS_FILES, "src/render.js", "src/calm.js"],
           ["feelText", "cabinText", "verdictWords", "verdictFor",
            "calmPanelHTML", "BANDS", "CALM_BANDS", "CALM_VERDICTS", "VERDICTS"],
           { settable: ["CALM"] });
});

const off = () => C.set.CALM(false);
const on  = () => C.set.CALM(true);

describe("calm mode — wiring", () => {
  it("passes the original copy straight through when off", () => {
    off();
    for (const b of C.BANDS){
      expect(C.feelText(b)).toBe(b.feel);
      expect(C.cabinText(b)).toBe(b.cabin);
    }
  });

  it("substitutes the calm copy when on", () => {
    on();
    for (const b of C.BANDS){
      expect(C.feelText(b)).toBe(C.CALM_BANDS[b.key].feel);
      expect(C.cabinText(b)).toBe(C.CALM_BANDS[b.key].why);
      expect(C.feelText(b)).not.toBe(b.feel);
    }
    off();
  });

  it("covers every band — no missing calm variant", () => {
    expect(C.CALM_BANDS).toHaveLength(C.BANDS.length);
    C.BANDS.forEach((b, i) => {
      expect(C.CALM_BANDS[i].name).toBe(b.name);
      expect(C.CALM_BANDS[i].feel.length).toBeGreaterThan(10);
      expect(C.CALM_BANDS[i].why.length).toBeGreaterThan(10);
    });
  });

  it("uses the same verdict thresholds in both modes", () => {
    expect(C.CALM_VERDICTS.map(v => v[0])).toEqual(C.VERDICTS.map(v => v[0]));
  });

  it("swaps the verdict headline but keeps the same severity ordering", () => {
    const felts = [0.05, 0.14, 0.22, 0.30, 0.42, 0.55, 0.80];
    off(); const normal = felts.map(f => C.verdictWords(f));
    on();  const calm   = felts.map(f => C.verdictWords(f));
    off();
    // Same bucket index chosen for every input.
    felts.forEach((f, i) => {
      expect(C.VERDICTS.indexOf(normal[i])).toBe(C.CALM_VERDICTS.indexOf(calm[i]));
    });
    expect(calm[0][1]).not.toBe(normal[0][1]);
    expect(calm[6][1]).not.toBe(normal[6][1]);
  });
});

describe("calm mode — the promise it makes", () => {
  /* The whole claim of this mode is that only the wording changes. If a future
     edit ever tries to soften a number, these fail. */
  it("never renames a band, so severity language stays honest", () => {
    on();
    const worst = { band: C.BANDS[5] };            // Severe
    const html = C.calmPanelHTML({ worst });
    expect(html).toContain("Severe");
    expect(html).not.toMatch(/\bmild\b|\bnothing to worry\b|\bperfectly safe\b/i);
    off();
  });

  it("still names strong and severe conditions plainly in the headline", () => {
    on();
    expect(C.verdictWords(0.80)[1].toLowerCase()).toContain("bumpy");
    expect(C.verdictWords(0.80)[2].toLowerCase()).toContain("strong");
    off();
  });

  it("says explicitly that the numbers are unchanged", () => {
    on();
    const html = C.calmPanelHTML({ worst: { band: C.BANDS[2] } });
    expect(html).toMatch(/same in this mode|Only the wording changes/i);
    off();
  });

  it("renders a panel even with no worst waypoint", () => {
    on();
    const html = C.calmPanelHTML({ worst: null });
    expect(html).toContain("What this actually means");
    expect(html).toContain("Smooth");
    off();
  });

  it("keeps the seatbelt point, which is the one that changes behaviour", () => {
    on();
    const html = C.calmPanelHTML({ worst: { band: C.BANDS[3] } });
    expect(html).toMatch(/belt/i);
    off();
  });
});
