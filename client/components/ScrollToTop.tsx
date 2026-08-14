"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Smoothly scrolls the window back to the top on every route change so the
 * next page always opens from the top, without jarring jumps.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
