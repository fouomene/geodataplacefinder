import { Router, type Request, type Response } from "express";
import { getConnection } from "../lib/duckdb";
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
    res
      .status(400)
      .json({
        error:
          "At least one search parameter is required: q, name, city, postcode, or type",
      });
    return;
  }

  const con = await getConnection();

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (searchTerm) {
    params.push(searchTerm);
    conditions.push(`lower(name) LIKE '%' || lower($${params.length}) || '%'`);
  }

  if (city) {
    params.push(city);
    conditions.push(
      `lower(address) LIKE '%' || lower($${params.length}) || '%'`,
    );
  }

  if (postcode) {
    params.push(postcode);
    conditions.push(
      `lower(address) LIKE '%' || lower($${params.length}) || '%'`,
    );
  }

  if (type) {
    params.push(type);
    conditions.push(
      `list_contains(list_transform(categories, x -> lower(x)), lower($${params.length}))`,
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  params.push(limit);
  const query = `
    SELECT id, name, address, lat, lon, confidence, categories
    FROM places
    ${whereClause}
    ORDER BY confidence DESC NULLS LAST
    LIMIT $${params.length}
  `;

  con.all(
    query,
    ...params,
    (err: Error | null, rows: Record<string, unknown>[]) => {
      if (err) {
        req.log.error({ err }, "DuckDB search query failed");
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
          confidence: r.confidence ?? null,
          categories: Array.isArray(r.categories) ? r.categories : null,
        })),
      );
    },
  );
});

export default router;
