"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Cat, Menu, X, Phone, Mail, MessageCircle, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { getData } from "@/lib/api";
import { WebsiteContent } from "@/types";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await getData<WebsiteContent>("/api/content");
        if (res) setContent(res);
      } catch (err) {
        console.error("Failed to load CMS content for SiteLayout:", err);
      }
    }
    loadContent();
  }, []);

  const logoImageUrl = content?.brand?.logoImage?.url;
  const brandName = content?.brand?.name || SITE.name;
  const brandTagline = content?.brand?.tagline || "Premium kittens, raised with love";
  const announcementBar =
    content?.brand?.announcementBar ||
    "Ethical & Loving Cat Breeding • Reserve your purebred companion today";
  const phone = content?.contact?.phone || "+1 (555) 234-5678";
  const email = content?.contact?.email || "hello@whiskerhaven.com";
  const footerText =
    content?.brand?.footerText ||
    "All kittens come fully vaccinated, health-checked, and microchipped before joining your home.";

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Our Cats", href: "/cats" },
    { label: "About Us", href: "/about" },
    { label: "Referral Winners", href: "/winners" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
      {/* Top Announcement Bar */}
      <div className="bg-primary/10 border-b border-primary/15 text-primary text-xs font-medium py-2 px-4 text-center flex justify-center items-center gap-2">
        <span className="inline-flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 fill-primary text-primary" /> {announcementBar}
        </span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/60 transition-all">
        <div className="container-site h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {logoImageUrl ? (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform bg-primary/10 flex items-center justify-center">
                <Image
                  src={logoImageUrl}
                  alt={brandName}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
                <Cat className="w-6 h-6" />
              </div>
            )}
            <div>
              <span className="font-display font-bold text-xl tracking-tight block text-foreground group-hover:text-primary transition-colors">
                {brandName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block">
                {brandTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="hidden sm:inline-flex rounded-xl font-medium px-5">
              <Link href="/booking">Book a Kitten</Link>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-6 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-2">
              <Button asChild className="w-full rounded-xl justify-center font-medium">
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  Book a Kitten <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16 pt-16 pb-12">
        <div className="container-site space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                {logoImageUrl ? (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                    <Image src={logoImageUrl} alt={brandName} fill className="object-contain p-0.5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                    <Cat className="w-5 h-5" />
                  </div>
                )}
                <span className="font-display font-bold text-lg text-foreground">{brandName}</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content?.brand?.description || SITE.description}
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/cats" className="text-muted-foreground hover:text-primary transition-colors">
                    Available Cats
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Our Cattery
                  </Link>
                </li>
                <li>
                  <Link href="/winners" className="text-muted-foreground hover:text-primary transition-colors">
                    Referral Winners
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="text-muted-foreground hover:text-primary transition-colors">
                    Booking Request
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Contact */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">
                Get in Touch
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{phone}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>{email}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Messenger Support Available</span>
                </li>
              </ul>
            </div>

            {/* Cattery Quality */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">
                Cattery Quality
              </h4>
              <p className="text-sm text-muted-foreground">
                {footerText}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
            <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
            <p>Designed with care for cat lovers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SiteLayout;
