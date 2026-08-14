"use client";

import React from "react";
import Link from "next/link";
import { Cat, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        {/* Cat Illustration Badge */}
        <div className="relative mx-auto w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
          <Cat className="w-12 h-12" />
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs">
            404
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink">
            Page Not Found
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Oops! The kitten or page you are looking for seems to have wandered off. It may have been moved or no longer exists.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild size="lg" className="w-full sm:w-auto rounded-xl gap-2 font-medium">
            <Link href="/">
              <Home className="w-4 h-4 text-white" /> Return to Home Page
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl gap-2 font-medium border-border">
            <Link href="/cats">
              <Search className="w-4 h-4" /> Browse Available Cats
            </Link>
          </Button>
        </div>

        <div className="pt-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Whisker Haven
          </Link>
        </div>
      </div>
    </div>
  );
}
