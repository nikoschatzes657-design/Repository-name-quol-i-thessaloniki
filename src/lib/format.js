export const fmtPct = (v) =>
  Number.isFinite(v) ? (v * 100).toFixed(1) + "%" : "–";

export const fmtDec = (v, d=2) =>
  Number.isFinite(v) ? v.toFixed(d) : "–";

export const fmtRange = (a, b) =>
  `${a.toFixed(1)}–${b.toFixed(1)}`;
