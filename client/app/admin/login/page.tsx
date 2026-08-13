"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Cat, Lock, Mail, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postData, apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AdminUser } from "@/types";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      const res = await postData<{ admin: AdminUser; token?: string }>("/api/auth/login", data);
      toast.success("Admin login successful!");
      if (res?.token) {
        localStorage.setItem("catshop_admin_token", res.token);
      }
      if (res?.admin) {
        setUser(res.admin);
      }
      router.push("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-sm">
            <Cat className="w-7 h-7" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-foreground">
            Whisker Haven
          </h1>
          <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Administrator Portal Sign In
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Admin Email
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...register("email")}
                  className="pl-9 rounded-lg"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-9 rounded-lg"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full rounded-xl font-medium mt-2 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" /> Authenticating...
                </>
              ) : (
                <span className="flex items-center gap-2 text-white">
                  Sign In to Dashboard <ArrowRight className="w-4 h-4 text-white" />
                </span>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <a href="/" className="text-xs text-muted-foreground hover:text-primary underline">
            ← Return to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
