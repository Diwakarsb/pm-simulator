import * as duckdb from "@duckdb/duckdb-wasm";

let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;

async function initDb(): Promise<duckdb.AsyncDuckDB> {
  const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    mvp: {
      mainModule: "/duckdb/duckdb-mvp.wasm",
      mainWorker: "/duckdb/duckdb-browser-mvp.worker.js",
    },
    eh: {
      mainModule: "/duckdb/duckdb-eh.wasm",
      mainWorker: "/duckdb/duckdb-browser-eh.worker.js",
    },
  };

  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  return db;
}

export function getDb(): Promise<duckdb.AsyncDuckDB> {
  if (!dbPromise) dbPromise = initDb();
  return dbPromise;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

export async function runQuery(sql: string): Promise<QueryResult> {
  const db = await getDb();
  const conn = await db.connect();
  try {
    const result = await conn.query(sql);
    const columns = result.schema.fields.map((f) => f.name);
    const rows = result.toArray().map((row) => {
      const obj: Record<string, unknown> = {};
      for (const col of columns) {
        const v = row[col];
        obj[col] = typeof v === "bigint" ? v.toString() : v;
      }
      return obj;
    });
    return { columns, rows };
  } finally {
    await conn.close();
  }
}

export type DatasetKey = "viditation" | "calmly";

export const DATASET_SCHEMAS: Record<DatasetKey, { database: string; tables: { name: string; columns: string[] }[] }> = {
  viditation: {
    database: "Viditation Database",
    tables: [
      {
        name: "viditation_user",
        columns: [
          "user_id",
          "created_date",
          "acquisition_channel",
          "acquisition_campaign",
          "country_iso",
          "h_lifetime_days",
          "h_session_frequency_days",
          "age",
          "goal",
          "is_premium",
          "acquisition_cost",
          "is_skylark",
          "onboarding_version",
        ],
      },
    ],
  },
  calmly: {
    database: "Calmly Database",
    tables: [
      {
        name: "users",
        columns: [
          "id",
          "created_at",
          "channel",
          "country",
          "platform",
          "age",
          "is_premium",
          "premium_started_at",
          "goal",
          "referred_by",
          "marketing_opt_in",
        ],
      },
      {
        name: "sessions",
        columns: ["id", "user_id", "started_at", "duration_min", "content_id", "completed"],
      },
    ],
  },
};

const seededDatasets = new Set<DatasetKey>();

export async function ensureSeeded(dataset: DatasetKey = "viditation"): Promise<void> {
  if (seededDatasets.has(dataset)) return;
  const db = await getDb();
  const conn = await db.connect();
  try {
    await conn.query(dataset === "calmly" ? CALMLY_SEED_SQL : VIDITATION_SEED_SQL);
  } finally {
    await conn.close();
  }
  seededDatasets.add(dataset);
}

// Generates viditation_user rows satisfying the T2 answer key: exactly 17 premium
// Google-Ads users created in Jan 2022, alongside a larger non-matching population
// so naive counts (e.g. 116) are plausible traps.
const VIDITATION_SEED_SQL = `
CREATE TABLE IF NOT EXISTS viditation_user (
  user_id INTEGER,
  created_date TIMESTAMP,
  acquisition_channel VARCHAR,
  acquisition_campaign VARCHAR,
  country_iso VARCHAR,
  h_lifetime_days INTEGER,
  h_session_frequency_days INTEGER,
  age INTEGER,
  goal VARCHAR,
  is_premium BOOLEAN,
  acquisition_cost NUMERIC,
  is_skylark INTEGER,
  onboarding_version VARCHAR
);

DELETE FROM viditation_user;

-- 17 rows matching: premium + January 2022 + google
INSERT INTO viditation_user
SELECT
  20000 + i AS user_id,
  TIMESTAMP '2022-01-01' + (i * INTERVAL 1 DAY) AS created_date,
  'google' AS acquisition_channel,
  ['early adopters', 'esoteric', 'improve concentration'][1 + (i % 3)] AS acquisition_campaign,
  ['DE', 'FR'][1 + (i % 2)] AS country_iso,
  10 + (i % 60) AS h_lifetime_days,
  1 + (i % 5) AS h_session_frequency_days,
  20 + (i % 40) AS age,
  ['fitness', 'style', 'sustainability'][1 + (i % 3)] AS goal,
  TRUE AS is_premium,
  4.5 + (i % 10) AS acquisition_cost,
  0 AS is_skylark,
  'v2' AS onboarding_version
FROM range(0, 17) AS t(i);

-- 99 rows: premium + January 2022 + non-google (twitter) -> total premium Jan = 116
INSERT INTO viditation_user
SELECT
  21000 + i AS user_id,
  TIMESTAMP '2022-01-01' + (i * INTERVAL 1 DAY) AS created_date,
  'twitter' AS acquisition_channel,
  ['early adopters', 'esoteric', 'improve concentration'][1 + (i % 3)] AS acquisition_campaign,
  ['DE', 'FR'][1 + (i % 2)] AS country_iso,
  10 + (i % 60) AS h_lifetime_days,
  1 + (i % 5) AS h_session_frequency_days,
  20 + (i % 40) AS age,
  ['fitness', 'style', 'sustainability'][1 + (i % 3)] AS goal,
  TRUE AS is_premium,
  3.0 + (i % 8) AS acquisition_cost,
  0 AS is_skylark,
  'v2' AS onboarding_version
FROM range(0, 99) AS t(i);

-- 400 rows: outside Jan 2022 or non-premium, mixed channels, for realism
INSERT INTO viditation_user
SELECT
  22000 + i AS user_id,
  TIMESTAMP '2022-02-15' + (i * INTERVAL 1 DAY) AS created_date,
  ['google', 'twitter'][1 + (i % 2)] AS acquisition_channel,
  ['early adopters', 'esoteric', 'improve concentration'][1 + (i % 3)] AS acquisition_campaign,
  ['DE', 'FR'][1 + (i % 2)] AS country_iso,
  10 + (i % 60) AS h_lifetime_days,
  1 + (i % 5) AS h_session_frequency_days,
  20 + (i % 40) AS age,
  ['fitness', 'style', 'sustainability'][1 + (i % 3)] AS goal,
  (i % 2 = 0) AS is_premium,
  2.0 + (i % 12) AS acquisition_cost,
  0 AS is_skylark,
  'v2' AS onboarding_version
FROM range(0, 400) AS t(i);
`;

// Generates the Calmly (meditation app) dataset for the SQL-for-PMs lesson,
// engineered so the answer-key targets in content/sql-for-pms.json hold:
//   sql_q2: exactly 1,204 users created in Jan 2024.
//   sql_q3: 'organic' is the top channel by user count.
//   sql_q4: overall premium conversion ~= 6.2%.
//   sql_q5: 'referral' has the highest premium-conversion% among channels with
//           real volume; 'partner_promo' (12 users, 50%) is a small-sample trap.
//   sql_q6: avg sessions per active user in Jan 2024 = exactly 4.7 (7,050 / 1,500).
//   sql_q7: 7-day retention of the Jan signup cohort = 337 / 1,204 ~= 28%.
//   sql_q8: a handful of sessions with duration_min = 100000 (logging bug).
// User ids are partitioned by range so these metrics don't cross-contaminate:
//   1..1204        Jan-2024 signup cohort
//   1205..2704     "active in Jan 2024" session pool (base cohort, organic)
//   1205..10816    base cohort (all channels, signed up Jul-Dec 2023)
const CALMLY_SEED_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id                 INTEGER,
  created_at         TIMESTAMP,
  channel            VARCHAR,
  country             VARCHAR,
  platform            VARCHAR,
  age                 INTEGER,
  is_premium          BOOLEAN,
  premium_started_at  TIMESTAMP,
  goal                VARCHAR,
  referred_by         INTEGER,
  marketing_opt_in    BOOLEAN
);

CREATE TABLE IF NOT EXISTS sessions (
  id            INTEGER,
  user_id       INTEGER,
  started_at    TIMESTAMP,
  duration_min  INTEGER,
  content_id    INTEGER,
  completed     BOOLEAN
);

DELETE FROM users;
DELETE FROM sessions;

-- Jan 2024 signup cohort: 1,204 users, ids 1..1204, ~6% premium (72 users)
INSERT INTO users
SELECT
  1 + i AS id,
  TIMESTAMP '2024-01-01' + (i * INTERVAL 37 MINUTE) AS created_at,
  ['organic', 'google_ads', 'instagram', 'referral', 'apple_search'][1 + (i % 5)] AS channel,
  ['US', 'IN', 'DE', 'GB', 'BR'][1 + (i % 5)] AS country,
  ['ios', 'android', 'web'][1 + (i % 3)] AS platform,
  18 + (i % 45) AS age,
  (i < 72) AS is_premium,
  CASE WHEN i < 72 THEN TIMESTAMP '2024-01-01' + (i * INTERVAL 37 MINUTE) + INTERVAL 3 DAY ELSE NULL END AS premium_started_at,
  ['sleep', 'stress', 'focus', 'anxiety'][1 + (i % 4)] AS goal,
  NULL AS referred_by,
  (i % 2 = 0) AS marketing_opt_in
FROM range(0, 1204) AS t(i);

-- Base cohort segments, signed up Jul-Dec 2023 (never in Jan 2024).
-- organic: ids 1205..6204 (5000), 305 premium
INSERT INTO users
SELECT
  1205 + i AS id,
  TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + ((i % 1440) * INTERVAL 1 MINUTE) AS created_at,
  'organic' AS channel,
  ['US', 'IN', 'DE', 'GB', 'BR'][1 + (i % 5)] AS country,
  ['ios', 'android', 'web'][1 + (i % 3)] AS platform,
  18 + (i % 45) AS age,
  (i < 305) AS is_premium,
  CASE WHEN i < 305 THEN TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + INTERVAL 3 DAY ELSE NULL END AS premium_started_at,
  ['sleep', 'stress', 'focus', 'anxiety'][1 + (i % 4)] AS goal,
  NULL AS referred_by,
  (i % 2 = 0) AS marketing_opt_in
FROM range(0, 5000) AS t(i);

-- google_ads: ids 6205..8004 (1800), 72 premium
INSERT INTO users
SELECT
  6205 + i AS id,
  TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + ((i % 1440) * INTERVAL 1 MINUTE) AS created_at,
  'google_ads' AS channel,
  ['US', 'IN', 'DE', 'GB', 'BR'][1 + (i % 5)] AS country,
  ['ios', 'android', 'web'][1 + (i % 3)] AS platform,
  18 + (i % 45) AS age,
  (i < 72) AS is_premium,
  CASE WHEN i < 72 THEN TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + INTERVAL 3 DAY ELSE NULL END AS premium_started_at,
  ['sleep', 'stress', 'focus', 'anxiety'][1 + (i % 4)] AS goal,
  NULL AS referred_by,
  (i % 2 = 0) AS marketing_opt_in
FROM range(0, 1800) AS t(i);

-- instagram: ids 8005..9204 (1200), 36 premium
INSERT INTO users
SELECT
  8005 + i AS id,
  TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + ((i % 1440) * INTERVAL 1 MINUTE) AS created_at,
  'instagram' AS channel,
  ['US', 'IN', 'DE', 'GB', 'BR'][1 + (i % 5)] AS country,
  ['ios', 'android', 'web'][1 + (i % 3)] AS platform,
  18 + (i % 45) AS age,
  (i < 36) AS is_premium,
  CASE WHEN i < 36 THEN TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + INTERVAL 3 DAY ELSE NULL END AS premium_started_at,
  ['sleep', 'stress', 'focus', 'anxiety'][1 + (i % 4)] AS goal,
  NULL AS referred_by,
  (i % 2 = 0) AS marketing_opt_in
FROM range(0, 1200) AS t(i);

-- referral: ids 9205..10104 (900), 135 premium (highest conversion with real volume)
INSERT INTO users
SELECT
  9205 + i AS id,
  TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + ((i % 1440) * INTERVAL 1 MINUTE) AS created_at,
  'referral' AS channel,
  ['US', 'IN', 'DE', 'GB', 'BR'][1 + (i % 5)] AS country,
  ['ios', 'android', 'web'][1 + (i % 3)] AS platform,
  18 + (i % 45) AS age,
  (i < 135) AS is_premium,
  CASE WHEN i < 135 THEN TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + INTERVAL 3 DAY ELSE NULL END AS premium_started_at,
  ['sleep', 'stress', 'focus', 'anxiety'][1 + (i % 4)] AS goal,
  NULL AS referred_by,
  (i % 2 = 0) AS marketing_opt_in
FROM range(0, 900) AS t(i);

-- apple_search: ids 10105..10804 (700), 42 premium
INSERT INTO users
SELECT
  10105 + i AS id,
  TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + ((i % 1440) * INTERVAL 1 MINUTE) AS created_at,
  'apple_search' AS channel,
  ['US', 'IN', 'DE', 'GB', 'BR'][1 + (i % 5)] AS country,
  ['ios', 'android', 'web'][1 + (i % 3)] AS platform,
  18 + (i % 45) AS age,
  (i < 42) AS is_premium,
  CASE WHEN i < 42 THEN TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + INTERVAL 3 DAY ELSE NULL END AS premium_started_at,
  ['sleep', 'stress', 'focus', 'anxiety'][1 + (i % 4)] AS goal,
  NULL AS referred_by,
  (i % 2 = 0) AS marketing_opt_in
FROM range(0, 700) AS t(i);

-- partner_promo: ids 10805..10816 (12), 6 premium (50%) -- small-sample trap for sql_q5
INSERT INTO users
SELECT
  10805 + i AS id,
  TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) AS created_at,
  'partner_promo' AS channel,
  ['US', 'IN', 'DE', 'GB', 'BR'][1 + (i % 5)] AS country,
  ['ios', 'android', 'web'][1 + (i % 3)] AS platform,
  18 + (i % 45) AS age,
  (i < 6) AS is_premium,
  CASE WHEN i < 6 THEN TIMESTAMP '2023-07-01' + ((i % 170) * INTERVAL 1 DAY) + INTERVAL 3 DAY ELSE NULL END AS premium_started_at,
  ['sleep', 'stress', 'focus', 'anxiety'][1 + (i % 4)] AS goal,
  NULL AS referred_by,
  (i % 2 = 0) AS marketing_opt_in
FROM range(0, 12) AS t(i);

-- "Active in Jan 2024" session pool: 7,050 sessions over exactly 1,500 distinct
-- users (ids 1205..2704, part of the organic base-cohort segment) -> avg 4.7.
INSERT INTO sessions
SELECT
  1 + i AS id,
  1205 + (i % 1500) AS user_id,
  TIMESTAMP '2024-01-01' + ((i % 30) * INTERVAL 1 DAY) + ((i % 1440) * INTERVAL 1 MINUTE) AS started_at,
  5 + (i % 50) AS duration_min,
  1 + (i % 20) AS content_id,
  (i % 3 = 0) AS completed
FROM range(0, 7050) AS t(i);

-- 7-day retention rows: 337 of the 1,204 Jan-cohort users (ids 1..337) get a
-- session exactly 10 days after their own signup -> 337/1204 ~= 28% retention.
INSERT INTO sessions
SELECT
  7051 + i AS id,
  1 + i AS user_id,
  TIMESTAMP '2024-01-01' + (i * INTERVAL 37 MINUTE) + INTERVAL 10 DAY AS started_at,
  8 + (i % 40) AS duration_min,
  1 + (i % 20) AS content_id,
  TRUE AS completed
FROM range(0, 337) AS t(i);

-- A handful of sessions with a logging bug (duration_min = 100000) for sql_q8.
INSERT INTO sessions
SELECT
  7500 + i AS id,
  6205 AS user_id,
  TIMESTAMP '2024-03-15' + (i * INTERVAL 1 DAY) AS started_at,
  100000 AS duration_min,
  1 AS content_id,
  TRUE AS completed
FROM range(0, 5) AS t(i);
`;
