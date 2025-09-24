// frontend/src/app/metadata.ts
// Server-only metadata for Next.js App Router

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://fahariyoghurt.co.ke"),
  title: "Fahari Yoghurt – Pure, Healthy, Delicious",
  description:
    "Fahari Yoghurt offers the purest, healthiest and most delicious yoghurt products in Kenya. Explore our flavours and enjoy the taste of tradition with modern freshness.",
  keywords: [
    "Fahari",
    "Yoghurt",
    "Kenya",
    "Fresh yoghurt",
    "Dairy",
    "Vanilla yoghurt",
  ],
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Fahari Yoghurt",
    description:
      "Pure, healthy and delicious yoghurt crafted with care. Explore our products today.",
    url: "https://fahariyoghurt.co.ke",
    siteName: "Fahari Yoghurt",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Fahari Yoghurt",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fahari Yoghurt – Pure, Healthy, Delicious",
    description:
      "Pure, healthy and delicious yoghurt crafted with care. Explore our products today.",
    images: ["/preview.png"],
  },
};
