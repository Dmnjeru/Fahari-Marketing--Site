"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const normalize = (p: string) => (p === "/" ? "/" : p.replace(/\/$/, ""));

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/products", label: "Products" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/careers", label: "Careers" },
  ];

  if (!mounted) return null;

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo + Description */}
        <section aria-label="Fahari Yoghurt brand intro">
          <h3 className="text-xl font-bold text-[var(--brand-primary)]">
            Fahari<span className="text-pink-500">Yoghurt</span>
          </h3>
          <p className="mt-3 text-gray-600 text-sm leading-relaxed">
            Pure, healthy and delicious yoghurt made with love. Serving freshness to every Kenyan home.
          </p>
          <div className="mt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-white font-semibold shadow-md bg-[var(--brand-primary)] hover:opacity-90 transition"
            >
              Contact Us
            </Link>
          </div>
        </section>

        {/* Quick Links */}
        <nav aria-label="Footer quick links">
          <h4 className="font-semibold text-gray-800">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {navLinks.map((n) => {
              const isActive = normalize(pathname) === normalize(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={`footer-link ${isActive ? "text-[var(--brand-primary)] font-semibold" : "hover:text-[var(--brand-primary)] transition"}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Social + Newsletter */}
        <section aria-label="Social media and newsletter">
          <h4 className="font-semibold text-gray-800">Connect with us</h4>
          <div className="flex gap-4 mt-3">
            {/* WhatsApp */}
            <a
              href="https://wa.me/+254740918689"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:opacity-90"
            >
              {/* SVG remains unchanged */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21.7 4.3a11.9 11.9 0 00-16.9 0l-.1.1C1.9 7.9 1.6 12 4 15.5L3 21l5.6-1.1c2.8 1.5 6.3 1 8.6-1.2a11.9 11.9 0 000-16.9z" fill="#25D366"/>
                <path d="M17.4 14.2c-.3-.2-1.8-.9-2.1-1-.3-.2-.5-.3-.7.2s-.8 1-1 1.2c-.2.3-.4.3-.7.1-1.5-.7-2.5-1.7-3.4-3-.3-.5.3-.5.8-1 0 0 .5-.5.3-1.2-.3-.7-.8-1-1.1-1.2-.3-.2-.8-.2-1.5-.2-.7 0-1.9.3-2.9 1.4-1 1.1-1 2.6-1 3.1s.3 1.1.6 1.6c.3.5.8 1.2 1.7 1.8s2 1.6 3.5 2.1c1.9.6 2.7.6 3.4.5.7-.2 2.1-.9 2.4-1.7.2-.7.2-1.3.1-1.6-.1-.3-.4-.4-.7-.6z" fill="#fff"/>
              </svg>
            </a>

            {/* Instagram / TikTok / Facebook remain unchanged */}
            {/* ... */}
          </div>

          {/* Newsletter Form */}
          <div className="mt-6">
            <h5 className="text-sm font-semibold text-gray-800">Newsletter</h5>
            <p className="text-xs text-gray-600 mt-1">
              Get updates about new flavours and offers.
            </p>
            <form
              action="/api/newsletter"
              method="post"
              className="mt-3 flex gap-2"
              aria-label="Subscribe to Fahari newsletter"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="px-3 py-2 rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-semibold text-white bg-[var(--brand-primary)] hover:opacity-90 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Fahari Yoghurt. All rights reserved.
      </div>
    </footer>
  );
}
