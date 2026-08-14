"use client";

import React from "react";
import Image from "next/image";
import { Trophy, ExternalLink, Star, Award, HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import WinnerSkeleton from "@/components/site/winners/WinnerSkeleton";
import { useWinners } from "@/lib/queries";

export default function WinnersPage() {
  // Cached — revisiting the winners page renders instantly.
  const winnersQuery = useWinners();
  const winners = (winnersQuery.data ?? []).filter((w) => w.isActive !== false);
  const loading = winnersQuery.isPending;

  if (loading) {
    return <WinnerSkeleton />;
  }

  const winnerOfMonth = winners.find((w) => w.isWinnerOfMonth) || winners[0];
  const otherWinners = winners.filter((w) => w._id !== winnerOfMonth?._id);

  return (
    <div className="py-12 bg-background">
      <div className="container-site space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-soft text-amber-deep text-xs font-semibold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Adopter Recognition</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink">
            Referral Winners & Community Spotlight
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We love our Whisker Haven cat family! Here are our monthly referral contest winners and community champions.
          </p>
        </div>

        {/* Winner of the Month Banner */}
        {winnerOfMonth && (
          <div className="bg-card rounded-xl border border-primary/30 p-8 shadow-lift max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
              <Image
                src={
                  winnerOfMonth.image?.url ||
                  "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=600&auto=format&fit=crop"
                }
                alt={winnerOfMonth.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-amber-deep text-white font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> Winner of the Month
                </Badge>
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left flex-1">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Spotlight Ambassador
                </span>
                <h2 className="font-display font-extrabold text-3xl text-foreground mt-1">
                  {winnerOfMonth.name}
                </h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Thank you for spreading the word about Whisker Haven! Our Winner of the Month receives exclusive cattery perks, care packages, and community recognition.
              </p>

              {winnerOfMonth.facebookUrl && (
                <a
                  href={winnerOfMonth.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                >
                  Visit Facebook Profile <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* All Winners Table / Cards */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Referral Contest Champions
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              Verified Adopter Referrals
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading winners...</div>
          ) : winners.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-xl border border-border">
              <p className="text-sm text-muted-foreground">No referral winners listed yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {winners.map((winner, idx) => (
                <div
                  key={winner._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>

                    <div className="flex items-center gap-3">
                      {winner.image?.url && (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                          <Image src={winner.image.url} alt={winner.name} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-base text-foreground block">{winner.name}</span>
                        {winner.isWinnerOfMonth && (
                          <span className="text-[11px] text-amber-deep font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> Winner of the Month
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {winner.facebookUrl ? (
                      <a
                        href={winner.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Facebook <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Verified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
