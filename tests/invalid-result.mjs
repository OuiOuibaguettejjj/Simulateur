export const INVALID_RESULT_RE=/(?:\bNaN\b|\b-Infinity\b|\bInfinity\b|\bundefined\b|\bnull\b|\[object Object\]|(?:^|[^\d])-∞(?=\s|€|$)|(?:^|[^\d])∞(?=\s|€|$))/i;
export function isInvalidResult(value){return INVALID_RESULT_RE.test(String(value??""));} 
