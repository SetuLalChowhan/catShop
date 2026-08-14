import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, webPageJsonLd } from "@/lib/seo";
import { serverFetchCached } from "@/lib/api";
import { Cat, WebsiteContent, Winner } from "@/types";
import HomeClient from "./home-client";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Whisker Haven | Premium Kittens & Purebred Cats for Adoption",
  titleAbsolute: true,
  description:
    "Whisker Haven is a family-run cattery raising healthy, vaccinated, and socialized purebred kittens in a loving home. Browse available kittens and reserve yours today.",
  keywords: [
    "purebred kittens for sale",
    "cattery",
    "kittens for adoption",
    "ethical cat breeder",
    "premium kitten cattery",
  ],
  path: "/",
  robots: "index",
});

async function getHomeData(): Promise<{
  cats: Cat[];
  winners: Winner[];
  content: WebsiteContent | null;
}> {
  const [cats, winners, content] = await Promise.allSettled([
    serverFetchCached<Cat[]>("/api/cats"),
    serverFetchCached<Winner[]>("/api/winners"),
    serverFetchCached<WebsiteContent>("/api/content"),
  ]);
  return {
    cats: cats.status === "fulfilled" ? cats.value : [],
    winners: winners.status === "fulfilled" ? winners.value : [],
    content: content.status === "fulfilled" ? content.value : null,
  };
}

export default async function HomePage() {
  const { cats, winners, content } = await getHomeData();

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: "/",
          name: "Whisker Haven | Premium Kittens & Purebred Cats for Adoption",
          description:
            "Whisker Haven is a family-run cattery raising healthy, vaccinated, and socialized purebred kittens in a loving home.",
          type: "WebPage",
        })}
      />
      <HomeClient cats={cats} winners={winners} content={content} />
    </>
  );
}
