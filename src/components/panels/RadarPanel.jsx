import { useEffect, useMemo, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { FLAT_OT, DK_INDICATORS } from "src/lib/constants.js";
import { pickValue, clamp01 } from "src/lib/scoring.js";

Chart.register(...registerables);

/*
  RadarPanel:
  - Προβάλλει τις τιμές ΔΕΙΚΤΩΝ του επιλεγμένου feature (propsObj) σε ραντάρ.
  - Για OT: χρησιμοποιεί FLAT_OT και pickValue(keys).
  - Για DK: χρησιμοποιεί DK_INDICATORS (χωρίς να εφαρμόζει invert εδώ, δείχνουμε τις raw 0–1 τιμές).
  - Προβάλλει και τα βάρη ως δεύτερο dataset (scaled 0–1).
*/

export default function RadarPanel({ propsObj, level = "ot", weights = {} }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const metas = useMemo(() => {
    return level === "dk"
      ? DK_INDICATORS
      : FLAT_OT; // [{id, label, keys}] για OT
  }, [level]);

  const labels = useMemo(
    () => metas.map(m => m.label || m.id),
    [metas]
  );

  // Τιμές για το επιλεγμένο feature
  const valuesFeature = useMemo(() => {
    const p = propsObj || {};
    return metas.map(m => {
      let v;
      if (level === "dk") {
        v = Number(p?.[m.id]);
      } else {
        v = pickValue(p, m.keys);
      }
      return clamp01(v) ?? 0;
    });
  }, [propsObj, metas, level]);

  // Βάρη (όπως είναι ορισμένα στο panel) κλιμακωμένα στο 0–1
  const valuesWeights = useMemo(() => {
    return metas.map(m => clamp01(Number(weights?.[m.id])) ?? 0);
  }, [weights, metas]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current?.destroy();
    chartRef.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Τιμές επιλεγμένης περιοχής",
            data: valuesFeature,
            borderWidth: 2,
            pointRadius: 2,
            fill: true,
          },
          {
            label: "Βάρη δεικτών",
            data: valuesWeights,
            borderWidth: 2,
            pointRadius: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          r: {
            min: 0, max: 1,
            ticks: { stepSize: 0.2 },
            grid: { circular: true },
          },
        },
        plugins: { legend: { display: true } },
      },
    });

    return () => chartRef.current?.destroy();
  }, [labels, valuesFeature, valuesWeights]);

  return (
    <>
      <div className="panel-title">Ραντάρ δεικτών</div>
      <div style={{ position: "relative", minHeight: 280 }}>
        <canvas ref={canvasRef} />
      </div>
    </>
  );
}
