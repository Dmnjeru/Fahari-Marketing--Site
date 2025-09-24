// frontend/src/app/admin/jobs/JobModal.tsx
"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import axios, { type AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface JobPayload {
  title: string;
  slug?: string;
  description: string;
  location: string;
  type: string;
  department?: string;
  salaryRange?: string;
  requirements?: string[];
  responsibilities?: string[];
  tags?: string[];
  applicationDeadline?: string | null;
  status?: "active" | "closed" | "draft";
}

export type Job = JobPayload & { _id?: string; createdAt?: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Job | null;
  onSaved?: (job: Job) => void;
}

/** API response shape used by backend */
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

/** Helper to extract a usable error message from unknown error */
function extractErrorMessage(err: unknown, fallback = "An error occurred"): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError;
    const data = axiosErr.response?.data as ApiResponse | undefined;
    if (data && typeof data === "object" && data.message) return String(data.message);
    if (axiosErr.message) return axiosErr.message;
    return fallback;
  }
  if (err instanceof Error) return err.message;
  try {
    return String(err);
  } catch {
    return fallback;
  }
}

export default function JobModal({ isOpen, onClose, initialData = null, onSaved }: Props): React.ReactElement | null {
  const queryClient = useQueryClient();
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  // form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [department, setDepartment] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState<string | null>(null);
  const [status, setStatus] = useState<JobPayload["status"]>("active");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // reset form when modal opens for create/edit
  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialData?.title ?? "");
    setSlug(initialData?.slug ?? "");
    setLocation(initialData?.location ?? "");
    setType(initialData?.type ?? "Full-time");
    setDepartment(initialData?.department ?? "");
    setSalaryRange(initialData?.salaryRange ?? "");
    setDescription(initialData?.description ?? "");
    setRequirements(initialData?.requirements ?? []);
    setResponsibilities(initialData?.responsibilities ?? []);
    setTags(initialData?.tags ?? []);
    setApplicationDeadline(
      initialData?.applicationDeadline ? formatDateForInput(initialData.applicationDeadline) : null
    );
    setStatus(initialData?.status ?? "active");
    setErrors({});
    // focus after paint
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [isOpen, initialData]);

  // helpers
  function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }

  function formatDateForInput(d: string | Date) {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!description.trim() || description.trim().length < 20) e.description = "Description must be at least 20 characters";
    if (!location.trim()) e.location = "Location is required";
    if (!type) e.type = "Type is required";
    if (applicationDeadline) {
      const d = new Date(applicationDeadline);
      const today = new Date();
      d.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (d < today) e.applicationDeadline = "Deadline cannot be in the past";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // mutation for create/update (uses centralized api client with interceptors)
  const mutation = useMutation<ApiResponse<Job>, unknown, JobPayload>({
    mutationFn: async (body: JobPayload) => {
      if (initialData?._id) {
        const url = `${API_BASE}/api/careers/jobs/${encodeURIComponent(initialData._id)}`;
        const res = await api.patch<ApiResponse<Job>>(url, body); // api adds creds + Authorization + refresh
        return res.data;
      }

      const url = `${API_BASE}/api/careers/jobs`;
      const res = await api.post<ApiResponse<Job>>(url, body);
      return res.data;
    },
    onSuccess: (resp) => {
      const job = resp?.data;
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      if (job) onSaved?.(job);
      onClose();
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setErrors({ form: "Unauthorized — please sign in and try again." });
        return;
      }
      const msg = extractErrorMessage(err, "Failed to save job");
      setErrors({ form: msg });
    },
  });

  // event handlers
  const handleAddTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    const newTags = Array.from(new Set([...tags, ...v.split(/[,;\s]+/).map((t) => t.trim()).filter(Boolean)]));
    setTags(newTags);
    setTagInput("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    setIsSaving(true);

    const payload: JobPayload = {
      title: title.trim(),
      slug: slug ? slugify(slug) : slugify(title),
      description: description.trim(),
      location: location.trim(),
      type,
      department: department || undefined,
      salaryRange: salaryRange || undefined,
      requirements: requirements.filter(Boolean),
      responsibilities: responsibilities.filter(Boolean),
      tags: tags.filter(Boolean),
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
      status,
    };

    try {
      await mutation.mutateAsync(payload);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!initialData?._id) return;
    if (!confirm("Delete this job? This action is permanent.")) return;
    setIsSaving(true);
    try {
      await api.delete(`${API_BASE}/api/careers/jobs/${encodeURIComponent(initialData._id)}`);
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setErrors({ form: "Unauthorized — please sign in and try again." });
      } else {
        const msg = extractErrorMessage(err, "Delete failed");
        setErrors({ form: msg });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-auto max-h-[90vh]"
        aria-labelledby="job-modal-title"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 id="job-modal-title" className="text-lg font-semibold">
            {initialData ? "Edit Job" : "Create Job"}
          </h3>
          <div className="flex items-center gap-2">
            {initialData?._id && (
              <Button type="button" variant="destructive" onClick={handleDeleteJob} disabled={isSaving}>
                <Trash size={14} />
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={handleClose} aria-label="Close modal">
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {errors.form && <div className="text-sm text-red-600">{errors.form}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input ref={firstInputRef} value={title} onChange={(e) => setTitle(e.target.value)} />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label>Slug (optional)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from title"
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
            </div>

            <div>
              <Label>Type</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
                <option>Temporary</option>
                <option>Remote</option>
              </select>
            </div>

            <div>
              <Label>Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>

            <div>
              <Label>Salary Range</Label>
              <Input
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. KES 40,000 - 60,000"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label>Application Deadline</Label>
              <Input
                type="date"
                value={applicationDeadline ?? ""}
                onChange={(e) => setApplicationDeadline(e.target.value || null)}
              />
              {errors.applicationDeadline && <p className="text-xs text-red-600 mt-1">{errors.applicationDeadline}</p>}
            </div>

            <div>
              <Label>Status</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobPayload["status"])}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="comma separated or press Enter"
              />
              <Button type="button" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t) => (
                <div key={t} className="px-2 py-1 bg-slate-100 rounded flex items-center gap-2">
                  <span className="text-sm">{t}</span>
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                    className="text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 border-t pt-4">
            <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={14} className="mr-2" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
