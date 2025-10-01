// frontend/src/app/admin/blogs/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/axios";

type Blog = {
  _id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category?: string;
  tags?: string[]; // stored as array
  isPublished?: boolean;
  publishAt?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  createdAt?: string;
};

const defaultForm: Blog = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  category: "",
  tags: [],
  isPublished: false,
  publishAt: null,
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
};

function makeSlug(s = "") {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function estimateReadTime(text = "") {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  const wpm = 200;
  return Math.max(1, Math.round(words / wpm));
}

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e).slice(0, 200);
  } catch {
    return String(e);
  }
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<Blog>({ ...defaultForm });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch admin blogs
  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/blogs", { params: { admin: true, limit: 1000 } });
      setBlogs(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("fetchBlogs:", err);
      setError(getErrorMessage(err) || "Failed to load posts");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const updateField = (patch: Partial<Blog>) => setForm((f) => ({ ...f, ...patch }));

  // Upload single image (file input)
  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const fd = new FormData();
    fd.append("file", file);
    setBusy(true);
    setError(null);
    try {
      const res = await api.post("/api/admin/blogs/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.data?.url;
      if (url) updateField({ image: url });
      setSuccess("Image uploaded");
      setTimeout(() => setSuccess(null), 1500);
    } catch (err) {
      console.error("upload:", err);
      setError(getErrorMessage(err) || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const createPost = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!form.title || !form.content || !form.category) {
      setError("Title, content and category are required.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || makeSlug(form.title || ""),
        tags: (form.tags || []).map(String),
      };
      await api.post("/api/blogs", payload);
      setSuccess("Post created");
      setForm({ ...defaultForm });
      await fetchBlogs();
    } catch (err) {
      console.error("create:", err);
      setError(getErrorMessage(err) || "Create failed");
    } finally {
      setBusy(false);
    }
  };

  const updatePost = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form._id) {
      setError("No post selected");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...form,
        slug: form.slug || makeSlug(form.title || ""),
        tags: (form.tags || []).map(String),
      };
      await api.put(`/api/blogs/${form._id}`, payload);
      setSuccess("Post updated");
      setForm({ ...defaultForm });
      setIsEditing(false);
      await fetchBlogs();
    } catch (err) {
      console.error("update:", err);
      setError(getErrorMessage(err) || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (b: Blog) => {
    setIsEditing(true);
    setForm({
      _id: b._id,
      title: b.title ?? "",
      slug: b.slug ?? makeSlug(b.title ?? ""),
      excerpt: b.excerpt ?? "",
      content: b.content ?? "",
      image: b.image ?? "",
      category: b.category ?? "",
      tags: b.tags ?? [],
      isPublished: Boolean(b.isPublished),
      publishAt: b.publishAt ?? null,
      metaTitle: b.metaTitle ?? "",
      metaDescription: b.metaDescription ?? "",
      canonicalUrl: b.canonicalUrl ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setForm({ ...defaultForm });
    setError(null);
    setSuccess(null);
  };

  const deletePost = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusy(true);
    try {
      await api.delete(`/api/blogs/${id}`);
      setSuccess("Deleted");
      await fetchBlogs();
    } catch (err) {
      console.error("delete:", err);
      setError(getErrorMessage(err) || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  // Tags input is simple comma-separated string for simplicity in UI
  const setTagsFromString = (val: string) =>
    updateField({ tags: val.split(",").map((t) => t.trim()).filter(Boolean) });

  const tagsString = (form.tags || []).join(", ");

  const readTime = estimateReadTime(form.content || "");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Articles (Admin)</h1>
            <p className="text-sm text-gray-600">Simple editor focused on SEO fields.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-700 hover:underline">← Dashboard</Link>
            <button
              onClick={() => {
                setForm({ ...defaultForm });
                setIsEditing(false);
                setError(null);
                setSuccess(null);
              }}
              className="rounded-md bg-white border px-3 py-1 text-sm shadow-sm hover:shadow"
            >
              New article
            </button>
          </div>
        </header>

        {error && <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-800">{error}</div>}
        {success && <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-green-800">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: list */}
          <div className="col-span-2">
            <div className="bg-white border rounded-lg p-4 mb-6">
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
                    <li key={b._id} className="p-3 rounded-md hover:bg-gray-50 border">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-medium">{b.title}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {b.category ?? "Uncategorized"} • {b.isPublished ? "Published" : "Draft"}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => startEdit(b)} className="text-sm px-3 py-1 rounded-md bg-white border">Edit</button>
                          <button onClick={() => deletePost(b._id)} className="text-sm px-3 py-1 rounded-md bg-red-50 text-red-700 border">Delete</button>
                        </div>
                      </div>
                      {b.excerpt && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{b.excerpt}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* preview */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Preview</h3>
              <div className="prose max-w-none">
                <h2>{form.title || "Untitled"}</h2>
                <p className="text-sm text-gray-600">{form.excerpt}</p>
                <div style={{ whiteSpace: "pre-wrap" }}>{form.content || "(no content yet)"}</div>
                <div className="text-xs text-gray-500 mt-2">Read time: {readTime} min</div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <aside>
            <div className="bg-white border rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold">{isEditing ? "Edit article" : "New article"}</h3>

              <form onSubmit={isEditing ? updatePost : createPost} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    required
                    value={form.title || ""}
                    onChange={(e) => updateField({ title: e.target.value })}
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <input
                      value={form.slug || ""}
                      onChange={(e) => updateField({ slug: makeSlug(e.target.value) })}
                      className="mt-1 block w-full rounded-md border px-3 py-2"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => updateField({ slug: makeSlug(form.title || "") })}
                      className="self-end mt-6 rounded-md border px-3 py-2 bg-white"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    required
                    value={form.category || ""}
                    onChange={(e) => updateField({ category: e.target.value })}
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                  <input
                    value={form.excerpt || ""}
                    onChange={(e) => updateField({ excerpt: e.target.value })}
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                    maxLength={300}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                  <input
                    value={tagsString}
                    onChange={(e) => setTagsFromString(e.target.value)}
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Featured image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="mt-1 block w-full"
                  />
                  {form.image && (
                    <div className="mt-2 w-full rounded-md overflow-hidden relative h-48">
                      {/* Using next/image for better optimization. Ensure external domains are configured in next.config.js if needed. */}
                      <Image
                        src={form.image}
                        alt={form.title || "featured image"}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    required
                    value={form.content || ""}
                    onChange={(e) => updateField({ content: e.target.value })}
                    className="mt-1 block w-full rounded-md border px-3 py-2 min-h-[140px]"
                  />
                </div>

                <fieldset className="border-t pt-2 space-y-2">
                  <legend className="text-sm font-medium text-gray-700">SEO</legend>
                  <input
                    placeholder="Meta title"
                    value={form.metaTitle || ""}
                    onChange={(e) => updateField({ metaTitle: e.target.value })}
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                  />
                  <input
                    placeholder="Meta description"
                    value={form.metaDescription || ""}
                    onChange={(e) => updateField({ metaDescription: e.target.value })}
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                  />
                  <input
                    placeholder="Canonical URL (optional)"
                    value={form.canonicalUrl || ""}
                    onChange={(e) => updateField({ canonicalUrl: e.target.value })}
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                  />
                </fieldset>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(form.isPublished)}
                      onChange={(e) => updateField({ isPublished: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>

                  <input
                    type="datetime-local"
                    value={form.publishAt ?? ""}
                    onChange={(e) => updateField({ publishAt: e.target.value || null })}
                    className="rounded-md border px-2 py-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-md bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-60"
                  >
                    {busy ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save changes" : "Create article"}
                  </button>

                  {isEditing && (
                    <button type="button" onClick={cancelEdit} className="rounded-md bg-white border px-3 py-2">
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
