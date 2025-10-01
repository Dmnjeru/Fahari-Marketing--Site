// frontend/src/app/api/_smtp-test.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Proxy endpoint that triggers the backend SMTP test endpoint.
 * - POST only
 * - Expects no body (the proxied backend endpoint will run the actual SMTP check)
 *
 * Env:
 * - NEXT_PUBLIC_API_URL (preferred) OR BACKEND_API_URL
 *   e.g. https://api.faharidairies.co.ke
 */

type Payload = {
  ok: boolean;
  info?: unknown;
  error?: string;
  preview?: string;
};

const BACKEND_API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  "https://api.faharidairies.co.ke";

function mask(s?: string): string {
  if (!s) return "MISSING";
  if (s.length <= 8) return s[0] + "***" + s.slice(-1);
  return s.slice(0, 3) + "..." + s.slice(-3);
}

function formatUnknownError(err: unknown): string {
  if (!err) return String(err);
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err as Record<string, unknown>);
  } catch {
    return String(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Payload>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Masked env-presence logging (no secrets printed)
  try {
    console.log("=== Forwarding SMTP test to backend ===");
    console.log("Backend URL:", BACKEND_API);
    console.log("Env presence (masked):", {
      NEXT_PUBLIC_API_URL: mask(process.env.NEXT_PUBLIC_API_URL),
      BACKEND_API_URL: mask(process.env.BACKEND_API_URL),
      SMTP_HOST_present: Boolean(process.env.SMTP_HOST),
      SMTP_USER_present: Boolean(process.env.SMTP_USER),
      NODE_ENV: process.env.NODE_ENV ?? "undefined",
    });
  } catch {
    // ignore any logging failures
  }

  const url = new URL("/api/_smtp-test", BACKEND_API).toString();

  try {
    const backendResp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // If you use an internal secret header, add it here:
        // "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
      },
    });

    const text = await backendResp.text();
    let data: unknown = undefined;

    if (text) {
      // parse JSON if possible; assign to `unknown`
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = { message: text };
      }
    } else {
      data = {};
    }

    if (!backendResp.ok) {
      console.error(
        "Backend SMTP test returned non-OK:",
        backendResp.status,
        typeof data === "object" ? data : String(data)
      );
      const errMsg =
        (data && typeof data === "object" && "error" in (data as Record<string, unknown>)
          ? String((data as Record<string, unknown>).error)
          : (data && typeof data === "object" && "message" in (data as Record<string, unknown>)
              ? String((data as Record<string, unknown>).message)
              : `Backend returned status ${backendResp.status}`));
      return res.status(502).json({ ok: false, error: errMsg });
    }

    // Success: forward backend info (unknown) to caller
    return res.status(200).json({ ok: true, info: data });
  } catch (err: unknown) {
    const msg = formatUnknownError(err);
    console.error("Failed to call backend SMTP test endpoint:", msg);
    return res.status(500).json({ ok: false, error: msg });
  }
}
