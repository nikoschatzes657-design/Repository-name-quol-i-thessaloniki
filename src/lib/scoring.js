// src/lib/scoring.js
import * as C from "./constants.js";

/* pick από πολλαπλά keys (μόνο για OT) */
export function pickValue(props, keys) {
  if (!props) return null;
  for (const k of (keys || [])) {
    const v = props[k];
    if (v !== undefined && v !== null && v !== "") return Number(v);
  }
  return null;
}

export function clamp01(x) {
  return Number.isFinite(x) ? Math.max(0, Math.min(1, Number(x))) : null;
}

/* ====== OT (flat proximity) ====== */
export function computeScoreOT(props, weights) {
  try {
    const items = Array.isArray(C.FLAT_OT) ? C.FLAT_OT : [];
    let ssum = 0, wsum = 0;
    for (const it of items) {
      const w = Number(weights?.[it.id] ?? 0);
      if (w <= 0) continue;
      const v = pickValue(props, it.keys);
      if (Number.isFinite(v)) { ssum += w * v; wsum += w; }
    }
    return wsum > 0 ? clamp01(ssum / wsum) : null;
  } catch {
    return null;
  }
}

/* ====== DK (flat sliders, με inversion όπου χρειάζεται) ====== */
export function computeScoreDK(props, weights) {
  try {
    // Αν για κάποιο λόγο δεν υπάρχει DK_INDICATORS, μην πεθάνουμε.
    const metas = Array.isArray(C.DK_INDICATORS) ? C.DK_INDICATORS : [];

    // Αν ούτε αυτά υπάρχουν, έστω βάδισε πάνω στα keys των weights (χωρίς invert).
    const safeMetas = metas.length
      ? metas
      : Object.keys(weights || {}).map(id => ({ id, invert: false }));

    let ssum = 0, wsum = 0;

    for (const it of safeMetas) {
      const w = Number(weights?.[it.id] ?? 0);
      if (w <= 0) continue;

      let v = props?.[it.id];
      if (v === null || v === undefined || v === "") continue;

      v = Number(v);
      if (!Number.isFinite(v)) continue;

      // clamp στο [0,1]
      v = Math.max(0, Math.min(1, v));

      // ρητό invert μόνο όταν ζητείται
      if (it.invert === true) v = 1 - v;

      ssum += w * v;
      wsum += w;
    }

    return wsum > 0 ? Number((ssum / wsum).toFixed(6)) : null;
  } catch {
    // Τελευταία άμυνα: ποτέ άσπρη οθόνη.
    return null;
  }
}
