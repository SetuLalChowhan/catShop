"use client";

import React, { useState } from "react";
import HeroBanner from "@/components/site/home/HeroBanner";
import FeaturedCats from "@/components/site/home/FeaturedCats";
import WinnerPreview from "@/components/site/home/WinnerPreview";
import AboutPreview from "@/components/site/home/AboutPreview";
import ContactBanner from "@/components/site/home/ContactBanner";
import BookingModal from "@/components/site/booking/BookingModal";
import { useCats, useWinners, useContent } from "@/lib/queries";
import { Cat } from "@/types";

export default function HomePage() {
  // All three are cached — returning to the home page (or any page sharing
  // these endpoints) renders instantly from cache.
  const catsQuery = useCats();
  const winnersQuery = useWinners();
  const contentQuery = useContent();

  const cats = catsQuery.data ?? [];
  const winners = winnersQuery.data ?? [];
  const content = contentQuery.data ?? null;
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const loading = catsQuery.isPending || winnersQuery.isPending || contentQuery.isPending;

  const handleBookCat = (cat: Cat) => {
    setSelectedCat(cat);
    setBookingOpen(true);
  };

  const handleOpenGeneralBooking = () => {
    setSelectedCat(null);
    setBookingOpen(true);
  };

  return (
    <div className="space-y-0">
      <HeroBanner content={content} loading={loading} onBookClick={handleOpenGeneralBooking} />

      <FeaturedCats cats={cats} loading={loading} onBookClick={handleBookCat} content={content} />

      <WinnerPreview winners={winners} loading={loading} content={content} />

      <AboutPreview content={content} loading={loading} />

      <ContactBanner contact={content?.contact} />

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        selectedCat={selectedCat}
        catsList={cats}
      />
    </div>
  );
}