import { MetadataRoute } from "next";
import { SITE_URL, API_URL } from "@/lib/site";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/cats",
    "/about",
    "/winners",
    "/contact",
    "/booking",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const res = await fetch(`${API_URL}/api/cats`, { next: { revalidate: 60 } });
    if (res.ok) {
      const cats = await res.json();
      const list = Array.isArray(cats?.data) ? cats.data : Array.isArray(cats) ? cats : [];
      const catRoutes = list.map((cat: any) => ({
        url: `${SITE_URL}/cats/${cat.slug}`,
        lastModified: cat.updatedAt || new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
      return [...routes, ...catRoutes];
    }
  } catch (e) {
    // Graceful fallback to static routes
  }

  return routes;
}
