import duckdb from "duckdb";
import { logger } from "./logger";

let _connection: duckdb.Connection | null = null;
let _db: duckdb.Database | null = null;

export function getConnection(): duckdb.Connection {
  if (_connection) {
    return _connection;
  }

  _db = new duckdb.Database(":memory:", (err) => {
    if (err) {
      logger.error({ err }, "DuckDB failed to open in-memory database");
      throw err;
    }
  });

  _connection = _db.connect();

  _connection.exec("INSTALL spatial; LOAD spatial;", (err) => {
    if (err) logger.warn({ err }, "DuckDB spatial extension warning");
  });

  _connection.exec("INSTALL httpfs; LOAD httpfs;", (err) => {
    if (err) logger.warn({ err }, "DuckDB httpfs extension warning");
  });

  logger.info("DuckDB in-memory database initialized with spatial + httpfs");
  return _connection;
}

export const OVERTURE_PLACES =
  "https://data.overturemaps.org/releases/latest/theme=places/type=place/*.parquet";
