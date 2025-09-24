// src/app/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';


const PHONE_WHATSAPP = '+254740918689';
const ORDER_APP_URL = 'https://app.faharidairies.co.ke/order';


// Fixed motion variants
const heroVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};


function Navbar() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" aria-label="Fahari Yoghurt home" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Fahari Yoghurt logo" width={48} height={48} priority />
            <span className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900">
              Fahari Yoghurt
            </span>
          </Link>
          <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <li><Link className="hover:text-slate-900" href="/products">Products</Link></li>
            <li><Link className="hover:text-slate-900" href="/recipes">Recipes</Link></li>
            <li><Link className="hover:text-slate-900" href="/about">About</Link></li>

            <li><Link className="hover:text-slate-900" href="/blog">Blog</Link></li>

            <li>
              <a
                href={`https://wa.me/${PHONE_WHATSAPP.replace(/\+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                className="ml-2 inline-block px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-yellow-400 text-white font-semibold shadow hover:scale-105 transform transition"
                href={ORDER_APP_URL}
                target="_blank"
                rel="noreferrer"
              >
                Order Now
              </a>
            </li>
          </ul>

          <div className="md:hidden flex items-center gap-3">
            <a
              href={`https://wa.me/${PHONE_WHATSAPP.replace(/\+/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700"
            >
              Chat
            </a>
            <a
              href={ORDER_APP_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow"
            >
              Order
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <motion.section initial="hidden" animate="show" variants={heroVariant} className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-20">
          <div>
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              Fresh. Local. Delightful.
            </motion.h1>
            <motion.p
              className="mt-6 text-lg text-slate-600 max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
            >
              Fahari Yoghurt is lovingly made from local milk, packed with natural flavour and goodness.
            </motion.p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={ORDER_APP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold shadow hover:scale-105 transition transform"
              >
                Order Now
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <Link href="/products" className="px-5 py-3 rounded-full border border-slate-200 hover:bg-slate-50">
                View Products
              </Link>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="rounded-3xl shadow-2xl overflow-hidden bg-white"
              >
                <Image
                  src="/hero-yoghurt.jpg"
                  alt="Pouring Fahari yoghurt with fresh fruit"
                  width={880}
                  height={600}
                  priority
                  className="object-cover w-full h-full"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ProductsPreview, Testimonials, CTASection, Footer remain unchanged
// Only motion variants are fixed as above

export default function Page() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-emerald-200">
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  );
}
