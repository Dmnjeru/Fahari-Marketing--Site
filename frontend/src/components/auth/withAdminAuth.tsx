// frontend/src/components/auth/withAdminAuth.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosAuth from "@/lib/axiosAuth";

/**
 * withAdminAuth HOC
 * - Verifies session using GET /api/admin/me
 * - If authenticated -> renders WrappedComponent
 * - If not -> redirects to /admin/login (replace)
 *
 * Notes:
 * - Relies on axiosAuth to attach Authorization header (or to perform refresh logic).
 * - Keeps a "Checking session..." loading state to avoid layout flash.
 */
export default function withAdminAuth<P extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedAdminPage(props: P) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      let mounted = true;

      async function verify() {
        try {
          setChecking(true);
          // axiosAuth should perform refresh if needed via its interceptor
          await axiosAuth.get("/api/admin/me", { withCredentials: true });
          if (!mounted) return;
          setAuthorized(true);
        } catch {
          // not authenticated => navigate to login
          if (!mounted) return;
          setAuthorized(false);
          // push to login page (replace so back doesn't leak)
          router.replace("/admin/login");
        } finally {
          if (!mounted) return;
          setChecking(false);
        }
      }

      verify();

      return () => {
        mounted = false;
      };
    }, [router]);

    if (checking) {
      return (
        <div className="flex items-center justify-center h-screen text-gray-500">
          Checking admin session...
        </div>
      );
    }

    // if not authorized, we've already redirected — render nothing to avoid flash
    if (!authorized) return null;

    return <WrappedComponent {...props} />;
  };
}
