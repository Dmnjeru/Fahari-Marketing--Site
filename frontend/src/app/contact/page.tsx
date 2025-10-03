/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/contact-page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";

type LoadStatus = "loading" | "ok" | "error";
type UnknownRecord = Record<string, unknown>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

class HTTPError extends Error {
  details?: UnknownRecord;
}

/**
 * Contact / Quote page component
 */
export default function ContactPage() {
  /* ---------------------- Slideshow config ---------------------- */
  const slides = useMemo(
    () => [
      "/images/contact/slide-1.jpg",
      "/images/contact/slide-2.jpg",
      "/images/contact/slide-3.jpg",
      "/images/contact/slide-4.jpg",
      "/images/contact/slide-5.jpg",
    ],
    []
  );

  const SLIDE_MS = 5000; // ms
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState<LoadStatus[]>(
    () => new Array(slides.length).fill("loading") as LoadStatus[]
  );

  // Preload images + safe unmount
  useEffect(() => {
    let mounted = true;
    slides.forEach((src, i) => {
      const img = new window.Image();
      img.onload = () => {
        if (!mounted) return;
        setStatus((prev) => {
          const next = [...prev];
          next[i] = "ok";
          return next;
        });
      };
      img.onerror = () => {
        if (!mounted) return;
        setStatus((prev) => {
          const next = [...prev];
          next[i] = "error";
          return next;
        });
      };
      img.src = src;
    });
    return () => {
      mounted = false;
    };
  }, [slides]);

  // Autoplay
  useEffect(() => {
    if (slides.length === 0) return;
    const id = window.setInterval(() => {
      setActive((idx) => (idx + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  /* ---------------------- Helpers ---------------------- */
  async function postJson<T = UnknownRecord>(url: string, body: unknown): Promise<T> {
    const target = url.startsWith("http") ? url : `${API_BASE}${url}`;
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: UnknownRecord = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || res.statusText || (res.ok ? "OK" : "Request failed") };
    }

    if (!res.ok) {
      const err = new HTTPError((data && (data.message as string)) || `Request failed with status ${res.status}`);
      err.details = data;
      throw err;
    }

    return data as T;
  }

  /* ---------------------- Contact Form State ---------------------- */
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccessMessage, setContactSuccessMessage] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
    setContactError(null);
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (contactSubmitting) return;

    setContactError(null);
    setContactSuccessMessage(null);

    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactError("Please fill in all required fields.");
      return;
    }

    setContactSubmitting(true);
    try {
      const payload = { ...contactForm, type: "contact" };
      const data = await postJson<{ success?: boolean; message?: string }>("/api/contact", payload);
      setContactSuccessMessage(data?.message ?? "Message sent — thank you!");
      setContactForm({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setContactSuccessMessage(null), 6000);
    } catch (err: unknown) {
      if (err instanceof HTTPError) {
        const details = err.details;
        // server validation errors commonly come back as { errors: [...] }
        const serverErrors = details?.errors;
        if (Array.isArray(serverErrors) && serverErrors.length > 0 && (serverErrors[0] as any).msg) {
          setContactError(String((serverErrors[0] as any).msg));
        } else if (details?.message) {
          setContactError(String(details.message));
        } else {
          setContactError(err.message);
        }
      } else if (err instanceof Error) {
        setContactError(err.message);
      } else {
        setContactError("Something went wrong. Please try again.");
      }
    } finally {
      setContactSubmitting(false);
    }
  };

  /* ---------------------- Quote Form State ---------------------- */
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    products: "",
    notes: "",
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccessMessage, setQuoteSuccessMessage] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const handleQuoteChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuoteForm((prev) => ({ ...prev, [name]: value }));
    setQuoteError(null);
  };

  const handleQuoteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (quoteSubmitting) return;

    setQuoteError(null);
    setQuoteSuccessMessage(null);

    if (!quoteForm.name.trim() || !quoteForm.email.trim() || !quoteForm.products.trim()) {
      setQuoteError("Please fill in all required fields.");
      return;
    }

    setQuoteSubmitting(true);
    try {
      // Backend currently expects `message` (contact route validation).
      // Build a `message` combining products + notes so the same handler accepts quote.
      const builtMessage = `Products/Request:\n${quoteForm.products.trim()}\n\nNotes:\n${quoteForm.notes?.trim() || "N/A"}`;

      const payload = {
        name: quoteForm.name,
        email: quoteForm.email,
        phone: quoteForm.phone || "",
        products: quoteForm.products,
        notes: quoteForm.notes || "",
        type: "quote",
        // include message to satisfy validation that requires message
        message: builtMessage,
      };

      const data = await postJson<{ success?: boolean; message?: string }>("/api/contact", payload);
      setQuoteSuccessMessage(data?.message ?? "Quote request submitted!");
      setQuoteForm({ name: "", email: "", phone: "", products: "", notes: "" });
      setTimeout(() => setQuoteSuccessMessage(null), 6000);
    } catch (err: unknown) {
      if (err instanceof HTTPError) {
        const details = err.details;
        const serverErrors = details?.errors;
        if (Array.isArray(serverErrors) && serverErrors.length > 0 && (serverErrors[0] as any).msg) {
          setQuoteError(String((serverErrors[0] as any).msg));
        } else if (details?.message) {
          setQuoteError(String(details.message));
        } else {
          setQuoteError(err.message);
        }
      } else if (err instanceof Error) {
        setQuoteError(err.message);
      } else {
        setQuoteError("Something went wrong. Please try again.");
      }
    } finally {
      setQuoteSubmitting(false);
    }
  };

  /* ---------------------- Render ---------------------- */
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero */}
      <section className="relative h-[70vh] md:h-[60vh] overflow-hidden text-white">
        <div className="absolute inset-0">
          {slides.map((src, i) => {
            const isActive = i === active;
            const s = status[i];
            return s === "ok" ? (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover transition-opacity duration-1000 ease-linear ${isActive ? "opacity-100" : "opacity-0"}`}
                onError={() => setStatus((prev) => { const next = [...prev]; next[i] = "error"; return next; })}
              />
            ) : (
              <div
                key={`${src}-fallback`}
                className={`absolute inset-0 bg-sky-200 transition-opacity duration-1000 ease-linear ${isActive ? "opacity-100" : "opacity-0"}`}
              />
            );
          })}
        </div>

        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Get in Touch</h1>
          <p className="max-w-2xl mx-auto text-lg opacity-95 drop-shadow-md">
            We’d love to hear from you. Whether it’s a question, feedback, or a bulk order inquiry, reach out and we’ll respond quickly.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact-form" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition">Contact Us</a>
            <a href="#get-quote" className="px-6 py-3 bg-white text-green-700 font-semibold rounded-lg shadow hover:bg-gray-100 transition">Get a Quote</a>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="max-w-5xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <form onSubmit={handleContactSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-4">
            {contactSuccessMessage && <div role="status" aria-live="polite" className="text-green-700 bg-green-100 p-3 rounded-md">{contactSuccessMessage}</div>}
            {contactError && <div role="alert" className="text-red-700 bg-red-100 p-3 rounded-md">{contactError}</div>}

            <div>
              <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={contactForm.name} onChange={handleContactChange} placeholder="Your full name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={contactForm.email} onChange={handleContactChange} placeholder="you@example.com" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" name="phone" value={contactForm.phone} onChange={handleContactChange} placeholder="+254 700 000 000" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message <span className="text-red-500">*</span></label>
              <textarea name="message" value={contactForm.message} onChange={handleContactChange} placeholder="Write your message here..." rows={5} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" required />
            </div>

            <button type="submit" disabled={contactSubmitting} className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition disabled:opacity-60">
              {contactSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div className="hidden md:flex justify-center items-center">
            <Image src="/contact-illustration.png" alt="Contact Fahari Yoghurt" width={420} height={420} className="rounded-2xl shadow-lg object-cover" />
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="get-quote" className="bg-green-50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-bold text-green-700">Request a Quote</h2>
          <p className="text-gray-600 mt-2">Planning a bulk order? Share your details and we’ll send a custom quotation.</p>
        </div>

        <form onSubmit={handleQuoteSubmit} className="bg-white p-8 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {quoteSuccessMessage && <div className="col-span-2 text-green-700 bg-green-100 p-3 rounded-md" role="status" aria-live="polite">{quoteSuccessMessage}</div>}
          {quoteError && <div className="col-span-2 text-red-700 bg-red-100 p-3 rounded-md" role="alert">{quoteError}</div>}

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input type="text" name="name" value={quoteForm.name} onChange={handleQuoteChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input type="email" name="email" value={quoteForm.email} onChange={handleQuoteChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" name="phone" value={quoteForm.phone} onChange={handleQuoteChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Products & Sizes *</label>
            <textarea name="products" value={quoteForm.products} onChange={handleQuoteChange} rows={3} placeholder="e.g., 100 bottles of Fahari Vanilla 250ml" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" required />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea name="notes" value={quoteForm.notes} onChange={handleQuoteChange} rows={3} placeholder="Delivery location, preferred dates, etc." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" />
          </div>

          <button type="submit" disabled={quoteSubmitting} className="col-span-2 w-full py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition disabled:opacity-60">
            {quoteSubmitting ? "Submitting..." : "Submit Quote Request"}
          </button>
        </form>
      </section>
    </main>
  );
}
