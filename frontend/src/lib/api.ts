// frontend/src/lib/api.ts
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosRequestHeaders,
} from "axios";

// -----------------------------------------------------------------------------
// Base URL (from env) - remove trailing slash if present
// -----------------------------------------------------------------------------
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

// -----------------------------------------------------------------------------
// Token helpers
// -----------------------------------------------------------------------------
const ACCESS_TOKEN_KEY = "fahari_access_token";

function getStoredToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token?: string | null) {
  try {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface ExtendedRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type QueuedRequest = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: ExtendedRequestConfig;
};

interface RefreshResponse {
  success?: boolean;
  data?: { token?: string } | null;
  token?: string | null;
}

// -----------------------------------------------------------------------------
// Axios instance
// -----------------------------------------------------------------------------
const api: AxiosInstance = axios.create({
  baseURL: API_BASE || undefined,
  withCredentials: true,
});

// -----------------------------------------------------------------------------
// Request interceptor: attach Authorization
// -----------------------------------------------------------------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }

    const token = getStoredToken();
    if (token) {
      (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------------------------------------------------
// Response interceptor: refresh-on-401 with queueing
// -----------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  for (const queued of failedQueue) {
    if (error) {
      queued.reject(error);
    } else {
      if (token && queued.config.headers) {
        (queued.config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
      }
      queued.resolve(api(queued.config));
    }
  }
  failedQueue = [];
};

api.interceptors.response.use(
  (resp) => resp,
  async (err: AxiosError) => {
    const originalRequest = err.config as ExtendedRequestConfig | undefined;
    if (!originalRequest) return Promise.reject(err);

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResp = await axios.post<RefreshResponse>(
          `${API_BASE}/api/admin/refresh`, // ✅ adjust if backend differs
          {},
          { withCredentials: true }
        );

        const refreshData = refreshResp.data;
        const newToken = refreshData?.data?.token ?? refreshData?.token ?? null;

        if (newToken && typeof newToken === "string") {
          storeToken(newToken);
        } else {
          storeToken(null);
          if (typeof window !== "undefined") {
            window.location.href = "/admin/login";
          }
          return Promise.reject(err);
        }

        const tokenToUse = getStoredToken();
        processQueue(null, tokenToUse ?? null);

        if (tokenToUse && originalRequest.headers) {
          (originalRequest.headers as AxiosRequestHeaders)["Authorization"] =
            `Bearer ${tokenToUse}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storeToken(null);
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
