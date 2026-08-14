"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { apiErrorMessage } from "@/lib/api";
import {
  useAdminCats,
  useDeleteCat,
  useSaveCat,
  useToggleCatStatus,
} from "@/lib/queries";
import { Cat, ImageAsset } from "@/types";
import { formatAge, capitalize } from "@/lib/format";
import { toast } from "sonner";

const catFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  breed: z.string().min(2, "Breed is required"),
  ageMonths: z.number().min(0, "Age cannot be negative"),
  gender: z.enum(["male", "female"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  availability: z.enum(["available", "reserved", "sold"]),
  status: z.enum(["active", "archived"]),
  isFeatured: z.boolean(),
  pedigree: z.string().optional(),
  traitsInput: z.string().optional(),
});

type CatFormValues = z.infer<typeof catFormSchema>;

export default function CatManagementPage() {
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<Cat | null>(null);
  const [deleteCatTarget, setDeleteCatTarget] = useState<Cat | null>(null);

  // Form image assets state
  const [uploadedImages, setUploadedImages] = useState<ImageAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CatFormValues>({
    resolver: zodResolver(catFormSchema),
    defaultValues: {
      name: "",
      breed: "",
      ageMonths: 3,
      gender: "male",
      description: "",
      shortDescription: "",
      availability: "available",
      status: "active",
      isFeatured: false,
      pedigree: "",
      traitsInput: "",
    },
  });

  const [page, setPage] = useState(1);

  // Debounced copy of the search box so we don't fire a request per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when a new search settles (the query below re-runs).
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Cached query: page, availability, and debounced search each get their own
  // cache entry, so revisiting a page/filter renders instantly and refetches
  // in the background instead of flashing a full-table loading state.
  const catsQuery = useAdminCats({
    page,
    availability: availabilityFilter,
    search: debouncedSearch,
  });
  const cats = Array.isArray(catsQuery.data) ? catsQuery.data : catsQuery.data?.cats ?? [];
  const pagination = !Array.isArray(catsQuery.data) ? (catsQuery.data?.pagination ?? null) : null;
  const loading = catsQuery.isPending;

  const saveCat = useSaveCat();
  const deleteCat = useDeleteCat();
  const toggleStatus = useToggleCatStatus();

  const toggleCatStatus = async (cat: Cat) => {
    const newStatus = cat.status === "active" ? "archived" : "active";
    try {
      // Optimistic UI update happens inside the mutation: instant switch toggle.
      await toggleStatus.mutateAsync({ id: cat._id, status: newStatus });
      toast.success(`Cat listing ${newStatus === "active" ? "enabled (visible on site)" : "disabled (hidden on site)"}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to toggle cat status"));
    }
  };

  const openAddModal = () => {
    reset({
      name: "",
      breed: "",
      ageMonths: 3,
      gender: "male",
      description: "",
      shortDescription: "",
      availability: "available",
      status: "active",
      isFeatured: false,
      pedigree: "",
      traitsInput: "",
    });
    setUploadedImages([]);
    setAddModalOpen(true);
  };

  const openEditModal = (cat: Cat) => {
    setEditCat(cat);
    reset({
      name: cat.name,
      breed: cat.breed,
      ageMonths: cat.ageMonths,
      gender: cat.gender,
      description: cat.description,
      shortDescription: cat.shortDescription || "",
      availability: cat.availability,
      status: cat.status,
      isFeatured: cat.isFeatured,
      pedigree: cat.pedigree || "",
      traitsInput: cat.traits ? cat.traits.join(", ") : "",
    });
    setUploadedImages(cat.images || []);
  };

  const onSubmit = async (data: CatFormValues) => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one cat image");
      return;
    }

    const traits = data.traitsInput
      ? data.traitsInput.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      name: data.name,
      breed: data.breed,
      ageMonths: Number(data.ageMonths),
      gender: data.gender,
      description: data.description,
      shortDescription: data.shortDescription,
      availability: data.availability,
      status: data.status,
      isFeatured: data.isFeatured,
      pedigree: data.pedigree,
      traits,
      images: uploadedImages,
    };

    try {
      setSubmitting(true);
      if (editCat) {
        await saveCat.mutateAsync({ id: editCat._id, payload });
        toast.success("Cat updated successfully!");
        setEditCat(null);
      } else {
        await saveCat.mutateAsync({ payload });
        toast.success("New cat added successfully!");
        setAddModalOpen(false);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to save cat record"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCatTarget) return;
    try {
      await deleteCat.mutateAsync(deleteCatTarget._id);
      toast.success("Cat deleted successfully!");
      setDeleteCatTarget(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete cat"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
            Cat Inventory Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Add, update, or manage cats, images, and availability statuses.
          </p>
        </div>

        <Button onClick={openAddModal} className="rounded-xl gap-2 font-medium">
          <Plus className="w-4 h-4" /> Add New Cat
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Search by name, breed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Availability</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Adopted / Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading cat inventory...</div>
        ) : cats.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No cats found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">Cat Image</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Breed</th>
                  <th className="py-3.5 px-4">Age / Gender</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Status Switch</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cats.map((cat) => (
                  <tr key={cat._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border">
                        {cat.images && cat.images.length > 0 ? (
                          <Image src={cat.images[0].url} alt={cat.name} fill className="object-cover" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground flex items-center justify-center h-full">No img</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        {cat.name}
                        {cat.isFeatured && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] py-0">Featured</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{cat.breed}</td>
                    <td className="py-3 px-4 text-muted-foreground capitalize">
                      {formatAge(cat.ageMonths)} • {cat.gender}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          cat.availability === "available"
                            ? "bg-sage text-white"
                            : cat.availability === "reserved"
                            ? "bg-amber-deep text-white"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {cat.availability}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cat.status === "active"}
                          onCheckedChange={() => toggleCatStatus(cat)}
                        />
                        <span className={`text-xs font-medium ${cat.status === "active" ? "text-sage" : "text-muted-foreground"}`}>
                          {cat.status === "active" ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(cat)}
                        className="rounded-lg h-8 px-2.5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteCatTarget(cat)}
                        className="rounded-lg h-8 px-2.5 text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination && pagination.pages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
                <span className="text-xs text-muted-foreground font-medium">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total cats)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg h-8 text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    className="rounded-lg h-8 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        open={addModalOpen || !!editCat}
        onOpenChange={(open) => {
          if (!open) {
            setAddModalOpen(false);
            setEditCat(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editCat ? `Edit Cat: ${editCat.name}` : "Add New Cat to Inventory"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Fill in the cat details and upload high-res images to Cloudinary.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Image Uploader */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cat Images (Cloudinary) *</Label>
              <ImageUploader
                value={uploadedImages}
                onChange={(val) => setUploadedImages(Array.isArray(val) ? val : val ? [val] : [])}
                multiple
                maxFiles={8}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">Cat Name *</Label>
                <Input id="name" placeholder="Luna" {...register("name")} className="rounded-lg" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="breed" className="text-xs font-semibold">Breed *</Label>
                <Input id="breed" placeholder="Persian / British Shorthair" {...register("breed")} className="rounded-lg" />
                {errors.breed && <p className="text-xs text-destructive">{errors.breed.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ageMonths" className="text-xs font-semibold">Age (Months) *</Label>
                <Input
                  id="ageMonths"
                  type="number"
                  {...register("ageMonths", { valueAsNumber: true })}
                  className="rounded-lg"
                />
                {errors.ageMonths && <p className="text-xs text-destructive">{errors.ageMonths.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-xs font-semibold">Gender *</Label>
                <Select
                  value={watch("gender")}
                  onValueChange={(val: "male" | "female") => setValue("gender", val)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male ♂</SelectItem>
                    <SelectItem value="female">Female ♀</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="availability" className="text-xs font-semibold">Availability *</Label>
                <Select
                  value={watch("availability")}
                  onValueChange={(val: "available" | "reserved" | "sold") => setValue("availability", val)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold / Adopted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shortDescription" className="text-xs font-semibold">Short Description (Card preview)</Label>
              <Input id="shortDescription" placeholder="Playful 3-month-old British Shorthair kitten..." {...register("shortDescription")} className="rounded-lg" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">Full Description *</Label>
              <Textarea id="description" rows={4} placeholder="Full story, temperament, health record..." {...register("description")} className="rounded-lg resize-none" />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="traitsInput" className="text-xs font-semibold">Traits (Comma separated)</Label>
                <Input id="traitsInput" placeholder="Vaccinated, Pedigree, Playful" {...register("traitsInput")} className="rounded-lg" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pedigree" className="text-xs font-semibold">Pedigree Line / Certificate</Label>
                <Input id="pedigree" placeholder="TICA Certified Lineage" {...register("pedigree")} className="rounded-lg" />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setAddModalOpen(false); setEditCat(null); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="min-w-[120px]">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : editCat ? "Update Cat" : "Add Cat"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteCatTarget} onOpenChange={(open) => !open && setDeleteCatTarget(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete {deleteCatTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The cat record and Cloudinary image references will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Cat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
