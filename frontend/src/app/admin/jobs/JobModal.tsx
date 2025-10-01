// frontend/src/app/admin/jobs/JobModal.tsx
"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import axios, { type AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * JobPayload expanded to include dynamicQuestions which the backend expects:
 * dynamicQuestions: [{ questionText, type, options?, required? }]
 */
export interface DynamicQuestion {
  // backend uses `questionText` and `type`; keep shape compatible
  questionText: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select" | "file";
  required?: boolean;
  options?: string[]; // for radio/select/checkbox
  // addedBy is handled server-side if needed
}

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
  dynamicQuestions?: DynamicQuestion[]; // NEW
}

export type Job = JobPayload & { _id?: string; createdAt?: string; dynamicQuestions?: DynamicQuestion[] };

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

  // dynamic questions state
  const [dynamicQuestions, setDynamicQuestions] = useState<DynamicQuestion[]>([]);

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
    // initialize dynamicQuestions from initialData if present
    setDynamicQuestions(
      (initialData?.dynamicQuestions ?? []).map((q) => ({
        // Safely support both modern shape (questionText) and legacy shape (question)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questionText: q.questionText ?? ( (q as any).question ?? "" ),
        type: q.type ?? "text",
        required: q.required ?? false,
        options: Array.isArray(q.options) ? q.options.slice() : [],
      }))
    );
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

    // validate dynamic questions
    dynamicQuestions.forEach((q, idx) => {
      if (!q.questionText || !q.questionText.trim()) {
        e[`dq.${idx}.questionText`] = `Question #${idx + 1} text is required`;
      }
      if (["select", "radio", "checkbox"].includes(q.type)) {
        if (!q.options || q.options.length === 0) {
          e[`dq.${idx}.options`] = `Question #${idx + 1} needs at least one option`;
        }
      }
    });

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
      dynamicQuestions: dynamicQuestions.map((q) => ({
        questionText: q.questionText?.trim(),
        type: q.type,
        required: Boolean(q.required),
        options: Array.isArray(q.options) ? q.options.filter(Boolean) : undefined,
      })),
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

  // Dynamic questions helpers
  const addQuestion = () => {
    setDynamicQuestions((prev) => [
      ...prev,
      { questionText: "", type: "text", required: false, options: [] },
    ]);
  };

  const updateQuestion = (idx: number, patch: Partial<DynamicQuestion>) => {
    setDynamicQuestions((prev) => {
      const copy = prev.slice();
      copy[idx] = { ...copy[idx], ...patch };
      // ensure options array exists for option-based types
      if (["select", "radio", "checkbox"].includes(copy[idx].type) && !Array.isArray(copy[idx].options)) {
        copy[idx].options = [];
      }
      if (!["select", "radio", "checkbox"].includes(copy[idx].type)) {
        copy[idx].options = copy[idx].options ?? [];
      }
      return copy;
    });
  };

  const removeQuestion = (idx: number) => {
    setDynamicQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const addOptionToQuestion = (qIdx: number, option: string) => {
    const val = String(option).trim();
    if (!val) return;
    setDynamicQuestions((prev) => {
      const copy = prev.slice();
      const q = { ...copy[qIdx] };
      q.options = Array.isArray(q.options) ? q.options.slice() : [];
      q.options.push(val);
      copy[qIdx] = q;
      return copy;
    });
  };

  const removeOptionFromQuestion = (qIdx: number, optIdx: number) => {
    setDynamicQuestions((prev) => {
      const copy = prev.slice();
      const q = { ...copy[qIdx] };
      q.options = Array.isArray(q.options) ? q.options.filter((_, i) => i !== optIdx) : [];
      copy[qIdx] = q;
      return copy;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-auto max-h-[90vh]"
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

          {/* Dynamic Questions */}
          <div>
            <div className="flex items-center justify-between">
              <Label>Application Questions (optional)</Label>
              <Button type="button" onClick={addQuestion} variant="ghost" className="flex items-center gap-2">
                <Plus size={14} /> Add question
              </Button>
            </div>

            {dynamicQuestions.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">No custom questions — use the default application fields (CV, cover letter, email).</p>
            )}

            <div className="space-y-3 mt-3">
              {dynamicQuestions.map((q, idx) => (
                <div key={idx} className="border rounded p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label>Question #{idx + 1}</Label>
                      <Input
                        value={q.questionText}
                        onChange={(e) => updateQuestion(idx, { questionText: e.target.value })}
                        placeholder="e.g. Why do you want this role?"
                      />
                      {errors[`dq.${idx}.questionText`] && (
                        <p className="text-xs text-red-600 mt-1">{errors[`dq.${idx}.questionText`]}</p>
                      )}

                      <div className="flex gap-2 items-center mt-2">
                        <div>
                          <Label className="text-xs">Type</Label>
                          <select
                            value={q.type}
                            onChange={(e) =>
                              updateQuestion(idx, { type: e.target.value as DynamicQuestion["type"] })
                            }
                            className="border rounded px-2 py-1 w-full"
                          >
                            <option value="text">Text (single line)</option>
                            <option value="textarea">Long answer</option>
                            <option value="select">Select (single choice)</option>
                            <option value="radio">Radio (single choice)</option>
                            <option value="checkbox">Checkbox (multiple choice)</option>
                            <option value="file">File upload</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            id={`dq-${idx}-required`}
                            type="checkbox"
                            checked={Boolean(q.required)}
                            onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <Label htmlFor={`dq-${idx}-required`} className="text-sm">Required</Label>
                        </div>
                      </div>

                      {/* options editor for select / radio / checkbox */}
                      {["select", "radio", "checkbox"].includes(q.type) && (
                        <div className="mt-3">
                          <Label className="text-sm">Options</Label>
                          <OptionEditor
                            options={q.options ?? []}
                            onAdd={(val) => addOptionToQuestion(idx, val)}
                            onRemove={(optIdx) => removeOptionFromQuestion(idx, optIdx)}
                          />
                          {errors[`dq.${idx}.options`] && (
                            <p className="text-xs text-red-600 mt-1">{errors[`dq.${idx}.options`]}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-3 flex-shrink-0 flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeQuestion(idx)}
                        className="self-end"
                        title="Remove question"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
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

/* -------------------------------------------------------------------------- */
/* Small internal OptionEditor component used for editing options per q       */
/* -------------------------------------------------------------------------- */

function OptionEditor({
  options,
  onAdd,
  onRemove,
}: {
  options: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}) {
  const [optInput, setOptInput] = useState("");

  return (
    <div>
      <div className="flex gap-2 items-center">
        <Input
          value={optInput}
          onChange={(e) => setOptInput(e.target.value)}
          placeholder="Add option and press Add"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = optInput.trim();
              if (v) {
                onAdd(v);
                setOptInput("");
              }
            }
          }}
        />
        <Button
          type="button"
          onClick={() => {
            const v = optInput.trim();
            if (!v) return;
            onAdd(v);
            setOptInput("");
          }}
        >
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((o, i) => (
          <div key={i} className="px-2 py-1 bg-white border rounded flex items-center gap-2">
            <span className="text-sm">{o}</span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-xs text-red-600"
              aria-label={`Remove option ${o}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
