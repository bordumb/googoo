/** Format cents as a dollar string. Returns "Free" for null (swap/free listings). */
export function formatPrice(cents: number | null): string {
  if (cents === null) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

/** Format meters as a human-readable distance string. */
export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 0.1) return "Nearby";
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`;
  return `${miles.toFixed(1)} mi`;
}
