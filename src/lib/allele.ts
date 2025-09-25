export function normalizeAllele(value: number | null | undefined) {
  if (value === null || value === undefined) return null as any;
  const integerPart = Math.floor(value);
  const fractionalPart = value - integerPart;
  const approx = (a: number, b: number) => Math.abs(a - b) < 1e-6;
  let newFraction = fractionalPart;
  if (approx(fractionalPart, 0.75) || approx(fractionalPart, 0.35)) {
    newFraction = 0.3;
  } else if (approx(fractionalPart, 0.25) || approx(fractionalPart, 0.5)) {
    newFraction = 0.2;
  }
  const normalized = integerPart + newFraction;
  return parseFloat(normalized.toFixed(1));
}
