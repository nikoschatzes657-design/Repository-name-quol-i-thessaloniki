// src/hooks/useMapCommunities.js
import { useCallback, useEffect, useRef, useState } from "react";
import { computeScoreOT, computeScoreDK, clamp01 } from "src/lib/scoring.js";
import { DEFAULT_WEIGHTS_OT } from "src/lib/constants.js";

/* Εμπλουτισμός κάθε feature με _score και _score_vis */
function enrich(geojson, level, weights) {
  const data = JSON.parse(JSON.stringify(geojson || { type: "FeatureCollection", features: [] }));
  for (const f of data.features || []) {
    const p = f.properties || {};
    const raw = level === "dk"
      ? computeScoreDK(p, weights)
      : computeScoreOT(p, weights || DEFAULT_WEIGHTS_OT);
    p._score = raw;
    p._score_vis = clamp01(raw) ?? 0;
  }
  return data;
}

export function useMapCommunities({ apiBase, level, weights }) {
  const [geojson, setGeojson] = useState(null);
  const [allGeojson, setAllGeojson] = useState(null);
  const [loading, setLoading] = useState(false);

  const viewportAbortRef = useRef(null);
  const API = apiBase || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const fetchByBbox = useCallback(
    async (bbox) => {
      try {
        viewportAbortRef.current?.abort?.();
        const ctrl = new AbortController();
        viewportAbortRef.current = ctrl;

        const url = new URL(`${API}/api/communities`);
        for (const v of bbox) url.searchParams.append("bbox", String(v));
        url.searchParams.set("level", level);

        setLoading(true);
        const resp = await fetch(url.toString(), { signal: ctrl.signal });
        if (!resp.ok) throw new Error(`API ${resp.status}`);
        const data = await resp.json();
        const enriched = enrich(data, level, weights);
        console.log("FETCHED", level, enriched.features?.length, enriched.features?.[0]?.properties);
        setGeojson(enriched);
        return enriched;
      } finally {
        setLoading(false);
      }
    },
    [API, level, weights]
  );

  const fetchAll = useCallback(
  async () => {
    const url = new URL(`${API}/api/communities`);

    // Bbox Θεσσαλονίκης
    [22.80, 40.50, 23.10, 40.80].forEach(v =>
      url.searchParams.append("bbox", String(v))
    );

    url.searchParams.set("level", level);

    const resp = await fetch(url.toString());

    if (!resp.ok) {
      const empty = { type: "FeatureCollection", features: [] };
      setAllGeojson(empty);
      setGeojson(empty);
      return null;
    }

    const data = await resp.json();
    const enriched = enrich(data, level, weights);

    // ΠΟΛΥ ΣΗΜΑΝΤΙΚΟ:
    // Για DK-only, το ίδιο dataset μπαίνει και στο χάρτη και στα panels.
    setAllGeojson(enriched);
    setGeojson(enriched);

    console.log(
      "FETCH ALL DK:",
      enriched.features?.length ?? 0,
      "features"
    );

    return enriched;
  },
  [API, level, weights]
);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Re-enrich “all” όταν αλλάζουν βάρη στο τρέχον level
  useEffect(() => {
  if (!allGeojson?.features) return;

  const enriched = enrich(allGeojson, level, weights);

  setAllGeojson(enriched);
  setGeojson(enriched);
}, [weights, level]);
  useEffect(() => () => viewportAbortRef.current?.abort?.(), []);

  return { geojson, allGeojson, setGeojson, fetchByBbox, loading };
}
