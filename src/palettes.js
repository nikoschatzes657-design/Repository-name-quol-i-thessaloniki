// Μικρό palette module (color-blind-safe επιλογές).
// samplePalette(base, k): επιστρέφει k χρώματα ομοιόμορφα από την παλέτα.

export const PALETTES = {
  Viridis: [
    "#440154","#481567","#482475","#453781","#3b528b","#2c728e",
    "#21918c","#27ad81","#5ec962","#addc30","#fde725"
  ],
  Cividis: [
    "#00204c","#11366e","#2a4a7f","#425b86","#5a6b89","#727a88",
    "#8b897f","#a4996f","#bcaa59","#d6bd43","#f1cf2f"
  ],
  Plasma: [
    "#0d0887","#3a049a","#5c01a6","#7b02a8","#9a179b","#b83289",
    "#d14e72","#e66c5c","#f48849","#fca636","#fbd324"
  ],
  Magma: [
    "#000004","#140b34","#3b0f70","#641a80","#8c2981","#b5367a",
    "#de4968","#f66e5b","#fe9f6d","#fecf92","#fcfdbf"
  ],
  YlGnBu: [
    "#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4",
    "#1d91c0","#225ea8","#253494","#081d58"
  ],
  Turbo: [
    "#23171b","#3a355e","#1d63a6","#1b9bd0","#5fc7b7",
    "#b5e08d","#fde95e","#fbb23c","#ea5b2b","#b11f2f","#6a1135"
  ],
};

// Δώσε k χρώματα από την παλέτα (ακόμη κι αν είναι μεγαλύτερη/μικρότερη).
export function samplePalette(base, k) {
  const arr = Array.isArray(base) ? base : PALETTES.Viridis;
  const n = Math.max(3, Math.min(9, Number(k) || 6));
  if (arr.length === n) return [...arr];
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1); // 0..1
    const idx = Math.round(t * (arr.length - 1));
    out.push(arr[idx]);
  }
  return out;
}
