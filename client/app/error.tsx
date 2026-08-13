"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-paper flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink">
            Something Went Wrong
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            An unexpected error occurred while processing your request. Please try again or return home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} size="lg" className="w-full sm:w-auto rounded-xl gap-2 font-medium text-white">
            <RotateCcw className="w-4 h-4 text-white" /> Try Again
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl gap-2 font-medium border-border">
            <Link href="/">
              <Home className="w-4 h-4" /> Go to Homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
