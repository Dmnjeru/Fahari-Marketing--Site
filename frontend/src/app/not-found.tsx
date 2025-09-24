// src/app/not-found.tsx
"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center">
      <h1 className="text-6xl md:text-8xl font-extrabold text-pink-600 mb-6">
        404
      </h1>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
        Page Not Found
      </h2>
      <p className="text-gray-600 max-w-md mb-8">
        Oops! The page you are looking for doesn’t exist or has been moved.
        Check the URL or go back to the homepage.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-2xl bg-pink-600 text-white font-medium shadow hover:bg-pink-700 transition"
      >
        Go Home
      </Link>
    </main>
  );
}
