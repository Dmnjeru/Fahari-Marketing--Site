// frontend/src/app/layout.tsx
"use client"; // Needed because we are using a client component (QueryProvider)

import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import QueryProvider from "./QueryProvider"; // make sure this path is correct

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cssVars = `
    :root {
      --brand-primary: #1d60a6;
      --brand-pink: #ff6fa6;
    }

    .nav-link {
      transition: box-shadow 0.18s ease, transform 0.12s ease;
      border-radius: 9999px;
      padding: 0.25rem 0.6rem;
    }

    .nav-link:hover {
      box-shadow: 0 6px 20px rgba(29, 96, 166, 0.12);
      transform: translateY(-1px);
    }

    .nav-link.active {
      box-shadow: 0 0 18px rgba(29, 96, 166, 0.25);
      background: rgba(29, 96, 166, 0.06);
      color: var(--brand-primary);
    }

    .footer-link {
      color: inherit;
    }

    .nav-link:focus,
    .footer-link:focus {
      outline: 3px solid rgba(29, 96, 166, 0.14);
      outline-offset: 2px;
    }
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Fahari Yoghurt",
    url: "https://fahariyoghurt.co.ke",
    logo: "https://fahariyoghurt.co.ke/preview.png",
    description: "Pure, healthy and delicious yoghurt made in Kenya.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://fahariyoghurt.co.ke" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="keywords"
          content="Fahari, Yoghurt, Kenya, Fresh yoghurt, Dairy, Vanilla yoghurt"
        />
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className} style={{ backgroundColor: "#f8fafc" }}>
        {/* Wrap your app with QueryProvider */}
        <QueryProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
