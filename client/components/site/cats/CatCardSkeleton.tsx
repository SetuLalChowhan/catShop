"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function CatCardSkeleton() {
  return (
    <div className="group bg-card rounded-xl border border-border/80 overflow-hidden shadow-xs flex flex-col h-full">
      {/* Image */}
      <Skeleton className="relative aspect-[4/3] w-full bg-muted/60 animate-pulse" />

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3.5 w-20 rounded-md bg-muted/60" />
            <Skeleton className="h-3.5 w-24 rounded-md bg-muted/50" />
          </div>
          <Skeleton className="h-6 w-32 rounded-md bg-muted/70" />
          <Skeleton className="h-3.5 w-full rounded-md bg-muted/40" />
          <Skeleton className="h-3.5 w-4/5 rounded-md bg-muted/40" />

          {/* Traits */}
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-5 w-16 rounded-md bg-muted/50" />
            <Skeleton className="h-5 w-20 rounded-md bg-muted/50" />
            <Skeleton className="h-5 w-14 rounded-md bg-muted/50" />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="pt-3 border-t border-border/60 flex items-center gap-2">
          <Skeleton className="h-8 flex-1 rounded-lg bg-muted/70" />
          <Skeleton className="h-8 flex-1 rounded-lg bg-muted/70" />
        </div>
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
