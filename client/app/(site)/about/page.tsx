"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShieldCheck, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useContent } from "@/lib/queries";

export default function AboutPage() {
  // Cached — the about page reuses the shared content query.
  const contentQuery = useContent();
  const content = contentQuery.data ?? null;
  const loading = contentQuery.isPending;

  const title = content?.about?.title || "Dedicated to Raising Healthy & Happy Companion Cats";
  const story = content?.about?.story || "Whisker Haven was founded out of a deep passion for cat welfare and ethical breeding standards. We raise purebred kittens inside our loving home environment rather than cages.";
  const mission = content?.about?.mission || "Our mission is to match every kitten with a loving forever home, providing lifetime support, full health guarantees, and complete pedigree transparency.";
  const images = content?.about?.images || [];

  if (loading) {
    return (
      <div className="py-12 bg-background">
        <div className="container-site space-y-12 animate-pulse">
          <div className="max-w-3xl space-y-3">
            <Skeleton className="h-5 w-36 bg-muted/60 rounded-full" />
            <Skeleton className="h-10 w-4/5 bg-muted/70 rounded-xl" />
            <Skeleton className="h-5 w-3/5 bg-muted/50 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <Skeleton className="h-7 w-56 bg-muted/70 rounded-lg" />
              <Skeleton className="h-4 w-full bg-muted/50 rounded-md" />
              <Skeleton className="h-4 w-full bg-muted/50 rounded-md" />
              <Skeleton className="h-4 w-4/5 bg-muted/50 rounded-md" />
              <Skeleton className="h-32 w-full rounded-xl bg-muted/60" />
            </div>
            <div className="lg:col-span-6">
              <Skeleton className="w-full aspect-[4/3] rounded-xl bg-muted/70" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-background">
      <div className="container-site space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Heart className="w-3.5 h-3.5 fill-primary/20" />
            <span>About Whisker Haven</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-ink leading-tight">
            {title}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Learn about our philosophy, our cattery environment, and how we nurture every kitten from birth until they join your family.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-display font-bold text-2xl text-foreground">Our Background & Story</h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {story}
            </p>

            <div className="p-6 rounded-xl bg-cream/50 border border-border space-y-3">
              <h3 className="font-display font-bold text-lg text-foreground">Our Ethical Guarantee</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                  <span>Cage-free living in a calm, family home setup</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                  <span>Regular health screening for genetic conditions & parasites</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                  <span>Early socialization with kids and household routines</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-lift bg-muted">
              <Image
                src={
                  images[0]?.url ||
                  "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=800&auto=format&fit=crop"
                }
                alt="Whisker Haven Cattery"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Mission Banner */}
        <div className="p-8 md:p-12 bg-card rounded-xl border border-border shadow-xs text-center space-y-4 max-w-4xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground">Our Cattery Mission</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
            {mission}
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="rounded-xl font-medium">
              <Link href="/cats" className="flex items-center gap-2">
                View Available Companions <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
