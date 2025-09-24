// frontend/src/app/recipe/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

/**
 * Sleek Recipes Page — compact, premium, 3D feel
 * - CSS 3D hero carousel (autoplay, pause on hover)
 * - Flip cards for recipes (hover / tap)
 * - Modal detail view
 * - Favorites (localStorage)
 *
 * Keep images in public/images/recipes/
 */

type Recipe = {
  id: string;
  title: string;
  product: string;
  image: string;
  description: string;
  servings?: string;
  ingredients: string[];
  steps: string[];
  tags?: string[];
};

const RECIPES: Recipe[] = [
  { id: "mango", title: "Fahari Mango Smoothie", product: "Fahari Mango", image: "/images/recipes/mango-smoothie.jpg", description: "Silky mango smoothie.", servings: "2", ingredients: ["1 cup Fahari Mango yoghurt", "1 cup diced mango", "1/2 cup milk", "Ice"], steps: ["Blend all.", "Serve chilled."], tags: ["drink", "breakfast"] },
  { id: "vanilla", title: "Vanilla Berry Parfait", product: "Vanilla", image: "/images/recipes/vanilla-parfait.jpg", description: "Creamy vanilla parfait.", servings: "1-2", ingredients: ["1 cup Fahari Vanilla yoghurt", "1/2 cup granola", "1/2 cup berries"], steps: ["Layer ingredients.", "Serve."], tags: ["snack"] },
  { id: "strawberry", title: "Strawberry Compote Bowl", product: "Strawberry", image: "/images/recipes/strawberry-compote.jpg", description: "Warm compote over yoghurt.", servings: "2", ingredients: ["2 cups strawberries","2 tbsp sugar","1 tsp lemon juice","1 cup Fahari Strawberry yoghurt"], steps: ["Cook berries.", "Serve over yoghurt."], tags: ["dessert"] },
  { id: "mala", title: "Mala Spiced Dip", product: "Mala", image: "/images/recipes/mala-dip.jpg", description: "Fragrant spiced dip.", servings: "4", ingredients: ["1 cup Fahari Mala yoghurt","1 garlic clove","1 tbsp lemon juice","Salt"], steps: ["Mix & chill."], tags: ["dip"] },
  { id: "lemon", title: "Lemon Biscuit Crumble", product: "Lemon Biscuit", image: "/images/recipes/lemon-biscuit-crumble.jpg", description: "Biscuit crumble with yoghurt.", servings: "4", ingredients: ["crushed biscuits","butter","Lemon Biscuit yoghurt"], steps: ["Layer and serve."], tags: ["dessert"] },
  { id: "plain", title: "Plain Yoghurt Bowl", product: "Plain Yoghurt", image: "/images/recipes/plain-yoghurt-bowl.jpg", description: "Simple bowl with toppings.", servings: "1", ingredients: ["Plain yoghurt","honey","nuts","fruit"], steps: ["Assemble and serve."], tags: ["breakfast"] },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(!!mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

export default function Page() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | string>("All");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // load favorites
  useEffect(() => {
    try {
      const raw = localStorage.getItem("fy:favs");
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("fy:favs", JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  const recipes = useMemo(() => RECIPES, []);
  const slides = useMemo(() => recipes.map((r) => ({ id: r.id, src: r.image, title: r.title })), [recipes]);

  const filtered = recipes.filter((r) => {
    if (filter !== "All" && r.product !== filter) return false;
    if (!q) return true;
    const s = `${r.title} ${r.description} ${r.tags?.join(" ")}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  // Removed unused toggleFav function

  return (
    <main className="min-h-screen bg-white text-black antialiased">
      <style jsx>{`
        /* small tailored styles for the 3D hero + flip cards */
        .hero-carousel { perspective: 1400px; }
        .carousel-track { transform-style: preserve-3d; transition: transform 900ms cubic-bezier(.2,.9,.2,1); }
        .card-3d { transform-style: preserve-3d; backface-visibility: hidden; }
        .flip-wrap { perspective: 1000px; }
        .flip-inner { transform-style: preserve-3d; transition: transform 700ms; }
        .flip-front, .flip-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; transform-style: preserve-3d; }
        .flip-back { transform: rotateY(180deg); }
        @keyframes spinY { from { transform: rotateY(0deg); } to { transform: rotateY(-360deg); } }
        .spin { animation: spinY 18s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .spin { animation: none; }
        }
      `}</style>

      <header className="max-w-6xl mx-auto px-6 py-10">
        <div className="md:flex md:items-center md:justify-between gap-8">
          <div className="md:flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Fahari Recipes — elevated</h1>
            <p className="mt-3 text-slate-700 max-w-2xl text-lg">Curated recipes using Fahari flavours. Sleek visuals, quick actions, and a delightful 3D preview.</p>

            <div className="mt-5 flex flex-wrap gap-3 items-center">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-black">
                <option value="All">All products</option>
                {Array.from(new Set(recipes.map((r) => r.product))).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>

              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipes, tags, ingredients..." className="px-3 py-2 rounded-lg border border-slate-200 min-w-[220px] text-black" />

              <button onClick={() => { setQ(""); setFilter("All"); }} className="px-4 py-2 bg-white border border-slate-200 rounded-lg">Reset</button>
            </div>
          </div>

          {/* 3D hero carousel: simplified, elegant */}
          <div className="mt-6 md:mt-0 w-full md:w-96">
            <div className="hero-carousel rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-50">
              <div
                className={`carousel-track w-full h-56 relative ${prefersReducedMotion ? "" : "spin"}`}
                style={{ transformOrigin: "50% 50% -320px" }}
                onMouseEnter={(e) => { if (!prefersReducedMotion) (e.currentTarget as HTMLElement).style.animationPlayState = "paused"; }}
                onMouseLeave={(e) => { if (!prefersReducedMotion) (e.currentTarget as HTMLElement).style.animationPlayState = "running"; }}
                aria-hidden={false}
              >
                {/* place a few angled cards in a circle — limited count for speed */}
                {slides.map((s, i) => {
                  const angle = (i / slides.length) * 360;
                  const transform = `rotateY(${angle}deg) translateZ(320px) rotateY(${0}deg)`;
                  return (
                    <div key={s.id} className="card-3d absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl overflow-hidden w-64 h-40"
                      style={{ transform, transformOrigin: "center", boxShadow: "0 18px 50px rgba(13,24,35,0.12)" }}>
                      <div className="relative w-full h-full">
                        <Image src={s.src} alt={s.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 420px" />
                        <div className="absolute left-3 bottom-3 bg-black/55 text-white px-3 py-1 rounded text-sm">{s.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600">3D preview — hover to pause</div>
          </div>
        </div>
      </header>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <div key={r.id} className="flip-wrap bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flip-inner" style={{ transform: "rotateY(0deg)" }}>
                {/* FRONT */}
                <div className="flip-front relative h-56">
                  <div className="relative w-full h-full">
                    <Image src={r.image} alt={r.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 420px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-black">{r.title}</h3>
                        <div className="text-xs text-slate-500">{r.product} • {r.servings}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => setSelected(r)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm">Open</button>
                        <button onClick={() => toggleFavoriteLocal(r.id, favorites, setFavorites)} className={`px-3 py-1 rounded-lg text-sm ${favorites[r.id] ? "bg-amber-200" : "bg-white border"}`}>{favorites[r.id] ? "Saved" : "Save"}</button>
                      </div>
                    </div>
                    <p className="mt-3 text-slate-700 text-sm">{r.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.tags?.map((t) => <span key={t} className="text-xs px-2 py-1 bg-emerald-50 rounded text-slate-800">{t}</span>)}
                    </div>
                  </div>
                </div>

                {/* BACK (quick ingredients) */}
                <div className="flip-back absolute inset-0 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Ingredients</h4>
                    <div className="text-xs text-slate-500">Tap to flip</div>
                  </div>
                  <ul className="mt-3 ml-5 text-sm text-slate-800 list-disc">
                    {r.ingredients.slice(0, 5).map((ing, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>{ing}</span>
                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(ing); toast("Copied"); }} className="text-xs px-2 py-1 border rounded ml-2">Copy</button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setSelected(r)} className="px-3 py-1 bg-emerald-600 text-white rounded">View</button>
                    <button onClick={() => { r.ingredients.forEach((ing) => { navigator.clipboard.writeText(ing + "\n"); }); toast("Ingredients copied"); }} className="px-3 py-1 border rounded">Copy all</button>
                  </div>
                </div>
              </div>

              {/* small script to handle flip on hover/tap: minimal inline */}
              <script dangerouslySetInnerHTML={{
                __html: `(function(el){
                  const inner = el.querySelector('.flip-inner');
                  let flipped=false;
                  el.addEventListener('mouseenter',()=>{ inner.style.transform='rotateY(180deg)'; });
                  el.addEventListener('mouseleave',()=>{ inner.style.transform='rotateY(0deg)'; });
                  el.addEventListener('click',()=>{ flipped=!flipped; inner.style.transform=flipped?'rotateY(180deg)':'rotateY(0deg)'; });
                })(document.currentScript.parentElement);`
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selected && <RecipeModal recipe={selected} onClose={() => setSelected(null)} />}

    </main>
  );
}

/* ---------------- Utilities ---------------- */
function toggleFavoriteLocal(id: string, state: Record<string, boolean>, setState: (s: Record<string, boolean>) => void) {
  setState({ ...state, [id]: !state[id] });
}

function toast(msg: string) {
  const id = "fy-toast";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:3rem;background:#0f172a;color:#fff;padding:8px 14px;border-radius:10px;z-index:9999;opacity:1;transition:opacity .3s;";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  setTimeout(() => { if (el) el.style.opacity = "0"; }, 1400);
}

/* ---------------- Modal Component ---------------- */
function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void; }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handlePrint = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${recipe.title}</title><style>body{font-family:system-ui;padding:20px;color:#111}</style></head><body><h1>${recipe.title}</h1><h4>${recipe.product}</h4><h3>Ingredients</h3><ul>${recipe.ingredients.map(i=>`<li>${i}</li>`).join("")}</ul><h3>Steps</h3><ol>${recipe.steps.map(s=>`<li>${s}</li>`).join("")}</ol></body></html>`;
    const w = window.open("", "_blank", "width=700,height=800");
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(), 300); }
  };

  const handleShare = async () => {
    const text = `${recipe.title} — ${recipe.description}`;
    try {
      if (typeof (navigator as Navigator & { share?: (data: { title: string; text: string }) => Promise<void> }).share === "function") {
        await (navigator as Navigator & { share: (data: { title: string; text: string }) => Promise<void> }).share({ title: recipe.title, text });
      } else {
        await navigator.clipboard.writeText(text); toast("Recipe copied");
      }
    } catch { toast("Couldn't share"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-auto max-h-[90vh]">
        <div className="grid md:grid-cols-2">
          <div className="relative h-64 md:h-auto md:min-h-[320px] bg-slate-50">
            <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{recipe.title}</h2>
                <div className="text-sm text-slate-600">{recipe.product} • {recipe.servings}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="px-3 py-2 rounded border">Print</button>
                <button onClick={handleShare} className="px-3 py-2 rounded border">Share</button>
                <button onClick={onClose} className="px-3 py-2 rounded bg-red-50">Close</button>
              </div>
            </div>

            <p className="mt-4 text-slate-800">{recipe.description}</p>

            <h4 className="mt-6 font-semibold">Ingredients</h4>
            <ul className="list-disc ml-5 mt-2 text-slate-800">
              {recipe.ingredients.map((ing, i) => <li key={i} className="flex items-center justify-between">{ing}<button onClick={() => { navigator.clipboard.writeText(ing); toast("Copied"); }} className="text-xs px-2 py-1 border rounded ml-2">Copy</button></li>)}
            </ul>

            <h4 className="mt-6 font-semibold">Steps</h4>
            <ol className="list-decimal ml-5 mt-2 text-slate-800 space-y-2">{recipe.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </div>
        </div>
      </div>
    </div>
  );
}
