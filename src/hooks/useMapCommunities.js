// src/hooks/useMapCommunities.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { computeScoreOT, computeScoreDK, clamp01 } from "src/lib/scoring.js";
import { DEFAULT_WEIGHTS_OT } from "src/lib/constants.js";

const STATIC_GEOJSON_URL = "/data/dk_indicators_qol_i.geojson";

function emptyFeatureCollection() {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

function cloneGeojson(geojson) {
  return JSON.parse(JSON.stringify(geojson || emptyFeatureCollection()));
}

function getFallbackScore(props) {
  return (
    clamp01(Number(props._score)) ??
    clamp01(Number(props._score_vis)) ??
    clamp01(Number(props.qol_i)) ??
    clamp01(Number(props.final_qol_i)) ??
    clamp01(Number(props.score)) ??
    clamp01(Number(props.qol)) ??
    0
  );
}

function enrichGeojson(geojson, level, weights) {
  const data = cloneGeojson(geojson);

  for (const feature of data.features || []) {
    const props = feature.properties || {};
    feature.properties = props;

    const dynamicScore =
      level === "dk"
        ? computeScoreDK(props, weights)
        : computeScoreOT(props, weights || DEFAULT_WEIGHTS_OT);

    const finalScore =
      clamp01(Number(dynamicScore)) ??
      getFallbackScore(props);

    props._score = finalScore;
    props._score_vis = finalScore;
  }

  return data;
}

export function useMapCommunities({ level = "dk", weights }) {
  const [baseGeojson, setBaseGeojson] = useState(emptyFeatureCollection());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadGeojson() {
      try {
        setLoading(true);

        const response = await fetch(STATIC_GEOJSON_URL);

        if (!response.ok) {
          throw new Error(`GeoJSON loading failed: ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setBaseGeojson(data);
          console.log(
            "Loaded static GeoJSON:",
            data.features?.length ?? 0,
            "features"
          );
        }
      } catch (error) {
        console.error("Failed to load static GeoJSON:", error);

        if (!cancelled) {
          setBaseGeojson(emptyFeatureCollection());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGeojson();

    return () => {
      cancelled = true;
    };
  }, []);

  const enrichedGeojson = useMemo(() => {
    return enrichGeojson(baseGeojson, level, weights);
  }, [baseGeojson, level, weights]);

  const fetchByBbox = useCallback(async () => {
    return enrichedGeojson;
  }, [enrichedGeojson]);

  return {
    geojson: enrichedGeojson,
    allGeojson: enrichedGeojson,
    fetchByBbox,
    loading,
  };
}