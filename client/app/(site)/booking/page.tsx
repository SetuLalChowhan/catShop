"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Heart, CheckCircle2, Loader2, ShieldCheck, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiErrorMessage } from "@/lib/api";
import { useCats, useCreateBooking } from "@/lib/queries";
import { toast } from "sonner";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number must be at least 7 digits"),
  catId: z.string().optional(),
  preferredDate: z.string().optional(),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function BookingContent() {
  const searchParams = useSearchParams();
  const catSlugParam = searchParams.get("cat");

  // Cached — the cat dropdown reuses the shared cats query.
  const catsQuery = useCats();
  const cats = catsQuery.data ?? [];
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const createBooking = useCreateBooking();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      catId: "",
      preferredDate: "",
      message: "",
    },
  });

  // When arriving via ?cat=<slug>, preselect the matching cat once loaded.
  useEffect(() => {
    if (catSlugParam && cats.length > 0) {
      const matched = cats.find((c) => c.slug === catSlugParam);
      if (matched) {
        setValue("catId", matched._id);
      }
    }
  }, [catSlugParam, cats, setValue]);

  const currentCatId = watch("catId");

  const onSubmit = async (data: BookingFormValues) => {
    try {
      setSubmitting(true);
      await createBooking.mutateAsync({
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        cat: data.catId,
        preferredDate: data.preferredDate || undefined,
        message: data.message || undefined,
      });

      setSubmittedSuccess(true);
      toast.success("Booking request submitted!");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to submit booking request"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-background min-h-[75vh]">
      <div className="container-site max-w-4xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 fill-primary/20" />
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink">
            Kitten Reservation & Visit Inquiry
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Submit your reservation details below. Our cattery team will contact you promptly to confirm availability and visit arrangements.
          </p>
        </div>

        {submittedSuccess ? (
          <div className="p-8 md:p-12 bg-card rounded-xl border border-border shadow-xs text-center space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-sage-soft text-sage flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-bold text-2xl text-foreground">
                Request Received!
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Thank you for submitting your booking. We have logged your request and will reach out via phone or email within 24 hours.
              </p>
            </div>
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" /> +1 (555) 234-5678
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> hello@whiskerhaven.com
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form */}
            <div className="lg:col-span-8 bg-card rounded-xl border border-border p-6 md:p-8 shadow-xs">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="customerName" className="text-xs font-semibold">
                    Full Name *
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Jane Doe"
                    {...register("customerName")}
                    className="rounded-lg"
                  />
                  {errors.customerName && (
                    <p className="text-xs text-destructive">{errors.customerName.message}</p>
                  )}
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      {...register("email")}
                      className="rounded-lg"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      {...register("phone")}
                      className="rounded-lg"
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Cat Selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="catId" className="text-xs font-semibold">
                    Select Companion Cat *
                  </Label>
                  <Select
                    value={currentCatId}
                    onValueChange={(val) => setValue("catId", val, { shouldValidate: true })}
                  >
                    <SelectTrigger id="catId" className="rounded-lg">
                      <SelectValue placeholder="Select a cat from list..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cats.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name} — {cat.breed} ({cat.availability})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.catId && (
                    <p className="text-xs text-destructive">{errors.catId.message}</p>
                  )}
                </div>

                {/* Preferred Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="preferredDate" className="text-xs font-semibold">
                    Preferred Visit / Adoption Date
                  </Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    {...register("preferredDate")}
                    className="rounded-lg"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-semibold">
                    Additional Information / Questions
                  </Label>
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder="Tell us about your home, experience with cats, or specific questions..."
                    {...register("message")}
                    className="rounded-lg resize-none"
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={submitting} size="lg" className="w-full rounded-xl font-medium">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting Request...
                    </>
                  ) : (
                    "Submit Reservation Request"
                  )}
                </Button>
              </form>
            </div>

            {/* Sidebar guarantee */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-xl bg-cream/50 border border-border space-y-4">
                <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sage" /> Cattery Assurance
                </h3>
                <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-sage font-bold">•</span>
                    <span>No upfront deposit required prior to initial phone consultation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage font-bold">•</span>
                    <span>Full health check & vaccination documentation provided upon adoption.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage font-bold">•</span>
                    <span>Direct customer support via phone, email, and Facebook Messenger.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading booking page...</div>}>
      <BookingContent />
    </Suspense>
  );
}
