"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function CatCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs space-y-3 p-4">
      {/* Image Skeleton */}
      <Skeleton className="w-full aspect-4/3 rounded-xl bg-muted/60 animate-pulse" />

      {/* Title & Badge */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-6 w-32 rounded-md bg-muted/60" />
        <Skeleton className="h-5 w-20 rounded-full bg-muted/60" />
      </div>

      {/* Subtitle / Breed info */}
      <Skeleton className="h-4 w-24 rounded-md bg-muted/50" />

      {/* Description lines */}
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-3.5 w-full rounded-md bg-muted/40" />
        <Skeleton className="h-3.5 w-4/5 rounded-md bg-muted/40" />
      </div>

      {/* Footer buttons / CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <Skeleton className="h-4 w-16 rounded-md bg-muted/50" />
        <Skeleton className="h-9 w-28 rounded-xl bg-muted/70" />
      </div>
    </div>
  );
}

export function CatGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <CatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default CatCardSkeleton;
