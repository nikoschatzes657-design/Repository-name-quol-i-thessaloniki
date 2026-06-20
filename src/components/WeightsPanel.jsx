// src/components/WeightsPanel.jsx

import { useState, useMemo } from "react";
import {
  GROUPS_OT,
  FLAT_OT,
  DEFAULT_WEIGHTS_OT,
  DK_GROUPS,
  DK_INDICATORS,
  DEFAULT_WEIGHTS_DK,
  DK_WEIGHT_PROFILES,
} from "src/lib/constants.js";

function setWeightConstrained(prev, id, newVal) {
  const keys = Object.keys(prev);
  const clamped = Math.max(0, Math.min(1, Number(newVal) || 0));
  const others = keys.filter((k) => k !== id);
  const sumOthers = others.reduce((a, k) => a + Number(prev[k] || 0), 0);

  if (clamped >= 1 || sumOthers === 0) {
    return Object.fromEntries(keys.map((k) => [k, k === id ? 1 : 0]));
  }

  const remaining = 1 - clamped;
  const ratio = remaining / sumOthers;
  const next = {};
  for (const k of keys) {
    next[k] = k === id ? clamped : Number(prev[k] || 0) * ratio;
  }
  return next;
}

const IcoEdu = () => (
  <svg className="ico" viewBox="0 0 24 24">
    <path d="M12 3L2 9l10 6 10-6-10-6zm0 8l6.5-3.9v4.6L12 15l-6.5-3.3V7.1L12 11z" />
  </svg>
);

const IcoHealth = () => (
  <svg className="ico" viewBox="0 0 24 24">
    <path d="M12 21s-6.5-4-9-8.5C1.2 11.6 1 10.8 1 10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 .8-.2 1.6-2 2.5C18.5 17 12 21 12 21z" />
  </svg>
);

const IcoInfra = () => (
  <svg className="ico" viewBox="0 0 24 24">
    <path d="M3 5h18v2H3zm0 4h18v2H3zm0 4h18v2H3zm0 4h18v2H3z" />
  </svg>
);

const iconOf = (g) =>
  g.icon === "edu" ? <IcoEdu /> : g.icon === "health" ? <IcoHealth /> : <IcoInfra />;

export default function WeightsPanel({
  level = "ot",
  weights,
  setWeights,
  lockSumToOne,
  setLockSumToOne,
  showDynamic,
  setShowDynamic,
}) {
  const { groups, flat, defaults, profiles } = useMemo(() => {
    if (level === "dk") {
      return {
        groups: DK_GROUPS,
        flat: DK_INDICATORS,
        defaults: DEFAULT_WEIGHTS_DK,
        profiles: DK_WEIGHT_PROFILES,
      };
    }
    return {
      groups: GROUPS_OT,
      flat: FLAT_OT,
      defaults: DEFAULT_WEIGHTS_OT,
      profiles: null,
    };
  }, [level]);

  const [open, setOpen] = useState(() =>
    Object.fromEntries(groups.map((g) => [g.title, true]))
  );

  const [selectedProfile, setSelectedProfile] = useState(
    level === "dk" ? "thesis" : "custom"
  );

  const toggle = (title) =>
    setOpen((o) => ({
      ...o,
      [title]: !o[title],
    }));

  const applyProfile = (id) => {
    setSelectedProfile(id);
    if (!profiles) return;
    const prof = profiles.find((p) => p.id === id);
    if (prof && prof.weights) {
      setWeights({ ...prof.weights });
    }
  };

  const setW = (id, v) => {
    const numeric = Number(v);
    const clean = Number.isFinite(numeric) ? numeric : 0;
    setWeights((prev) =>
      lockSumToOne
        ? setWeightConstrained(prev, id, clean)
        : {
            ...prev,
            [id]: Math.max(0, Math.min(1, clean)),
          }
    );
    if (level === "dk" && selectedProfile !== "custom") {
      setSelectedProfile("custom");
    }
  };

  const reset = () => {
    setWeights(defaults);
    if (level === "dk") setSelectedProfile("thesis");
  };

  const zeroAll = () =>
    setWeights(Object.fromEntries(flat.map((it) => [it.id, 0])));

  const sum = Object.values(weights || {}).reduce(
    (a, b) => a + Number(b || 0),
    0
  );

  const groupSums = useMemo(() => {
    const res = {};
    groups.forEach((g) => {
      res[g.title] = (g.items || []).reduce(
        (acc, it) => acc + Number(weights?.[it.id] || 0),
        0
      );
    });
    return res;
  }, [groups, weights]);

  return (
    <div className="side-panel">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          id="toggle-dynamic"
          type="checkbox"
          checked={showDynamic}
          onChange={(e) => setShowDynamic(e.target.checked)}
        />
        <label
          htmlFor="toggle-dynamic"
          style={{ userSelect: "none", fontWeight: 500 }}
        >
          Εμφάνιση θεματικών πολυγώνων
        </label>
      </div>

      <div className="lock-row" style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <input
            id="lock-sum"
            type="checkbox"
            checked={lockSumToOne}
            onChange={(e) => setLockSumToOne(e.target.checked)}
          />
          <label htmlFor="lock-sum">Κλείδωμα: άθροισμα βαρών = 1</label>
        </div>

        {level === "dk" && profiles && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Προφίλ βαρών (DK)</div>
            <select
              value={selectedProfile}
              onChange={(e) => applyProfile(e.target.value)}
              style={{
                width: "100%",
                padding: "2px 6px",
                fontSize: 12,
                borderRadius: 6,
                border: "1px solid var(--line)",
                background: "var(--bg-3)",
                color: "var(--text-0)",
              }}
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ marginTop: 6, marginBottom: 8, fontSize: 12, opacity: 0.8 }}>
        Βάρη δεικτών · άθροισμα: {sum.toFixed(2)}
      </div>

      {groups.map((g) => {
        const groupSum = groupSums[g.title] ?? 0;
        return (
          <div className="group" key={g.title}>
            <div
              className="group-head"
              onClick={() => toggle(g.title)}
              style={{ cursor: "pointer" }}
            >
              {iconOf(g)}
              <div style={{ fontWeight: 700, marginLeft: 6 }}>{g.title}</div>
              {level === "dk" && (
                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    opacity: 0.8,
                  }}
                >
                  w = {groupSum.toFixed(2)}
                </div>
              )}
              <div style={{ marginLeft: 6 }}>
                {open[g.title] ? "▾" : "▸"}
              </div>
            </div>

            {open[g.title] && (
              <div className="group-body">
                {g.items.map((it) => {
                  const value = Number(
                    weights?.[it.id] ?? defaults[it.id] ?? 0
                  );
                  const numId = `w-num-${level}-${it.id}`;
                  const rangeId = `w-range-${level}-${it.id}`;

                  return (
                    <div className="weight-row" key={it.id}>
                      <label htmlFor={rangeId} className="weight-label">
                        {it.label}
                      </label>
                      <div className="weight-controls">
                        <input
                          id={rangeId}
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={value}
                          onChange={(e) => setW(it.id, e.target.value)}
                        />
                        <input
                          id={numId}
                          type="number"
                          min={0}
                          max={1}
                          step={0.01}
                          value={value.toFixed(2)}
                          onChange={(e) => setW(it.id, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 10,
          justifyContent: "space-between",
        }}
      >
        <button className="btn-small" type="button" onClick={reset}>
          Επαναφορά προεπιλεγμένων
        </button>
        <button className="btn-small secondary" type="button" onClick={zeroAll}>
          Μηδενισμός βαρών
        </button>
      </div>
    </div>
  );
}
