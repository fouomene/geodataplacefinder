import { Router, type Request, type Response } from "express";
import { getConnection, OVERTURE_PLACES } from "../lib/duckdb";
import { SearchPlacesQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/search", async (req: Request, res: Response) => {
  const parsed = SearchPlacesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q, name, city, postcode, type, limit = 5 } = parsed.data;
  const searchTerm = q ?? name;

  if (!searchTerm && !city && !postcode && !type) {
    res.status(400).json({ error: "At least one search parameter is required: q, name, city, postcode, or type" });
    return;
  }

  const con = getConnection();

  const conditions: string[] = [];
  const params: (string | number)[] = [OVERTURE_PLACES];

  if (searchTerm) {
    conditions.push(`lower(names.primary) LIKE '%' || lower($${params.length + 1}) || '%'`);
    params.push(searchTerm);
  }

  if (city) {
    conditions.push(`lower(addresses[1].locality) LIKE '%' || lower($${params.length + 1}) || '%'`);
    params.push(city);
  }

  if (postcode) {
    conditions.push(`lower(addresses[1].postcode) LIKE '%' || lower($${params.length + 1}) || '%'`);
    params.push(postcode);
  }

  if (type) {
    conditions.push(`list_contains(list_transform(categories.primary, x -> lower(x)), lower($${params.length + 1}))`);
    params.push(type);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT
      names.primary AS name,
      addresses[1].freeform AS address,
      ST_Y(geometry) AS latitude,
      ST_X(geometry) AS longitude,
      confidence,
      categories.primary AS categories
    FROM read_parquet($1)
    ${whereClause}
    ORDER BY confidence DESC NULLS LAST
    LIMIT $${params.length + 1}
  `;
  params.push(limit);

  con.all(query, ...params, (err: Error | null, rows: Record<string, unknown>[]) => {
    if (err) {
      req.log.error({ err }, "DuckDB search query failed");
      res.status(500).json({ error: "Query failed: " + err.message });
      return;
    }

    const results = (rows ?? []).map((r) => ({
      name: r.name ?? null,
      address: r.address ?? null,
      lat: r.latitude,
      lon: r.longitude,
      confidence: r.confidence ?? null,
      categories: Array.isArray(r.categories) ? r.categories : null,
    }));

    res.json(results);
  });
});

export default router;
