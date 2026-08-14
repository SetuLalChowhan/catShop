/** Age stored in months → human-friendly label. */
export function formatAge(ageMonths: number): string {
  if (ageMonths <= 0) return "Newborn";
  if (ageMonths < 12) {
    const weeks = Math.round(ageMonths * 4.345);
    if (weeks < 8) return `${Math.max(1, Math.round(ageMonths * 4.345))} weeks`;
    return `${ageMonths} month${ageMonths === 1 ? "" : "s"}`;
  }
  const years = ageMonths / 12;
  const whole = Math.floor(years);
  const rem = Math.round((years - whole) * 12);
  if (rem === 0) return `${whole} year${whole === 1 ? "" : "s"}`;
  return `${whole} year${whole === 1 ? "" : "s"} ${rem} month${rem === 1 ? "" : "s"}`;
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Ensure an external URL starts with a protocol so the browser doesn't treat
 * it as a relative path (e.g. "facebook.com/page" → "https://facebook.com/page").
 * Returns the fallback when the value is empty.
 */
export function safeExternalUrl(
  url: string | null | undefined,
  fallback = "",
): string {
  const value = (url || "").trim();
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
