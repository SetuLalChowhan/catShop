"use client";

import React, { useState } from "react";
import HeroBanner from "@/components/site/home/HeroBanner";
import FeaturedCats from "@/components/site/home/FeaturedCats";
import WinnerPreview from "@/components/site/home/WinnerPreview";
import AboutPreview from "@/components/site/home/AboutPreview";
import ContactBanner from "@/components/site/home/ContactBanner";
import BookingModal from "@/components/site/booking/BookingModal";
import { Cat, WebsiteContent, Winner } from "@/types";

interface HomeClientProps {
  cats: Cat[];
  winners: Winner[];
  content: WebsiteContent | null;
}

/**
 * Client island for the home page. Page data is fetched server-side and passed
 * in as props so the initial HTML is fully crawlable; this component only
 * owns the interactive booking-modal state.
 */
export default function HomeClient({ cats, winners, content }: HomeClientProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);

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
      <HeroBanner content={content} loading={false} onBookClick={handleOpenGeneralBooking} />

      <FeaturedCats cats={cats} loading={false} onBookClick={handleBookCat} content={content} />

      <WinnerPreview winners={winners} loading={false} content={content} />

      <AboutPreview content={content} loading={false} />

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