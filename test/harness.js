/* Load the real source files into a sandbox and hand back their globals.
 *
 * The app ships as classic <script> blocks, not ES modules, so there is nothing
 * to import. Rather than maintain a parallel testable copy of the physics —
 * which would drift, and would mean the tests stopped describing the deployed
 * code — the harness evaluates the exact files build.sh concatenates.
 *
 * One wrinkle: top-level `function` declarations become properties of the
 * sandbox's global object, but top-level `const` and `let` do not — they live in
 * the global *lexical* environment, invisible from outside. So after loading we
 * evaluate one more snippet inside the context whose only job is to copy the
 * names we want onto globalThis.
 */
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* The browser gives these to the app for free; core.js touches `document` at the
 * bottom, and the render layer expects a few more. Nothing here fakes physics —
 * these are inert stubs so a file can finish evaluating. */
function browserStubs(){
  const noop = () => {};
  return {
    console,
    document: { querySelector: () => null, querySelectorAll: () => [],
                createElement: () => ({ style:{}, classList:{ add:noop, remove:noop } }),
                addEventListener: noop },
    window: { addEventListener: noop, matchMedia: () => ({ matches:false }) },
    navigator: { userAgent: "test" },
    location: { protocol: "http:", hash: "", origin: "http://localhost" },
    fetch: () => Promise.reject(new Error("network disabled in tests")),
    setTimeout, clearTimeout, setInterval, clearInterval,
  };
}

/**
 * @param {string[]} files  paths relative to the repo root, in load order
 * @param {string[]} names  globals to lift out (consts included)
 */
export function load(files, names){
  const ctx = createContext(browserStubs());
  for (const f of files){
    runInContext(readFileSync(join(ROOT, f), "utf8"), ctx, { filename: f });
  }
  runInContext(
    `globalThis.__t = { ${names.map(n => `${n}`).join(", ")} };`,
    ctx, { filename: "<harness-export>" }
  );
  return ctx.__t;
}

/* The physics lives in core.js + engine.js; engine needs core's constants, and
 * core parses the embedded tables at load, so the data files come first. */
export const PHYSICS_FILES = [
  "src/data/airports.js",
  "src/data/airlines.js",
  "src/core.js",
  "src/engine.js",
];

/** Build a synthetic pressure-level profile of the shape profileAt() returns. */
export function makeProfile({ speed, dirDeg = 270, thetaBase = 300, thetaPerKm = 0, zBase = 0, dzPerLevel = 1000 }, LEVELS, rad, KAPPA){
  return LEVELS.map((L, k) => {
    const z = zBase + k*dzPerLevel;
    const ws = typeof speed === "function" ? speed(k) : speed;
    const th = rad(dirDeg);
    return {
      p: L.p, z, ft: z/0.3048,
      T: 288.15,
      theta: thetaBase + thetaPerKm*(z/1000),
      spd: ws,
      u: -ws*Math.sin(th),
      v: -ws*Math.cos(th),
    };
  });
}
