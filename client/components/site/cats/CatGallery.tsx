"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types";

/** How much the magnifier lens enlarges the image. */
const ZOOM = 2.5;
/** Diameter of the magnifier lens (px). */
const LENS_SIZE = 170;
/** Minimum horizontal swipe (px) to change photos in the lightbox. */
const SWIPE_THRESHOLD = 60;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Build a higher-resolution Cloudinary variant for crisp zooming. */
function zoomableUrl(url: string): string {
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const base = url.slice(0, idx + marker.length);
  const rest = url.slice(idx + marker.length);
  return `${base}q_auto,f_auto,w_1600/${rest}`;
}

interface CatGalleryProps {
  images: ImageAsset[];
  name: string;
  /** Optional badges/overlays rendered on top of the main image. */
  overlay?: React.ReactNode;
}

export function CatGallery({ images, name, overlay }: CatGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [supportsHover, setSupportsHover] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  // Hover zoom is only useful on devices that actually hover.
  useEffect(() => {
    setSupportsHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  // Lock page scroll while the lightbox is open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

  const next = useCallback(
    () => setActive((i) => (i + 1) % images.length),
    [images.length],
  );
  const prev = useCallback(
    () => setActive((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, next, prev]);

  /** Imperatively move the magnifier lens to follow the cursor. */
  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!supportsHover) return;
      const rect = mainRef.current?.getBoundingClientRect();
      const lens = lensRef.current;
      if (!rect || !lens) return;

      const px = clamp(e.clientX - rect.left, 0, rect.width);
      const py = clamp(e.clientY - rect.top, 0, rect.height);

      // Keep the lens fully inside the image.
      const half = LENS_SIZE / 2;
      const lx = clamp(px, half, Math.max(half, rect.width - half));
      const ly = clamp(py, half, Math.max(half, rect.height - half));

      lens.style.opacity = "1";
      lens.style.left = `${lx - half}px`;
      lens.style.top = `${ly - half}px`;
      lens.style.backgroundSize = `${rect.width * ZOOM}px ${rect.height * ZOOM}px`;
      lens.style.backgroundPosition = `${-(px * ZOOM - half)}px ${-(py * ZOOM - half)}px`;
    },
    [supportsHover],
  );

  const handleLeave = useCallback(() => {
    setZooming(false);
    if (lensRef.current) lensRef.current.style.opacity = "0";
  }, []);

  if (images.length === 0) return null;

  const mainImage = images[active];

  return (
    <div
      className={cn(
        "grid gap-3 md:gap-4 items-start",
        // The two-column layout (thumbnail rail + main image) only applies when
        // there are thumbnails — otherwise the main image must fill the row.
        images.length > 1 ? "grid-cols-1 md:grid-cols-[88px_1fr]" : "grid-cols-1",
      )}
    >
      {/* Thumbnail rail — vertical on desktop, horizontal strip on mobile */}
      {images.length > 1 && (
        <div className="order-2 md:order-1 flex md:flex-col gap-2.5 overflow-x-auto md:overflow-visible scrollbar-hidden w-full md:w-auto pb-1 md:pb-0">
          {images.map((img, idx) => (
            <button
              key={img.publicId || img.url}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`View photo ${idx + 1} of ${images.length}`}
              aria-current={idx === active}
              className={cn(
                "relative aspect-square w-16 md:w-[76px] shrink-0 rounded-lg overflow-hidden border-2 bg-muted transition-all",
                idx === active
                  ? "border-primary shadow-lift"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt={`${name} photo ${idx + 1}`}
                fill
                sizes="88px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image with hover zoom + click-to-open lightbox */}
      <div className="order-1 md:order-2 relative">
        <div
          ref={mainRef}
          onMouseEnter={() => supportsHover && setZooming(true)}
          onMouseLeave={handleLeave}
          onMouseMove={handleMove}
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-border shadow-lift bg-muted cursor-zoom-in select-none"
        >
          <Image
            key={mainImage.url}
            src={mainImage.url}
            alt={`${name} photo ${active + 1}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 55vw"
          />

          {/* Subtle darkening while zooming makes the lens pop */}
          <div
            className={cn(
              "absolute inset-0 bg-black/10 transition-opacity duration-150",
              zooming ? "opacity-100" : "opacity-0",
            )}
          />

          {/* Magnifier lens */}
          <div
            ref={lensRef}
            className="pointer-events-none absolute rounded-full border-2 border-white shadow-2xl opacity-0 z-10"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              backgroundRepeat: "no-repeat",
              backgroundImage: `url(${zoomableUrl(mainImage.url)})`,
            }}
          />

          {/* Overlay badges passed from the page */}
          {overlay && (
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">{overlay}</div>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            <ZoomIn className="w-3.5 h-3.5" /> Click to zoom
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 z-20 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
              {active + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photo viewer`}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-white">
            <span className="text-sm font-medium flex items-baseline gap-3">
              <span className="font-display text-base">{name}</span>
              <span className="text-white/50 text-xs">
                Photo {active + 1} of {images.length}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close photo viewer"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image area with swipe + arrows */}
          <div
            className="flex-1 relative flex items-center justify-center min-h-0 px-4 sm:px-20"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const delta = touchX.current - e.changedTouches[0].clientX;
              touchX.current = null;
              if (Math.abs(delta) > SWIPE_THRESHOLD) {
                if (delta > 0) next();
                else prev();
              }
            }}
          >
            {images.length > 1 && (
              <button
                type="button"
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-5 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            <div className="relative w-full h-full max-w-[85vw] max-h-[70vh]">
              <Image
                key={mainImage.url}
                src={mainImage.url}
                alt={`${name} photo ${active + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={next}
                aria-label="Next photo"
                className="absolute right-2 sm:right-5 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Lightbox thumbnail strip */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2.5 px-4 py-5 overflow-x-auto scrollbar-hidden">
              {images.map((img, idx) => (
                <button
                  key={img.publicId || img.url}
                  type="button"
                  onClick={() => setActive(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  className={cn(
                    "relative aspect-square w-16 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                    idx === active
                      ? "border-primary"
                      : "border-white/20 opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    src={img.url}
                    alt={`${name} photo ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CatGallery;
