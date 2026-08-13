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

        {/* Winner of the Month Hero Card Skeleton */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Skeleton className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-muted/70 shrink-0" />
            <div className="space-y-3 text-center sm:text-left flex-1 w-full">
              <Skeleton className="h-5 w-36 bg-muted/60 rounded-md mx-auto sm:mx-0" />
              <Skeleton className="h-8 w-56 bg-muted/80 rounded-lg mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-48 bg-muted/50 rounded-md mx-auto sm:mx-0" />
            </div>
          </div>
        </div>

        {/* Top Winners List Skeletons */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-7 w-48 bg-muted/70 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border p-5 rounded-2xl space-y-3 text-center">
                <Skeleton className="w-20 h-20 rounded-full bg-muted/70 mx-auto" />
                <Skeleton className="h-5 w-32 bg-muted/80 rounded-md mx-auto" />
                <Skeleton className="h-4 w-24 bg-muted/50 rounded-md mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WinnerSkeleton;
