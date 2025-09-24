// frontend/src/app/components/Navbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
  { href: "/careers", label: "Careers" },
  { href: "/faq", label: "FAQ" },
  { href: "/recipes", label: "Recipes" },
  { href: "/admin", label: "Admin" },
];

const normalize = (p: string) => (p === "/" ? "/" : p.replace(/\/$/, ""));

export default function Navbar() {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Fahari Yoghurt home"
          className="flex items-center gap-3"
        >
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--brand-primary)]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" fill="white" />
              <path
                d="M8.8 12.2c.6-2.3 3.4-2.6 4.6-1 1.1 1.4 2.6 1 3 .4"
                stroke="#1d60a6"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="font-bold text-lg"
            style={{ color: "var(--brand-primary)" }}
          >
            Fahari <span className="text-pink-500">Yoghurt</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden md:flex items-center gap-6"
          role="navigation"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = normalize(pathname) === normalize(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link text-sm font-medium px-3 py-2 rounded-md transition transform hover:bg-gray-100 hover:shadow-sm hover:-translate-y-0.5 ${
                  isActive ? "active" : "text-gray-700"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/contact"
            className="ml-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold bg-[var(--brand-primary)] shadow-md hover:shadow-lg transition"
            aria-label="Contact Fahari"
          >
            Contact Us
          </Link>
        </nav>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-3">
          {/* WhatsApp button */}
          <a
            href="https://wa.me/+254740918689"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M21.7 4.3a11.9 11.9 0 00-16.9 0l-.1.1C1.9 7.9 1.6 12 4 15.5L3 21l5.6-1.1c2.8 1.5 6.3 1 8.6-1.2a11.9 11.9 0 000-16.9z"
                fill="#25D366"
              />
              <path
                d="M17.4 14.2c-.3-.2-1.8-.9-2.1-1-.3-.2-.5-.3-.7.2s-.8 1-1 1.2c-.2.3-.4.3-.7.1-1.5-.7-2.5-1.7-3.4-3-.3-.5.3-.5.8-1 0 0 .5-.5.3-1.2-.3-.7-.8-1-1.1-1.2-.3-.2-.8-.2-1.5-.2-.7 0-1.9.3-2.9 1.4-1 1.1-1 2.6-1 3.1s.3 1.1.6 1.6c.3.5.8 1.2 1.7 1.8s2 1.6 3.5 2.1c1.9.6 2.7.6 3.4.5.7-.2 2.1-.9 2.4-1.7.2-.7.2-1.3.1-1.6-.1-.3-.4-.4-.7-.6z"
                fill="#fff"
              />
            </svg>
          </a>

          {/* Mobile menu button */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((s) => !s)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm px-4 py-4">
          <ul className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => {
              const isActive = normalize(pathname) === normalize(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block nav-link px-3 py-2 rounded-md transition transform hover:bg-gray-100 hover:shadow-sm hover:-translate-y-0.5 ${
                      isActive ? "active" : "text-gray-700"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/contact"
                className="mt-2 block w-full text-center px-4 py-2 rounded-full font-semibold text-white bg-[var(--brand-primary)] shadow-md hover:shadow-lg transition"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
