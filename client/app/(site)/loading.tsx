"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SiteLoading() {
  return (
    <div className="py-8 sm:py-12 bg-background min-h-[70vh]">
      <div className="container-site space-y-6 sm:space-y-10 animate-pulse">
        {/* Banner / Hero Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Text Area Skeleton */}
          <div className="lg:col-span-7 space-y-5">
            <Skeleton className="h-6 w-44 rounded-full bg-muted/70" />
            <Skeleton className="h-12 w-4/5 rounded-xl bg-muted/80" />
            <Skeleton className="h-5 w-full rounded-md bg-muted/50" />
            <Skeleton className="h-5 w-3/4 rounded-md bg-muted/50" />
            <div className="flex gap-3 pt-3">
              <Skeleton className="h-11 w-44 rounded-xl bg-muted/80" />
              <Skeleton className="h-11 w-40 rounded-xl bg-muted/60" />
            </div>
          </div>

          {/* Banner Image Skeleton */}
          <div className="lg:col-span-5">
            <Skeleton className="w-full aspect-[4/3] rounded-xl bg-muted/70 shadow-xs" />
          </div>
        </div>

        {/* Feature Pills / Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/60">
          <Skeleton className="h-24 rounded-xl bg-muted/50" />
          <Skeleton className="h-24 rounded-xl bg-muted/50" />
          <Skeleton className="h-24 rounded-xl bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
