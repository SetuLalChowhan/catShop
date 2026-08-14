import type { Metadata } from "next";
import React from "react";

interface Props {
  children: React.ReactNode;
}

/** Private admin area — never indexed and excluded from the sitemap. */
export const metadata: Metadata = {
  title: {
    default: "Admin Sign In",
    template: "%s | Admin",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }: Props) {
  return <>{children}</>;
}
