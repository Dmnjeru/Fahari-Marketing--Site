// frontend/src/lib/apiClient.ts
import axios from "axios";

/**
 * Production-ready axios client (TypeScript-safe)
 *
 * - withCredentials: true for httpOnly cookie auth
 * - single refresh attempt on 401 with request queueing
 * - no reliance on axios internal type exports (works with various axios versions)
 */

/* ------------------------ create axios instance ------------------------ */
const api = axios.create({
  baseURL: "/api",
  timeout: 20_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/* --------------------------- derived types ---------------------------- */
/**
 * Request config type as accepted by our instance's request method.
 * This avoids importing axios internal types and works reliably.
 */
type ReqConfig = Parameters<typeof api.request>[0];

/**
 * Response type returned from api.request(...) (inferred)
 */
type ApiResponse = ReturnType<typeof api.request> extends Promise<infer R> ? R : unknown;

/* -------------------------- queue structures -------------------------- */
type QueuedReq = {
  config: ReqConfig;
  resolve: (value: ApiResponse) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let refreshPromise: Promise<unknown> | null = null;
let requestQueue: QueuedReq[] = [];

/* --------------------------- helpers --------------------------------- */
/** Narrow an unknown error to shape that might have `response.status` */
function getResponseStatus(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null) {
    const maybe = err as { response?: { status?: unknown } };
    if (maybe.response && typeof maybe.response.status === "number") {
      return maybe.response.status;
    }
  }
  return undefined;
}

/* Process queued requests after refresh finishes.
   If `error` is provided, reject each queued request with that error.
   Otherwise retry each queued request and resolve/reject accordingly. */
async function processQueue(error?: unknown) {
  const queued = requestQueue;
  requestQueue = [];

  if (error) {
    for (const q of queued) {
      q.reject(error);
    }
    return;
  }

  // Retry each request in sequence (or concurrently if you prefer)
  await Promise.all(
    queued.map(async (q) => {
      try {
        const resp = await api.request(q.config);
        q.resolve(resp);
      } catch (err) {
        q.reject(err);
      }
    })
  );
}

/* ------------------------ interceptor logic -------------------------- */
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // Safely read config and status from unknown error
    const status = getResponseStatus(error);
    const cfg = (typeof error === "object" && error !== null && "config" in error)
      ? (error as { config: unknown }).config
      : undefined;

    // If no config present, just reject
    if (!cfg) return Promise.reject(error);

    // Cast config to our ReqConfig (we inferred this type from api.request)
    const originalConfig = cfg as ReqConfig & { _retry?: boolean };

    // Only handle 401 once per request
    if (status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      // If refresh is in progress, queue the request and return a Promise that will resolve/reject later
      if (isRefreshing) {
        return new Promise<ApiResponse>((resolve, reject) => {
          requestQueue.push({ config: originalConfig, resolve, reject });
        });
      }

      // Start refresh flow
      isRefreshing = true;
      refreshPromise = api
        .post("/auth/refresh")
        .then((r) => {
          // refresh succeeded
          isRefreshing = false;
          return r;
        })
        .catch((refreshErr) => {
          // refresh failed
          isRefreshing = false;
          throw refreshErr;
        });

      try {
        // Wait for refresh to finish
        await refreshPromise;
        // After refresh, retry queued requests (concurrently) and then retry the original request here
        await processQueue();
        return api.request(originalConfig);
      } catch (refreshErr) {
        // If refresh failed, reject queued requests with that error and bubble up
        await processQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        refreshPromise = null;
        isRefreshing = false;
      }
    }

    // Not a 401 or already retried -> forward error
    return Promise.reject(error);
  }
);

export default api;
