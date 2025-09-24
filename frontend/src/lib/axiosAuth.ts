// frontend/src/lib/axiosAuth.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestHeaders } from "axios";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, ""); // remove trailing slash
const ACCESS_TOKEN_KEY = "fahari_access_token";

/* ---------------------- Token Helpers ---------------------- */
function getAccessToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null) {
  try {
    if (typeof window === "undefined") return;
    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function clearAccessToken() {
  setAccessToken(null);
}

/* ---------------------- Axios Instance ---------------------- */
const axiosAuth: AxiosInstance = axios.create({
  baseURL: API_BASE || undefined,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------------- Request Interceptor ---------------------- */
axiosAuth.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

/* ---------------------- Response Interceptor ---------------------- */
axiosAuth.interceptors.response.use(
  (resp) => resp,
  async (err: AxiosError) => {
    const originalRequest = err.config as (typeof err.config & { _retry?: boolean }) | undefined;
    if (!originalRequest) return Promise.reject(err);

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call backend refresh endpoint
        const refreshRes = await axios.post(
          `${API_BASE}/api/admin/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes?.data?.token as string | undefined;

        if (newToken) {
          setAccessToken(newToken);

          // Attach new token and retry request
          originalRequest.headers = (originalRequest.headers ?? {}) as AxiosRequestHeaders;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          return axiosAuth.request(originalRequest);
        } else {
          clearAccessToken();
          if (typeof window !== "undefined") {
            window.location.href = "/admin/login";
          }
          return Promise.reject(err);
        }
      } catch (refreshError) {
        clearAccessToken();
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default axiosAuth;
