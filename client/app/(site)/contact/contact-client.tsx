"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/api";
import { useCreateContact } from "@/lib/queries";
import { safeExternalUrl } from "@/lib/format";
import { ContactSkeleton } from "@/components/site/contact/ContactSkeleton";
import { ContactInfo } from "@/types";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactClientProps {
  contact: ContactInfo | null;
}

/** Client island — contact details are fetched server-side and passed in. */
export default function ContactClient({ contact }: ContactClientProps) {
  const loading = false;
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const createContact = useCreateContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const phone = contact?.phone || "+1 (555) 234-5678";
  const email = contact?.email || "hello@whiskerhaven.com";
  const facebook = safeExternalUrl(contact?.facebook, "https://facebook.com");
  const messenger = safeExternalUrl(contact?.messenger, "https://m.me");
  const address = contact?.address || "123 Whisker Way, Loving Home Cattery";
  const hours = contact?.hours || "Mon - Sun: 9:00 AM - 7:00 PM (Visits by appointment)";

  // Show the skeleton until the dynamic contact data arrives — no static
  // placeholder flash before the real values render.
  if (loading) return <ContactSkeleton />;

  const onSubmit = async (data: ContactFormValues) => {
    try {
      setSubmitting(true);
      await createContact.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        subject: data.subject,
        message: data.message,
      });
      setSentSuccess(true);
      toast.success("Message sent successfully!");
      reset();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to send message"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-background">
      <div className="container-site space-y-8 sm:space-y-12">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <span>Get in Touch</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink">
            Contact Whisker Haven Cattery
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Have questions about our kittens, adoption process, or visiting our cattery? Reach out through any of our channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Contact Details Left */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-foreground">Direct Channels</h2>

              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">Phone Support</span>
                    <span className="text-sm font-bold text-foreground">{phone}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">Email Inquiry</span>
                    <span className="text-sm font-bold text-foreground">{email}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">Cattery Address</span>
                    <span className="text-sm font-bold text-foreground">{address}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">Visiting Hours</span>
                    <span className="text-sm font-bold text-foreground">{hours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Buttons */}
            <div className="p-6 rounded-xl bg-cream/50 border border-border space-y-4">
              <h3 className="font-display font-semibold text-base text-foreground">Social & Instant Messaging</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect with us on social media for daily kitten photos, updates, and instant responses.
              </p>

              <div className="flex flex-col gap-3">
                <a href={facebook} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full justify-start rounded-xl gap-3 font-medium bg-card">
                    <svg className="w-5 h-5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Visit Official Facebook Page
                  </Button>
                </a>

                <a href={messenger} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full justify-start rounded-xl gap-3 font-medium bg-[#0084FF] hover:bg-[#0084FF]/90 text-white">
                    <MessageCircle className="w-5 h-5" />
                    Chat Directly on Messenger
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Form Right */}
          <div className="lg:col-span-7 bg-card rounded-xl border border-border p-6 md:p-8 shadow-xs">
            <h2 className="font-display font-bold text-xl text-foreground mb-4">Send Us a Message</h2>

            {sentSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-sage-soft text-sage flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground">Message Delivered</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you for reaching out! We have received your inquiry and will respond within 24 hours.
                </p>
                <Button variant="outline" onClick={() => setSentSuccess(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">Your Name *</Label>
                    <Input id="name" placeholder="John Doe" {...register("name")} className="rounded-lg" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address *</Label>
                    <Input id="email" type="email" placeholder="john@example.com" {...register("email")} className="rounded-lg" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 000-0000" {...register("phone")} className="rounded-lg" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-semibold">Subject *</Label>
                    <Input id="subject" placeholder="General Inquiry / Adoption" {...register("subject")} className="rounded-lg" />
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-semibold">Message *</Label>
                  <Textarea id="message" rows={5} placeholder="Write your message here..." {...register("message")} className="rounded-lg resize-none" />
                  {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                </div>

                <Button type="submit" disabled={submitting} size="lg" className="w-full rounded-xl font-medium">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
