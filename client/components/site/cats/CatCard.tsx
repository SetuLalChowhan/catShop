"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Calendar, ArrowRight, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cat } from "@/types";
import { formatAge, capitalize } from "@/lib/format";

interface CatCardProps {
  cat: Cat;
  onBookClick?: (cat: Cat) => void;
}

export function CatCard({ cat, onBookClick }: CatCardProps) {
  const primaryImage = cat.images && cat.images.length > 0
    ? cat.images[0].url
    : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop";

  const availabilityBadge = () => {
    switch (cat.availability) {
      case "available":
        return (
          <Badge className="bg-sage text-white hover:bg-sage/90 font-medium px-2.5 py-0.5 shadow-xs">
            Available
          </Badge>
        );
      case "reserved":
        return (
          <Badge className="bg-amber-deep text-white hover:bg-amber-deep/90 font-medium px-2.5 py-0.5">
            Reserved
          </Badge>
        );
      case "sold":
        return (
          <Badge variant="secondary" className="bg-stone-soft text-stone-deep font-medium px-2.5 py-0.5">
            Adopted
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group bg-card rounded-xl border border-border/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={primaryImage}
          alt={cat.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {availabilityBadge()}
          {cat.isFeatured && (
            <Badge className="bg-primary text-primary-foreground font-medium flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" /> Featured
            </Badge>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {cat.breed}
            </span>
            <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary/70" />
              {formatAge(cat.ageMonths)} • {capitalize(cat.gender)}
            </span>
          </div>

          <h3 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors">
            <Link href={`/cats/${cat.slug}`}>{cat.name}</Link>
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {cat.shortDescription || cat.description}
          </p>

          {/* Traits tags */}
          {cat.traits && cat.traits.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {cat.traits.slice(0, 3).map((trait, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Buttons Footer */}
        <div className="pt-3 border-t border-border/60 flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg text-xs font-medium">
            <Link href={`/cats/${cat.slug}`}>
              View Details
            </Link>
          </Button>

          {cat.availability === "available" ? (
            <Button
              size="sm"
              onClick={() => onBookClick?.(cat)}
              className="flex-1 rounded-lg text-xs font-medium gap-1 shadow-xs"
            >
              Book Now <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled className="flex-1 rounded-lg text-xs">
              Unavailable
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CatCard;
