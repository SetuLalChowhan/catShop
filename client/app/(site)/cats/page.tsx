"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, Cat as CatIcon, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CatCard } from "@/components/site/cats/CatCard";
import { CatGridSkeleton } from "@/components/site/cats/CatCardSkeleton";
import BookingModal from "@/components/site/booking/BookingModal";
import { getData } from "@/lib/api";
import { Cat } from "@/types";

export default function CatsPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [breedFilter, setBreedFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);

  useEffect(() => {
    async function fetchCats() {
      try {
        const data = await getData<Cat[]>("/api/cats");
        if (Array.isArray(data)) {
          setCats(data);
        }
      } catch (err) {
        console.error("Failed to fetch cats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCats();
  }, []);

  // Unique breeds
  const breeds = useMemo(() => {
    const set = new Set<string>();
    cats.forEach((c) => {
      if (c.breed) set.add(c.breed);
    });
    return Array.from(set).sort();
  }, [cats]);

  // Filtered cats
  const filteredCats = useMemo(() => {
    return cats.filter((cat) => {
      if (cat.status === "archived") return false;

      // Availability
      if (availabilityFilter !== "all" && cat.availability !== availabilityFilter) {
        return false;
      }

      // Breed
      if (breedFilter !== "all" && cat.breed !== breedFilter) {
        return false;
      }

      // Gender
      if (genderFilter !== "all" && cat.gender !== genderFilter) {
        return false;
      }

      // Search
      if (search.trim() !== "") {
        const q = search.toLowerCase();
        const matchName = cat.name.toLowerCase().includes(q);
        const matchBreed = cat.breed.toLowerCase().includes(q);
        const matchDesc = (cat.description || "").toLowerCase().includes(q);
        if (!matchName && !matchBreed && !matchDesc) return false;
      }

      return true;
    });
  }, [cats, availabilityFilter, breedFilter, genderFilter, search]);

  const [visibleLimit, setVisibleLimit] = useState(6);

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
    <div className="py-10 bg-background min-h-[70vh]">
      <div className="container-site space-y-8">
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

        {/* Filter Controls Bar */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-4">
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
                    {[
                      { value: "all", label: "All", count: cats.length },
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
                        label: "Adopted",
                        count: cats.filter((c) => c.availability === "sold").length,
                      },
                    ].map((tab) => {
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

            {/* Result count on small screens (below the scrollable pills) */}
            <p className="md:hidden mt-2 text-xs text-muted-foreground font-medium">
              Showing {filteredCats.length} result{filteredCats.length === 1 ? "" : "s"}
            </p>
          </div>
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
