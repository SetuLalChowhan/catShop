import axios from "axios";
import { API_URL } from "./site";

/** Helper to unwrap standard backend response wrappers `{ cats: [...] }`, `{ cat }`, etc. */
function unwrapApiData<T>(raw: any): T {
  if (!raw || typeof raw !== "object") return raw as T;

  if (Array.isArray(raw.cats)) return raw.cats as T;
  if (raw.cat && typeof raw.cat === "object") return raw.cat as T;

  if (Array.isArray(raw.winners)) {
    if (raw.winnerOfMonth) {
      const monthWinner = { ...raw.winnerOfMonth, isWinnerOfMonth: true };
      const restWinners = raw.winners.filter((w: any) => w._id !== monthWinner._id);
      return [monthWinner, ...restWinners] as T;
    }
    return raw.winners as T;
  }

  if (Array.isArray(raw.contacts)) return raw.contacts as T;
  if (raw.contact && typeof raw.contact === "object") return raw.contact as T;
  if (raw.content && typeof raw.content === "object") return raw.content as T;
  if (Array.isArray(raw.bookings)) return raw.bookings as T;
  if (raw.booking && typeof raw.booking === "object") return raw.booking as T;
  if (raw.stats && typeof raw.stats === "object") return raw.stats as T;

  return raw as T;
}

/**
 * ── Server components ─────────────────────────────────────────────────────────
 * Fetches the backend directly (absolute URL). Throws on failure; callers
 * decide whether to degrade gracefully.
 */
export async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }

  const json = await res.json();
  const payload = json?.data ?? json;
  return unwrapApiData<T>(payload);
}

/**
 * Cached variant for static/ISR server components — fetch fresh data from the
 * backend at most every `revalidate` seconds, so public pages render real
 * content in the initial HTML without hitting the API on every request.
 */
export async function serverFetchCached<T>(
  path: string,
  revalidate = 60,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }

  const json = await res.json();
  const payload = json?.data ?? json;
  return unwrapApiData<T>(payload);
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: any;
  results?: number;
}

/**
 * ── Browser ───────────────────────────────────────────────────────────────────
 * Same-origin axios client: `/api/*` is proxied to the backend by Next.js,
 * so cookies just work. Set NEXT_PUBLIC_API_URL to an absolute URL instead
 * if you deploy the API separately.
 */
export const api = axios.create({
  baseURL: "",
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("catshop_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Expired/invalid session on admin calls → drop the stored session and
    // send the admin back to the login page. Failed login attempts (401 on
    // /api/auth/login) must NOT redirect — the form shows the error instead.
    const status = error?.response?.status;
    const url: string = error?.config?.url || "";
    if (status === 401 && !url.includes("/api/auth/login") && typeof window !== "undefined") {
      localStorage.removeItem("catshop_admin_user");
      localStorage.removeItem("catshop_admin_token");
      if (window.location.pathname.startsWith("/dashboard")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export async function getData<T>(path: string): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(path);
  const payload = data?.data ?? data;
  return unwrapApiData<T>(payload);
}

export async function postData<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(path, body);
  const payload = data?.data ?? data;
  return unwrapApiData<T>(payload);
}

export async function patchData<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<ApiResponse<T>>(path, body);
  const payload = data?.data ?? data;
  return unwrapApiData<T>(payload);
}

export async function deleteData<T>(path: string): Promise<T> {
  const { data } = await api.delete<ApiResponse<T>>(path);
  const payload = data?.data ?? data;
  return unwrapApiData<T>(payload);
}

/** Extract a readable message from an axios error. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}
