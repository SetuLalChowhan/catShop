"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactInfo } from "@/types";

interface ContactBannerProps {
  contact?: ContactInfo | null;
}

export function ContactBanner({ contact }: ContactBannerProps) {
  const phone = contact?.phone || "+1 (555) 234-5678";
  const email = contact?.email || "hello@whiskerhaven.com";
  const facebook = contact?.facebook || "https://facebook.com";
  const messenger = contact?.messenger || "https://m.me";

  return (
    <section className="py-16 bg-primary/5 border-t border-border/60">
      <div className="container-site">
        <div className="bg-card rounded-2xl border border-primary/20 p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Have Questions or Ready to Reserve?
            </span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              Get in Touch with Our Cattery Team
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We respond quickly to Facebook messages, Messenger inquiries, calls, and email. Reach out to discuss availability, visits, or kitten care advice.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-sm text-foreground">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-semibold">{phone}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-semibold">{email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" className="w-full rounded-xl gap-2 font-medium border-border hover:bg-muted">
                <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook Page
              </Button>
            </a>

            <a
              href={messenger}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button className="w-full rounded-xl gap-2 font-medium bg-[#0084FF] hover:bg-[#0084FF]/90 text-white shadow-xs">
                <MessageCircle className="w-4 h-4" />
                Chat on Messenger
              </Button>
            </a>

            <Button asChild variant="secondary" className="w-full sm:w-auto rounded-xl font-medium">
              <Link href="/contact" className="flex items-center gap-1.5">
                Contact Page <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactBanner;
