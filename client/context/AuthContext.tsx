"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AdminUser } from "@/types";
import { getData, postData } from "@/lib/api";

const AUTH_STORAGE_KEY = "catshop_admin_user";

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  setUser: (user: AdminUser | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<AdminUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AdminUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const setUser = (newUser: AdminUser | null) => {
    setUserState(newUser);
    if (typeof window !== "undefined") {
      if (newUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem("catshop_admin_token");
      }
    }
  };

  const checkAuth = async () => {
    try {
      const data = await getData<AdminUser>("/api/auth/me");
      if (data && data._id) {
        setUser(data);
        return data;
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setUser(null);
        return null;
      }
    } finally {
      setLoading(false);
    }
    return user;
  };

  const logout = async () => {
    try {
      await postData("/api/auth/logout");
    } catch {}
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};


