// frontend/src/app/admin/AdminLayoutClient.tsx
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axiosAuth from "../../../lib/axiosAuth";

interface AdminLayoutClientProps {
  children: ReactNode;
}

export default function AdminLayoutClient({
  children,
}: AdminLayoutClientProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Jobs", href: "/admin/jobs" },
    { label: "Applications", href: "/admin/applications" },
    { label: "Blogs", href: "/admin/blogs" },
  ];

  // Verify authentication
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const verify = async () => {
      try {
        setChecking(true);
        await axiosAuth.get("/api/admin/me", {
          withCredentials: true,
          signal: controller.signal,
        });
        if (mounted) setAuthenticated(true);
      } catch {
        if (mounted) {
          setAuthenticated(false);
          const isLoginPath =
            pathname === "/admin/login" || pathname === "/admin/login/";
          if (!isLoginPath) {
            try {
              router.push("/admin/login");
            } catch {
              // swallow router errors in early render phases
            }
          }
        }
      } finally {
        if (mounted) setChecking(false);
      }
    };

    verify();

    return () => {
      mounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axiosAuth.post("/api/admin/logout", {}, { withCredentials: true });
    } catch {
      // Even if server call fails, clear client state
    } finally {
      localStorage.removeItem("authToken"); // if you use localStorage tokens
      setAuthenticated(false);
      router.push("/admin/login");
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Checking authentication…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Redirecting…
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-gray-100 text-black">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r shadow-md transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:inset-auto`}
        >
          {/* Logo / Header */}
          <div className="h-16 flex items-center justify-center font-bold text-2xl border-b bg-gray-50">
            Admin Panel
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors 
                    ${
                      active
                        ? "bg-violet-100 font-semibold text-violet-700"
                        : "hover:bg-gray-100"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="mt-6 w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              aria-label="Logout"
              type="button"
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen md:pl-64">
          {/* Top navbar (mobile only) */}
          <header className="h-16 flex items-center justify-between px-4 bg-white border-b shadow-sm md:hidden">
            <div className="font-bold text-lg">Admin Panel</div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Toggle Sidebar"
              type="button"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
