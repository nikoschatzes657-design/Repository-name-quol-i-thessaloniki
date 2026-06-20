def rows_to_geojson(rows):
    feats = []
    for r in rows:
        geom = r.get("geometry")
        if not geom:
            continue
        props = r.get("props")
        if props is None:
            props = {k: v for k, v in r.items() if k != "geometry"}
        feats.append({"type": "Feature", "properties": props, "geometry": geom})
    return {"type": "FeatureCollection", "features": feats}
