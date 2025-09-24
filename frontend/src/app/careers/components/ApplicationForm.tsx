// frontend/src/app/careers/components/ApplicationForm.tsx
"use client";

import React from "react";
import type { Job } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Props = {
  job: Job;
  onSuccess?: () => void;
};

/**
 * Extend Job with optional id fields that might be present from different backends
 */
type JobWithId = Job & {
  _id?: string;
  id?: string;
};

type ApiError = {
  msg: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  errors?: ApiError[];
};

export default function ApplicationForm({ job, onSuccess }: Props) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [coverLetter, setCoverLetter] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const xhrRef = React.useRef<XMLHttpRequest | null>(null);

  const maxFileMB = 5;
  const allowedExt = ["pdf", "doc", "docx"];

  function validate(): string | null {
    if (!fullName.trim()) return "Full name is required";
    if (!email.trim()) return "Email is required";
    // simple email sanity check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Please enter a valid email";
    if (!phone.trim()) return "Phone is required";
    if (!file) return "Please attach your CV (PDF/DOC/DOCX)";
    const parts = file.name.split(".");
    const ext = (parts.length > 1 ? parts.pop() || "" : "").toLowerCase();
    if (!allowedExt.includes(ext)) return "CV must be a PDF, DOC or DOCX file";
    if (file.size > maxFileMB * 1024 * 1024) return `CV must be smaller than ${maxFileMB} MB`;
    return null;
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  React.useEffect(() => {
    // cleanup: abort XHR if component unmounts while uploading
    return () => {
      if (xhrRef.current && xhrRef.current.readyState !== 4) {
        try {
          xhrRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    // Determine job id (support _id or id)
    const jobWithId = job as JobWithId;
    const jobId = jobWithId._id ?? jobWithId.id ?? "";

    if (!jobId) {
      setError("Invalid job selected");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const form = new FormData();
      form.append("jobId", jobId);
      form.append("fullName", fullName.trim());
      form.append("email", email.trim());
      form.append("phone", phone.trim());
      if (coverLetter) form.append("coverLetter", coverLetter.trim());
      if (file) form.append("cv", file, file.name);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.open("POST", `${API}/api/careers/apply`, true);

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        };

        xhr.onload = () => {
          setLoading(false);
          setProgress(null);

          const raw = xhr.responseText || "";
          let parsed: ApiResponse | null = null;
          try {
            parsed = raw ? (JSON.parse(raw) as ApiResponse) : null;
          } catch (parseErr) {
            // Keep parsed null and log parse error
             
            console.error("Failed to parse server response JSON:", parseErr, "raw:", raw);
          }

          if (xhr.status >= 200 && xhr.status < 300) {
            const msg = parsed?.message || "Application submitted successfully";
            setSuccess(msg);
            setFullName("");
            setEmail("");
            setPhone("");
            setCoverLetter("");
            setFile(null);
            if (onSuccess) onSuccess();
            resolve();
            return;
          }

          // Non-2xx -> derive message
          let msg = `Submission failed (${xhr.status})`;
          if (parsed) {
            if (parsed.message) msg = parsed.message;
            else if (parsed.errors && parsed.errors.length) {
              msg = parsed.errors.map((er) => er.msg).join("; ");
            }
          }
           
          console.error("Application submission failed:", xhr.status, raw || parsed);
          setError(msg);
          reject(new Error(msg));
        };

        xhr.onerror = () => {
          setLoading(false);
          setProgress(null);
          setError("Network error. Please try again.");
           
          console.error("XHR network error while submitting application");
          reject(new Error("Network error"));
        };

        // helpful for APIs that return JSON
        xhr.setRequestHeader("Accept", "application/json");

        xhr.send(form);
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || "Failed to submit application");
      else setError("Failed to submit application");
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-emerald-50 rounded-2xl p-6" aria-live="polite">
      <h3 className="text-lg font-semibold">Apply for {job?.title}</h3>
      <p className="text-sm text-slate-600 mt-1">Fill this form and attach your CV.</p>

      <div className="mt-4 space-y-3">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          name="fullName"
          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          type="email"
          name="email"
          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200"
          required
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          name="phone"
          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200"
          required
        />
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Cover letter (optional, max 3000 characters)"
          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200 min-h-[120px]"
        />
        <label className="block">
          <span className="text-sm text-slate-700">Attach CV (PDF, DOC, DOCX, max {maxFileMB}MB)</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/msword,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFile}
            className="mt-2"
            aria-label="Upload CV"
            required
          />
          {file && (
            <div className="text-xs text-slate-600 mt-1">
              {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}
        </label>

        {progress !== null && (
          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
            <div style={{ width: `${progress}%` }} className="h-2 rounded-full bg-emerald-600" />
            <div className="text-xs text-slate-500 mt-1">{progress}%</div>
          </div>
        )}

        {error && (
          <div role="alert" className="text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit Application"}
          </button>

          <button
            type="button"
            onClick={() => {
              setFullName("");
              setEmail("");
              setPhone("");
              setCoverLetter("");
              setFile(null);
              setError(null);
              setSuccess(null);
            }}
            className="px-4 py-2 rounded-2xl border text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}
