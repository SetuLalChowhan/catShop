"use client";

import React from "react";
import Link from "next/link";
import {
  Cat as CatIcon,
  CalendarCheck,
  Mail,
  Trophy,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStats, useBookings, useCats } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export default function DashboardOverviewPage() {
  // All three queries are cached by React Query, so revisiting the overview
  // (or any dashboard section that shares these endpoints) renders instantly.
  const statsQuery = useAdminStats();
  const bookingsQuery = useBookings();
  const catsQuery = useCats();

  const stats = statsQuery.data ?? null;
  const recentBookings = (bookingsQuery.data ?? []).slice(0, 5);
  const recentCats = (catsQuery.data ?? []).slice(0, 5);
  const loading = statsQuery.isPending || bookingsQuery.isPending || catsQuery.isPending;

  const bookingBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-soft text-amber-deep border-amber-deep/30">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-sage text-white">Confirmed</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
            Cattery Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time management summary for inventory, bookings, and customer referrals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="rounded-xl gap-2 font-medium">
            <Link href="/dashboard/cats">
              <Plus className="w-4 h-4" /> Add New Cat
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Cats */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Cats
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CatIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground">
              {loading ? "..." : stats?.totalCats ?? 0}
            </span>
            <span className="text-xs font-medium text-sage flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {stats?.availableCats ?? 0} Available
            </span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cat Bookings
            </span>
            <div className="w-9 h-9 rounded-xl bg-sage-soft text-sage flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground">
              {loading ? "..." : stats?.totalBookings ?? 0}
            </span>
            <span className="text-xs font-medium text-amber-deep flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {stats?.pendingBookings ?? 0} Pending
            </span>
          </div>
        </div>

        {/* Contact Messages */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact Messages
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground">
              {loading ? "..." : stats?.totalContacts ?? 0}
            </span>
            <span className="text-xs font-medium text-primary flex items-center gap-1">
              {stats?.unreadContacts ?? 0} Unread
            </span>
          </div>
        </div>

        {/* Confirmed Bookings */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirmed Bookings
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-soft text-amber-deep flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground">
              {loading ? "..." : stats?.confirmedBookings ?? 0}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {stats?.completedBookings ?? 0} Completed
            </span>
          </div>
        </div>

        {/* Total Winners */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Referral Winners
            </span>
            <div className="w-9 h-9 rounded-xl bg-clay-soft text-clay flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground">
              {loading ? "..." : stats?.totalWinners ?? 0}
            </span>
            <span className="text-xs font-medium text-primary">Community Active</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Inventory Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-7 bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-foreground">Recent Booking Inquiries</h2>
            <Link href="/dashboard/bookings" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No recent bookings found.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentBookings.map((b) => (
                <div key={b._id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-sm text-foreground block">{b.customerName}</span>
                    <span className="text-xs text-muted-foreground">{b.email} • {b.phone}</span>
                  </div>
                  <div className="text-right">
                    {bookingBadge(b.status)}
                    <span className="text-[11px] text-muted-foreground block mt-1">{formatDate(b.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Cats Inventory */}
        <div className="lg:col-span-5 bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-foreground">Cat Inventory Snapshot</h2>
            <Link href="/dashboard/cats" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Manage Cats <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentCats.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No cats in database.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentCats.map((c) => (
                <div key={c._id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-sm text-foreground block">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.breed} • {c.gender}</span>
                  </div>
                  <Badge className={c.availability === "available" ? "bg-sage text-white" : "bg-muted text-muted-foreground"}>
                    {c.availability}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}