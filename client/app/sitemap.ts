import { MetadataRoute } from "next";
import { SITE_URL, API_URL } from "@/lib/site";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/cats`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/winners`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/booking`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const res = await fetch(`${API_URL}/api/cats`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json?.data?.cats)
        ? json.data.cats
        : Array.isArray(json?.cats)
          ? json.cats
          : [];
      const seen = new Set<string>();

      // Only active cats are returned by the public API; guard again and
      // deduplicate by slug so the sitemap never lists the same URL twice.
      for (const cat of list) {
        if (cat?.status && cat.status !== "active") continue;
        if (!cat?.slug || seen.has(cat.slug)) continue;
        seen.add(cat.slug);
        routes.push({
          url: `${SITE_URL}/cats/${cat.slug}`,
          lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {
    // Graceful fallback: static routes only (already populated above).
  }

  return routes;
}
