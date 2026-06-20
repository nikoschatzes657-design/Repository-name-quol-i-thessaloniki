import { useEffect, useMemo, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { FLAT_OT, DK_INDICATORS, BREAKS } from "src/lib/constants.js";
import { computeScoreOT, computeScoreDK, pickValue } from "src/lib/scoring.js";
import { colorFor } from "src/lib/color.js";
Chart.register(...registerables);

export default function DistPanel({ geojson, allGeojson, weights, selectedBin, onSelectBin, level="ot" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [metric, setMetric] = useState("score");
  const [scope, setScope] = useState("all");

  const indicators = useMemo(() => {
    return level === "dk"
      ? [{ id: "score", label: "Συνολικός δείκτης ποιότητας ζωής" }, ...DK_INDICATORS]
      : [{ id: "score", label: "Συνολικός δείκτης προσβασιμότητας" }, ...FLAT_OT.map(i => ({ id: i.id, label: i.label }))];
  }, [level]);

  const pickByMetric = (props) => {
    if (!props) return null;
    let val = null;
    if (metric === "score") {
      val = level === "dk" ? computeScoreDK(props, weights) : computeScoreOT(props, weights);
    } else {
      if (level === "dk") val = Number(props[metric]);
      else {
        const meta = FLAT_OT.find(x => x.id === metric);
        if (meta) val = pickValue(props, meta.keys);
      }
    }
    return Number.isFinite(val) ? Math.max(0, Math.min(1, Number(val))) : null;
  };

  const sourceFeatures = useMemo(() => {
    if (scope === "all") return allGeojson?.features ? [...allGeojson.features] : [];
    return geojson?.features ? [...geojson.features] : [];
  }, [scope, allGeojson, geojson]);

  const values = useMemo(() => {
    if (!sourceFeatures.length) return [];
    return sourceFeatures
      .map(f => pickByMetric(f.properties))
      .filter(v => Number.isFinite(v));
  }, [sourceFeatures, metric, weights, level]);

  const domain = useMemo(() => {
    if (!values.length) return [0, 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min >= 0 && max <= 1.0001) return [0, 1];
    return [min, max];
  }, [values]);

  const EDGES = useMemo(() => {
  // Αν οι τιμές είναι normalized 0–1, χρησιμοποιούμε τα ίδια breaks με τον χάρτη/υπόμνημα.
  if (domain[0] >= 0 && domain[1] <= 1.0001) {
    return BREAKS;
  }

  // Fallback για περίπτωση που κάποια μετρική δεν είναι 0–1.
  const bins = BREAKS.length - 1;
  const [min, max] = domain;
  const step = (max - min) / bins;
  return Array.from({ length: bins + 1 }, (_, i) => min + i * step);
}, [domain]);

const BINS = EDGES.length - 1;

const CENTERS = useMemo(
  () => Array.from(
    { length: BINS },
    (_, i) => (EDGES[i] + EDGES[i + 1]) / 2
  ),
  [EDGES, BINS]
);
const BIN_LABELS = useMemo(
  () =>
    Array.from({ length: BINS }, (_, i) =>
      `${EDGES[i].toFixed(2)}–${EDGES[i + 1].toFixed(2)}`
    ),
  [EDGES, BINS]
);
  const makeHistogramCDF = (vals) => {
  const counts = new Array(BINS).fill(0);

  for (const v of vals) {
    let idx = EDGES.findIndex((edge, i) => {
      if (i === EDGES.length - 1) return false;
      const left = EDGES[i];
      const right = EDGES[i + 1];

      // Το τελευταίο interval περιλαμβάνει και το 1.00
      if (i === BINS - 1) {
        return v >= left && v <= right;
      }

      return v >= left && v < right;
    });

    if (idx < 0) {
      idx = v < EDGES[0] ? 0 : BINS - 1;
    }

    counts[idx]++;
  }

  const total = Math.max(1, vals.length);
  const cdf = counts.map(
    (_, i) => counts.slice(0, i + 1).reduce((a, b) => a + b, 0) / total
  );

  return { counts, cdf };
};

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { counts, cdf } = makeHistogramCDF(values);
    const barData = counts;
    const cdfData = cdf;

    const barColors = barData.map((_, i) =>
  colorFor((EDGES[i] + EDGES[i + 1]) / 2)
);
    const barBorders = barData.map((_, i) => (i === selectedBin ? "#49c5ff" : undefined));
    const barBorderWidths = barData.map((_, i) => (i === selectedBin ? 2 : 0));

    chartRef.current?.destroy();
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
  labels: BIN_LABELS,
  datasets: [
    {
      type: "bar",
      label: "Συχνότητα",
      data: barData,
      backgroundColor: barColors,
      borderColor: barBorders,
      borderWidth: barBorderWidths,
      barPercentage: 0.95,
      categoryPercentage: 0.95,
    },
    {
      type: "line",
      label: "CDF",
      data: cdfData,
      yAxisID: "y1",
      pointRadius: 2,
      borderWidth: 2,
      borderColor: "#eaf2ff",
      tension: 0.25,
    },
  ],
},
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: "nearest", intersect: true },
        onClick: (evt) => {
          const points = chartRef.current.getElementsAtEventForMode(evt, "nearest", { intersect: true }, false);
          if (points?.length) {
            const i = points[0].index;
            onSelectBin(prev => (prev === i ? null : i));
          }
        },
        scales: {
  x: {
    type: "category",
    title: {
      display: true,
      text: "Κλάσεις τιμών",
    },
    grid: {
      drawOnChartArea: false,
    },
    ticks: {
      maxRotation: 0,
      minRotation: 0,
    },
  },
  y: {
    beginAtZero: true,
    ticks: {
      precision: 0,
    },
    title: {
      display: true,
      text: "Πλήθος πολυγώνων (N)",
    },
  },
  y1: {
    beginAtZero: true,
    max: 1,
    position: "right",
    grid: {
      drawOnChartArea: false,
    },
    title: {
      display: true,
      text: "Αθροιστικό ποσοστό (CDF)",
    },
  },
},
        plugins: { legend: { display: true } },
      },
    });

    return () => chartRef.current?.destroy();
  }, [values, domain, selectedBin, EDGES, BINS, BIN_LABELS]);

  const N = values.length;
  const mm = values.length ? { min: Math.min(...values), max: Math.max(...values) } : null;
  const countViewport = geojson?.features?.length ?? 0;
  const countAll = allGeojson?.features?.length ?? 0;

  return (
    <>
      <div className="panel-title">Κατανομή (ιστόγραμμα + CDF)</div>
      <div className="dist-controls">
        <label htmlFor="metric">Μετρική:</label>
        <select id="metric" value={metric} onChange={(e) => onSelectBin(null) || setMetric(e.target.value)}>
          {indicators.map(opt => <option key={opt.id} value={opt.id}>{opt.label || opt.id}</option>)}
        </select>

        <label htmlFor="scope">Πεδίο:</label>
        <select id="scope" value={scope} onChange={(e) => onSelectBin(null) || setScope(e.target.value)}>
          <option value="all">Όλες</option>
          <option value="viewport">Viewport</option>
        </select>

        <span className="badge">{`N=${N}`}</span>
        <span className="badge">VP {countViewport}</span>
        <span className="badge">ALL {countAll}</span>
        {mm && <span className="badge">min {mm.min.toFixed(2)}</span>}
        {mm && <span className="badge">max {mm.max.toFixed(2)}</span>}
      </div>

      <div ref={wrapRef} className="bottom-canvas-wrap" style={{ position: "relative", minHeight: 220 }}>
        <canvas ref={canvasRef} />
      </div>
    </>
  );
}
