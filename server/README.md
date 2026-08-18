# Observation network backend

Deploy-ready. Not deployed — it needs a Cloudflare account.

```bash
cd server
npx wrangler d1 create ride-report          # copy the id into wrangler.toml
npx wrangler d1 execute ride-report --file=./migrations/0001_init.sql --remote
npx wrangler deploy
```

Then point the client at it by setting `OBS_ENDPOINT` in `src/motionview.js`.

## What it stores, and what it refuses to

There is no column for a device id, an account, a session, a user agent or an IP
address. Privacy here is a property of the schema rather than of a policy
document: nothing that could identify a passenger is stored, because no such
column exists.

Position is coarse by contract. The client rounds to 0.1° (~11 km) before
sending and the Worker rounds again on arrival, so a client that forgets cannot
leak precision. Timestamps are rounded to the minute — a 10-second-resolution
track of somebody's position is more identifying than this needs.

Rate limiting uses a salted, truncated, hourly-expiring hash of the address. The
address itself is never written. Change `SALT` before deploying, or the scheme is
guessable.

## Why `/forecasts` exists

The verification loop only means anything if the forecast is recorded **before**
the flight. A model that looks up what it predicted after seeing the outcome is
grading its own homework. So briefings POST their forecast points at build time,
and `/verification` joins the two afterwards.

`/verification` reports observed index against forecast band. Those are different
quantities — one is cabin response, one is atmospheric EDR — so the question it
answers is whether forecast severity **orders** the observations correctly, not
whether the numbers agree. Publish the disagreement too; that is the point.

## The proxy route

`/proxy?src=opensky&path=...` exists because no free ADS-B source allows browser
origins:

| Source | Cross-origin |
|---|---|
| OpenSky | `access-control-allow-origin: https://opensky-network.org` |
| adsb.lol | no CORS header |
| airplanes.live | 403 |

That is what blocks aircraft rotation in the delay estimate and live traffic on a
map view. This route unblocks both. It is **off by default** (`ENABLE_PROXY=0`)
because it spends someone else's quota under your name — turn it on knowingly,
and respect their rate limits.
