import { Router, type Request, type Response } from "express";
import { getConnection, OVERTURE_PLACES } from "../lib/duckdb";
import { NearestPlacesQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/places/nearest", async (req: Request, res: Response) => {
  const parsed = NearestPlacesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lat, lon, name, max_distance_m = 5000 } = parsed.data;

  const con = getConnection();

  const params: (string | number)[] = [lon, lat, OVERTURE_PLACES, lon, lat, max_distance_m];
  let nameClause = "";

  if (name) {
    nameClause = `AND lower(names.primary) LIKE '%' || lower($${params.length + 1}) || '%'`;
    params.push(name);
  }

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
    WHERE ST_Distance(
      ST_Transform(geometry, 'EPSG:4326', 'EPSG:3857'),
      ST_Transform(ST_Point($4, $5), 'EPSG:4326', 'EPSG:3857')
    ) <= $6
    ${nameClause}
    ORDER BY distance_m ASC NULLS LAST
    LIMIT 1
  `;

  con.all(
    query,
    ...params,
    (err: Error | null, rows: Record<string, unknown>[]) => {
      if (err) {
        req.log.error({ err }, "DuckDB nearest query failed");
        res.status(500).json({ error: "Query failed: " + err.message });
        return;
      }

      if (!rows || rows.length === 0) {
        res.status(404).json({ error: "No place found within the specified radius" });
        return;
      }

      const r = rows[0];
      res.json({
        name: r.name ?? null,
        address: r.address ?? null,
        lat: r.latitude,
        lon: r.longitude,
        distance_m: typeof r.distance_m === "number" ? Math.round(r.distance_m * 100) / 100 : r.distance_m,
        confidence: r.confidence ?? null,
        categories: Array.isArray(r.categories) ? r.categories : null,
      });
    },
  );
});

export default router;
