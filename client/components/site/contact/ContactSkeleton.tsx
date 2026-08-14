"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Full-page loading skeleton for the Contact page — mirrors the real layout. */
export function ContactSkeleton() {
  return (
    <div className="py-12 bg-background">
      <div className="container-site space-y-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="max-w-2xl space-y-3">
          <Skeleton className="h-4 w-28 bg-muted/60 rounded-full" />
          <Skeleton className="h-10 sm:h-11 w-4/5 bg-muted/80 rounded-xl" />
          <Skeleton className="h-4 w-full bg-muted/50 rounded-md" />
          <Skeleton className="h-4 w-2/3 bg-muted/50 rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left column: Direct Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-44 bg-muted/70 rounded-md" />

              {/* Contact detail cards */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-card border border-border space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg bg-muted/60 shrink-0" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24 bg-muted/50 rounded-md" />
                      <Skeleton className="h-4 w-52 bg-muted/70 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social card skeleton */}
            <div className="p-6 rounded-xl bg-cream/50 border border-border space-y-4">
              <Skeleton className="h-5 w-56 bg-muted/70 rounded-md" />
              <Skeleton className="h-3 w-full bg-muted/50 rounded-md" />
              <Skeleton className="h-3 w-3/4 bg-muted/50 rounded-md" />
              <Skeleton className="h-11 w-full bg-muted/70 rounded-xl" />
              <Skeleton className="h-11 w-full bg-muted/70 rounded-xl" />
            </div>
          </div>

          {/* Right column: form card skeleton */}
          <div className="lg:col-span-7 bg-card rounded-xl border border-border p-6 md:p-8 shadow-xs">
            <Skeleton className="h-6 w-56 bg-muted/70 rounded-md mb-4" />

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 bg-muted/50 rounded-md" />
                  <Skeleton className="h-10 w-full bg-muted/60 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 bg-muted/50 rounded-md" />
                  <Skeleton className="h-10 w-full bg-muted/60 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 bg-muted/50 rounded-md" />
                  <Skeleton className="h-10 w-full bg-muted/60 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 bg-muted/50 rounded-md" />
                  <Skeleton className="h-10 w-full bg-muted/60 rounded-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3 w-20 bg-muted/50 rounded-md" />
                <Skeleton className="h-32 w-full bg-muted/60 rounded-lg" />
              </div>

              <Skeleton className="h-12 w-full bg-muted/70 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactSkeleton;
