"use client";

import React, { useEffect, useRef, useState, FormEvent } from "react";
import axios, { AxiosError, type AxiosProgressEvent } from "axios";
import type { Job } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.faharidairies.co.ke";

type JobQuestion = {
  _id?: string;
  questionText: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "file";
  required?: boolean;
  options?: string[];
};

type Props = {
  job: Job & { dynamicQuestions?: JobQuestion[] };
  onSuccess?: () => void;
};

type AnswerValue = string | string[] | File | null;

type ServerValidationError = { msg?: string; param?: string };
type ServerResponseShape = {
  success?: boolean;
  message?: string;
  data?: unknown;
  errors?: ServerValidationError[];
};

/**
 * Application form with:
 * - realtime upload progress
 * - robust parsing of server responses (accepts id/_id/application shapes)
 * - dynamic question handling (including file fields)
 * - cancellation of in-flight request with AbortController
 */
export default function ApplicationForm({ job, onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Abort controller reference (to cancel axios request)
  const abortRef = useRef<AbortController | null>(null);

  const maxFileMB = 5;
  const allowedExt = ["pdf", "doc", "docx"];

  // stable key for dynamic questions
  const getQKey = (q: JobQuestion, idx: number) => q._id ?? `question_${idx}`;

  /* ----------------- Dynamic handlers ----------------- */
  const setAnswerText = (key: string, value: string) =>
    setAnswers((p) => ({ ...p, [key]: value }));

  const setAnswerRadio = (key: string, value: string) =>
    setAnswers((p) => ({ ...p, [key]: value }));

  const toggleAnswerCheckbox = (key: string, option: string) =>
    setAnswers((p) => {
      const cur = p[key];
      const arr = Array.isArray(cur) ? [...cur] : [];
      const idx = arr.indexOf(option);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(option);
      return { ...p, [key]: arr };
    });

  const setAnswerFile = (key: string, file: File | null) =>
    setAnswers((p) => ({ ...p, [key]: file }));

  /* ----------------- CV handler ----------------- */
  const onCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalError(null);
    const f = e.target.files?.[0] ?? null;
    setCvFile(f);
  };

  /* ----------------- Validation ----------------- */
  const validateAll = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs["fullName"] = "Full name is required";
    if (!email.trim()) errs["email"] = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      errs["email"] = "Please enter a valid email address";

    if (!phone.trim()) errs["phone"] = "Phone number is required";

    if (!cvFile) errs["cv"] = "Please attach your CV";
    else {
      const ext = cvFile.name.split(".").pop()?.toLowerCase() ?? "";
      if (!allowedExt.includes(ext)) errs["cv"] = "CV must be a PDF, DOC or DOCX";
      else if (cvFile.size > maxFileMB * 1024 * 1024)
        errs["cv"] = `CV must be smaller than ${maxFileMB} MB`;
    }

    (job.dynamicQuestions ?? []).forEach((q, idx) => {
      if (!q.required) return;
      const key = getQKey(q, idx);
      const val = answers[key];
      if (q.type === "checkbox") {
        if (!Array.isArray(val) || val.length === 0) errs[key] = `${q.questionText} is required`;
      } else if (q.type === "file") {
        if (!(val instanceof File)) errs[key] = `${q.questionText} is required`;
      } else {
        if (!val || String(val).trim() === "") errs[key] = `${q.questionText} is required`;
      }
    });

    setFieldErrors(errs);
    setGlobalError(Object.keys(errs).length ? "Please fix the errors and try again." : null);
    return Object.keys(errs).length === 0;
  };

  /* ----------------- Build answers payload ----------------- */
  const buildAnswersPayload = () =>
    (job.dynamicQuestions ?? [])
      .map((q, idx) => {
        const key = getQKey(q, idx);
        const val = answers[key];
        if (val === undefined || val === null || val === "") return null;
        if (val instanceof File) return { questionId: q._id ?? null, questionText: q.questionText, answer: val.name };
        if (Array.isArray(val)) return { questionId: q._id ?? null, questionText: q.questionText, answer: val.join(", ") };
        return { questionId: q._id ?? null, questionText: q.questionText, answer: String(val) };
      })
      .filter(Boolean) as { questionId?: string | null; questionText: string; answer: string }[];

  /* ----------------- Helpers: normalize server response ----------------- */
  function extractApplicationIdFromResponse(respData: unknown): string | null {
    // try many common shapes: { data: { _id|id } }, { application: { _id } }, { id }, { _id }
    try {
      if (!respData) return null;
      // use safe object access
      const asObj = respData as Record<string, unknown>;

      // common: data object
      if (asObj.data && typeof asObj.data === "object") {
        const d = asObj.data as Record<string, unknown>;
        if (typeof d._id === "string") return d._id;
        if (typeof d.id === "string") return d.id;
        // nested: data.application
        if (d.application && typeof d.application === "object") {
          const a = d.application as Record<string, unknown>;
          if (typeof a._id === "string") return a._id;
          if (typeof a.id === "string") return a.id;
        }
      }

      // direct fields
      if (typeof asObj._id === "string") return asObj._id;
      if (typeof asObj.id === "string") return asObj.id;

      // application field top-level
      if (asObj.application && typeof asObj.application === "object") {
        const a = asObj.application as Record<string, unknown>;
        if (typeof a._id === "string") return a._id;
        if (typeof a.id === "string") return a.id;
      }

      return null;
    } catch {
      return null;
    }
  }

  /* ----------------- Submit ----------------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccess(null);
    setFieldErrors({});

    if (!validateAll()) return;

    const jobId = (job as { _id?: string })._id ?? "";
    if (!jobId) {
      setGlobalError("Invalid job selected");
      return;
    }

    const form = new FormData();
    form.append("jobId", jobId);
    form.append("fullName", fullName.trim());
    form.append("email", email.trim().toLowerCase());
    form.append("phone", phone.trim());
    if (coverLetter) form.append("coverLetter", coverLetter.trim());
    if (cvFile) form.append("cv", cvFile, cvFile.name);

    const answersPayload = buildAnswersPayload();
    if (answersPayload.length) form.append("customAnswers", JSON.stringify(answersPayload));

    // Attach dynamic file fields using deterministic field names
    (job.dynamicQuestions ?? []).forEach((q, idx) => {
      if (q.type !== "file") return;
      const key = getQKey(q, idx);
      const val = answers[key];
      if (val instanceof File) {
        const nameKey = q._id ? `file_question_${String(q._id)}` : `file_question_${idx}`;
        form.append(nameKey, val, val.name);
      }
    });

    setLoading(true);
    setProgress(0);

    // cancel previous request if present
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {
        /* ignore */
      }
      abortRef.current = null;
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await axios.post<ServerResponseShape>(`${API}/api/careers/apply`, form, {
        signal: controller.signal,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const loaded = Number(progressEvent?.loaded ?? 0);
          const total = Number(progressEvent?.total ?? 0);
          if (total > 0) setProgress(Math.round((loaded / total) * 100));
        },
        headers: {
          Accept: "application/json",
          // DO NOT set Content-Type; browser will set multipart boundary
        },
        timeout: 120_000,
      });

      // normalize message
      const serverMessage = resp?.data?.message ?? "Application submitted successfully";
      // attempt to extract application id (backends sometimes return id or _id under various shapes)
      const appId = extractApplicationIdFromResponse(resp.data) ?? null;

      // use appId presence to consider submission successful — but also allow success flag
      const successFlag = resp.data?.success ?? true;

      if (!successFlag) {
        // server says not successful
        setGlobalError(String(serverMessage || "Submission failed"));
        setLoading(false);
        setProgress(null);
        return;
      }

      // success: display server message and reset form
      const shownMessage = serverMessage || (appId ? "Application submitted" : "Application submitted");
      setSuccess(String(shownMessage));
      setFullName("");
      setEmail("");
      setPhone("");
      setCoverLetter("");
      setCvFile(null);
      setAnswers({});
      setFieldErrors({});

      if (onSuccess) onSuccess();

      // hide success after a while
      setTimeout(() => setSuccess(null), 6000);
    } catch (err: unknown) {
      // handle axios errors with typed parsing but without `any`
      if (axios.isAxiosError(err)) {
        const aerr = err as AxiosError<unknown>;
        if (aerr.code === "ERR_CANCELED") {
          setGlobalError("Upload cancelled");
        } else {
          // attempt to read server payload
          const payload = aerr.response?.data as unknown;
          if (!payload) {
            setGlobalError("Failed to submit application. Please try again.");
          } else {
            // payload may contain message / errors array
            const maybe = payload as Record<string, unknown>;
            const msg = typeof maybe.message === "string" ? maybe.message : null;
            if (msg) {
              setGlobalError(msg);
            } else if (Array.isArray(maybe.errors) && maybe.errors.length > 0) {
              // map server validation errors by param
              const newFieldErrs: Record<string, string> = {};
              (maybe.errors as unknown[]).forEach((e) => {
                if (e && typeof e === "object") {
                  const o = e as Record<string, unknown>;
                  const param = typeof o.param === "string" ? o.param : "";
                  const m = typeof o.msg === "string" ? o.msg : String(o.msg ?? "Invalid value");
                  if (param) newFieldErrs[param] = m;
                }
              });
              if (Object.keys(newFieldErrs).length) {
                setFieldErrors((p) => ({ ...p, ...newFieldErrs }));
                setGlobalError("Please fix the highlighted errors.");
              } else {
                setGlobalError("Failed to submit application. Please try again.");
              }
            } else {
              setGlobalError("Failed to submit application. Please try again.");
            }
          }
        }
      } else {
        setGlobalError("Unexpected error. Please try again.");
      }
      // for debugging
     
      console.error("Application submit error:", err);
    } finally {
      setLoading(false);
      setProgress(null);
      abortRef.current = null;
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch {
          /* ignore */
        }
        abortRef.current = null;
      }
    };
  }, []);

  /* ----------------- Render ----------------- */
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-emerald-50 rounded-2xl p-6 space-y-4"
      aria-live="polite"
      aria-busy={loading}
      noValidate
    >
      <h3 className="text-lg font-semibold">Apply for {job?.title}</h3>
      <p className="text-sm text-slate-600">Fill this form and attach your CV.</p>

      {/* Full name */}
      <div>
        <label htmlFor="fullName" className="sr-only">Full name</label>
        <input
          id="fullName"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200"
          aria-describedby={fieldErrors.fullName ? "err-fullName" : undefined}
          required
        />
        {fieldErrors.fullName && (
          <div id="err-fullName" role="alert" className="text-xs text-red-600 mt-1">
            {fieldErrors.fullName}
          </div>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          type="email"
          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200"
          aria-describedby={fieldErrors.email ? "err-email" : undefined}
          required
        />
        {fieldErrors.email && (
          <div id="err-email" role="alert" className="text-xs text-red-600 mt-1">
            {fieldErrors.email}
          </div>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="sr-only">Phone</label>
        <input
          id="phone"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200"
          aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
          required
        />
        {fieldErrors.phone && (
          <div id="err-phone" role="alert" className="text-xs text-red-600 mt-1">
            {fieldErrors.phone}
          </div>
        )}
      </div>

      {/* Cover letter */}
      <div>
        <label htmlFor="coverLetter" className="sr-only">Cover letter</label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Cover letter (optional)"
          className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-200 min-h-[120px]"
        />
      </div>

      {/* CV */}
      <div>
        <label className="block">
          <span className="text-sm text-slate-700">Attach CV (PDF, DOC, DOCX, max {maxFileMB}MB)</span>
          <input
            id="cv"
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx,application/msword,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={onCvChange}
            className="mt-2"
            aria-describedby={fieldErrors.cv ? "err-cv" : undefined}
            required
          />
        </label>
        {cvFile && (
          <div className="text-xs text-slate-600 mt-1">
            {cvFile.name} • {(cvFile.size / 1024 / 1024).toFixed(2)} MB
          </div>
        )}
        {fieldErrors.cv && (
          <div id="err-cv" role="alert" className="text-xs text-red-600 mt-1">
            {fieldErrors.cv}
          </div>
        )}
      </div>

      {/* Dynamic questions */}
      {(job.dynamicQuestions ?? []).map((q, idx) => {
        const key = getQKey(q, idx);
        const val = answers[key];
        const fieldErr = fieldErrors[key];
        return (
          <div key={key} className="space-y-2">
            <label className="block font-medium">
              {q.questionText} {q.required && <span className="text-red-600">*</span>}
            </label>

            {q.type === "text" && (
              <input
                value={typeof val === "string" ? val : ""}
                onChange={(e) => setAnswerText(key, e.target.value)}
                className="w-full px-3 py-2 border rounded"
                aria-describedby={fieldErr ? `err-${key}` : undefined}
                required={q.required}
              />
            )}

            {q.type === "textarea" && (
              <textarea
                value={typeof val === "string" ? val : ""}
                onChange={(e) => setAnswerText(key, e.target.value)}
                className="w-full px-3 py-2 border rounded"
                aria-describedby={fieldErr ? `err-${key}` : undefined}
                required={q.required}
              />
            )}

            {q.type === "select" && (
              <select
                value={typeof val === "string" ? val : ""}
                onChange={(e) => setAnswerRadio(key, e.target.value)}
                className="w-full px-3 py-2 border rounded"
                aria-describedby={fieldErr ? `err-${key}` : undefined}
                required={q.required}
              >
                <option value="">Select...</option>
                {q.options?.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {q.type === "radio" &&
              q.options?.map((opt, i) => (
                <label key={i} className="inline-flex items-center gap-2 mr-3">
                  <input
                    type="radio"
                    name={`radio_${key}`}
                    value={opt}
                    checked={val === opt}
                    onChange={() => setAnswerRadio(key, opt)}
                    required={q.required}
                  />
                  {opt}
                </label>
              ))}

            {q.type === "checkbox" &&
              q.options?.map((opt, i) => (
                <label key={i} className="inline-flex items-center gap-2 mr-3">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={Array.isArray(val) && (val as string[]).includes(opt)}
                    onChange={() => toggleAnswerCheckbox(key, opt)}
                  />
                  {opt}
                </label>
              ))}

            {q.type === "file" && (
              <>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/msword,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setAnswerFile(key, e.target.files?.[0] ?? null)}
                  aria-describedby={fieldErr ? `err-${key}` : undefined}
                  required={q.required}
                />
                {val instanceof File && (
                  <div className="text-xs text-slate-600 mt-1">
                    {(val as File).name} • {(((val as File).size || 0) / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
              </>
            )}

            {fieldErr && (
              <div id={`err-${key}`} role="alert" className="text-xs text-red-600 mt-1">
                {fieldErr}
              </div>
            )}
          </div>
        );
      })}

      {/* progress */}
      {progress !== null && (
        <div className="w-full">
          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
            <div style={{ width: `${progress}%` }} className="h-2 rounded-full bg-emerald-600" />
          </div>
          <div className="text-xs text-slate-500 mt-1">{progress}%</div>
        </div>
      )}

      {/* messages */}
      {globalError && (
        <div role="alert" className="text-sm text-red-600">
          {globalError}
        </div>
      )}
      {success && (
        <div role="status" className="text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* actions */}
      <div className="flex items-center gap-3 mt-3">
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
            // cancel running upload if any
            if (abortRef.current) {
              try {
                abortRef.current.abort();
              } catch {
                /* ignore */
              }
              abortRef.current = null;
            }
            setFullName("");
            setEmail("");
            setPhone("");
            setCoverLetter("");
            setCvFile(null);
            setAnswers({});
            setFieldErrors({});
            setGlobalError(null);
            setSuccess(null);
            setProgress(null);
          }}
          className="px-4 py-2 rounded-2xl border text-sm"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
