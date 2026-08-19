-- Sample dataset schema for the SQL-tool task (T2).
-- Load into DuckDB-WASM / sql.js and seed with generated rows matching the constraints below.
-- The verified correct answer for T2 requires: exactly 17 rows where
--   is_premium = TRUE AND created_date BETWEEN '2022-01-01' AND '2022-02-01'
--   AND acquisition_channel = 'google'.
-- Generate the rest of the table so that count is 17 (and the "116" trap is plausible, e.g. total
-- premium Jan rows across all channels is larger).

CREATE TABLE viditation_user (
  user_id                  INTEGER,
  created_date             TIMESTAMP,
  acquisition_channel      VARCHAR,   -- e.g. 'google', 'twitter'
  acquisition_campaign     VARCHAR,   -- e.g. 'early adopters', 'esoteric', 'improve concentration'
  country_iso              VARCHAR,   -- e.g. 'DE', 'FR'
  h_lifetime_days          INTEGER,
  h_session_frequency_days INTEGER,
  age                      INTEGER,
  goal                     VARCHAR,
  is_premium               BOOLEAN,
  acquisition_cost         NUMERIC,
  is_skylark               INTEGER,
  onboarding_version       VARCHAR
);

-- Example rows (shape only):
-- 27395 | 2022-01-05T04:12:12 | twitter | early adopters       | DE | 5  | 3 | ... | ...
-- 27396 | 2022-01-05T16:28:12 | google  | esoteric             | FR | 41 | 1 | ... | ...
-- 27397 | 2022-01-05T22:45:29 | twitter | improve concentration| DE | 13 | 1 | ... | ...
