/** Parse "3 g", "500ml", "2", or "pinch" into quantity + unit strings. */
export function parseQuantityAndUnit(
  raw: string,
  fallbackUnit: string,
): { qty: number; unit: string } {
  const t = raw.trim();
  const unitFb = fallbackUnit.trim() || "g";
  if (t === "") {
    return { qty: 1, unit: unitFb };
  }
  const m = t.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (m) {
    const num = Number(m[1]);
    const rest = (m[2] ?? "").trim();
    if (Number.isFinite(num) && num >= 0) {
      return { qty: num, unit: rest || unitFb };
    }
  }
  return { qty: 1, unit: t || unitFb };
}
