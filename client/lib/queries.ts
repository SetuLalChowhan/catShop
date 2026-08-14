"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteData, getData, patchData, postData } from "./api";
import type {
  Booking,
  BookingStatus,
  Cat,
  CatStatus,
  ContactMessage,
  ContactMessageStatus,
  DashboardStats,
  Pagination,
  WebsiteContent,
  Winner,
} from "@/types";

/* ── Query keys ──────────────────────────────────────────────────────────── */

export const queryKeys = {
  cats: ["cats"] as const,
  winners: ["winners"] as const,
  content: ["content"] as const,
  bookings: ["bookings"] as const,
  adminStats: ["admin", "stats"] as const,
  adminCats: (params: Record<string, string | number>) =>
    ["admin", "cats", params] as const,
  adminBookings: (params: Record<string, string | number>) =>
    ["admin", "bookings", params] as const,
  adminContacts: (params: Record<string, string | number>) =>
    ["admin", "contacts", params] as const,
  adminWinners: ["admin", "winners"] as const,
} as const;

/* ── Shared helpers ──────────────────────────────────────────────────────── */

/** Admin list responses arrive as `{ cats: [...], pagination }` etc. */
function buildAdminUrl(
  base: string,
  params: Record<string, string | number>,
): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === "all") continue;
    q.set(key, String(value));
  }
  return `${base}?${q.toString()}`;
}

/* ── Public site queries ─────────────────────────────────────────────────── */

export function useCats() {
  return useQuery({
    queryKey: queryKeys.cats,
    queryFn: () => getData<Cat[]>("/api/cats"),
  });
}

/**
 * Server-side search + filtering of the public cat listing.
 * The backend applies search (name/breed), availability, breed and gender;
 * the frontend debounces the search box and passes settled values here.
 */
export function useFilteredCats(params: {
  search?: string;
  availability?: string;
  breed?: string;
  gender?: string;
}) {
  const p = {
    search: params.search || "",
    availability: params.availability || "all",
    breed: params.breed || "all",
    gender: params.gender || "all",
    limit: 50,
  };
  const url = buildAdminUrl("/api/cats", p);
  return useQuery({
    queryKey: ["cats", "filtered", p],
    queryFn: () => getData<Cat[] | { cats: Cat[] }>(url),
    // Keep showing the previous results while a new filter/search settles,
    // so typing never flashes a skeleton on every keystroke.
    placeholderData: keepPreviousData,
  });
}

export function useWinners() {
  return useQuery({
    queryKey: queryKeys.winners,
    queryFn: () => getData<Winner[]>("/api/winners"),
  });
}

export function useContent() {
  return useQuery({
    queryKey: queryKeys.content,
    queryFn: () => getData<WebsiteContent>("/api/content"),
  });
}

/** Public booking list (used by the dashboard overview). */
export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: () => getData<Booking[]>("/api/bookings"),
  });
}

/* ── Admin queries ───────────────────────────────────────────────────────── */

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: () => getData<DashboardStats>("/api/admin/stats"),
  });
}

export function useAdminCats(params: {
  page: number;
  availability?: string;
  search?: string;
}) {
  const p = { page: params.page, limit: 10, availability: params.availability || "all", search: params.search || "" };
  const url = buildAdminUrl("/api/admin/cats", p);
  return useQuery({
    queryKey: queryKeys.adminCats(p),
    queryFn: () => getData<Cat[] | { cats: Cat[]; pagination?: Pagination }>(url),
    placeholderData: keepPreviousData,
  });
}

export function useAdminBookings(params: {
  page: number;
  status?: string;
  search?: string;
}) {
  const p = { page: params.page, limit: 10, status: params.status || "all", search: params.search || "" };
  const url = buildAdminUrl("/api/admin/bookings", p);
  return useQuery({
    queryKey: queryKeys.adminBookings(p),
    queryFn: () =>
      getData<Booking[] | { bookings: Booking[]; pagination?: Pagination }>(url),
    placeholderData: keepPreviousData,
  });
}

export function useAdminContacts(params: {
  page: number;
  status?: string;
  search?: string;
}) {
  const p = { page: params.page, limit: 10, status: params.status || "all", search: params.search || "" };
  const url = buildAdminUrl("/api/admin/contacts", p);
  return useQuery({
    queryKey: queryKeys.adminContacts(p),
    queryFn: () =>
      getData<ContactMessage[] | { contacts: ContactMessage[]; pagination?: Pagination }>(url),
    placeholderData: keepPreviousData,
  });
}

export function useAdminWinners() {
  return useQuery({
    queryKey: queryKeys.adminWinners,
    queryFn: () => getData<Winner[] | { winners: Winner[] }>("/api/admin/winners"),
  });
}

/* ── Invalidation helpers ────────────────────────────────────────────────── */

function invalidateCats(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["admin", "cats"] });
  qc.invalidateQueries({ queryKey: queryKeys.cats });
  qc.invalidateQueries({ queryKey: queryKeys.adminStats });
}

function invalidateWinners(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.adminWinners });
  qc.invalidateQueries({ queryKey: queryKeys.winners });
}

function invalidateBookings(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
  qc.invalidateQueries({ queryKey: queryKeys.bookings });
  qc.invalidateQueries({ queryKey: queryKeys.adminStats });
}

function invalidateContacts(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["admin", "contacts"] });
  qc.invalidateQueries({ queryKey: queryKeys.adminStats });
}

/* ── Mutations ───────────────────────────────────────────────────────────── */

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => postData("/api/bookings", payload),
    onSuccess: () => invalidateBookings(qc),
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => postData("/api/contacts", payload),
    onSuccess: () => invalidateContacts(qc),
  });
}

export function useSaveCat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: Record<string, unknown> }) =>
      id ? patchData(`/api/cats/${id}`, payload) : postData("/api/cats", payload),
    onSuccess: () => invalidateCats(qc),
  });
}

export function useDeleteCat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteData(`/api/cats/${id}`),
    onSuccess: () => invalidateCats(qc),
  });
}

export function useToggleCatStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CatStatus }) =>
      patchData(`/api/cats/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["admin", "cats"] });
      const snapshot = qc.getQueriesData<Cat[] | { cats?: Cat[] }>({ queryKey: ["admin", "cats"] });
      qc.setQueriesData<Cat[] | { cats?: Cat[] }>({ queryKey: ["admin", "cats"] }, (old) => {
        if (!old) return old;
        const patch = (c: Cat) => (c._id === id ? { ...c, status } : c);
        return Array.isArray(old) ? old.map(patch) : old.cats ? { ...old, cats: old.cats.map(patch) } : old;
      });
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => {
        qc.setQueriesData<Cat[] | { cats?: Cat[] }>({ queryKey: key }, () => data);
      });
    },
    onSettled: () => invalidateCats(qc),
  });
}

export function useSaveWinner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: Record<string, unknown> }) =>
      id ? patchData(`/api/winners/${id}`, payload) : postData("/api/winners", payload),
    onSuccess: () => invalidateWinners(qc),
  });
}

export function useDeleteWinner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteData(`/api/winners/${id}`),
    onSuccess: () => invalidateWinners(qc),
  });
}

export function useToggleWinnerActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      patchData(`/api/winners/${id}`, { isActive }),
    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: queryKeys.adminWinners });
      const snapshot = qc.getQueriesData<Winner[] | { winners?: Winner[] }>({
        queryKey: queryKeys.adminWinners,
      });
      qc.setQueriesData<Winner[] | { winners?: Winner[] }>({ queryKey: queryKeys.adminWinners }, (old) => {
        if (!old) return old;
        const patch = (w: Winner) => (w._id === id ? { ...w, isActive } : w);
        return Array.isArray(old) ? old.map(patch) : old.winners ? { ...old, winners: old.winners.map(patch) } : old;
      });
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => {
        qc.setQueriesData<Winner[] | { winners?: Winner[] }>({ queryKey: key }, () => data);
      });
    },
    onSettled: () => invalidateWinners(qc),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      patchData(`/api/bookings/${id}`, { status }),
    onSuccess: () => invalidateBookings(qc),
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteData(`/api/bookings/${id}`),
    onSuccess: () => invalidateBookings(qc),
  });
}

export function useUpdateContactStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessageStatus }) =>
      patchData(`/api/admin/contacts/${id}`, { status }),
    onSuccess: () => invalidateContacts(qc),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteData(`/api/admin/contacts/${id}`),
    onSuccess: () => invalidateContacts(qc),
  });
}

export function useSaveContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => patchData("/api/content", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.content });
    },
  });
}

