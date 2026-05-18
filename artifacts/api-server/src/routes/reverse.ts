import { Router, type Request, type Response } from "express";
import { getConnection } from "../lib/duckdb";
import { ReversePlacesQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/reverse", async (req: Request, res: Response) => {
  const parsed = ReversePlacesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lat, lon, limit = 5 } = parsed.data;

  const con = await getConnection();

  const query = `
    SELECT
      id,
      name,
      address,
      lat,
      lon,
      ST_Distance(
        ST_Transform(ST_Point(lon, lat), 'EPSG:4326', 'EPSG:3857'),
        ST_Transform(ST_Point($1, $2), 'EPSG:4326', 'EPSG:3857')
      ) AS distance_m,
      confidence,
      categories
    FROM places
    ORDER BY distance_m ASC NULLS LAST
    LIMIT $3
  `;

  con.all(
    query,
    lon,
    lat,
    limit,
    (err: Error | null, rows: Record<string, unknown>[]) => {
      if (err) {
        req.log.error({ err }, "DuckDB reverse query failed");
        res.status(500).json({ error: "Query failed: " + err.message });
        return;
      }

      res.json(
        (rows ?? []).map((r) => ({
          id: r.id ?? null,
          name: r.name ?? null,
          address: r.address ?? null,
          lat: r.lat,
          lon: r.lon,
          distance_m:
            typeof r.distance_m === "number"
              ? Math.round((r.distance_m as number) * 100) / 100
              : r.distance_m,
          confidence: r.confidence ?? null,
          categories: Array.isArray(r.categories) ? r.categories : null,
        })),
      );
    },
  );
});

export default router;
