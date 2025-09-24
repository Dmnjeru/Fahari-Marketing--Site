// src/components/products/ClientProducts.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Product type
 */
export type Product = {
  id: string;
  name: string;
  flavour: string;
  sizes: string[];
  short: string;
  description?: string;
  image?: string;
  alt?: string;
  tags?: string[];
};

/* --------------------------- Placeholder Graphic --------------------------- */
function PlaceholderGraphic({ flavour }: { flavour: string }) {
  const initial = (flavour || "F").slice(0, 1).toUpperCase();
  const gradientId = `g-${initial}`;

  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fdf2f8" />
          <stop offset="60%" stopColor="#ffedd5" />
          <stop offset="100%" stopColor="#fff7ed" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="12" fill={`url(#${gradientId})`} />
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="54"
        fontWeight="700"
        fill="#1d60a6"
      >
        {initial}
      </text>
      <text
        x="50%"
        y="66%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fill="#6b7280"
      >
        {flavour}
      </text>
    </svg>
  );
}

/* --------------------------- Main Component --------------------------- */
export default function ClientProducts({ products }: { products: Product[] }) {
  const [query, setQuery] = React.useState("");
  const [flavourFilter, setFlavourFilter] = React.useState<string>("All");
  const [sizeFilter, setSizeFilter] = React.useState<string>("All");
  const [sortBy, setSortBy] = React.useState<string>("featured");
  const [selected, setSelected] = React.useState<Product | null>(null);

  // derive filters
  const flavours = React.useMemo(() => {
    const setF = new Set(products.map((p) => p.flavour));
    return ["All", ...Array.from(setF)];
  }, [products]);

  const sizes = React.useMemo(() => {
    const setS = new Set(products.flatMap((p) => p.sizes));
    return ["All", ...Array.from(setS)];
  }, [products]);

  // filter & sort
  const filtered = React.useMemo(() => {
    let list = products.slice();

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.short.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          p.flavour.toLowerCase().includes(q)
      );
    }

    if (flavourFilter !== "All") {
      list = list.filter((p) => p.flavour === flavourFilter);
    }

    if (sizeFilter !== "All") {
      list = list.filter((p) => p.sizes.includes(sizeFilter));
    }

    if (sortBy === "alpha") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "popular") {
      list.sort((a, b) => {
        const aHas = a.tags?.includes("best-seller") ? 0 : 1;
        const bHas = b.tags?.includes("best-seller") ? 0 : 1;
        return aHas - bHas;
      });
    }

    return list;
  }, [products, query, flavourFilter, sizeFilter, sortBy]);

  return (
    <section className="max-w-7xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center md:justify-between gap-4 mb-8">
        <div>
          <label className="sr-only" htmlFor="product-search">
            Search products
          </label>
          <input
            id="product-search"
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={flavourFilter}
            onChange={(e) => setFlavourFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
            aria-label="Filter by flavour"
          >
            {flavours.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
            aria-label="Filter by size"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg"
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="popular">Popular</option>
            <option value="alpha">A → Z</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((p) => (
          <motion.article
            key={p.id}
            layout
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl overflow-hidden"
            aria-labelledby={`product-${p.id}`}
          >
            <div className="relative w-full h-64">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.alt ?? p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <PlaceholderGraphic flavour={p.flavour} />
              )}
            </div>

            <div className="p-6">
              <h3 id={`product-${p.id}`} className="text-lg font-bold">
                {p.name}
              </h3>
              <p className="mt-2 text-slate-600 text-sm">{p.short}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <span
                    key={s}
                    className="text-xs text-slate-700 px-2 py-1 border rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setSelected(p)}
                  className="px-3 py-2 rounded-full border hover:bg-slate-50 text-sm"
                >
                  Quick view
                </button>

                <Link
                  href="/contact"
                  className="px-3 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Contact
                </Link>

                <a
                  href={`https://wa.me/+254740918689?text=${encodeURIComponent(
                    `Hi Fahari, I’m interested in ${p.name} — please advise on ordering.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-sm text-blue-600 hover:underline"
                >
                  WhatsApp →
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-slate-500 mt-10">
          No products match your criteria.
        </div>
      )}

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

/* --------------------------- Modal --------------------------- */
function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={onClose}
        aria-hidden
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="relative z-10 max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative w-full h-80 md:h-full">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.alt ?? product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <PlaceholderGraphic flavour={product.flavour} />
            )}
          </div>

          <div className="p-6 md:p-10">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="mt-2 text-slate-600">{product.description}</p>

            <div className="mt-4">
              <h4 className="text-sm font-semibold text-slate-700">
                Available sizes
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/contact"
                className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Contact Us
              </Link>
              <a
                href={`https://wa.me/+254740918689?text=${encodeURIComponent(
                  `Hi Fahari, I'm interested in ${product.name}. Please send order details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full border hover:bg-slate-50"
              >
                WhatsApp
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full border hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <p className="mt-6 text-xs text-slate-400">
              For pricing and delivery options, please contact us — we’d love to
              help you pick the right size and packaging.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
