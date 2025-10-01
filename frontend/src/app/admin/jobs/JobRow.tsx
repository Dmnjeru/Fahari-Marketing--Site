// frontend/src/app/admin/jobs/JobRow.tsx
"use client";

import React from "react";
import type { Job } from "./types";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface JobRowProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

export default function JobRow({ job, onEdit, onDelete }: JobRowProps) {
  // Defensive: ensure we have an ID
  const jobId = job._id ?? job.id;

  const handleEdit = () => onEdit(job);

  const handleDelete = () => {
    if (!jobId) {
      console.warn("Attempted to delete job without ID:", job);
      return;
    }
    if (confirm(`Are you sure you want to delete job "${job.title}"?`)) {
      onDelete(String(jobId));
    }
  };

  // Normalize status
  const statusKey = (job.status ?? "").toLowerCase();
  let statusLabel = "Unknown";
  let statusClass = "bg-gray-100 text-gray-800";

  if (statusKey === "active" || statusKey === "open") {
    statusLabel = "Open";
    statusClass = "bg-green-100 text-green-800";
  } else if (statusKey === "closed") {
    statusLabel = "Closed";
    statusClass = "bg-red-100 text-red-800";
  } else if (statusKey === "draft") {
    statusLabel = "Draft";
    statusClass = "bg-yellow-100 text-yellow-800";
  }

  // Deadline display
  const deadlineDisplay = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString()
    : "-";

  // Created display (relative)
  const createdDisplay = job.createdAt
    ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
    : "-";

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Title + Department */}
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{job.title}</div>
        {job.department && (
          <div className="text-xs text-gray-500">{job.department}</div>
        )}
      </td>

      {/* Location */}
      <td className="px-4 py-3 text-gray-700">{job.location || "-"}</td>

      {/* Type */}
      <td className="px-4 py-3 text-gray-700">{job.type || "-"}</td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge className={statusClass}>{statusLabel}</Badge>
      </td>

      {/* Deadline */}
      <td className="px-4 py-3 text-gray-700">{deadlineDisplay}</td>

      {/* Created */}
      <td className="px-4 py-3 text-gray-500 text-sm">{createdDisplay}</td>

      {/* Actions */}
      <td className="px-4 py-3 flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          className="flex items-center gap-1"
        >
          <Pencil size={16} /> Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="flex items-center gap-1"
        >
          <Trash2 size={16} /> Delete
        </Button>
      </td>
    </tr>
  );
}
