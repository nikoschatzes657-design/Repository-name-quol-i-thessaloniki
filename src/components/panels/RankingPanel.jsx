// src/components/panels/RankingPanel.jsx

import { useMemo, useState } from "react";
import { computeScoreOT, computeScoreDK, clamp01 } from "src/lib/scoring.js";

function getName(props, level) {
  if (!props) return "Χωρίς όνομα";

  if (level === "dk") {
    return props.name || props.dk_name || props.community || "Χωρίς όνομα";
  }

  return (
    props.fua_name ||
    props.mun_name ||
    props.community ||
    props.name ||
    `OT ${props.id ?? ""}` ||
    "Χωρίς όνομα"
  );
}

function getScore(props, level, weights) {
  const raw =
    level === "dk"
      ? computeScoreDK(props, weights)
      : computeScoreOT(props, weights);

  return clamp01(raw);
}

function getClassLabel(score) {
  if (!Number.isFinite(score)) return "Μη διαθέσιμη";

  if (score < 0.2) return "Πολύ χαμηλή";
  if (score < 0.4) return "Χαμηλή";
  if (score < 0.6) return "Μέτρια";
  if (score < 0.8) return "Υψηλή";
  return "Πολύ υψηλή";
}

export default function RankingPanel({
  geojson,
  allGeojson,
  weights,
  level = "dk",
}) {
  const [scope, setScope] = useState("all");
  const [count, setCount] = useState(5);

  const sourceFeatures = useMemo(() => {
    if (scope === "viewport") {
      return geojson?.features ? [...geojson.features] : [];
    }

    return allGeojson?.features ? [...allGeojson.features] : [];
  }, [scope, geojson, allGeojson]);

  const ranking = useMemo(() => {
    return sourceFeatures
      .map((feature) => {
        const props = feature.properties || {};
        const score = getScore(props, level, weights);

        return {
          id: props.id ?? props.objectid ?? props.fid ?? getName(props, level),
          name: getName(props, level),
          score,
          category: getClassLabel(score),
          props,
        };
      })
      .filter((row) => Number.isFinite(row.score))
      .sort((a, b) => b.score - a.score);
  }, [sourceFeatures, level, weights]);

  const topRows = ranking.slice(0, count);
  const bottomRows = [...ranking].reverse().slice(0, count);

  const title =
    level === "dk"
      ? "Κατάταξη Δημοτικών Κοινοτήτων"
      : "Κατάταξη Οικοδομικών Τετραγώνων";

  const scoreLabel =
    level === "dk"
      ? "QoL-i"
      : "Δείκτης προσβασιμότητας";

  return (
    <>
      <div className="panel-title">{title}</div>

      <div className="dist-controls">
        <label htmlFor="ranking-scope">Πεδίο:</label>
        <select
          id="ranking-scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        >
          <option value="all">Όλες οι περιοχές</option>
          <option value="viewport">Τρέχουσα προβολή χάρτη</option>
        </select>

        <label htmlFor="ranking-count">Πλήθος:</label>
        <select
          id="ranking-count"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        >
          <option value={5}>Top/Bottom 5</option>
          <option value={10}>Top/Bottom 10</option>
          <option value={15}>Top/Bottom 15</option>
        </select>

        <span className="badge">N={ranking.length}</span>
      </div>

      <div className="ranking-grid">
        <RankingTable
          title="Υψηλότερες τιμές"
          rows={topRows}
          scoreLabel={scoreLabel}
        />

        <RankingTable
          title="Χαμηλότερες τιμές"
          rows={bottomRows}
          scoreLabel={scoreLabel}
        />
      </div>
    </>
  );
}

function RankingTable({ title, rows, scoreLabel }) {
  return (
    <div className="ranking-card">
      <div className="ranking-title">{title}</div>

      <div className="ranking-table-wrap">
        <table className="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Περιοχή</th>
              <th>{scoreLabel}</th>
              <th>Κατηγορία</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="ranking-empty">
                  Δεν υπάρχουν διαθέσιμα δεδομένα.
                </td>
              </tr>
            )}

            {rows.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.name}</td>
                <td>
                  <code>{row.score.toFixed(3)}</code>
                </td>
                <td>{row.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}