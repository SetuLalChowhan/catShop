"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postData, apiErrorMessage } from "@/lib/api";
import { Cat } from "@/types";
import { CheckCircle2, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number must be at least 7 digits"),
  catId: z.string().optional(),
  preferredDate: z.string().optional(),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCat?: Cat | null;
  catsList?: Cat[];
}

export function BookingModal({ open, onOpenChange, selectedCat, catsList = [] }: BookingModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      catId: selectedCat?._id || "",
      preferredDate: "",
      message: "",
    },
  });

  // Keep catId in sync when selectedCat changes
  React.useEffect(() => {
    if (selectedCat?._id) {
      setValue("catId", selectedCat._id);
    }
  }, [selectedCat, setValue]);

  const currentCatId = watch("catId");

  const onSubmit = async (data: BookingFormValues) => {
    try {
      setSubmitting(true);
      await postData("/api/bookings", {
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        cat: data.catId,
        preferredDate: data.preferredDate || undefined,
        message: data.message || undefined,
      });

      setSubmittedSuccess(true);
      toast.success("Booking request submitted successfully!");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to submit booking request"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmittedSuccess(false);
      reset();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] rounded-xl bg-card p-6 border-border">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Heart className="w-5 h-5 fill-primary/20" />
          </div>
          <DialogTitle className="font-display text-2xl font-bold">
            {submittedSuccess ? "Booking Received!" : "Reserve Your Kitten"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {submittedSuccess
              ? "We've received your request and will contact you via phone or email within 24 hours."
              : "Fill out the information below to express your interest. Our cattery team will contact you promptly."}
          </DialogDescription>
        </DialogHeader>

        {submittedSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-sage-soft text-sage flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-sm text-muted-foreground">
              Thank you for trusting Whisker Haven. We look forward to matching you with your new furry companion!
            </p>
            <Button onClick={handleClose} className="w-full mt-4">
              Close Window
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Customer Name */}
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
                  Phone / WhatsApp *
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

            {/* Cat Select */}
            <div className="space-y-1.5">
              <Label htmlFor="catSelect" className="text-xs font-semibold">
                Selected Cat *
              </Label>
              <Select
                value={currentCatId}
                onValueChange={(val) => setValue("catId", val, { shouldValidate: true })}
              >
                <SelectTrigger id="catSelect" className="rounded-lg">
                  <SelectValue placeholder="Choose a kitten..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedCat && !catsList.some((c) => c._id === selectedCat._id) && (
                    <SelectItem key={selectedCat._id} value={selectedCat._id}>
                      {selectedCat.name} ({selectedCat.breed})
                    </SelectItem>
                  )}
                  {catsList.map((cat) => (
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
                Preferred Visit / Pickup Date
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
                Special Requests or Questions
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us about your home environment or any questions..."
                rows={3}
                {...register("message")}
                className="rounded-lg resize-none"
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="min-w-[120px]">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Booking"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BookingModal;
