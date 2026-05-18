import duckdb from "duckdb";
import path from "node:path";
import { existsSync } from "node:fs";
import { logger } from "./logger";

const DATA_DIR = path.resolve(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "places.duckdb");

// 5 spread-out files give good global coverage; LIMIT fetches only the first row group each
const S3_BASE =
  "s3://overturemaps-us-west-2/release/2026-04-15.0/theme=places/type=place";
const SAMPLE_FILES = [
  `${S3_BASE}/part-00000-055f4006-e6da-546f-b0ef-d3b15d7c4094-c000.zstd.parquet`,
  `${S3_BASE}/part-00003-0065bc5f-d3b7-5816-af38-40ff1e317215-c000.zstd.parquet`,
  `${S3_BASE}/part-00006-b8b57db3-4404-5731-9cce-99426fa50e5f-c000.zstd.parquet`,
  `${S3_BASE}/part-00010-2cd130a1-3932-5f62-bfbe-071a3e357bdd-c000.zstd.parquet`,
  `${S3_BASE}/part-00014-392ed95f-b425-5afb-ae1c-5eff8cbbc3da-c000.zstd.parquet`,
];
const ROWS_PER_FILE = 10_000;

let _connection: duckdb.Connection | null = null;
let _initPromise: Promise<duckdb.Connection> | null = null;

function runAsync(con: duckdb.Connection, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    con.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function queryAsync<T = Record<string, unknown>>(
  con: duckdb.Connection,
  sql: string,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    con.all(sql, (err: Error | null, rows: duckdb.TableData) => {
      if (err) reject(err);
      else resolve((rows ?? []) as unknown as T[]);
    });
  });
}

async function hasLocalData(con: duckdb.Connection): Promise<boolean> {
  try {
    const rows = await queryAsync<{ cnt: number }>(
      con,
      "SELECT count(*) AS cnt FROM places",
    );
    return rows[0].cnt > 0;
  } catch {
    return false;
  }
}

async function populateFromS3(con: duckdb.Connection): Promise<void> {
  logger.info("Populating local places cache from Overture Maps S3...");

  await runAsync(
    con,
    `CREATE TABLE IF NOT EXISTS places (
      id                   TEXT,
      name                 TEXT,
      address              TEXT,
      lat                  DOUBLE,
      lon                  DOUBLE,
      confidence           DOUBLE,
      categories           TEXT[],
      names_json           TEXT,
      addresses_json       TEXT,
      categories_alternate TEXT[],
      sources_json         TEXT,
      websites             TEXT[],
      phones               TEXT[],
      socials              TEXT[],
      emails               TEXT[],
      brand_json           TEXT
    )`,
  );

  for (const [i, file] of SAMPLE_FILES.entries()) {
    logger.info(
      { file: `part-${String(i).padStart(5, "0")}`, rows: ROWS_PER_FILE },
      "Fetching S3 sample",
    );
    await runAsync(
      con,
      `INSERT INTO places
       SELECT
         'overture:place:' || id               AS id,
         names.primary                         AS name,
         addresses[1].freeform                 AS address,
         ST_Y(geometry)                        AS lat,
         ST_X(geometry)                        AS lon,
         confidence,
         CASE WHEN categories.primary IS NOT NULL
              THEN list_value(categories.primary)
              ELSE NULL END                    AS categories,
         CAST(to_json(names)    AS TEXT)       AS names_json,
         CAST(to_json(addresses) AS TEXT)      AS addresses_json,
         categories.alternate                  AS categories_alternate,
         CAST(to_json(sources)  AS TEXT)       AS sources_json,
         websites,
         phones,
         socials,
         emails,
         CASE WHEN brand IS NOT NULL
              THEN CAST(to_json(brand) AS TEXT)
              ELSE NULL END                    AS brand_json
       FROM read_parquet('${file}')
       WHERE names.primary IS NOT NULL
       LIMIT ${ROWS_PER_FILE}`,
    );
  }

  const [{ cnt }] = await queryAsync<{ cnt: number }>(
    con,
    "SELECT count(*) AS cnt FROM places",
  );
  logger.info({ rows: cnt }, "Local places cache ready");
}

async function initConnection(): Promise<duckdb.Connection> {
  const isNew = !existsSync(DB_PATH);

  const db = new duckdb.Database(DB_PATH, (err) => {
    if (err) {
      logger.error({ err }, "DuckDB failed to open database");
      throw err;
    }
  });

  const con = db.connect();

  await runAsync(con, "INSTALL httpfs; LOAD httpfs;");
  await runAsync(con, "INSTALL spatial; LOAD spatial;");

  if (isNew) {
    // Configure anonymous S3 access for the public Overture Maps bucket
    await runAsync(con, `
      SET s3_region = 'us-west-2';
      SET s3_access_key_id = '';
      SET s3_secret_access_key = '';
      SET s3_url_style = 'path';
    `);
  }

  if (!(await hasLocalData(con))) {
    // Need S3 settings even if DB file existed but was empty
    await runAsync(con, `
      SET s3_region = 'us-west-2';
      SET s3_access_key_id = '';
      SET s3_secret_access_key = '';
      SET s3_url_style = 'path';
    `);
    await populateFromS3(con);
  } else {
    const [{ cnt }] = await queryAsync<{ cnt: number }>(
      con,
      "SELECT count(*) AS cnt FROM places",
    );
    logger.info({ rows: cnt }, "DuckDB local cache loaded");
  }

  return con;
}

export function getConnection(): Promise<duckdb.Connection> {
  if (_connection) return Promise.resolve(_connection);
  if (_initPromise) return _initPromise;

  _initPromise = initConnection()
    .then((con) => {
      _connection = con;
      return con;
    })
    .catch((err) => {
      _initPromise = null;
      throw err;
    });

  return _initPromise;
}

// Kick off initialization immediately at module load so the cache
// is ready before the first request arrives.
getConnection().catch((err) =>
  logger.error({ err }, "DuckDB background init failed"),
);
