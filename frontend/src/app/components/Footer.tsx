"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";

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
        {/* Brand Section */}
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
                    className={`footer-link ${
                      isActive
                        ? "text-[var(--brand-primary)] font-semibold"
                        : "hover:text-[var(--brand-primary)] transition"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Social Media + Newsletter */}
        <section aria-label="Social media and newsletter">
          <h4 className="font-semibold text-gray-800">Connect with us</h4>
          <div className="flex gap-4 mt-3 text-2xl text-gray-700">
            <a
              href="https://wa.me/+254740918689"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:text-green-500 transition"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://www.instagram.com/fahariyoghurt/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-pink-500 transition"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.facebook.com/fahariyoghurt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-blue-600 transition"
            >
              <FaFacebook />
            </a>
            
<a
              href="https://www.tiktok.com/@fahari.yoghurt_dairy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Tiktok"
              className="hover:text-blue-600 transition"
            >
              <FaTiktok />
            </a>





            
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
