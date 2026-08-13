"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Cat as CatIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatCard } from "@/components/site/cats/CatCard";
import { CatGridSkeleton } from "@/components/site/cats/CatCardSkeleton";
import { Cat } from "@/types";

interface FeaturedCatsProps {
  cats: Cat[];
  loading?: boolean;
  onBookClick: (cat: Cat) => void;
}

export function FeaturedCats({ cats, loading = false, onBookClick }: FeaturedCatsProps) {
  const featured = cats.filter((c) => c.status === "active").slice(0, 6);

  return (
    <section className="py-16 bg-cream/50 border-y border-border/60">
      <div className="container-site">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <CatIcon className="w-3.5 h-3.5" />
              <span>Kittens & Cats Available</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink">
              Meet Our Available Companions
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Explore our current litter of health-checked, pedigreed kittens. Each cat is raised with individual love and preparation for their forever home.
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-xl border-border hover:bg-background font-medium shrink-0">
            <Link href="/cats" className="flex items-center gap-2">
              View All Cats ({cats.length}) <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Cats Grid / Skeleton */}
        {loading ? (
          <CatGridSkeleton count={6} />
        ) : featured.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-3">
            <p className="text-lg font-medium text-foreground">No cats currently available.</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We are expecting new litters soon. Feel free to contact us or submit a general booking inquiry to get on our waiting list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featured.map((cat) => (
              <CatCard key={cat._id} cat={cat} onBookClick={onBookClick} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedCats;
