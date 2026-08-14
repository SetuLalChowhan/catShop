import JsonLd from "@/components/seo/JsonLd";
import {
  SITE_DESCRIPTION,
  buildMetadata,
  breadcrumbJsonLd,
  catteryJsonLd,
  webPageJsonLd,
} from "@/lib/seo";
import { serverFetchCached } from "@/lib/api";
import { WebsiteContent } from "@/types";
import AboutClient from "./about-client";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "About Our Cattery — Ethical Cat Breeding",
  description:
    "Learn about Whisker Haven's family cattery, our ethical breeding standards, cage-free home environment, and how every kitten is health-checked and socialized.",
  keywords: [
    "about our cattery",
    "ethical cat breeder",
    "cat breeding standards",
    "how kittens are raised",
    "family cattery",
  ],
  path: "/about",
  robots: "index",
});

async function getContent(): Promise<WebsiteContent | null> {
  try {
    return await serverFetchCached<WebsiteContent>("/api/content");
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const content = await getContent();

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: "/about",
          name: "About Our Cattery — Ethical Cat Breeding",
          description:
            "Learn about Whisker Haven's family cattery, ethical breeding standards, and how every kitten is raised.",
          type: "AboutPage",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About Us", path: "/about" },
        ])}
      />
      <JsonLd
        data={catteryJsonLd({
          path: "/about",
          description: SITE_DESCRIPTION,
          telephone: "+1 (555) 234-5678",
          email: "hello@whiskerhaven.com",
          address: "123 Whisker Way, Loving Home Cattery",
          hours: "Mon - Sun: 9:00 AM - 7:00 PM (visits by appointment)",
        })}
      />
      <AboutClient content={content} />
    </>
  );
}
