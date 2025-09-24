"use client";

import React, { useState } from "react";
import axios from "axios"; // removed unused AxiosError
import { useRouter } from "next/navigation";
import AdminLayoutClient from "../AdminLayoutClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BACKEND_URL}/api/admin/login`,
        { email: email.trim(), password },
        { withCredentials: true }
      );

      if (!res.data?.success) {
        setError(res.data?.message || "Login failed");
        return;
      }

      // Redirect to admin dashboard after login
      router.push("/admin");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Server error");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayoutClient>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
          aria-label="Admin login form"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>
          )}

          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
            autoComplete="username"
          />

          <label className="block mb-2 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-6"
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white p-2 rounded ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </AdminLayoutClient>
  );
}
