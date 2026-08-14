import type { Metadata } from "next";
import { SITE, SITE_URL } from "./site";

/** Default social sharing image (self-hosted, 1200×826). */
export const OG_IMAGE = "/og-image.jpg";

/** Default social sharing image dimensions. */
export const OG_IMAGE_DIMENSIONS = { width: 1200, height: 826 };

export const SITE_NAME = SITE.name;
export const SITE_TAGLINE = SITE.tagline;
export const SITE_DESCRIPTION = SITE.description;

/** Shared keywords for the whole site; pages can narrow these further. */
export const SITE_KEYWORDS = [
  "kittens for adoption",
  "purebred kittens",
  "cattery",
  "cat breeder",
  "kittens for sale",
];

/** Build an absolute URL for a given site path (e.g. "/cats/milo"). */
export function absoluteUrl(path = ""): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface SeoMetadataConfig {
  /** Page title (the root layout appends " · Whisker Haven"). */
  title: string;
  /** Use `title.absolute` instead of the layout template when full control is needed. */
  titleAbsolute?: boolean;
  description: string;
  keywords?: string[];
  /** Site path, e.g. "/cats". Used for the canonical URL and OG url. */
  path: string;
  /** Optional OG image path (defaults to the shared OG image). */
  image?: string;
  imageAlt?: string;
  imageDimensions?: { width: number; height: number };
  robots?: "index" | "noindex";
}

/**
 * Build a complete, consistent Metadata object for a public page.
 * Centralizes canonical URLs, Open Graph, Twitter card and robots config so
 * pages only declare what is unique to them.
 */
export function buildMetadata(config: SeoMetadataConfig): Metadata {
  const {
    title,
    titleAbsolute = false,
    description,
    keywords = [],
    path,
    image = OG_IMAGE,
    imageAlt,
    imageDimensions = OG_IMAGE_DIMENSIONS,
    robots = "index",
  } = config;

  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  const titleValue = titleAbsolute ? { absolute: title } : title;

  return {
    title: titleValue,
    description,
    keywords: Array.from(new Set([...keywords, ...SITE_KEYWORDS])),
    alternates: { canonical: url },
    robots: {
      index: robots === "index",
      follow: true,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: titleAbsolute ? title : `${title} | ${SITE_NAME}`,
      description,
      url,
      locale: "en_US",
      images: [
        {
          url: imageUrl,
        alt: imageAlt || `${SITE_NAME} | ${title}`,
        ...imageDimensions,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleAbsolute ? title : `${title} | ${SITE_NAME}`,
      description,
      images: [imageUrl],
    },
  };
}

/* ── JSON-LD (structured data) ───────────────────────────────────────────── */

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** BreadcrumbList schema — used on every public page below the home page. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Organization schema — emitted once in the root layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(OG_IMAGE),
    description: SITE_DESCRIPTION,
    sameAs: ["https://facebook.com", "https://m.me"],
  };
}

/** WebSite schema — emitted once in the root layout. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": absoluteUrl("/#organization") },
    inLanguage: "en-US",
  };
}

/** WebPage schema for a given page. */
export function webPageJsonLd(config: {
  path: string;
  name: string;
  description: string;
  type?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": config.type || "WebPage",
    "@id": `${absoluteUrl(config.path)}#webpage`,
    url: absoluteUrl(config.path),
    name: config.name,
    description: config.description,
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: { "@id": absoluteUrl("/#organization") },
    inLanguage: "en-US",
  };
}

/** LocalBusiness-style schema for the cattery contact details. */
export function catteryJsonLd(config: {
  path: string;
  name?: string;
  description: string;
  telephone: string;
  email: string;
  address: string;
  hours: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AnimalShelter",
    "@id": `${absoluteUrl(config.path)}#cattery`,
    name: config.name || SITE_NAME,
    url: absoluteUrl(config.path),
    image: absoluteUrl(OG_IMAGE),
    description: config.description,
    telephone: config.telephone,
    email: config.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.address,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      description: config.hours,
    },
    sameAs: ["https://facebook.com", "https://m.me"],
  };
}

/* ── Image alt text helpers ──────────────────────────────────────────────── */

/** Descriptive alt text for a cat's photos. */
export function catImageAlt(
  name: string,
  breed?: string,
  index?: number,
): string {
  const base = `${name}${breed ? `, ${breed} kitten` : " kitten"} at ${SITE_NAME}`;
  return typeof index === "number" ? `${base}, photo ${index + 1}` : base;
}
