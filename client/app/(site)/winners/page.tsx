import JsonLd from "@/components/seo/JsonLd";
import {
  buildMetadata,
  breadcrumbJsonLd,
  webPageJsonLd,
} from "@/lib/seo";
import { serverFetchCached } from "@/lib/api";
import { Winner } from "@/types";
import WinnersClient from "./winners-client";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Referral Winners & Adopter Community Spotlight",
  description:
    "Meet our monthly referral contest winners and community champions: the Whisker Haven cat families who share the love and spread the word about our cattery.",
  keywords: [
    "referral winners",
    "cat adoption community",
    "adopter spotlight",
    "kitten referral program",
    "Whisker Haven community",
  ],
  path: "/winners",
  robots: "index",
});

async function getWinners(): Promise<Winner[]> {
  try {
    return await serverFetchCached<Winner[]>("/api/winners");
  } catch {
    return [];
  }
}

export default async function WinnersPage() {
  const winners = await getWinners();

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: "/winners",
          name: "Referral Winners & Adopter Community Spotlight",
          description:
            "Meet our monthly referral contest winners and community champions.",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Referral Winners", path: "/winners" },
        ])}
      />
      <WinnersClient winners={winners} />
    </>
  );
}
