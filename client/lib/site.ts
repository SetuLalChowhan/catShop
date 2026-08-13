/** Static fallbacks used before CMS content loads. */
export const SITE = {
  name: "Whisker Haven",
  tagline: "Premium kittens, raised with love",
  description:
    "A family-run cattery raising healthy, well-socialised kittens for loving homes.",
  nav: [
    { label: "Home", href: "/" },
    { label: "Our Cats", href: "/cats" },
    { label: "About", href: "/about" },
    { label: "Winners", href: "/winners" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

/** Absolute URL used by server components when calling the API. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
