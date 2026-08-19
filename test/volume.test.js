import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";

/* volume.js touches WebGL at load, so rather than run it through the sandbox
   harness this lifts out the one pure function that matters. The camera is the
   part that can silently produce a blank screen, and a blank screen is
   indistinguishable from a dead renderer — so it gets tested arithmetically. */
let volMatrix;
beforeAll(() => {
  const src = readFileSync(new URL("../src/volume.js", import.meta.url), "utf8");
  const body = src.slice(src.indexOf("function volMatrix"), src.indexOf("function volFrame"));
  volMatrix = new Function(body + "; return volMatrix;")();
});

/* The shader multiplies camRot by vec3(ndc, -1.6), so the ray at screen centre
   is -column2. */
const centreRay = m => [-m[6], -m[7], -m[8]];
const eyeAt = (yaw, pitch, d = 2.6) => {
  const cp = Math.cos(pitch);
  return [Math.sin(yaw)*cp*d, Math.sin(pitch)*d, Math.cos(yaw)*cp*d];
};
/* the same slab test the shader runs */
function hitBox(ro, rd){
  let t0 = -Infinity, t1 = Infinity;
  for (let i=0;i<3;i++){
    const inv = 1/rd[i];
    let a = (-1-ro[i])*inv, b = (1-ro[i])*inv;
    if (a > b){ const t = a; a = b; b = t; }
    t0 = Math.max(t0, a); t1 = Math.min(t1, b);
  }
  return { t0, t1, hit: t1 > Math.max(t0, 0) };
}

const ANGLES = [
  [-0.6, 0.28], [0, 0], [1.2, -0.8], [3.0, 1.2],
  [-2.2, 0.9], [0.7, -1.3], [-1.35, 1.34], [2.5, -1.34],
];

describe("volume camera", () => {
  it("returns nine finite numbers", () => {
    const m = volMatrix(-0.6, 0.28);
    expect(m.length).toBe(9);
    for (const v of m) expect(Number.isFinite(v)).toBe(true);
  });

  it("aims the centre ray at the origin from every angle", () => {
    /* The regression: a hand-written matrix had the Y term inverted, so the ray
       pointed up where it should have pointed down. */
    for (const [yaw, pitch] of ANGLES){
      const eye = eyeAt(yaw, pitch);
      const want = eye.map(v => -v/Math.hypot(...eye));
      const got = centreRay(volMatrix(yaw, pitch));
      for (let i=0;i<3;i++) expect(got[i]).toBeCloseTo(want[i], 6);
    }
  });

  it("intersects the volume from every angle", () => {
    /* This is what failed: t0 > t1 meant no hit, so every pixel fell through to
       the background and the canvas rendered pure black. */
    for (const [yaw, pitch] of ANGLES){
      const eye = eyeAt(yaw, pitch);
      const h = hitBox(eye, centreRay(volMatrix(yaw, pitch)));
      expect(h.hit).toBe(true);
      expect(h.t1).toBeGreaterThan(h.t0);
      expect(h.t1 - h.t0).toBeGreaterThan(1.5);   // a real span, not a graze
    }
  });

  it("produces an orthonormal basis", () => {
    for (const [yaw, pitch] of ANGLES){
      const m = volMatrix(yaw, pitch);
      const col = i => [m[i*3], m[i*3+1], m[i*3+2]];
      const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
      for (let i=0;i<3;i++) expect(Math.hypot(...col(i))).toBeCloseTo(1, 6);
      expect(dot(col(0), col(1))).toBeCloseTo(0, 6);
      expect(dot(col(0), col(2))).toBeCloseTo(0, 6);
      expect(dot(col(1), col(2))).toBeCloseTo(0, 6);
    }
  });

  it("survives looking straight down, where the up vector degenerates", () => {
    for (const pitch of [Math.PI/2 - 1e-9, -Math.PI/2 + 1e-9]){
      const m = volMatrix(0, pitch);
      for (const v of m) expect(Number.isFinite(v)).toBe(true);
    }
  });
});
