// src/app/products-page/page.tsx
import type { Metadata } from "next";
import React from "react";
import ClientProducts, { type Product } from "@/components/products/ClientProducts";

/* ----------------------------- Metadata ------------------------------ */
export const metadata: Metadata = {
  title: "Products — Fahari Yoghurt",
  description:
    "Explore Fahari Yoghurt flavours — Vanilla, Strawberry, Mango, Kefir, Lemon Biscuit and Mala. Learn sizes and contact us to order.",
  openGraph: {
    title: "Fahari Yoghurt — Products",
    description:
      "Discover Fahari's fresh yoghurt flavours. Learn more about each variant and contact us today.",
    url: "https://fahariyoghurt.co.ke/products",
  },
};

/* ---------------------------- Product Data --------------------------- 
   Place your images in /public/products/
   Example:
   - /public/products/mango.jpg
   - /public/products/kefir.jpg
   - /public/products/lemon-biscuit.jpg
   - /public/products/vanilla.jpg
   - /public/products/strawberry.jpg
   - /public/products/mala.jpg
*/
const PRODUCTS: Product[] = [
  {
    id: "mango",
    name: "Fahari Mango",
    flavour: "Mango",
    sizes: ["100ml", "250ml", "500ml", "1L", "2L", "3L"],
    short: "Tropical mango — bright, fruity and refreshing.",
    description:
      "Ripe mango purée folded into smooth yoghurt for a sunny, tropical experience. Perfect chilled or blended into smoothies.",
    image: "/products/mango.jpg",
    alt: "Fahari Mango yoghurt",
    tags: ["seasonal", "tropical"],
  },
  {
    id: "kefir",
    name: "Fahari Kefir",
    flavour: "Kefir",
    sizes: ["100ml", "250ml", "500ml", "1L", "2L", "3L"],
    short: "Tangy, probiotic kefir for digestive wellness.",
    description:
      "Live cultures and a pleasantly tangy taste — Fahari Kefir supports gut health and is delicious with fruit or on its own.",
    image: "/products/kefir.jpg",
    alt: "Fahari Kefir bottle",
    tags: ["probiotic", "health"],
  },
  {
    id: "lemon-biscuit",
    name: "Fahari Lemon Biscuit",
    flavour: "Lemon Biscuit",
    sizes: ["100ml", "250ml", "500ml", "1L", "2L", "3L"],
    short: "Zesty lemon layered with biscuit crumbs — indulgent and bright.",
    description:
      "Creamy yoghurt with lemon zest and crunchy biscuit pieces — a delightful treat any time of day.",
    image: "/products/lemon-biscuit.jpg",
    alt: "Fahari Lemon Biscuit yoghurt",
    tags: ["dessert", "limited"],
  },
  {
    id: "vanilla",
    name: "Fahari Vanilla",
    flavour: "Vanilla",
    sizes: ["100ml", "250ml", "500ml", "1L", "2L", "3L"],
    short: "Smooth, classic vanilla — our signature favourite.",
    description:
      "Made with locally-sourced milk and natural vanilla, Fahari Vanilla is rich, smooth and perfect for breakfast or desserts.",
    image: "/products/vanilla.jpg",
    alt: "Fahari Vanilla yoghurt cup",
    tags: ["best-seller", "classic"],
  },
  {
    id: "strawberry",
    name: "Fahari Strawberry",
    flavour: "Strawberry",
    sizes: ["100ml", "250ml", "500ml", "1L", "2L", "3L"],
    short: "Fresh strawberry pieces, naturally sweet.",
    description:
      "Bursting with fruity strawberry pieces and lightly sweetened — great on cereal or as a snack.",
    image: "/products/strawberry.jpg",
    alt: "Fahari Strawberry yoghurt cup",
    tags: ["fruity"],
  },
  {
    id: "mala",
    name: "Fahari Mala",
    flavour: "Mala",
    sizes: ["100ml", "250ml", "500ml", "1L", "2L", "3L"],
    short: "Creamy traditional mala for a cultured taste.",
    description:
      "Traditional mala made with care — thick, tangy and full-bodied. Excellent as a side or in recipes.",
    image: "/products/mala.jpg",
    alt: "Fahari Mala yoghurt cup",
    tags: ["traditional"],
  },
];

/* ------------------------------- Page -------------------------------- */
export default function ProductsPage() {
return ( 
  <main className="min-h-screen bg-slate-50 text-gray-900">
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Our Products</h1>
        <p className="text-gray-700 mt-2">
          Explore Fahari’s handcrafted yoghurts — curious? Contact us to order or request samples.
        </p>
      </header>

      <ClientProducts products={PRODUCTS} />
    </div>
  </main>
);

}
