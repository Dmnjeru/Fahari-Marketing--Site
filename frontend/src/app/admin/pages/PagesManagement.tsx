// frontend/src/app/admin/pages/PagesManagement.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Modal from "../../components/Modal"; // Simple reusable modal component

// ---------------------- Types ----------------------
interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
}

interface ApiErrorData {
  message?: string;
}

// ---------------------- Component ----------------------
const PagesManagement: React.FC = () => {
  const router = useRouter();

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [contentUpdate, setContentUpdate] = useState("");
  const [imageUpdate, setImageUpdate] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch pages (useCallback so it can be a dependency safely)
  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ data: Page[] }>("/api/admin/pages", {
        withCredentials: true,
      });
      setPages(res.data.data || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        console.error("Fetch pages failed", axiosErr);
        if (axiosErr.response?.status === 401) {
          router.push("/admin/login");
        } else {
          const apiData = axiosErr.response?.data as ApiErrorData | undefined;
          setError(apiData?.message || axiosErr.message || "Failed to fetch pages.");
        }
      } else if (err instanceof Error) {
        console.error("Fetch pages failed", err);
        setError(err.message);
      } else {
        console.error("Fetch pages failed", err);
        setError("An unknown error occurred while fetching pages.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const openEditModal = (page: Page) => {
    setSelectedPage(page);
    setContentUpdate(page.content);
    setImageUpdate(null);
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedPage) return;

    const payload = new FormData();
    payload.append("content", contentUpdate);
    if (imageUpdate) payload.append("image", imageUpdate);

    setError(null);
    try {
      const res = await axios.patch<{ data: Page }>(
        `/api/admin/pages/${selectedPage._id}`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setPages((prev) => prev.map((p) => (p._id === selectedPage._id ? res.data.data : p)));
      setModalOpen(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        console.error("Update failed", axiosErr);
        const apiData = axiosErr.response?.data as ApiErrorData | undefined;
        setError(apiData?.message || axiosErr.message || "Update failed");
      } else if (err instanceof Error) {
        console.error("Update failed", err);
        setError(err.message);
      } else {
        console.error("Update failed", err);
        setError("An unknown error occurred while updating the page.");
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pages Management</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {loading ? (
        <p>Loading pages...</p>
      ) : pages.length === 0 ? (
        <p>No pages found.</p>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page._id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{page.title}</p>
                <p className="text-sm text-gray-600">{page.slug}</p>
              </div>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => openEditModal(page)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && selectedPage && (
        <Modal title={`Edit Page — ${selectedPage.title}`} onClose={() => setModalOpen(false)}>
          <div className="space-y-3">
            <textarea
              value={contentUpdate}
              onChange={(e) => setContentUpdate(e.target.value)}
              placeholder="Page content"
              className="w-full border p-2 rounded h-40"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageUpdate(e.target.files?.[0] ?? null)}
              className="w-full"
            />
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PagesManagement;
