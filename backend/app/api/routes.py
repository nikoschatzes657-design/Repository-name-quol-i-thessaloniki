from fastapi import APIRouter, Query, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.db.session import engine
from app.utils.geojson import rows_to_geojson
import logging
import time

logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)

router = APIRouter()

TABLE_WHITELIST = {
    "dk": "results.dk_indicators_v2",  # Δημοτικές Κοινότητες
}

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/api/communities")
def communities(
    bbox: list[float] = Query(
        ...,
        min_items=4,
        max_items=4,
        description="minLon,minLat,maxLon,maxLat (EPSG:4326)"
    ),
    level: str = Query("dk", description="dk"),
    limit: int = 100
):
    t0 = time.perf_counter()

    minx, miny, maxx, maxy = bbox

    if minx >= maxx or miny >= maxy:
        raise HTTPException(400, "Invalid bbox")

    table = TABLE_WHITELIST.get(level.lower())

    if not table:
        raise HTTPException(400, "Invalid level. Use 'dk'.")

    sql = f"""
    SELECT
    to_jsonb(p) - 'geom' AS props,
    ST_AsGeoJSON(ST_Transform(p.geom, 4326))::json AS geometry
    FROM {table} p
    LIMIT :limit;
    """

    try:
        with engine.connect() as conn:
            res = conn.execute(
                text(sql),
                {
                    "minx": minx,
                    "miny": miny,
                    "maxx": maxx,
                    "maxy": maxy,
                    "limit": limit,
                }
            )

            cols = res.keys()
            rows = [dict(zip(cols, row)) for row in res]

        logging.info(
            "Returned %s features for level=%s in %.3f sec",
            len(rows),
            level,
            time.perf_counter() - t0
        )

        return rows_to_geojson(rows)

    except SQLAlchemyError as e:
        logging.exception("DB error")
        raise HTTPException(status_code=500, detail=str(e))