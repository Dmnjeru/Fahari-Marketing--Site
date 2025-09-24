// frontend/src/lib/apiHelpers.ts
import api from "./apiClient";

/**
 * Typed API helpers for cleaner usage across the frontend.
 * You can use these with full TypeScript autocomplete.
 */

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<T>(url, { params });
  return res.data;
}

export async function post<T, B = unknown>(url: string, body?: B): Promise<T> {
  const res = await api.post<T>(url, body);
  return res.data;
}

export async function put<T, B = unknown>(url: string, body?: B): Promise<T> {
  const res = await api.put<T>(url, body);
  return res.data;
}

export async function del<T>(url: string): Promise<T> {
  const res = await api.delete<T>(url);
  return res.data;
}
