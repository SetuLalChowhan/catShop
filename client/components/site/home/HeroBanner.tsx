"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Heart, Award, Cat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WebsiteContent } from "@/types";

interface HeroBannerProps {
  content?: WebsiteContent | null;
  loading?: boolean;
  onBookClick?: () => void;
}

export function HeroBanner({ content, loading, onBookClick }: HeroBannerProps) {
  if (loading || !content) {
    return (
      <section className="relative pt-4 pb-12 sm:pt-8 sm:pb-16 lg:py-16 bg-background">
        <div className="container-site">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-pulse">
            <div className="w-full lg:col-span-5 order-1 lg:order-2">
              <Skeleton className="aspect-[16/11] sm:aspect-[4/3] lg:aspect-[4/5] w-full rounded-xl bg-muted/70 shadow-xs" />
            </div>

            <div className="w-full lg:col-span-7 order-2 lg:order-1 space-y-5 sm:space-y-6">
              <Skeleton className="h-6 w-44 rounded-full bg-muted/60" />
              <Skeleton className="h-12 w-4/5 rounded-xl bg-muted/80" />
              <Skeleton className="h-5 w-full rounded-md bg-muted/50" />
              <Skeleton className="h-5 w-3/4 rounded-md bg-muted/50" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-11 w-44 rounded-xl bg-muted/80" />
                <Skeleton className="h-11 w-40 rounded-xl bg-muted/60" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const heroTitle = content?.home?.heroTitle || "Purebred Kittens Raised in a Loving Home";
  const heroSubtitle =
    content?.home?.heroSubtitle && content.home.heroSubtitle.length < 50
      ? content.home.heroSubtitle
      : "Ethical Cattery & Purebred Companions";
  const heroText =
    content?.home?.introText ||
    "Every kitten in our care is raised indoors, health-checked, vaccinated, and socialized daily in a family home environment.";
  const heroImage =
    content?.home?.heroImage?.url ||
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1200&auto=format&fit=crop";

  return (
    <section className="relative pt-4 pb-12 sm:pt-8 sm:pb-16 lg:py-16 bg-background">
      <div className="container-site">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* 1. Mobile First: Cat Image Showcase (Shown at top on mobile, right on desktop) */}
          <div className="w-full lg:col-span-5 order-1 lg:order-2">
            <div className="relative aspect-[16/11] sm:aspect-[4/3] lg:aspect-[4/5] w-full rounded-xl overflow-hidden border border-border shadow-lift bg-muted group">
              <Image
                src={heroImage}
                alt="Whisker Haven Purebred Cat"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              
              {/* Floating Badge over Image */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-xl bg-background/90 backdrop-blur-md border border-border/60 shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary block">
                      Ethical Home Breeding
                    </span>
                    <p className="text-xs sm:text-sm font-display font-bold text-foreground mt-0.5">
                      Raised with daily love & veterinary care
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Heart className="w-4 h-4 fill-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Text Content (Shown below image on mobile, left on desktop) */}
          <div className="w-full lg:col-span-7 order-2 lg:order-1 space-y-5 sm:space-y-6">
            {/* Sleek Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold tracking-wide w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{heroSubtitle}</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.18] tracking-tight">
              {heroTitle}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed max-w-xl font-normal">
              {heroText}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button asChild size="lg" className="rounded-xl px-7 shadow-md font-medium text-sm sm:text-base justify-center">
                <Link href="/cats" className="flex items-center gap-2">
                  Browse Available Cats <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onBookClick}
                className="rounded-xl px-6 border-border hover:bg-muted text-sm sm:text-base font-medium justify-center"
              >
                Submit Reservation Request
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-sage-soft text-sage flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-foreground block">Health Certified</span>
                  <span className="text-muted-foreground text-[11px]">Vaccinated & Vet Checked</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-clay-soft text-clay flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-foreground block">Purebred Lineage</span>
                  <span className="text-muted-foreground text-[11px]">Pedigree Documentation</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-amber-soft text-amber-deep flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-foreground block">Home Socialized</span>
                  <span className="text-muted-foreground text-[11px]">Gentle & Affectionate</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
