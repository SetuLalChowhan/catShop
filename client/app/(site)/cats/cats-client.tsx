"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Cat as CatIcon,
  RefreshCw,
  SlidersHorizontal,
  X,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CatCard } from "@/components/site/cats/CatCard";
import { CatGridSkeleton } from "@/components/site/cats/CatCardSkeleton";
import BookingModal from "@/components/site/booking/BookingModal";
import { useCats, useFilteredCats } from "@/lib/queries";
import { Cat } from "@/types";

export default function CatsPage() {
  // Full active list — cached. Powers the availability counts, the breed list
  // and the booking modal. Actual result filtering happens server-side below.
  const catsQuery = useCats();
  const cats = catsQuery.data ?? [];

  const [search, setSearch] = useState("");
  // Debounced copy of the search box — the backend is queried with this value,
  // so we don't fire a request per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [breedFilter, setBreedFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);

  // Mobile: filters live behind a slide-in drawer instead of the inline bar.
  const [filterOpen, setFilterOpen] = useState(false);

  const [visibleLimit, setVisibleLimit] = useState(6);

  // Debounce the search box (350ms) before it hits the backend.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Server-side search + filters (cached per combination). The backend applies
  // search (name/breed), availability, breed and gender — no client filtering.
  const resultsQuery = useFilteredCats({
    search: debouncedSearch,
    availability: availabilityFilter,
    breed: breedFilter,
    gender: genderFilter,
  });
  const filteredCats = Array.isArray(resultsQuery.data)
    ? resultsQuery.data
    : resultsQuery.data?.cats ?? [];
  const loading = resultsQuery.isPending;

  const availabilityOptions = useMemo(
    () => [
      { value: "all", label: "All Cats", count: cats.length },
      {
        value: "available",
        label: "Available",
        count: cats.filter((c) => c.availability === "available").length,
      },
      {
        value: "reserved",
        label: "Reserved",
        count: cats.filter((c) => c.availability === "reserved").length,
      },
      {
        value: "sold",
        label: "Adopted / Sold",
        count: cats.filter((c) => c.availability === "sold").length,
      },
    ],
    [cats],
  );

  const activeFilterCount = [availabilityFilter, breedFilter, genderFilter].filter(
    (v) => v !== "all",
  ).length;

  // Unique breeds
  const breeds = useMemo(() => {
    const set = new Set<string>();
    cats.forEach((c) => {
      if (c.breed) set.add(c.breed);
    });
    return Array.from(set).sort();
  }, [cats]);

  const displayedCats = useMemo(() => {
    return filteredCats.slice(0, visibleLimit);
  }, [filteredCats, visibleLimit]);

  const handleBookClick = (cat: Cat) => {
    setSelectedCat(cat);
    setBookingOpen(true);
  };

  const handleResetFilters = () => {
    setSearch("");
    setAvailabilityFilter("all");
    setBreedFilter("all");
    setGenderFilter("all");
    setVisibleLimit(6);
  };

  return (
    <div className="py-6 sm:py-10 bg-background min-h-[70vh]">
      <div className="container-site space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <CatIcon className="w-3.5 h-3.5" />
            <span>Our Cattery Portfolio</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink">
            Explore Available Purebred Cats
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Browse our current companions. Filter by availability, breed, or gender to find your ideal kitten.
          </p>
        </div>

        {/* ── Filter Controls Bar ─ Desktop: full inline filters ── */}
        <div className="hidden md:block bg-card border border-border rounded-xl p-4 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search — left, flexible width */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <Input
                placeholder="Search by name, breed..."
                aria-label="Search cats by name or breed"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-lg"
              />
            </div>

            {/* Breed + Gender + Reset — grouped together on the right */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-2.5 shrink-0">
              {/* Breed Filter */}
              <div className="sm:w-44">
                <Select value={breedFilter} onValueChange={setBreedFilter}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="All Breeds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Breeds ({breeds.length})</SelectItem>
                    {breeds.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gender Filter */}
              <div className="sm:w-40">
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male ♂</SelectItem>
                    <SelectItem value="female">Female ♀</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset */}
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="w-full sm:w-auto rounded-lg gap-1.5 text-xs font-medium h-9"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
              </Button>
            </div>
          </div>

          {/* Availability Filters — horizontally scrollable segmented control */}
          <div className="pt-4 border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hidden -mx-1 px-1 py-0.5 touch-pan-x">
                <Tabs value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <TabsList className="w-max bg-muted/70 p-1 rounded-full gap-1">
                    {availabilityOptions.map((tab) => {
                      const active = availabilityFilter === tab.value;
                      return (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="rounded-full px-4 py-1.5 text-xs font-semibold gap-1.5 transition-all duration-200 text-muted-foreground hover:text-ink active:scale-[0.97] data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-md"
                        >
                          {tab.label}
                          <span
                            className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold tabular-nums transition-colors ${active
                                ? "bg-muted text-muted-foreground"
                                : "bg-card/80 text-muted-foreground shadow-xs"
                              }`}
                          >
                            {tab.count}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>

              <span className="hidden md:inline-flex shrink-0 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Showing {filteredCats.length} result{filteredCats.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Filter Controls Bar ─ Mobile: search row + Filter row ── */}
        <div className="md:hidden bg-card border border-border rounded-xl p-2.5 shadow-xs space-y-2">
          {/* Search — full-width row */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              placeholder="Search by name, breed..."
              aria-label="Search cats by name or breed"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-lg h-10 w-full"
            />
          </div>

          {/* Filter button — full-width row below the search */}
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            aria-label="Open filters"
            aria-expanded={filterOpen}
            className="w-full rounded-lg gap-2 font-medium h-10 justify-center"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Result count on small screens */}
          <p className="text-xs text-muted-foreground font-medium">
            Showing {filteredCats.length} result{filteredCats.length === 1 ? "" : "s"}
            {activeFilterCount > 0 && " • filters active"}
          </p>
        </div>

        {/* Cats Grid / Empty State */}
        {loading ? (
          <CatGridSkeleton count={6} />
        ) : filteredCats.length === 0 ? (
          <div className="py-16 text-center bg-card rounded-xl border border-border p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground">No cats match your filters</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search query, breed, or availability selection.
            </p>
            <Button variant="outline" onClick={handleResetFilters} className="mt-2">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {displayedCats.map((cat) => (
                <CatCard key={cat._id} cat={cat} onBookClick={handleBookClick} />
              ))}
            </div>

            {filteredCats.length > visibleLimit && (
              <div className="text-center pt-4">
                <Button
                  onClick={() => setVisibleLimit((prev) => prev + 6)}
                  size="lg"
                  className="rounded-xl px-8 font-medium text-white shadow-sm"
                >
                  Load More Cats ({filteredCats.length - visibleLimit} remaining)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mobile filter drawer — slide-in from the right */}
        <MobileFilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          availabilityOptions={availabilityOptions}
          availabilityFilter={availabilityFilter}
          onAvailabilityChange={setAvailabilityFilter}
          breeds={breeds}
          breedFilter={breedFilter}
          onBreedChange={setBreedFilter}
          genderFilter={genderFilter}
          onGenderChange={setGenderFilter}
          resultCount={filteredCats.length}
          onReset={handleResetFilters}
        />

        <BookingModal
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          selectedCat={selectedCat}
          catsList={cats}
        />
      </div>
    </div>
  );
}

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  availabilityOptions: { value: string; label: string; count: number }[];
  availabilityFilter: string;
  onAvailabilityChange: (value: string) => void;
  breeds: string[];
  breedFilter: string;
  onBreedChange: (value: string) => void;
  genderFilter: string;
  onGenderChange: (value: string) => void;
  resultCount: number;
  onReset: () => void;
}

/**
 * Slide-in filter panel for small screens (mirrors the MobileDrawer pattern).
 * All filters live here on mobile; the inline filter bar only shows on md+.
 */
function MobileFilterDrawer({
  open,
  onClose,
  availabilityOptions,
  availabilityFilter,
  onAvailabilityChange,
  breeds,
  breedFilter,
  onBreedChange,
  genderFilter,
  onGenderChange,
  resultCount,
  onReset,
}: MobileFilterDrawerProps) {
  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"
          }`}
      />

      {/* Panel — slides in from the right */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter cats"
        className={`absolute right-0 top-0 h-full w-[min(85vw,340px)] bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out will-change-transform ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border/70 shrink-0">
          <span className="font-display font-bold text-lg text-foreground">Filters</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-lg shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          {/* Availability */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Availability
            </span>
            <div className="space-y-2">
              {availabilityOptions.map((opt) => {
                const active = availabilityFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onAvailabilityChange(opt.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:bg-muted"
                      }`}
                  >
                    <span>{opt.label}</span>
                    <span className="flex items-center gap-2 text-xs tabular-nums">
                      {opt.count}
                      {active && <CheckCircle2 className="w-4 h-4" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Breed
            </span>
            <Select value={breedFilter} onValueChange={onBreedChange}>
              <SelectTrigger className="rounded-lg h-11">
                <SelectValue placeholder="All Breeds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Breeds ({breeds.length})</SelectItem>
                {breeds.map((breed) => (
                  <SelectItem key={breed} value={breed}>
                    {breed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Gender
            </span>
            <Select value={genderFilter} onValueChange={onGenderChange}>
              <SelectTrigger className="rounded-lg h-11">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male ♂</SelectItem>
                <SelectItem value="female">Female ♀</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="px-4 pb-6 pt-4 border-t border-border/70 space-y-2.5 shrink-0">
          <Button onClick={onClose} className="w-full rounded-xl font-medium">
            Show {resultCount} cat{resultCount === 1 ? "" : "s"}
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full rounded-xl gap-1.5 text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset All Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
