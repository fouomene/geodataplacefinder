import { Router, type Request, type Response } from "express";
import { getConnection } from "../lib/duckdb";
import { NearestPlacesQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/places/nearest", async (req: Request, res: Response) => {
  const parsed = NearestPlacesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lat, lon, name, max_distance_m = 5000 } = parsed.data;

  const con = await getConnection();

  const params: (string | number)[] = [lon, lat, lon, lat, max_distance_m];
  let nameClause = "";

  if (name) {
    params.push(name);
    nameClause = `AND lower(p.name) LIKE '%' || lower($${params.length}) || '%'`;
  }

  const query = `
    SELECT
      p.name,
      p.address,
      p.lat,
      p.lon,
      ST_Distance(
        ST_Transform(ST_Point(p.lon, p.lat), 'EPSG:4326', 'EPSG:3857'),
        ST_Transform(ST_Point($1, $2), 'EPSG:4326', 'EPSG:3857')
      ) AS distance_m,
      p.confidence,
      p.categories
    FROM places p
    WHERE ST_Distance(
      ST_Transform(ST_Point(p.lon, p.lat), 'EPSG:4326', 'EPSG:3857'),
      ST_Transform(ST_Point($3, $4), 'EPSG:4326', 'EPSG:3857')
    ) <= $5
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
        res
          .status(404)
          .json({ error: "No place found within the specified radius" });
        return;
      }

      const r = rows[0];
      res.json({
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
      });
    },
  );
});

export default router;
