import { RDYLGN } from "./constants.js";

export function colorFor(x) {
  const v = Math.max(0, Math.min(1, Number(x) || 0));
  const i = Math.min(
    Math.floor(v * RDYLGN.length),
    RDYLGN.length - 1
  );
  return RDYLGN[i];
}