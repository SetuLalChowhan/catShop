"use client";

import React, { useState, useEffect } from "react";
import HeroBanner from "@/components/site/home/HeroBanner";
import FeaturedCats from "@/components/site/home/FeaturedCats";
import WinnerPreview from "@/components/site/home/WinnerPreview";
import AboutPreview from "@/components/site/home/AboutPreview";
import ContactBanner from "@/components/site/home/ContactBanner";
import BookingModal from "@/components/site/booking/BookingModal";
import { getData } from "@/lib/api";
import { Cat, Winner, WebsiteContent } from "@/types";

export default function HomePage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catsRes, winnersRes, contentRes] = await Promise.allSettled([
          getData<Cat[]>("/api/cats"),
          getData<Winner[]>("/api/winners"),
          getData<WebsiteContent>("/api/content"),
        ]);

        if (catsRes.status === "fulfilled" && Array.isArray(catsRes.value)) {
          setCats(catsRes.value);
        }
        if (winnersRes.status === "fulfilled" && Array.isArray(winnersRes.value)) {
          setWinners(winnersRes.value);
        }
        if (contentRes.status === "fulfilled" && contentRes.value) {
          setContent(contentRes.value);
        }
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

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

      <FeaturedCats cats={cats} loading={loading} onBookClick={handleBookCat} />

      <WinnerPreview winners={winners} loading={loading} />

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