//frontend\src\app\careers\components\JobList.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import ApplicationForm from "./ApplicationForm";
import type { Job } from "../types";

export default function JobList({ jobs }: { jobs: Job[] }) {
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length === 0 && (
          <div className="p-8 bg-white rounded-2xl shadow text-center col-span-full">
            <h3 className="text-xl font-semibold">No vacancies right now</h3>
            <p className="text-slate-500 mt-2">Check back later — new roles are posted frequently.</p>
          </div>
        )}

        {jobs.map((job) => (
          <motion.article
            key={job._id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-bold">{job.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{job.location} • {job.type}</p>
            <p className="mt-2 text-slate-700 line-clamp-3">{job.description}</p>
            <button
              onClick={() => setSelectedJob(job)}
              className="mt-3 px-4 py-2 rounded-2xl bg-emerald-600 text-white text-sm hover:bg-emerald-700"
            >
              Apply Now
            </button>
          </motion.article>
        ))}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
            >
              ✕
            </button>
            <ApplicationForm job={selectedJob} onSuccess={() => setSelectedJob(null)} />
          </div>
        </div>
      )}
    </>
  );
}
