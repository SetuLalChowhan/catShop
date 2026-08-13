/**
 * Convert a string into a URL-friendly slug.
 * "Persian Cat – Luna!" → "persian-cat-luna"
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // strip punctuation
    .replace(/[\s_]+/g, "-") // spaces/underscores → dashes
    .replace(/-+/g, "-") // collapse repeated dashes
    .replace(/^-|-$/g, ""); // trim leading/trailing dashes
}

/** Append a short random suffix to guarantee uniqueness. */
export function uniqueSlug(input: string): string {
  const base = slugify(input);
  const suffix = Math.random().toString(36).slice(2, 6);
  return base ? `${base}-${suffix}` : `cat-${suffix}`;
}
