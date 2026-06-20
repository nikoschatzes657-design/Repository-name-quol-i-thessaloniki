import { useLayoutEffect, useMemo, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { DK_POPUP_FIELDS, getQoLClass } from "../lib/constants.js";

export default function MapView({
  mapRef,
  containerRef,
  showDynamic,
  setSelectedProps,
  setSelectedBin,    // polygon -> histogram
  selectedBin,       // histogram -> map highlight
  geojson,
  level = "dk",
}) {
  const levelRef = useRef(level);
  useEffect(() => { levelRef.current = level; }, [level]);

  const fillColorExpression = useMemo(() => ([
  "coalesce",
  [
    "step", ["coalesce", ["get", "_score_vis"], -1],
    "#1b1f2a",

    0.0, "#d73027",
    0.2, "#fdae61",
    0.4, "#ffffbf",
    0.6, "#a6d96a",
    0.8, "#1a9850"
  ],
  "#2a3344"
]), []);

  const fmtPct = (v) => (Number.isFinite(v) ? (v * 100).toFixed(1) + "%" : "–");
  const fmtDec = (v, d = 3) => (Number.isFinite(v) ? Number(v).toFixed(d) : "–");
  const clamp01 = (x) => (Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : null);

  function colorFromScore01(s) {
    const PALETTE = [
      "#d73027",
      "#fdae61",
      "#ffffbf",
      "#a6d96a",
      "#1a9850",
    ];

    if (!Number.isFinite(s)) return "#2a3344";

    const v = Math.max(0, Math.min(1, Number(s)));
    const i = Math.min(
      Math.floor(v * PALETTE.length),
      PALETTE.length - 1
    );

    return PALETTE[i];
  }

 function renderDKPopupSelected(p) {
  const title = p.name || p.dk_name || p.community || "(χωρίς όνομα)";
  const vis = clamp01(Number(p._score_vis));
  const qolClass = getQoLClass(vis);

  const badgeColor = colorFromScore01(vis);
  const badgeTextColor = qolClass.index >= 4 ? "#ffffff" : "#111827";

  const sw = `<span style="
    display:inline-block;
    width:14px;
    height:14px;
    border:1px solid #222;
    border-radius:3px;
    vertical-align:middle;
    background:${colorFromScore01(vis)}
  "></span>`;

  const scoreText = Number.isFinite(Number(p._score))
    ? Number(p._score).toFixed(3)
    : "–";

  const header = `
    <div style="margin-bottom:6px;display:flex;align-items:center;gap:8px">
      <b>${title}</b> ${sw}
    </div>

    <div style="font-size:12px;line-height:1.55;margin-bottom:8px">
      <div>
        <b>Σταθμισμένος δείκτης QoL-i:</b>
        <code>${scoreText}</code>
      </div>

      <div>
        <b>Κατηγορία QoL-i:</b>
        <span style="
          display:inline-block;
          margin-left:4px;
          padding:2px 8px;
          border-radius:999px;
          background:${badgeColor};
          border:1px solid #222;
          color:${badgeTextColor};
          font-weight:700;
        ">
          ${qolClass.label}
        </span>
      </div>

      <div style="opacity:.75">
        <b>Εύρος κατηγορίας:</b> ${qolClass.range}
      </div>
    </div>
  `;
  const rows = DK_POPUP_FIELDS
    .filter(f => f.id !== "_score")
    .map(f => {
      const v = p[f.id];
      const num = Number(v);

      const show = Number.isFinite(num) && num >= 0 && num <= 1
        ? `${num.toFixed(3)} (${(num * 100).toFixed(1)}%)`
        : (v ?? "–");

      return `<tr>
        <td style="padding:4px 6px;border-bottom:1px solid var(--line);opacity:.85">
          ${f.label}
        </td>
        <td style="padding:4px 6px;border-bottom:1px solid var(--line)">
          <code>${show}</code>
        </td>
      </tr>`;
    }).join("");

  return `
    <div style="min-width:280px;max-width:440px">
      ${header}
      <div style="font-size:12px;line-height:1.45">
        <div style="max-height:260px;overflow:auto;border:1px solid var(--line);border-radius:8px">
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr>
                <th style="text-align:left;padding:6px;border-bottom:1px solid var(--line);opacity:.7">
                  Δείκτης
                </th>
                <th style="text-align:left;padding:6px;border-bottom:1px solid var(--line);opacity:.7">
                  Τιμή
                </th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div style="margin-top:6px;font-size:11px;opacity:.72">
          Όλες οι τιμές έχουν προσανατολισμό 0–1, όπου το 1 δηλώνει ευνοϊκότερη συνθήκη.
        </div>
      </div>
    </div>`;
}

  function renderOTPopup(p) {
    const name = p.fua_name || p.mun_name || p.community || p.name || "(χωρίς όνομα)";
    const raw = clamp01(Number(p._score));
    const vis = clamp01(Number(p._score_vis));
    const sw = `<span style="
      display:inline-block;width:14px;height:14px;border:1px solid #222;
      border-radius:3px;vertical-align:middle;background:${colorFromScore01(vis)}"></span>`;

    return `<div style="min-width:240px">
      <div style="margin-bottom:6px;display:flex;align-items:center;gap:8px"><b>${name}</b> ${sw}</div>
      <div style="font-size:12px;line-height:1.5">
        <div><b>Score (βάρη):</b> ${fmtPct(raw)} <span style="opacity:.7">(${fmtDec(raw)})</span></div>
        <div><b>Χρώμα (Absolute 0–1):</b> ${fmtPct(vis)} <span style="opacity:.7">(${fmtDec(vis)})</span></div>
      </div>
    </div>`;
  }

  useLayoutEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
          "esri-sat": {
            type: "raster",
            tiles: [
              "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "Source: Esri, Maxar, Earthstar Geographics",
          },
        },
        layers: [
          { id: "osm-layer", type: "raster", source: "osm" },
          { id: "esri-sat-layer", type: "raster", source: "esri-sat" },
        ],
      },
      center: [22.9444, 40.6403],
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("communities", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "communities-fill",
        type: "fill",
        source: "communities",
        layout: { visibility: "visible" },
        paint: {
          "fill-color": fillColorExpression,
          "fill-opacity": 0.92,
        },
      });

      map.addLayer({
        id: "communities-outline",
        type: "line",
        source: "communities",
        layout: { visibility: "visible" },
        paint: {
          "line-color": "#334155",
          "line-width": 0.9,
          "line-opacity": 0.9,
        },
      });

      // click → popup
      map.on("click", "communities-fill", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties || {};
        setSelectedProps(p);

        const visScore = Number.isFinite(p._score_vis) ? p._score_vis : null;
        if (visScore !== null) {
          let idx = Math.floor(Math.min(visScore, 0.999999) * 10);
          idx = Math.max(0, Math.min(idx, 9));
          setSelectedBin(idx);
        }

        const currentLevel = levelRef.current;
        const html = currentLevel === "dk" ? renderDKPopupSelected(p) : renderOTPopup(p);

        new maplibregl.Popup({ maxWidth: "460px" })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
      });
    });

    mapRef.current = map;
    return () => {
      try { map.remove(); } catch {}
    };
  }, [containerRef, mapRef, fillColorExpression]);

  useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  const empty = { type: "FeatureCollection", features: [] };

  const updateSource = () => {
    const source = map.getSource("communities");

    if (!source) {
      console.warn("communities source δεν υπάρχει ακόμα");
      return;
    }

    try {
      source.setData(geojson || empty);

      console.log(
        "Map source updated:",
        geojson?.features?.length ?? 0,
        "features",
        "level:",
        level
      );
    } catch (e) {
      console.error("setData error:", e);
    }
  };

  if (map.loaded()) {
    updateSource();
  } else {
    map.once("load", updateSource);
  }

  return () => {
    try {
      map.off("load", updateSource);
    } catch {}
  };
}, [geojson, level, mapRef]);

  return <div id="map" ref={containerRef} />;
}
