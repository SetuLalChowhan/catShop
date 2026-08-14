import JsonLd from "@/components/seo/JsonLd";
import {
  buildMetadata,
  breadcrumbJsonLd,
  webPageJsonLd,
} from "@/lib/seo";
import { serverFetchCached } from "@/lib/api";
import { Cat } from "@/types";
import BookingClient from "./booking-client";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Reserve a Kitten — Booking & Visit Inquiry",
  description:
    "Submit a kitten reservation or cattery visit inquiry. Tell us which cat you're interested in and our team will confirm availability and visit arrangements.",
  keywords: [
    "reserve a kitten",
    "kitten booking",
    "cattery visit",
    "kitten adoption reservation",
    "book a kitten",
  ],
  path: "/booking",
  robots: "index",
});

async function getCats(): Promise<Cat[]> {
  try {
    return await serverFetchCached<Cat[]>("/api/cats");
  } catch {
    return [];
  }
}

export default async function BookingPage() {
  const cats = await getCats();

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: "/booking",
          name: "Reserve a Kitten — Booking & Visit Inquiry",
          description:
            "Submit a kitten reservation or cattery visit inquiry to Whisker Haven.",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Kitten Reservation", path: "/booking" },
        ])}
      />
      <BookingClient cats={cats} />
    </>
  );
}
