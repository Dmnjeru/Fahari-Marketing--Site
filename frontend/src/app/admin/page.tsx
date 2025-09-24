/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// frontend/src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosAuth from "../../lib/axiosAuth";
import AdminLayoutClient from "./AdminLayoutClient";
import { useRouter } from "next/navigation";

interface DashboardData {
  totalJobs: number;
  totalApplications: number;
  totalProducts: number;
  totalBlogs: number;
}

export default function AdminPage() {
  const router = useRouter();

  const [adminVerified, setAdminVerified] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(true);

  // 🔹 Check session at mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setVerifying(true);
        await axiosAuth.get("/api/admin/me", { withCredentials: true });
        setAdminVerified(true);
      } catch {
        setAdminVerified(false);
      } finally {
        setVerifying(false);
      }
    };
    checkSession();
  }, []);

  // 🔹 Dashboard query
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      // ✅ Use actual backend routes
      const [jobsRes, appsRes, productsRes, blogsRes] = await Promise.all([
        axiosAuth.get<{ count: number }>("/api/careers/jobs"), // returns array
        axiosAuth.get<{ count: number }>("/api/careers/applications/count"),
        axiosAuth.get("/api/products"), // returns array of products
        axiosAuth.get("/api/analytics/top-blogs"), // returns array of blogs
      ]);

      return {
        totalJobs: Array.isArray(jobsRes.data) ? jobsRes.data.length : jobsRes.data.count ?? 0,
        totalApplications: appsRes.data?.count ?? 0,
        totalProducts: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
        totalBlogs: Array.isArray(blogsRes.data) ? blogsRes.data.length : 0,
      };
    },
    enabled: adminVerified,
    refetchInterval: 5000, // auto refresh every 5s
  });

  // 🔹 Login handler (keep design unchanged)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Email and password are required");
      return;
    }

    try {
      setLoginLoading(true);
      const res = await axiosAuth.post(
        "/api/admin/login",
        { email: loginEmail.trim(), password: loginPassword },
        { withCredentials: true }
      );

      if (!res.data?.success) {
        setLoginError(res.data?.message || "Login failed");
        return;
      }

      await axiosAuth.get("/api/admin/me", { withCredentials: true });
      setAdminVerified(true);
      setLoginEmail("");
      setLoginPassword("");
    } catch (err: unknown) {
      setLoginError(
        (err as any)?.response?.data?.message ??
          (err as Error).message ??
          "Unexpected error"
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // 🔹 Logout handler
  const handleLogout = async () => {
    try {
      await axiosAuth.post("/api/admin/logout", {}, { withCredentials: true });
    } catch {
      // ignore
    } finally {
      setAdminVerified(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Verifying session...
      </div>
    );
  }

  if (!adminVerified) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-100 p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
          aria-label="Admin login form"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

          {loginError && (
            <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">
              {loginError}
            </div>
          )}

          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
            autoComplete="username"
          />

          <label className="block mb-2 font-medium">Password</label>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full p-2 border rounded mb-6"
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loginLoading}
            className={`w-full bg-blue-600 text-white p-2 rounded ${
              loginLoading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {loginLoading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <AdminLayoutClient onLogout={handleLogout}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {isLoading && <p className="text-gray-500">Loading dashboard...</p>}
        {isError && (
          <p className="text-red-500 mb-4">
            Failed to load dashboard. {(error as Error).message}
          </p>
        )}

        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6 flex flex-col items-start">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">
                Total Jobs
              </h2>
              <span className="text-3xl font-bold text-blue-600">
                {dashboardData.totalJobs}
              </span>
            </div>

            <div className="bg-white shadow rounded-lg p-6 flex flex-col items-start">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">
                Total Applications
              </h2>
              <span className="text-3xl font-bold text-green-600">
                {dashboardData.totalApplications}
              </span>
            </div>

            <div className="bg-white shadow rounded-lg p-6 flex flex-col items-start">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">
                Total Products
              </h2>
              <span className="text-3xl font-bold text-purple-600">
                {dashboardData.totalProducts}
              </span>
            </div>

            <div className="bg-white shadow rounded-lg p-6 flex flex-col items-start">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">
                Total Blogs
              </h2>
              <span className="text-3xl font-bold text-pink-600">
                {dashboardData.totalBlogs}
              </span>
            </div>

            <div className="bg-white shadow rounded-lg p-6 flex flex-col items-start col-span-full">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">
                Quick Actions
              </h2>
              <ul className="text-gray-700 list-disc list-inside">
                <li>Create Job</li>
                <li>Manage Applications</li>
                <li>Edit Pages</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutClient>
  );
}
