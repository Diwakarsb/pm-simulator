-- Calmly meditation app — sample dataset for the SQL-for-PMs simulator.
-- Load into DuckDB-WASM / sql.js. Generate seed rows so the answer keys in
-- content/sql-for-pms.json hold (see the ANSWER-KEY TARGETS at the bottom).

CREATE TABLE users (
  id                 INTEGER PRIMARY KEY,
  created_at         TIMESTAMP,   -- signup time
  channel            VARCHAR,     -- organic, google_ads, instagram, referral, apple_search
  country            VARCHAR,     -- US, IN, DE, GB, BR
  platform           VARCHAR,     -- ios, android, web
  age                INTEGER,
  is_premium         BOOLEAN,     -- currently a paying subscriber
  premium_started_at TIMESTAMP,   -- null if never premium
  goal               VARCHAR,     -- sleep, stress, focus, anxiety
  referred_by        INTEGER,     -- users.id or null
  marketing_opt_in   BOOLEAN
);  -- 11 columns (answer to sql_q1)

CREATE TABLE sessions (
  id            INTEGER PRIMARY KEY,
  user_id       INTEGER,         -- -> users.id
  started_at    TIMESTAMP,
  duration_min  INTEGER,         -- include a few bad rows (e.g. 100000) for sql_q8
  content_id    INTEGER,
  completed     BOOLEAN
);

-- ANSWER-KEY TARGETS (generate data to satisfy these):
--  sql_q1: users has exactly 11 columns.
--  sql_q2: COUNT(users created in Jan 2024) = 1204.
--  sql_q3: top channel by user count = 'organic'.
--  sql_q4: overall premium conversion ≈ 6.2%.
--  sql_q5: 'referral' has the highest premium-conversion% among channels with meaningful volume;
--          include one tiny channel (~12 users, ~50%) as a small-sample trap.
--  sql_q6: avg sessions per ACTIVE user in Jan 2024 ≈ 4.7.
--  sql_q7: 7-day retention of Jan signup cohort ≈ 28%.
--  sql_q8: a handful of sessions with duration_min = 100000 (logging bug) so AVG is distorted.
--  sql_q9: premium_started_at populated for premium users across several weeks (for weekly trend).
