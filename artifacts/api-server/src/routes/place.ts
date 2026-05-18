import { Router, type Request, type Response } from "express";
import { getConnection } from "../lib/duckdb";

const router = Router();

function parseJson(v: unknown): unknown {
  if (!v || typeof v !== "string") return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

router.get("/places/:id", async (req: Request, res: Response) => {
  const raw = req.params.id;

  if (!raw || !raw.startsWith("overture:place:")) {
    res.status(400).json({
      error: 'Invalid place ID format. Expected: overture:place:<id>',
    });
    return;
  }

  const con = await getConnection();

  con.all(
    `SELECT
       id, name, names_json, address, addresses_json,
       lat, lon, confidence,
       categories, categories_alternate,
       sources_json, websites, phones, socials, emails, brand_json
     FROM places
     WHERE id = $1
     LIMIT 1`,
    raw,
    (err: Error | null, rows: Record<string, unknown>[]) => {
      if (err) {
        req.log.error({ err }, "DuckDB place detail query failed");
        res.status(500).json({ error: "Query failed: " + err.message });
        return;
      }

      if (!rows || rows.length === 0) {
        res.status(404).json({ error: "Place not found" });
        return;
      }

      const r = rows[0];

      res.json({
        id: r.id,
        names: parseJson(r.names_json),
        addresses: parseJson(r.addresses_json),
        location: {
          lat: r.lat,
          lon: r.lon,
        },
        confidence: r.confidence ?? null,
        categories: {
          primary: Array.isArray(r.categories) ? (r.categories[0] ?? null) : null,
          alternate: Array.isArray(r.categories_alternate) && r.categories_alternate.length > 0
            ? r.categories_alternate
            : null,
        },
        sources: parseJson(r.sources_json),
        websites: Array.isArray(r.websites) && r.websites.length > 0 ? r.websites : null,
        phones:   Array.isArray(r.phones)   && r.phones.length   > 0 ? r.phones   : null,
        socials:  Array.isArray(r.socials)  && r.socials.length  > 0 ? r.socials  : null,
        emails:   Array.isArray(r.emails)   && r.emails.length   > 0 ? r.emails   : null,
        brand: parseJson(r.brand_json),
      });
    },
  );
});

export default router;
