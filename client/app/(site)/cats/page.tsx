import JsonLd from "@/components/seo/JsonLd";
import {
  buildMetadata,
  breadcrumbJsonLd,
  webPageJsonLd,
} from "@/lib/seo";
import CatsClient from "./cats-client";

export const metadata = buildMetadata({
  title: "Available Kittens & Cats for Adoption",
  description:
    "Browse Whisker Haven's available purebred kittens and cats. Filter by breed, gender, and availability, then reserve your new companion with a cattery visit.",
  keywords: [
    "kittens for sale",
    "cats for adoption",
    "purebred kittens",
    "available kittens",
    "kitten breeds",
  ],
  path: "/cats",
  robots: "index",
});

export default function CatsPage() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: "/cats",
          name: "Available Kittens & Cats for Adoption",
          description:
            "Browse Whisker Haven's available purebred kittens and cats with breed, gender, and availability filters.",
          type: "CollectionPage",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Available Cats", path: "/cats" },
        ])}
      />
      <CatsClient />
    </>
  );
}
