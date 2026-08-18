import { describe, it, expect, beforeEach } from "vitest";
import worker from "../server/worker.js";

/* A mock D1 that records what it was asked to store, so the privacy guarantees
   can be asserted rather than assumed. */
function mockDB(){
  const rows = { observations: [], forecasts: [], quota: new Map() };
  const prepare = (sql) => {
    const stmt = {
      sql, args: [],
      bind(...a){ return { ...stmt, args: a, run: stmt.run, first: stmt.first, all: stmt.all }; },
      async run(){
        if (/INSERT OR REPLACE INTO quota/.test(sql)) rows.quota.set(this.args[0], { n:1, expires:this.args[1] });
        else if (/UPDATE quota/.test(sql)){ const q = rows.quota.get(this.args[0]); if (q) q.n++; }
        return { success:true };
      },
      async first(){
        if (/SELECT n, expires FROM quota/.test(sql)) return rows.quota.get(this.args[0]) || null;
        return null;
      },
      async all(){ return { results: [] }; },
    };
    return stmt;
  };
  return {
    rows,
    prepare,
    async batch(stmts){
      for (const s of stmts){
        if (/INSERT INTO observations/.test(s.sql)) rows.observations.push(s.args);
        if (/INSERT INTO forecasts/.test(s.sql))    rows.forecasts.push(s.args);
      }
      return [];
    },
  };
}

const env = () => ({ DB: mockDB(), SALT: "test-salt", ENABLE_PROXY: "0" });
const post = (path, body) => new Request("https://x.dev" + path, {
  method: "POST", headers: { "content-type": "application/json", origin: "http://localhost:8080",
                             "cf-connecting-ip": "203.0.113.9" },
  body: JSON.stringify(body) });

let E;
beforeEach(() => { E = env(); });

describe("CORS and routing", () => {
  it("answers preflight with permissive headers", async () => {
    const r = await worker.fetch(new Request("https://x.dev/observations", { method:"OPTIONS" }), E);
    expect(r.headers.get("access-control-allow-origin")).toBeTruthy();
    expect(r.headers.get("access-control-allow-methods")).toMatch(/POST/);
  });
  it("404s an unknown route rather than throwing", async () => {
    const r = await worker.fetch(new Request("https://x.dev/nope"), E);
    expect(r.status).toBe(404);
  });
  it("rejects a malformed body with 400, not 500", async () => {
    const r = await worker.fetch(post("/observations", { nope: true }), E);
    expect(r.status).toBe(400);
  });
  it("refuses an oversized batch", async () => {
    const r = await worker.fetch(post("/observations", { observations: new Array(2001).fill({index:5}) }), E);
    expect(r.status).toBe(413);
  });
});

describe("privacy is enforced by the code, not by policy", () => {
  it("re-rounds position to 0.1 degrees even if the client sends precision", async () => {
    await worker.fetch(post("/observations", { observations: [
      { t: Date.UTC(2026,7,18,12,34,56), lat: 51.470622, lon: -0.461941, alt: 35123, index: 42 }
    ]}), E);
    const [t, lat, lon, alt] = E.DB.rows.observations[0];
    expect(lat).toBe(51.5);
    expect(lon).toBe(-0.5);
    expect(alt).toBe(35000);
  });

  it("rounds timestamps to the minute", async () => {
    const exact = Date.UTC(2026,7,18,12,34,56);
    await worker.fetch(post("/observations", { observations: [{ t: exact, index: 10 }] }), E);
    const t = E.DB.rows.observations[0][0];
    expect(t % 60000).toBe(0);
    expect(Math.abs(t - exact)).toBeLessThan(60000);
  });

  it("stores nothing that could identify a device or person", async () => {
    await worker.fetch(post("/observations", { observations: [
      { t: Date.now(), lat: 1, lon: 2, alt: 30000, index: 50, deviceId: "abc-123",
        userAgent: "iPhone", email: "someone@example.com", name: "A Passenger" }
    ]}), E);
    const row = E.DB.rows.observations[0];
    const asText = JSON.stringify(row);
    expect(asText).not.toMatch(/abc-123/);
    expect(asText).not.toMatch(/iPhone/);
    expect(asText).not.toMatch(/example\.com/);
    expect(asText).not.toMatch(/Passenger/);
    expect(row.length).toBe(12);          // exactly the declared columns
  });

  it("never writes the caller's address", async () => {
    await worker.fetch(post("/observations", { observations: [{ index: 5 }] }), E);
    const everything = JSON.stringify([...E.DB.rows.quota.entries(), E.DB.rows.observations]);
    expect(everything).not.toMatch(/203\.0\.113\.9/);
  });

  it("derives a rate-limit bucket that is not the address", async () => {
    await worker.fetch(post("/observations", { observations: [{ index: 5 }] }), E);
    const keys = [...E.DB.rows.quota.keys()];
    expect(keys.length).toBe(1);
    expect(keys[0]).toMatch(/^[0-9a-f]{10}$/);
  });
});

describe("validation", () => {
  it("drops observations with an out-of-range index", async () => {
    const r = await worker.fetch(post("/observations", { observations: [
      { index: -5 }, { index: 150 }, { index: "loud" }, { index: 55 }
    ]}), E);
    expect((await r.json()).stored).toBe(1);
    expect(E.DB.rows.observations[0][4]).toBe(55);
  });
  it("accepts a missing position rather than requiring geolocation", async () => {
    const r = await worker.fetch(post("/observations", { observations: [{ index: 30 }] }), E);
    expect((await r.json()).stored).toBe(1);
    const [, lat, lon] = E.DB.rows.observations[0];
    expect(lat).toBeNull(); expect(lon).toBeNull();
  });
  it("only allows known aircraft classes through", async () => {
    await worker.fetch(post("/observations", { observations: [
      { index: 10, acClass: "narrow" }, { index: 10, acClass: "'; DROP TABLE observations;--" }
    ]}), E);
    expect(E.DB.rows.observations[0][10]).toBe("narrow");
    expect(E.DB.rows.observations[1][10]).toBeNull();
  });
});

describe("forecast logging", () => {
  it("stores forecast points so verification cannot be done after the fact", async () => {
    const r = await worker.fetch(post("/forecasts", {
      models: "NOAA GFS 0.25", confidence: 88, issuedAt: Date.now(),
      points: [{ t: Date.now(), lat: 51.47, lon: -0.46, alt: 35000, edr: 0.31, band: 3 }]
    }), E);
    expect((await r.json()).stored).toBe(1);
    expect(E.DB.rows.forecasts[0][4]).toBeCloseTo(0.31, 4);
  });
  it("caps a forecast batch", async () => {
    await worker.fetch(post("/forecasts", { points: new Array(500).fill({ edr: 0.1, band: 1 }) }), E);
    expect(E.DB.rows.forecasts.length).toBe(200);
  });
});

describe("the proxy is off unless deliberately enabled", () => {
  it("refuses by default", async () => {
    const r = await worker.fetch(new Request("https://x.dev/proxy?src=opensky&path=states/all"), E);
    expect(r.status).toBe(403);
  });
  it("rejects an unknown source when enabled", async () => {
    E.ENABLE_PROXY = "1";
    const r = await worker.fetch(new Request("https://x.dev/proxy?src=evil&path=x"), E);
    expect(r.status).toBe(400);
  });
  it("rejects path traversal", async () => {
    E.ENABLE_PROXY = "1";
    const r = await worker.fetch(new Request("https://x.dev/proxy?src=opensky&path=../../etc"), E);
    expect(r.status).toBe(400);
  });
});
