"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldCheck, KeyRound, User, Mail, Save, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getData, patchData, apiErrorMessage } from "@/lib/api";
import { AdminUser } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AdminSettingsPage() {
  const { user, setUser } = useAuth();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || "",
        email: user.email || "",
      });
    } else {
      getData<AdminUser>("/api/auth/me")
        .then((data) => {
          if (data) {
            setUser(data);
            resetProfile({
              name: data.name || "",
              email: data.email || "",
            });
          }
        })
        .catch(() => {});
    }
  }, [user, resetProfile, setUser]);

  const onUpdateProfile = async (data: ProfileFormValues) => {
    try {
      setUpdatingProfile(true);
      const res = await patchData<{ admin: AdminUser }>("/api/auth/profile", {
        name: data.name,
        email: data.email,
      });
      toast.success("Admin email & name updated successfully!");
      if (res?.admin) {
        setUser(res.admin);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update admin profile"));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data: PasswordFormValues) => {
    try {
      setUpdatingPassword(true);
      await patchData("/api/auth/profile", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Admin password changed successfully!");
      resetPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to change password"));
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-primary" /> Admin Account & Authentication Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage admin account credentials, login email address, and change password securely.
        </p>
      </div>

      {/* 1. Admin Email & Account Details */}
      <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">Admin Account Credentials</h2>
            <p className="text-xs text-muted-foreground">Update your official login email address and display name.</p>
          </div>
        </div>

        <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Admin Display Name</Label>
              <Input id="name" {...registerProfile("name")} className="rounded-lg" />
              {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Login Email Address</Label>
              <Input id="email" type="email" {...registerProfile("email")} className="rounded-lg" />
              {profileErrors.email && <p className="text-xs text-destructive">{profileErrors.email.message}</p>}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={updatingProfile} className="rounded-xl gap-2 font-medium">
              {updatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Account Details
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Change Password */}
      <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-soft text-amber-deep flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">Change Password</h2>
            <p className="text-xs text-muted-foreground">Ensure your account stays secure by using a strong password.</p>
          </div>
        </div>

        <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs font-semibold">Current Password</Label>
            <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} className="rounded-lg" placeholder="••••••••" />
            {passwordErrors.currentPassword && <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-semibold">New Password</Label>
              <Input id="newPassword" type="password" {...registerPassword("newPassword")} className="rounded-lg" placeholder="Minimum 6 characters" />
              {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" {...registerPassword("confirmPassword")} className="rounded-lg" placeholder="Re-enter new password" />
              {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={updatingPassword} className="rounded-xl gap-2 font-medium">
              {updatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
