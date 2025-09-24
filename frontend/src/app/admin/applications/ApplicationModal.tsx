// frontend/src/app/admin/applications/ApplicationModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save } from "lucide-react";

export interface Application {
  _id: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  status: "pending" | "reviewed" | "rejected" | "accepted";
  submittedAt: string;
  resumeUrl?: string;
  coverLetter?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onSaved?: () => void;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  application,
  onSaved,
}: Props) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Application["status"]>("pending");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (application) setStatus(application.status);
  }, [application]);

  const mutation = useMutation({
    mutationFn: async (newStatus: Application["status"]) => {
      if (!application?._id) return;
      const rawApi = process.env.NEXT_PUBLIC_API_URL ?? "";
      const API_BASE = rawApi.replace(/\/$/, ""); // normalize

      const res = await axios.patch(
        `${API_BASE}/api/careers/applications/${application._id}`,
        { status: newStatus },
        { withCredentials: true } // ✅ send cookies/tokens
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      onSaved?.();
      onClose();
    },
    onError: (err) => {
      console.error("Failed to update application:", err);
    },
  });

  const handleSave = async () => {
    if (!application) return;
    setIsSaving(true);
    try {
      await mutation.mutateAsync(status);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative z-10 max-w-xl w-full p-6 rounded-2xl overflow-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Application Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>

        {/* Body */}
        <div className="space-y-3">
          <p>
            <strong>Applicant:</strong> {application.applicantName}
          </p>
          <p>
            <strong>Email:</strong> {application.applicantEmail}
          </p>
          <p>
            <strong>Job:</strong> {application.jobTitle}
          </p>
          <p>
            <strong>Submitted:</strong>{" "}
            {new Date(application.submittedAt).toLocaleDateString()}
          </p>

          {application.coverLetter && (
            <p>
              <strong>Cover Letter:</strong> {application.coverLetter}
            </p>
          )}

          {application.resumeUrl && (
            <p>
              <strong>Resume:</strong>{" "}
              <a
                href={application.resumeUrl}
                target="_blank"
                className="text-blue-600 underline"
              >
                View
              </a>
            </p>
          )}

          <div>
            <Label>Status</Label>
           <Select
  value={status}
  onValueChange={(v: string) => setStatus(v as Application["status"])}
>

              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2" /> Save
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
