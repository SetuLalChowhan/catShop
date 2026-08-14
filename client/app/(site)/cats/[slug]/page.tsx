import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  Award,
  Heart,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { serverFetch } from "@/lib/api";
import { formatAge, capitalize } from "@/lib/format";
import { CatGallery } from "@/components/site/cats/CatGallery";
import { Cat } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCat(slug: string): Promise<Cat | null> {
  try {
    const res = await serverFetch<{ data?: Cat; status?: string }>(`/api/cats/${slug}`);
    return (res as any)?.data || (res as any);
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const cat = await getCat(slug);

  if (!cat) {
    return {
      title: "Cat Not Found | Whisker Haven",
    };
  }

  const primaryImage = cat.images && cat.images.length > 0 ? cat.images[0].url : "";

  return {
    title: `${cat.name} (${cat.breed}) | Available Kitten at Whisker Haven`,
    description: cat.shortDescription || cat.description,
    openGraph: {
      title: `${cat.name} — ${cat.breed}`,
      description: cat.description,
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function CatDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = await getCat(slug);

  if (!cat) {
    notFound();
  }

  const images = cat.images && cat.images.length > 0
    ? cat.images
    : [{ url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1200&auto=format&fit=crop", publicId: "fallback" }];

  const availabilityBadge = () => {
    switch (cat.availability) {
      case "available":
        return <Badge className="bg-sage text-white text-sm px-3 py-1 font-medium">Available for Reservation</Badge>;
      case "reserved":
        return <Badge className="bg-amber-deep text-white text-sm px-3 py-1 font-medium">Reserved</Badge>;
      case "sold":
        return <Badge variant="secondary" className="bg-stone-soft text-stone-deep text-sm px-3 py-1">Adopted</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="py-6 sm:py-10 bg-background">
      <div className="container-site space-y-6 sm:space-y-8">
        {/* Back Link */}
        <Link href="/cats" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to All Cats
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Left Column: Image Gallery (hover zoom + click to open lightbox) */}
          <div className="lg:col-span-7">
            <CatGallery
              images={images}
              name={cat.name}
              overlay={
                <div className="flex flex-wrap gap-2">
                  {availabilityBadge()}
                  {cat.isFeatured && (
                    <Badge className="bg-primary text-primary-foreground font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Featured
                    </Badge>
                  )}
                </div>
              }
            />
          </div>

          {/* Right Column: Cat Details & Booking Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2 border-b border-border pb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {cat.breed}
                </span>
                <span className="text-xs text-muted-foreground capitalize flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {formatAge(cat.ageMonths)} • {capitalize(cat.gender)}
                </span>
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink">
                {cat.name}
              </h1>

              {cat.shortDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cat.shortDescription}
                </p>
              )}
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground block">Age</span>
                <span className="text-sm font-bold text-foreground">{formatAge(cat.ageMonths)}</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground block">Gender</span>
                <span className="text-sm font-bold text-foreground capitalize">{cat.gender}</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground block">Breed Line</span>
                <span className="text-sm font-bold text-foreground">{cat.breed}</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground block">Pedigree</span>
                <span className="text-sm font-bold text-foreground">{cat.pedigree || "Certified Purebred"}</span>
              </div>
            </div>

            {/* Traits */}
            {cat.traits && cat.traits.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Personality & Traits
                </span>
                <div className="flex flex-wrap gap-2">
                  {cat.traits.map((trait, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg text-xs font-medium bg-accent text-accent-foreground border border-accent">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-base text-foreground">About {cat.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {cat.description}
              </p>
            </div>

            {/* Health Guarantee Card */}
            <div className="p-4 rounded-xl bg-sage-soft/60 border border-sage/20 space-y-2">
              <div className="flex items-center gap-2 text-sage font-bold text-xs uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4" /> Health & Care Package Included
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Complete vaccination & deworming record</li>
                <li>• Veterinary health certificate & microchip</li>
                <li>• Pedigree lineage documentation</li>
              </ul>
            </div>

            {/* Booking CTA */}
            <div className="pt-4 border-t border-border space-y-3">
              <Button asChild size="lg" className="w-full rounded-xl font-medium shadow-md">
                <Link href={`/booking?cat=${cat.slug}`}>
                  <Heart className="w-4 h-4 mr-2 fill-current" /> Reserve {cat.name} Now
                </Link>
              </Button>

              <a
                href="https://m.me"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs font-medium text-muted-foreground hover:text-primary underline"
              >
                Have questions? Message us directly on Messenger →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
