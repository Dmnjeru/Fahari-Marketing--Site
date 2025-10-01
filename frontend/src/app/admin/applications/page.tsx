// frontend/src/app/admin/applications/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosAuth from "../../../lib/axiosAuth"; // axios wrapper with auth
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../../../components/ui/table";
import { motion } from "framer-motion";
import { Trash2, Eye } from "lucide-react";
import axios from "axios";
import ApplicationModal, { Application } from "./ApplicationModal";

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch applications
  const {
    data: applications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Application[]>({
    queryKey: ["admin-applications", search],
    queryFn: async () => {
      const res = await axiosAuth.get<{ data: Application[] }>(
        `/api/careers/applications?q=${encodeURIComponent(search)}`
      );
      return res.data?.data ?? [];
    },
    refetchInterval: 10000, // auto-refetch every 10s
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  // Delete application
  const deleteMutation = useMutation<void, unknown, string>({
    mutationFn: async (id: string) => {
      await axiosAuth.delete(`/api/careers/applications/${encodeURIComponent(id)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Input
          placeholder="Search by applicant or job..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* MAIN CARD */}
      <Card className="shadow-md">
        <CardContent className="p-4 space-y-4">
          {/* LOADING */}
          {isLoading && <p className="text-gray-500">Loading applications...</p>}

          {/* ERROR */}
          {isError && (
            <div className="text-red-600">
              <p>Failed to load applications.</p>
              <p className="text-sm">
                {axios.isAxiosError(error)
                  ? error.response?.data?.message || error.message
                  : (error as Error).message}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* NO RESULTS */}
          {!isLoading && !isError && applications.length === 0 && (
            <p className="text-gray-500">No applications found.</p>
          )}

          {/* APPLICATION LIST */}
          {!isLoading && applications.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app._id} className="hover:bg-gray-50">
                      <TableCell>{app.applicantName}</TableCell>
                      <TableCell>{app.applicantEmail}</TableCell>
                      <TableCell>{app.jobTitle || "—"}</TableCell>
                      <TableCell className="capitalize">{app.status}</TableCell>
                      <TableCell>
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {/* View button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setIsModalOpen(true);
                          }}
                        >
                          <Eye size={16} />
                        </Button>

                        {/* Delete button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (
                              confirm("Are you sure you want to delete this application?")
                            ) {
                              deleteMutation.mutate(app._id);
                            }
                          }}
                        >
                          {deleteMutation.isPending ? "Deleting..." : <Trash2 size={16} />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Modal integration */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApp(null);
        }}
        application={selectedApp}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["admin-applications"] })}
      />
    </motion.div>
  );
}
