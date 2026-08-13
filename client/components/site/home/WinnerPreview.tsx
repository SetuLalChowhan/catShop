"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, ExternalLink, ArrowRight, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Winner } from "@/types";

interface WinnerPreviewProps {
  winners: Winner[];
  loading?: boolean;
}

export function WinnerPreview({ winners, loading }: WinnerPreviewProps) {
  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3 animate-pulse">
            <Skeleton className="h-5 w-40 bg-muted/60 rounded-full mx-auto" />
            <Skeleton className="h-9 w-3/4 bg-muted/80 rounded-xl mx-auto" />
            <Skeleton className="h-4 w-4/5 bg-muted/50 rounded-md mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-pulse">
            <div className="lg:col-span-7 bg-card rounded-2xl border border-border p-6 md:p-8 space-y-4">
              <Skeleton className="w-36 h-36 rounded-2xl bg-muted/70 mx-auto md:mx-0" />
              <Skeleton className="h-6 w-48 bg-muted/80 rounded-md" />
              <Skeleton className="h-4 w-full bg-muted/50 rounded-md" />
            </div>
            <div className="lg:col-span-5 bg-cream/40 rounded-2xl border border-border p-6 space-y-4">
              <Skeleton className="h-6 w-36 bg-muted/70 rounded-md" />
              <Skeleton className="h-12 w-full bg-muted/50 rounded-xl" />
              <Skeleton className="h-12 w-full bg-muted/50 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const winnerOfMonth = winners.find((w) => w.isWinnerOfMonth) || winners[0];
  const referralWinners = winners.slice(0, 3);

  return (
    <section className="py-16 bg-background">
      <div className="container-site">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-soft text-amber-deep text-xs font-semibold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Community & Referrals</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink">
            Referral Winners & Recognition
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We celebrate our adopter community! Every month we reward top customer referrals and showcase our cat parent spotlight winners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Winner of the Month Spotlight */}
          {winnerOfMonth && (
            <div className="lg:col-span-7 bg-card rounded-2xl border border-border p-6 md:p-8 shadow-xs flex flex-col md:flex-row gap-6 items-center">
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden bg-muted border border-border shrink-0">
                <Image
                  src={
                    winnerOfMonth.image?.url ||
                    "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=600&auto=format&fit=crop"
                  }
                  alt={winnerOfMonth.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-amber-deep text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Spotlight
                </div>
              </div>

              <div className="space-y-3 text-center md:text-left flex-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                  Winner of the Month
                </span>
                <h3 className="font-display font-bold text-2xl text-foreground">
                  {winnerOfMonth.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Congratulations to our featured ambassador! Thank you for sharing the love and referring cat lovers to Whisker Haven.
                </p>
                {winnerOfMonth.facebookUrl && (
                  <a
                    href={winnerOfMonth.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
                  >
                    View Facebook Profile <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Referral List */}
          <div className="lg:col-span-5 bg-cream/40 rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Top Referral Winners
              </h4>
              <Link href="/winners" className="text-xs font-semibold text-primary hover:underline">
                View All
              </Link>
            </div>

            {referralWinners.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No referral winners posted yet.</p>
            ) : (
              <div className="space-y-3">
                {referralWinners.map((winner, idx) => (
                  <div
                    key={winner._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <span className="font-medium text-sm text-foreground">{winner.name}</span>
                    </div>

                    {winner.facebookUrl ? (
                      <a
                        href={winner.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        Facebook <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Verified Winner</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs font-medium">
                <Link href="/winners" className="flex items-center justify-center gap-1.5">
                  Learn About Our Referral Program <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WinnerPreview;
