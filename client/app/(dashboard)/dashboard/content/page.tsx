"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Save,
  Loader2,
  Phone,
  Home,
  Heart,
  Globe,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { getData, patchData, apiErrorMessage } from "@/lib/api";
import { WebsiteContent, ImageAsset } from "@/types";
import { toast } from "sonner";

const contentSchema = z.object({
  // Brand
  brandName: z.string().optional(),
  brandTagline: z.string().optional(),
  brandDescription: z.string().optional(),
  announcementBar: z.string().optional(),
  footerText: z.string().optional(),

  // Home
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  introText: z.string().optional(),
  primaryCtaLabel: z.string().optional(),
  secondaryCtaLabel: z.string().optional(),
  catsSectionTitle: z.string().optional(),
  catsSectionSubtitle: z.string().optional(),
  winnersSectionTitle: z.string().optional(),
  winnersSectionSubtitle: z.string().optional(),

  // About
  aboutTitle: z.string().optional(),
  aboutStory: z.string().optional(),
  aboutMission: z.string().optional(),

  // Contact
  phone: z.string().optional(),
  email: z.string().optional(),
  facebook: z.string().optional(),
  messenger: z.string().optional(),
  address: z.string().optional(),
  hours: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

export default function FullCMSManagementPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Images state
  const [logoImage, setLogoImage] = useState<ImageAsset | null>(null);
  const [heroImage, setHeroImage] = useState<ImageAsset | null>(null);
  const [aboutImages, setAboutImages] = useState<ImageAsset[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
  });

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const res = await getData<WebsiteContent>("/api/content");
        if (res) {
          reset({
            brandName: res.brand?.name || "Whisker Haven",
            brandTagline: res.brand?.tagline || "Premium kittens, raised with love",
            brandDescription: res.brand?.description || "",
            announcementBar: res.brand?.announcementBar || "Ethical & Loving Cat Breeding • Reserve your purebred companion today",
            footerText: res.brand?.footerText || "All kittens come fully vaccinated, health-checked, and microchipped before joining your home.",

            heroTitle: res.home?.heroTitle || "",
            heroSubtitle: res.home?.heroSubtitle || "",
            introText: res.home?.introText || "",
            primaryCtaLabel: res.home?.primaryCta?.label || "Browse Available Cats",
            secondaryCtaLabel: res.home?.secondaryCta?.label || "Submit Reservation Request",
            catsSectionTitle: res.home?.catsSectionTitle || "Meet Our Available Companions",
            catsSectionSubtitle: res.home?.catsSectionSubtitle || "Explore our current litter of health-checked, pedigreed kittens.",
            winnersSectionTitle: res.home?.winnersSectionTitle || "Referral Winners & Recognition",
            winnersSectionSubtitle: res.home?.winnersSectionSubtitle || "We celebrate our adopter community! Every month we reward top customer referrals.",

            aboutTitle: res.about?.title || "",
            aboutStory: res.about?.story || "",
            aboutMission: res.about?.mission || "",

            phone: res.contact?.phone || "",
            email: res.contact?.email || "",
            facebook: res.contact?.facebook || "",
            messenger: res.contact?.messenger || "",
            address: res.contact?.address || "",
            hours: res.contact?.hours || "",
          });

          setLogoImage(res.brand?.logoImage || null);
          setHeroImage(res.home?.heroImage || null);
          setAboutImages(res.about?.images || []);
        }
      } catch (err) {
        toast.error(apiErrorMessage(err, "Failed to load website content"));
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [reset]);

  const onSubmit = async (data: ContentFormValues) => {
    const payload = {
      brand: {
        name: data.brandName || "Whisker Haven",
        tagline: data.brandTagline || "",
        description: data.brandDescription || "",
        announcementBar: data.announcementBar || "",
        footerText: data.footerText || "",
        logoImage: logoImage || null,
      },
      home: {
        heroTitle: data.heroTitle || "",
        heroSubtitle: data.heroSubtitle || "",
        introText: data.introText || "",
        heroImage: heroImage || null,
        primaryCta: { label: data.primaryCtaLabel || "Browse Available Cats", href: "/cats" },
        secondaryCta: { label: data.secondaryCtaLabel || "Submit Reservation Request", href: "/booking" },
        catsSectionTitle: data.catsSectionTitle || "Meet Our Available Companions",
        catsSectionSubtitle: data.catsSectionSubtitle || "",
        winnersSectionTitle: data.winnersSectionTitle || "Referral Winners & Recognition",
        winnersSectionSubtitle: data.winnersSectionSubtitle || "",
      },
      about: {
        title: data.aboutTitle || "",
        story: data.aboutStory || "",
        mission: data.aboutMission || "",
        images: aboutImages,
      },
      contact: {
        phone: data.phone || "",
        email: data.email || "",
        facebook: data.facebook || "",
        messenger: data.messenger || "",
        address: data.address || "",
        hours: data.hours || "",
      },
    };

    try {
      setSubmitting(true);
      await patchData("/api/content", payload);
      toast.success("All website content updated successfully!");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to save CMS content"));
    } finally {
      setSubmitting(false);
    }
  };

  const onInvalid = (formErrors: any) => {
    console.error("Form validation errors:", formErrors);
    toast.error("Please check the form for invalid inputs");
  };

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground">Loading Full CMS Control Panel...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
            Full Website CMS Control Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete A-to-Z control over all titles, hero sections, badges, text, images, and social links across the website.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSubmit(onSubmit, onInvalid)}
          disabled={submitting}
          className="rounded-xl gap-2 font-medium min-w-[150px] shadow-sm"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Changes
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <Tabs defaultValue="brand" className="w-full space-y-6">
          <TabsList className="bg-card border border-border p-1 rounded-xl w-full justify-start flex-wrap gap-1">
            <TabsTrigger value="brand" className="rounded-lg text-xs font-semibold gap-1.5">
              <Globe className="w-4 h-4" /> Brand & Header/Footer
            </TabsTrigger>
            <TabsTrigger value="home" className="rounded-lg text-xs font-semibold gap-1.5">
              <Home className="w-4 h-4" /> Homepage Sections (A-Z)
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-lg text-xs font-semibold gap-1.5">
              <Heart className="w-4 h-4" /> About Us Page
            </TabsTrigger>
            <TabsTrigger value="contact" className="rounded-lg text-xs font-semibold gap-1.5">
              <Phone className="w-4 h-4" /> Contact & Social Links
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BRAND & NAVIGATION */}
          <TabsContent value="brand" className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6 shadow-xs">
            <h2 className="font-display font-bold text-xl text-foreground">Brand Identity, Header & Footer CMS</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Cattery Brand Logo Image (Optional)</Label>
                <p className="text-[11px] text-muted-foreground">Upload a transparent PNG/SVG logo to replace the default cat icon in header & footer.</p>
                <ImageUploader
                  value={logoImage}
                  onChange={(val) => setLogoImage(Array.isArray(val) ? val[0] : val)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="brandName" className="text-xs font-semibold">Cattery Brand Name</Label>
                  <Input id="brandName" {...register("brandName")} className="rounded-lg" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="brandTagline" className="text-xs font-semibold">Brand Tagline</Label>
                  <Input id="brandTagline" {...register("brandTagline")} className="rounded-lg" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="announcementBar" className="text-xs font-semibold">Top Announcement Bar Text</Label>
                <Input id="announcementBar" {...register("announcementBar")} className="rounded-lg" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brandDescription" className="text-xs font-semibold">Footer Short Brand Description</Label>
                <Textarea id="brandDescription" rows={3} {...register("brandDescription")} className="rounded-lg resize-none" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="footerText" className="text-xs font-semibold">Footer Quality & Health Guarantee Text</Label>
                <Input id="footerText" {...register("footerText")} className="rounded-lg" />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: HOMEPAGE SECTIONS */}
          <TabsContent value="home" className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6 shadow-xs">
            <h2 className="font-display font-bold text-xl text-foreground">Homepage Sections Configuration</h2>

            <div className="space-y-6">
              {/* Hero Photo & Titles */}
              <div className="space-y-4 border-b border-border pb-6">
                <h3 className="font-display font-semibold text-base text-foreground">1. Hero Section</h3>
                
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Hero Photo (Cloudinary)</Label>
                  <ImageUploader
                    value={heroImage}
                    onChange={(val) => setHeroImage(Array.isArray(val) ? val[0] : val)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="heroTitle" className="text-xs font-semibold">Hero Main Headline Title</Label>
                    <Input id="heroTitle" {...register("heroTitle")} className="rounded-lg" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="heroSubtitle" className="text-xs font-semibold">Hero Subtitle Badge Tag</Label>
                    <Input id="heroSubtitle" {...register("heroSubtitle")} className="rounded-lg" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="introText" className="text-xs font-semibold">Hero Introduction Paragraph</Label>
                  <Textarea id="introText" rows={3} {...register("introText")} className="rounded-lg resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="primaryCtaLabel" className="text-xs font-semibold">Primary Button Label</Label>
                    <Input id="primaryCtaLabel" {...register("primaryCtaLabel")} className="rounded-lg" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="secondaryCtaLabel" className="text-xs font-semibold">Secondary Button Label</Label>
                    <Input id="secondaryCtaLabel" {...register("secondaryCtaLabel")} className="rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Featured Cats Section Titles */}
              <div className="space-y-4 border-b border-border pb-6">
                <h3 className="font-display font-semibold text-base text-foreground">2. Available Cats Section Header</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="catsSectionTitle" className="text-xs font-semibold">Section Title</Label>
                    <Input id="catsSectionTitle" {...register("catsSectionTitle")} className="rounded-lg" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="catsSectionSubtitle" className="text-xs font-semibold">Section Subtitle Paragraph</Label>
                    <Input id="catsSectionSubtitle" {...register("catsSectionSubtitle")} className="rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Referral Winners Section Titles */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-base text-foreground">3. Referral Winners Section Header</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="winnersSectionTitle" className="text-xs font-semibold">Section Title</Label>
                    <Input id="winnersSectionTitle" {...register("winnersSectionTitle")} className="rounded-lg" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="winnersSectionSubtitle" className="text-xs font-semibold">Section Subtitle Paragraph</Label>
                    <Input id="winnersSectionSubtitle" {...register("winnersSectionSubtitle")} className="rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: ABOUT US PAGE */}
          <TabsContent value="about" className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6 shadow-xs">
            <h2 className="font-display font-bold text-xl text-foreground">About Us Page Configuration</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">About Gallery Photos (Cloudinary)</Label>
                <ImageUploader
                  value={aboutImages}
                  onChange={(val) => setAboutImages(Array.isArray(val) ? val : val ? [val] : [])}
                  multiple
                  maxFiles={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aboutTitle" className="text-xs font-semibold">About Page Main Headline</Label>
                <Input id="aboutTitle" {...register("aboutTitle")} className="rounded-lg" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aboutStory" className="text-xs font-semibold">Full Cattery Background & Story</Label>
                <Textarea id="aboutStory" rows={5} {...register("aboutStory")} className="rounded-lg resize-none" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aboutMission" className="text-xs font-semibold">Cattery Mission Statement</Label>
                <Textarea id="aboutMission" rows={3} {...register("aboutMission")} className="rounded-lg resize-none" />
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: CONTACT INFO & SOCIAL LINKS */}
          <TabsContent value="contact" className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6 shadow-xs">
            <h2 className="font-display font-bold text-xl text-foreground">Contact Details & Social Media Links</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">Phone / WhatsApp Number</Label>
                  <Input id="phone" {...register("phone")} className="rounded-lg" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Official Contact Email</Label>
                  <Input id="email" type="text" {...register("email")} className="rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="facebook" className="text-xs font-semibold">Facebook Page URL</Label>
                  <Input id="facebook" {...register("facebook")} className="rounded-lg" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="messenger" className="text-xs font-semibold">Messenger Chat URL</Label>
                  <Input id="messenger" {...register("messenger")} className="rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold">Physical Cattery Address</Label>
                  <Input id="address" {...register("address")} className="rounded-lg" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hours" className="text-xs font-semibold">Visiting Hours</Label>
                  <Input id="hours" {...register("hours")} className="rounded-lg" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
