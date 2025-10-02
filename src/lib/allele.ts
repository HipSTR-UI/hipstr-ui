export function normalizeAllele(value: number | null | undefined, marker?: string) {
  if (value === null || value === undefined) return null as any;

  const integerPart = Math.floor(value);
  const fractionalPart = value - integerPart;
  const approx = (a: number, b: number) => Math.abs(a - b) < 1e-6;

  // Normalize HipSTR fractional parts to ISFG style
  let newFraction = fractionalPart;
  if (approx(fractionalPart, 0.75) || approx(fractionalPart, 0.35)) {
    newFraction = 0.3;
  } else if (approx(fractionalPart, 0.25) || approx(fractionalPart, 0.5)) {
    newFraction = 0.2;
  }

  // Apply marker-specific shift in repeat units (integer part only)
  let adjustedInteger = integerPart;
  if (marker) {
    const key = marker.trim().toUpperCase().replace(/\s+/g, " ");
    const SHIFT_MAP: { [marker: string]: number } = {
      D19S433: -2,
      D21S11: -2,
      VWA: -2,
      PENTAD: 1,
    };
    const shift = SHIFT_MAP[key];
    if (typeof shift === "number") {
      adjustedInteger += shift;
    }
  }

  const normalized = adjustedInteger + newFraction;
  return parseFloat(normalized.toFixed(1));
}
