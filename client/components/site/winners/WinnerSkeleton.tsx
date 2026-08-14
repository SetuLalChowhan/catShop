"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function WinnerSkeleton() {
  return (
    <div className="py-12 bg-background">
      <div className="container-site space-y-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Skeleton className="h-5 w-40 bg-muted/60 rounded-full mx-auto" />
          <Skeleton className="h-10 w-3/4 bg-muted/80 rounded-xl mx-auto" />
          <Skeleton className="h-4 w-4/5 bg-muted/50 rounded-md mx-auto" />
        </div>

        {/* Winner of the Month banner skeleton — matches the real banner */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 max-w-4xl mx-auto shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Skeleton className="w-44 h-44 sm:w-56 sm:h-56 rounded-xl bg-muted/70 shrink-0" />
            <div className="space-y-3 text-center md:text-left flex-1 w-full">
              <Skeleton className="h-4 w-36 bg-muted/60 rounded-md mx-auto md:mx-0" />
              <Skeleton className="h-9 w-56 bg-muted/80 rounded-lg mx-auto md:mx-0" />
              <Skeleton className="h-4 w-full bg-muted/50 rounded-md" />
              <Skeleton className="h-4 w-3/4 bg-muted/50 rounded-md" />
              <Skeleton className="h-9 w-44 bg-muted/70 rounded-xl mx-auto md:mx-0" />
            </div>
          </div>
        </div>

        {/* List header */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Skeleton className="h-6 w-52 bg-muted/70 rounded-md" />
            <Skeleton className="h-4 w-32 bg-muted/50 rounded-md" />
          </div>

          {/* Winner rows — matches the real list rows */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/80"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="w-9 h-9 rounded-full bg-muted/60" />
                  <Skeleton className="w-10 h-10 rounded-full bg-muted/70" />
                  <Skeleton className="h-5 w-40 bg-muted/70 rounded-md" />
                </div>
                <Skeleton className="h-4 w-16 bg-muted/50 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WinnerSkeleton;
