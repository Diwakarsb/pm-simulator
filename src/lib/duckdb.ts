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

let seeded = false;

export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  const db = await getDb();
  const conn = await db.connect();
  try {
    await conn.query(SEED_SQL);
  } finally {
    await conn.close();
  }
  seeded = true;
}

// Generates viditation_user rows satisfying the T2 answer key: exactly 17 premium
// Google-Ads users created in Jan 2022, alongside a larger non-matching population
// so naive counts (e.g. 116) are plausible traps.
const SEED_SQL = `
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
