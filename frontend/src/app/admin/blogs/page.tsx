// frontend/src/app/admin/blogs/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import axios, { AxiosError } from "axios";

// -----------------------------
// Types
// -----------------------------
type Blog = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category?: string;
  tags?: string[];
  author?: string;
  isPublished?: boolean;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResult<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
};

type FormState = {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  tags: string; // comma-separated in form
  isPublished: boolean;
};

// -----------------------------
// Helpers
// -----------------------------
function makeSlug(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e).slice(0, 200);
  } catch {
    return String(e);
  }
}

// -----------------------------
// Component
// -----------------------------
export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const initialForm: FormState = {
    _id: undefined,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "",
    category: "",
    tags: "",
    isPublished: true,
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Abort controller ref for requests
  const controllerRef = useRef<AbortController | null>(null);

  const clearMessages = (): void => {
    setError(null);
    setSuccessMsg(null);
  };

  const resetForm = (): void => {
    setForm({ ...initialForm });
    setIsEditing(false);
  };

  // Fetch blogs (admin view). Use axios instance (api) which already has withCredentials
  const fetchBlogs = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    // cancel previous request
    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch {
        /* ignore */
      }
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await api.get<ApiResult<Blog[]>>("/api/blogs", {
        params: { admin: true, limit: 1000 },
        signal: controller.signal as unknown as AbortSignal, // axios supports AbortSignal
      });

      setBlogs(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err: unknown) {
      // handle axios-specific canceled error separately
      if (axios.isCancel(err)) {
        // request canceled intentionally — ignore
      } else {
        const axiosErr = err as AxiosError | undefined;
        const status = axiosErr?.response?.status;
        if (status === 401 || status === 403) {
          setError("Unauthorized. Please sign in as an admin.");
          setBlogs([]);
          setLoading(false);
          return;
        }

        console.error("Admin fetch blogs error:", err);
        setError(getErrorMessage(err) || "Failed to fetch blogs");
        setBlogs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    return () => {
      if (controllerRef.current) {
        try {
          controllerRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
     
  }, []);

  // Create blog
  const handleCreate = async (evt: React.FormEvent) => {
    evt.preventDefault();
    clearMessages();

    if (!form.title.trim() || !form.content.trim() || !form.category.trim()) {
      setError("Title, content and category are required.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || makeSlug(form.title),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content,
        image: form.image.trim() || undefined,
        category: form.category.trim(),
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter((t: string) => t.length > 0)
          : [],
        isPublished: Boolean(form.isPublished),
      };

      await api.post("/api/blogs", payload);
      setSuccessMsg("Blog created successfully.");
      await fetchBlogs();
      resetForm();
    } catch (err: unknown) {
      console.error("Create blog error:", err);
      setError(getErrorMessage(err) || "Failed to create blog.");
    } finally {
      setBusy(false);
    }
  };

  // Start editing
  const startEdit = (b: Blog) => {
    clearMessages();
    setIsEditing(true);
    setForm({
      _id: b._id,
      title: b.title ?? "",
      slug: b.slug ?? makeSlug(b.title ?? ""),
      excerpt: b.excerpt ?? "",
      content: b.content ?? "",
      image: b.image ?? "",
      category: b.category ?? "",
      tags: (b.tags ?? []).join(", "),
      isPublished: Boolean(b.isPublished),
    });
  };

  // Update blog
  const handleUpdate = async (evt: React.FormEvent) => {
    evt.preventDefault();
    clearMessages();

    if (!form._id) {
      setError("No blog selected for update.");
      return;
    }
    if (!form.title.trim() || !form.content.trim() || !form.category.trim()) {
      setError("Title, content and category are required.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || makeSlug(form.title),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content,
        image: form.image.trim() || undefined,
        category: form.category.trim(),
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter((t: string) => t.length > 0)
          : [],
        isPublished: Boolean(form.isPublished),
      };

      await api.put(`/api/blogs/${form._id}`, payload);
      setSuccessMsg("Blog updated successfully.");
      await fetchBlogs();
      resetForm();
    } catch (err: unknown) {
      console.error("Update blog error:", err);
      setError(getErrorMessage(err) || "Failed to update blog.");
    } finally {
      setBusy(false);
    }
  };

  // Delete blog
  const handleDelete = async (id?: string) => {
    clearMessages();
    if (!id) return;
    if (!confirm("Are you sure you want to delete this blog post? This cannot be undone.")) return;

    setBusy(true);
    try {
      await api.delete(`/api/blogs/${id}`);
      setSuccessMsg("Blog deleted.");
      await fetchBlogs();
    } catch (err: unknown) {
      console.error("Delete blog error:", err);
      setError(getErrorMessage(err) || "Failed to delete blog.");
    } finally {
      setBusy(false);
    }
  };

  // Toggle publish/unpublish
  const togglePublish = async (b: Blog) => {
    clearMessages();
    setBusy(true);
    try {
      const payload = { isPublished: !Boolean(b.isPublished) };
      await api.put(`/api/blogs/${b._id}`, payload);
      setSuccessMsg(`Blog ${payload.isPublished ? "published" : "unpublished"}.`);
      await fetchBlogs();
    } catch (err: unknown) {
      console.error("Toggle publish error:", err);
      setError(getErrorMessage(err) || "Failed to update publish state.");
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------------
  // Render
  // ---------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Blog Posts</h1>
            <p className="text-sm text-gray-600">Create, edit, publish or delete articles.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-700 hover:underline">
              ← Admin dashboard
            </Link>
            <button
              onClick={() => {
                resetForm();
                clearMessages();
              }}
              className="rounded-md bg-white border px-3 py-1 text-sm shadow-sm hover:shadow"
            >
              New post
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-800">
            <strong className="block font-medium">Error</strong>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-green-800">
            <p className="text-sm">{successMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Blog list */}
          <div className="col-span-2">
            <div className="bg-white border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Posts</h2>
                <div className="text-sm text-gray-500">Showing {blogs.length}</div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-gray-500">Loading...</div>
              ) : blogs.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No posts yet.</div>
              ) : (
                <ul className="space-y-3">
                  {blogs.map((b) => (
                    <li key={b._id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm text-gray-500">ID: {b._id}</div>
                            <div className="text-lg font-semibold text-gray-900">{b.title}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span>Slug: {b.slug}</span>
                              <span className="mx-2">•</span>
                              <span>{b.category ?? "Uncategorized"}</span>
                              <span className="mx-2">•</span>
                              <span>{b.isPublished ? "Published" : "Draft"}</span>
                            </div>
                            {b.createdAt && (
                              <div className="text-xs text-gray-400 mt-1">Created: {new Date(b.createdAt).toLocaleString()}</div>
                            )}
                          </div>

                          <div className="flex-shrink-0 flex flex-col items-end gap-2">
                            <button onClick={() => startEdit(b)} className="text-sm px-3 py-1 rounded-md bg-white border hover:bg-gray-50">
                              Edit
                            </button>

                            <button onClick={() => togglePublish(b)} className="text-sm px-3 py-1 rounded-md border bg-white hover:bg-gray-50">
                              {b.isPublished ? "Unpublish" : "Publish"}
                            </button>

                            <button onClick={() => handleDelete(b._id)} className="text-sm px-3 py-1 rounded-md bg-red-50 text-red-700 border hover:bg-red-100">
                              Delete
                            </button>
                          </div>
                        </div>

                        {b.excerpt && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{b.excerpt}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right: Form */}
          <aside className="col-span-1">
            <div className="bg-white border rounded-2xl p-4">
              <h3 className="text-lg font-semibold mb-3">{isEditing ? "Edit post" : "New post"}</h3>

              <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Title</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    placeholder="Enter post title"
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Slug (URL)</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((s) => ({ ...s, slug: makeSlug(e.target.value) }))}
                    placeholder="post-slug (auto-generated)"
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Category</span>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                    placeholder="e.g. Recipes, Health"
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Image URL</span>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
                    placeholder="https://... (or leave blank)"
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Excerpt</span>
                  <input
                    type="text"
                    value={form.excerpt}
                    onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))}
                    placeholder="Short summary for list view (optional)"
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                    maxLength={300}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Tags (comma separated)</span>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))}
                    placeholder="e.g. yoghurt,recipes,healthy"
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Content (HTML or Markdown)</span>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
                    placeholder="Full article content"
                    className="mt-1 block w-full rounded-md border px-3 py-2 min-h-[120px]"
                    required
                  />
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((s) => ({ ...s, isPublished: e.target.checked }))} />
                  <span className="text-sm text-gray-700">Published</span>
                </label>

                <div className="flex items-center gap-2">
                  <button type="submit" disabled={busy} className="rounded-md bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-60">
                    {busy ? "Saving..." : isEditing ? "Save changes" : "Create post"}
                  </button>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        clearMessages();
                      }}
                      className="rounded-md bg-white border px-3 py-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
