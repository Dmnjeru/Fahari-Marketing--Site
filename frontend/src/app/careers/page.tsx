import type { Metadata } from "next";
import Image from "next/image";
import JobList from "./components/JobList";
import type { Job } from "./types";

export const metadata: Metadata = {
  title: "Careers — Fahari Yoghurt",
  description: "Join the Fahari Yoghurt family. See open positions and apply online.",
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API}/api/careers/jobs`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data ?? [];
  } catch (err) {
    console.error("Failed to fetch jobs", err);
    return [];
  }
}

export default async function CareersPage() {
  const jobs = await fetchJobs();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Join the Fahari Yoghurt Family
            </h1>
            <p className="mt-4 text-gray-600 max-w-2xl">
              We&apos;re a fast-growing dairy brand looking for passionate people. See our open
              roles below and apply with your CV.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="#jobs"
                className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
              >
                View Open Positions
              </a>
              <a
                href="/about"
                className="px-5 py-3 rounded-2xl border border-emerald-600 text-emerald-600 font-medium hover:bg-emerald-50 transition"
              >
                Why Work With Us
              </a>
            </div>
          </div>

          <div className="w-full md:w-96">
            <Image
              src="/images/careers-hero.jpg"
              alt="Team Fahari Yoghurt"
              width={600}
              height={360}
              className="rounded-2xl object-cover shadow-lg"
              priority
              unoptimized
            />
          </div>
        </div>
      </header>

      <section id="jobs" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-2">Open Positions</h2>
        <p className="text-slate-600 mb-6">Current opportunities at Fahari Yoghurt & Dairies.</p>

        <JobList jobs={jobs} />
      </section>
    </main>
  );
}
