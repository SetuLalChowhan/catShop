"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Cat, X, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  isActive: (path: string) => boolean;
  brandName: string;
  logoImageUrl?: string;
  phone: string;
  email: string;
}

/**
 * Slide-in navigation drawer for small screens.
 * Slides in from the right with a fading overlay; links stagger in
 * for a refined, human feel. Closes on Escape, overlay click, or link tap.
 */
export function MobileDrawer({
  open,
  onClose,
  navItems,
  isActive,
  brandName,
  logoImageUrl,
  phone,
  email,
}: MobileDrawerProps) {
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
        aria-label="Navigation menu"
        className={`absolute right-0 top-0 h-full w-[min(85vw,320px)] bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out will-change-transform ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-border/70">
          <div className="flex items-center gap-2.5 min-w-0">
            {logoImageUrl ? (
              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                <Image src={logoImageUrl} alt={brandName} fill className="object-contain p-1" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                <Cat className="w-5 h-5" />
              </div>
            )}
            <span className="font-display font-bold text-lg tracking-tight text-foreground truncate">
              {brandName}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation links — staggered entrance */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">

          {navItems.map((item, idx) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{ transitionDelay: open ? `${90 + idx * 45}ms` : "0ms" }}
                className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${open ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"
                  } ${active
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                {item.label}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="px-4 pb-6 pt-4 border-t border-border/70 space-y-4">
          <Button
            asChild
            className="w-full rounded-xl font-medium"
            style={{ transitionDelay: open ? `${90 + navItems.length * 45}ms` : "0ms" }}
            onClick={onClose}
          >
            <Link href="/booking" className={`transition-all duration-300 ${open ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"}`}>
              Book a Kitten <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>

          <div
            className={`space-y-2 text-xs text-muted-foreground transition-all duration-300 ${open ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"
              }`}
            style={{ transitionDelay: open ? `${90 + (navItems.length + 1) * 45}ms` : "0ms" }}
          >
            <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" /> {phone}
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Mail className="w-3.5 h-3.5 text-primary shrink-0" /> {email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileDrawer;
