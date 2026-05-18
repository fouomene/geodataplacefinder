from fastapi import FastAPI, Query
from typing import Optional
from db import get_connection

app = FastAPI(
    title="Overture Merchant Geo API",
    description="API FastAPI + DuckDB pour interroger Overture Maps",
    version="1.1.0",
)

OVERTURE_PLACES = (
    "https://data.overturemaps.org/releases/latest/"
    "theme=places/type=place/*.parquet"
)

@app.get("/health")
def health():
    return {"status": "ok"}

# 🔍 Recherche par nom
@app.get("/places/search")
def search_merchant(
    name: str = Query(..., description="name place"),
    city: Optional[str] = Query(None, description="city"),
    limit: int = Query(5, le=20),
):
    con = get_connection()

    query = """
    SELECT
        names.primary AS name,
        addresses[1].freeform AS address,
        ST_Y(geometry) AS latitude,
        ST_X(geometry) AS longitude,
        confidence
    FROM read_parquet(?)
    WHERE lower(names.primary) LIKE '%' || lower(?) || '%'
    """

    params = [OVERTURE_PLACES, name]

    if city:
        query += " AND lower(addresses[1].freeform) LIKE '%' || lower(?) || '%'"
        params.append(city)

    query += " ORDER BY confidence DESC LIMIT ?"
    params.append(limit)

    rows = con.execute(query, params).fetchall()

    return [
        {
            "name": r[0],
            "address": r[1],
            "lat": r[2],
            "lon": r[3],
            "confidence": r[4],
        }
        for r in rows
    ]

# 📍 ▶️ NOUVELLE ROUTE : nearest
@app.get("/places/nearest")
def nearest_merchant(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    name: Optional[str] = Query(None, description="Filtre nom marchand"),
    max_distance_m: int = Query(5000, description="Distance max en mètres"),
):
    con = get_connection()

    query = """
    SELECT
        names.primary AS name,
        addresses[1].freeform AS address,
        ST_Y(geometry) AS latitude,
        ST_X(geometry) AS longitude,
        ST_Distance(
            geometry,
            ST_Point(?, ?)
        ) AS distance_m,
        confidence
    FROM read_parquet(?)
    WHERE ST_Distance(
        geometry,
        ST_Point(?, ?)
    ) <= ?
    """

    params = [lon, lat, OVERTURE_PLACES, lon, lat, max_distance_m]

    if name:
        query += " AND lower(names.primary) LIKE '%' || lower(?) || '%'"
        params.append(name)

    query += " ORDER BY distance_m ASC LIMIT 1"

    row = con.execute(query, params).fetchone()

    if not row:
        return {"message": "Aucun marchand trouvé"}

    return {
        "name": row[0],
        "address": row[1],
        "lat": row[2],
        "lon": row[3],
        "distance_m": round(row[4], 2),
        "confidence": row[5],
    }

