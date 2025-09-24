// src/app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
      <h1 className="text-6xl md:text-8xl font-extrabold text-red-600 mb-6">
        Oops!
      </h1>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
        Something went wrong
      </h2>
      <p className="text-gray-600 max-w-md mb-8">
        An unexpected error has occurred. Please try again or go back to the homepage.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-medium shadow hover:bg-emerald-700 transition"
        >
          Retry
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-2xl border border-gray-300 text-gray-800 font-medium shadow hover:bg-gray-100 transition"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
