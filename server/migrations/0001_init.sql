-- Ride Report observation network — D1 schema.
--
-- Privacy is enforced by the schema, not by policy: there is no column for a
-- device id, an account, a session, a user agent or an IP. Nothing here can
-- identify a passenger, because nothing that could is stored.
--
-- Position is coarse by contract. The client rounds to 0.1 degrees (~11 km)
-- before sending, and the Worker re-rounds on arrival so a client that forgets
-- cannot leak precision. That is fine enough to place an observation against a
-- forecast grid box (~25 km) and far too coarse to place a person.

CREATE TABLE IF NOT EXISTS observations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  -- when the 10-second window ended, unix ms, rounded to the minute on arrival
  t           INTEGER NOT NULL,
  lat         REAL,                -- 0.1 degree grid, nullable: no geolocation is fine
  lon         REAL,
  alt_ft      INTEGER,             -- rounded to 500 ft
  -- the measurement
  idx         INTEGER NOT NULL,    -- 0-100 relative roughness index, NOT an EDR
  slope       REAL,                -- fitted spectral slope; -5/3 is the Kolmogorov value
  r2          REAL,                -- fit quality of that slope
  kolm        REAL,                -- 0-1 confidence the window is turbulence-shaped
  rms         REAL,                -- band-limited RMS cabin acceleration, m/s^2
  fs          REAL,                -- the phone's actual sample rate, Hz
  -- provenance, coarse enough to stay non-identifying
  ac_class    TEXT,                -- 'narrow' | 'wide' | 'jumbo' | 'regional' | null
  received_at INTEGER NOT NULL
);

-- The verification page asks "for observations in this box at this level, what
-- did we forecast and what was measured", so the hot path is a spatial-temporal
-- lookup.
CREATE INDEX IF NOT EXISTS idx_obs_space_time ON observations (lat, lon, t);
CREATE INDEX IF NOT EXISTS idx_obs_time       ON observations (t);

-- Forecasts logged at briefing time, so the comparison is honest: the forecast
-- must be recorded BEFORE the flight, never looked up afterwards. A model that
-- grades its own homework after seeing the answer is worthless.
CREATE TABLE IF NOT EXISTS forecasts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  t           INTEGER NOT NULL,    -- valid time of the forecast point
  lat         REAL NOT NULL,
  lon         REAL NOT NULL,
  alt_ft      INTEGER NOT NULL,
  edr         REAL NOT NULL,       -- what we predicted
  band        INTEGER NOT NULL,    -- 0-5, the BANDS index
  models      TEXT,                -- which models produced it
  confidence  INTEGER,
  issued_at   INTEGER NOT NULL,    -- when the briefing was built
  received_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fc_space_time ON forecasts (lat, lon, t);

-- Rate limiting without identifying anyone: a coarse bucket key that expires.
CREATE TABLE IF NOT EXISTS quota (
  bucket   TEXT PRIMARY KEY,
  n        INTEGER NOT NULL,
  expires  INTEGER NOT NULL
);
