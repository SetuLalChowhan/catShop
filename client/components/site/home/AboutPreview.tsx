"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ArrowRight, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WebsiteContent } from "@/types";

interface AboutPreviewProps {
  content?: WebsiteContent | null;
  loading?: boolean;
}

export function AboutPreview({ content, loading }: AboutPreviewProps) {
  if (loading || !content) {
    return (
      <section className="py-16 bg-cream/30 border-t border-border/60">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-pulse">
            <div className="lg:col-span-6">
              <Skeleton className="aspect-[4/3] rounded-xl bg-muted/70 w-full" />
            </div>
            <div className="lg:col-span-6 space-y-4">
              <Skeleton className="h-5 w-36 bg-muted/60 rounded-full" />
              <Skeleton className="h-10 w-4/5 bg-muted/80 rounded-xl" />
              <Skeleton className="h-4 w-full bg-muted/50 rounded-md" />
              <Skeleton className="h-4 w-4/5 bg-muted/50 rounded-md" />
              <Skeleton className="h-24 w-full bg-muted/60 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const title = content?.about?.title || "Dedicated to Raising Healthy & Happy Cats";
  const story = content?.about?.story || "Whisker Haven was founded out of a deep passion for cat welfare and ethical breeding standards. We raise purebred kittens inside our loving home environment rather than cages.";
  const mission = content?.about?.mission || "Our mission is to match every kitten with a loving forever home, providing lifetime support, full health guarantees, and complete pedigree transparency.";
  const images = content?.about?.images || [];
  const mainImage = images[0]?.url || "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=800&auto=format&fit=crop";

  return (
    <section className="py-16 bg-cream/30 border-t border-border/60">
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Image Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-lift bg-muted">
              <Image
                src={mainImage}
                alt="About Whisker Haven Cattery"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 p-4 bg-card rounded-xl border border-border shadow-md max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-sage-soft text-sage flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-foreground block">100% Health Guarantee</span>
                <span className="text-muted-foreground">Genetic screening & vaccination</span>
              </div>
            </div>
          </div>

          {/* Right Text Story */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <span>About Our Cattery</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight">
              {title}
            </h2>

            <p className="text-muted-foreground text-base leading-relaxed">
              {story}
            </p>

            <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
              <h4 className="font-display font-semibold text-sm text-foreground">Our Core Mission</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{mission}</p>
            </div>

            <ul className="space-y-2.5 text-sm text-foreground">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                <span>Raised with constant socialization and care</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                <span>Parent cats genetic health tested & vaccinated</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                <span>Lifetime support & advice for all adopters</span>
              </li>
            </ul>

            <div className="pt-2">
              <Button asChild className="rounded-xl px-6 font-medium">
                <Link href="/about" className="flex items-center gap-2">
                  Read Our Full Story <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPreview;
