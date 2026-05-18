import { Router, type Request, type Response } from "express";
import { getConnection, OVERTURE_PLACES } from "../lib/duckdb";
import { ReversePlacesQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/reverse", async (req: Request, res: Response) => {
  const parsed = ReversePlacesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lat, lon, limit = 5 } = parsed.data;

  const con = getConnection();

  const query = `
    SELECT
      names.primary AS name,
      addresses[1].freeform AS address,
      ST_Y(geometry) AS latitude,
      ST_X(geometry) AS longitude,
      ST_Distance(
        ST_Transform(geometry, 'EPSG:4326', 'EPSG:3857'),
        ST_Transform(ST_Point($1, $2), 'EPSG:4326', 'EPSG:3857')
      ) AS distance_m,
      confidence,
      categories.primary AS categories
    FROM read_parquet($3)
    ORDER BY distance_m ASC NULLS LAST
    LIMIT $4
  `;

  con.all(
    query,
    lon,
    lat,
    OVERTURE_PLACES,
    limit,
    (err: Error | null, rows: Record<string, unknown>[]) => {
      if (err) {
        req.log.error({ err }, "DuckDB reverse query failed");
        res.status(500).json({ error: "Query failed: " + err.message });
        return;
      }

      const results = (rows ?? []).map((r) => ({
        name: r.name ?? null,
        address: r.address ?? null,
        lat: r.latitude,
        lon: r.longitude,
        distance_m: typeof r.distance_m === "number" ? Math.round(r.distance_m * 100) / 100 : r.distance_m,
        confidence: r.confidence ?? null,
        categories: Array.isArray(r.categories) ? r.categories : null,
      }));

      res.json(results);
    },
  );
});

export default router;
