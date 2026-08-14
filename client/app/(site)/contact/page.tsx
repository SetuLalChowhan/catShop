import JsonLd from "@/components/seo/JsonLd";
import {
  SITE_DESCRIPTION,
  buildMetadata,
  breadcrumbJsonLd,
  catteryJsonLd,
  webPageJsonLd,
} from "@/lib/seo";
import { serverFetchCached } from "@/lib/api";
import { ContactInfo } from "@/types";
import ContactClient from "./contact-client";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Contact Us — Visit or Inquire About Kittens",
  description:
    "Have questions about our kittens, adoption process, or visiting the cattery? Call, email, or message us on Facebook Messenger — we respond within 24 hours.",
  keywords: [
    "contact cattery",
    "kitten adoption questions",
    "visit the cattery",
    "cattery contact details",
    "kitten inquiry",
  ],
  path: "/contact",
  robots: "index",
});

async function getContact(): Promise<ContactInfo | null> {
  try {
    const content = await serverFetchCached<{ contact?: ContactInfo }>("/api/content");
    return content?.contact ?? null;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const contact = await getContact();

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: "/contact",
          name: "Contact Us — Visit or Inquire About Kittens",
          description:
            "Get in touch with Whisker Haven by phone, email, or Facebook Messenger.",
          type: "ContactPage",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <JsonLd
        data={catteryJsonLd({
          path: "/contact",
          description: SITE_DESCRIPTION,
          telephone: "+1 (555) 234-5678",
          email: "hello@whiskerhaven.com",
          address: "123 Whisker Way, Loving Home Cattery",
          hours: "Mon - Sun: 9:00 AM - 7:00 PM (visits by appointment)",
        })}
      />
      <ContactClient contact={contact} />
    </>
  );
}
