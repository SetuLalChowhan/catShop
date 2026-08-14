"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trophy, Star, Pencil, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { getData, postData, patchData, deleteData, apiErrorMessage } from "@/lib/api";
import { Winner, ImageAsset } from "@/types";
import { toast } from "sonner";

const winnerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  facebookUrl: z.string().url("Please enter a valid Facebook URL").or(z.literal("")),
  position: z.number().min(1, "Position must be at least 1"),
  isWinnerOfMonth: z.boolean(),
  isActive: z.boolean(),
});

type WinnerFormValues = z.infer<typeof winnerSchema>;

export default function WinnerManagementPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editWinner, setEditWinner] = useState<Winner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Winner | null>(null);

  const [winnerImage, setWinnerImage] = useState<ImageAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WinnerFormValues>({
    resolver: zodResolver(winnerSchema),
    defaultValues: {
      name: "",
      facebookUrl: "",
      position: 1,
      isWinnerOfMonth: false,
      isActive: true,
    },
  });

  const fetchWinners = async () => {
    try {
      setLoading(true);
      const res = await getData<{ winners?: Winner[] } | Winner[]>("/api/admin/winners");
      if (Array.isArray(res)) {
        setWinners(res);
      } else if (res?.winners) {
        setWinners(res.winners);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to fetch winners"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const openAddModal = () => {
    reset({
      name: "",
      facebookUrl: "",
      position: winners.length + 1,
      isWinnerOfMonth: false,
      isActive: true,
    });
    setWinnerImage(null);
    setAddModalOpen(true);
  };

  const openEditModal = (winner: Winner) => {
    setEditWinner(winner);
    reset({
      name: winner.name,
      facebookUrl: winner.facebookUrl || "",
      position: winner.position || 1,
      isWinnerOfMonth: winner.isWinnerOfMonth || false,
      isActive: winner.isActive !== false,
    });
    setWinnerImage(winner.image || null);
  };

  const toggleActive = async (winner: Winner) => {
    const updatedStatus = !(winner.isActive !== false);
    // Optimistic state update: Instant UI toggle, zero flicker
    setWinners((prev) =>
      prev.map((w) => (w._id === winner._id ? { ...w, isActive: updatedStatus } : w))
    );
    try {
      await patchData(`/api/winners/${winner._id}`, { isActive: updatedStatus });
      toast.success(`Winner ${updatedStatus ? "enabled (visible on site)" : "disabled (hidden on site)"}`);
    } catch (err) {
      // Revert if error
      setWinners((prev) =>
        prev.map((w) => (w._id === winner._id ? { ...w, isActive: !updatedStatus } : w))
      );
      toast.error(apiErrorMessage(err, "Failed to toggle winner status"));
    }
  };

  const onSubmit = async (data: WinnerFormValues) => {
    const payload = {
      name: data.name,
      facebookUrl: data.facebookUrl || undefined,
      position: Number(data.position),
      isWinnerOfMonth: data.isWinnerOfMonth,
      isActive: data.isActive,
      image: winnerImage || undefined,
    };

    try {
      setSubmitting(true);
      if (editWinner) {
        await patchData(`/api/winners/${editWinner._id}`, payload);
        toast.success("Winner record updated!");
        setEditWinner(null);
      } else {
        await postData("/api/winners", payload);
        toast.success("New winner added!");
        setAddModalOpen(false);
      }
      fetchWinners();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to save winner record"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteData(`/api/winners/${deleteTarget._id}`);
      toast.success("Winner record deleted");
      setDeleteTarget(null);
      fetchWinners();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete winner"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
            Referral Winner Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage top customer referral winners and set the Winner of the Month.
          </p>
        </div>

        <Button onClick={openAddModal} className="rounded-xl gap-2 font-medium">
          <Plus className="w-4 h-4" /> Add Winner
        </Button>
      </div>

      {/* List */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading winners list...</div>
        ) : winners.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No winners added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Winner Photo</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Facebook URL</th>
                  <th className="py-3.5 px-4">Spotlight Status</th>
                  <th className="py-3.5 px-4">Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {winners.map((winner) => (
                  <tr key={winner._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-muted-foreground">#{winner.position}</td>
                    <td className="py-3 px-4">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted border border-border">
                        {winner.image?.url ? (
                          <Image src={winner.image.url} alt={winner.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                            {winner.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">{winner.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {winner.facebookUrl ? (
                        <a href={winner.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                          Facebook <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {winner.isWinnerOfMonth ? (
                        <Badge className="bg-amber-deep text-white font-semibold flex items-center gap-1 w-fit">
                          <Star className="w-3 h-3 fill-current" /> Winner of Month
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Standard Winner</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={winner.isActive !== false}
                          onCheckedChange={() => toggleActive(winner)}
                        />
                        <span className={`text-xs font-medium ${winner.isActive !== false ? "text-sage" : "text-muted-foreground"}`}>
                          {winner.isActive !== false ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(winner)} className="rounded-lg h-8 px-2.5">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(winner)} className="rounded-lg h-8 px-2.5 text-white">
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={addModalOpen || !!editWinner} onOpenChange={(open) => !open && (setAddModalOpen(false), setEditWinner(null))}>
        <DialogContent className="sm:max-w-[500px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editWinner ? "Edit Winner Record" : "Add New Referral Winner"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure winner details, Facebook link, and Winner of the Month status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Winner Photo (Cloudinary)</Label>
              <ImageUploader
                value={winnerImage}
                onChange={(val) => setWinnerImage(Array.isArray(val) ? val[0] : val)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Winner Name *</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} className="rounded-lg" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="facebookUrl" className="text-xs font-semibold">Facebook Profile / Page URL</Label>
              <Input id="facebookUrl" placeholder="https://facebook.com/johndoe" {...register("facebookUrl")} className="rounded-lg" />
              {errors.facebookUrl && <p className="text-xs text-destructive">{errors.facebookUrl.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 rounded-xl bg-muted/40 p-3 border border-border flex items-center justify-between">
                <div>
                  <Label htmlFor="activeSwitch" className="text-xs font-semibold block cursor-pointer">
                    Public Status
                  </Label>
                  <span className="text-[10px] text-muted-foreground">{watch("isActive") ? "Enabled (Visible)" : "Disabled (Hidden)"}</span>
                </div>
                <Switch
                  id="activeSwitch"
                  checked={watch("isActive")}
                  onCheckedChange={(val) => setValue("isActive", val)}
                />
              </div>

              <div className="space-y-1 rounded-xl bg-muted/40 p-3 border border-border flex items-center justify-between">
                <div>
                  <Label htmlFor="winnerOfMonthSwitch" className="text-xs font-semibold block cursor-pointer">
                    Winner of Month
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Spotlight feature</span>
                </div>
                <Switch
                  id="winnerOfMonthSwitch"
                  checked={watch("isWinnerOfMonth")}
                  onCheckedChange={(val) => setValue("isWinnerOfMonth", val)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="position" className="text-xs font-semibold">Display Order Position</Label>
              <Input id="position" type="number" {...register("position", { valueAsNumber: true })} className="rounded-lg" />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => (setAddModalOpen(false), setEditWinner(null))}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="min-w-[120px]">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : editWinner ? "Update Winner" : "Add Winner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete winner record for {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The winner record will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
