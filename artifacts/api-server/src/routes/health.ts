import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { getConnection } from "../lib/duckdb";

const router: IRouter = Router();
const startedAt = Date.now();

async function healthHandler(_req: any, res: any) {
  let cacheRows = 0;
  try {
    const con = await getConnection();
    const rows = await new Promise<Array<{ n: number }>>((resolve, reject) => {
      con.all("SELECT COUNT(*) AS n FROM places", (err: Error | null, data: any) => {
        if (err) reject(err);
        else resolve(data as Array<{ n: number }>);
      });
    });
    cacheRows = Number(rows[0]?.n ?? 0);
  } catch {
    // cache not ready yet
  }

  const data = HealthCheckResponse.parse({
    status: "ok",
    version: "0.1.0",
    uptime_s: (Date.now() - startedAt) / 1000,
    cache_rows: cacheRows,
  });
  res.json(data);
}

router.get("/health", healthHandler);
router.get("/healthz", healthHandler);

export default router;
