// frontend/src/app/admin/pages/PagesManagement.tsx
"use client";

import React, { useEffect, useState } from "react";
import axiosAuth from "../../../lib/axiosAuth";
import Modal from "../../components/Modal"; // Reusable modal

/* ---------------------- Types ---------------------- */
interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
}

type FormMode = "create" | "edit";

/* ---------------------- Component ---------------------- */
const PagesManagement: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [currentPage, setCurrentPage] = useState<Page | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");

  /* ---------------------- API Calls ---------------------- */
  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.get<Page[]>("/api/admin/pages");
      setPages(res.data);
    } catch {
      setError("Failed to load pages.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (formMode === "create") {
        const res = await axiosAuth.post<Page>("/api/admin/pages", {
          title,
          slug,
          content,
        });
        setPages((prev) => [...prev, res.data]);
      } else if (formMode === "edit" && currentPage) {
        const res = await axiosAuth.put<Page>(
          `/api/admin/pages/${currentPage._id}`,
          { title, slug, content }
        );
        setPages((prev) =>
          prev.map((p) => (p._id === currentPage._id ? res.data : p))
        );
      }
      closeModal();
    } catch {
      setError("Failed to save page.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      await axiosAuth.delete(`/api/admin/pages/${id}`);
      setPages((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError("Failed to delete page.");
    }
  };

  /* ---------------------- Modal Helpers ---------------------- */
  const openCreateModal = () => {
    setFormMode("create");
    setTitle("");
    setSlug("");
    setContent("");
    setCurrentPage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (page: Page) => {
    setFormMode("edit");
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setCurrentPage(page);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPage(null);
  };

  /* ---------------------- Effects ---------------------- */
  useEffect(() => {
    fetchPages();
  }, []);

  /* ---------------------- Render ---------------------- */
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pages Management</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
        >
          + New Page
        </button>
      </div>

      {loading && <p>Loading pages…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && pages.length === 0 && (
        <p className="text-gray-500">No pages found.</p>
      )}

      <div className="space-y-4">
        {pages.map((page) => (
          <div
            key={page._id}
            className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">{page.title}</h2>
              <p className="text-sm text-gray-600">/{page.slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(page)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(page._id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-bold mb-4">
          {formMode === "create" ? "Create Page" : "Edit Page"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded h-32"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
            >
              {formMode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PagesManagement;
