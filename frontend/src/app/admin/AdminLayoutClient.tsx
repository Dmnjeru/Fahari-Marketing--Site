// frontend/src/app/admin/AdminLayoutClient.tsx
"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface AdminLayoutClientProps {
  children: ReactNode;
  onLogout?: () => void;
}

export default function AdminLayoutClient({ children, onLogout }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // React Query client
  const [queryClient] = useState(() => new QueryClient());

  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Jobs", href: "/admin/jobs" },
    { label: "Applications", href: "/admin/applications" },
    { label: "Blogs", href: "/admin/blogs" },
  ];

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
                    ${active ? "bg-violet-100 font-semibold text-violet-700" : "hover:bg-gray-100"}`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Logout */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="mt-6 w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                <LogOut size={16} /> Logout
              </button>
            )}
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
