"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import { io, type Socket } from "socket.io-client";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead as TH,
} from "../../../components/ui/table";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import JobRow from "./JobRow";
import JobModal from "./JobModal";
import type { Job } from "./types";

interface ApiJobsResponse {
  success: boolean;
  data: Job[];
  message?: string;
}

export default function JobsPage(): React.ReactElement {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [notAuthorized, setNotAuthorized] = useState(false);

  const queryClient = useQueryClient();

  // NEXT_PUBLIC_API_URL should include origin and optional /api suffix,
  // e.g. "http://localhost:5000/api"
  const rawApi = process.env.NEXT_PUBLIC_API_URL ?? "";
  const API_BASE = rawApi.replace(/\/$/, ""); // remove trailing slash
  const SOCKET_ORIGIN = API_BASE.replace(/\/api\/?$/, ""); // strip /api for socket origin

  // Keep a single socket instance per mounted JobsPage
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!SOCKET_ORIGIN) return;

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_ORIGIN, {
        withCredentials: true,
        path: "/socket.io",
        transports: ["websocket", "polling"],
        autoConnect: true,
      });
    }

    const sock = socketRef.current;

    const handleJobUpdated = (updatedJob: Job) => {
      queryClient.setQueryData<Job[] | undefined>(["admin-jobs", search], (old) => {
        const prev = Array.isArray(old) ? old.slice() : [];
        const idx = prev.findIndex((j) => j._id === updatedJob._id);
        if (idx >= 0) {
          prev[idx] = updatedJob;
          return prev;
        }
        return [updatedJob, ...prev];
      });
    };

    const handleJobDeleted = (deletedJobId: string) => {
      queryClient.setQueryData<Job[] | undefined>(["admin-jobs", search], (old) => {
        const prev = Array.isArray(old) ? old.slice() : [];
        return prev.filter((j) => j._id !== deletedJobId);
      });
    };

    sock.on("job-updated", handleJobUpdated);
    sock.on("job-deleted", handleJobDeleted);
    sock.on("connect_error", (err: unknown) => {
       
      console.warn("Socket connect error:", err);
    });

    return () => {
      sock.off("job-updated", handleJobUpdated);
      sock.off("job-deleted", handleJobDeleted);
      try {
        sock.disconnect();
      } catch {
        // ignore disconnect errors
      }
      socketRef.current = null;
    };
  }, [SOCKET_ORIGIN, queryClient, search]);

  // useQuery with minimal options to avoid TS overload issues.
  const { data: jobsData, isLoading, isError, error } = useQuery<Job[], Error>({
    queryKey: ["admin-jobs", search],
    queryFn: async (): Promise<Job[]> => {
      try {
        const res = await axios.get<ApiJobsResponse>(
          `${API_BASE}/api/careers/jobs?q=${encodeURIComponent(search)}`,
          { withCredentials: true }
        );
        return res.data?.data ?? [];
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && (err as AxiosError).response?.status === 401) {
          setNotAuthorized(true);
        }
        // rethrow as Error so react-query marks query as errored
        throw err instanceof Error ? err : new Error("Failed to fetch jobs");
      }
    },
    // Add only the core, well-typed options to avoid overload discrimination.
    staleTime: 1000 * 60 * 5,
  });

  const jobs: Job[] = Array.isArray(jobsData) ? jobsData : [];

  // Delete job mutation
  const deleteJobMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (!id) throw new Error("Missing job id");
      await axios.delete(`${API_BASE}/api/careers/jobs/${encodeURIComponent(id)}`, {
        withCredentials: true,
      });
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Job[] | undefined>(["admin-jobs", search], (old) => {
        const prev = Array.isArray(old) ? old.slice() : [];
        return prev.filter((j) => j._id !== deletedId);
      });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (e: Error) => {
       
      console.error("Delete job failed:", e);
    },
  });

  const handleOpenModal = (job: Job | null = null) => {
    setEditingJob(job);
    setOpenModal(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs Management</h1>
        <Button className="flex items-center gap-2" onClick={() => handleOpenModal()}>
          <PlusCircle size={18} /> Add Job
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-4 space-y-4">
          <Input
            placeholder="Search jobs by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search jobs"
          />

          {isLoading && <p className="text-gray-500">Loading jobs...</p>}

          {notAuthorized && (
            <div className="text-red-600">
              <p>Not authorized. Please sign in as an admin.</p>
            </div>
          )}

          {isError && !notAuthorized && (
            <div className="text-red-600">
              <p>Failed to load jobs.</p>
              {axios.isAxiosError(error as unknown) ? (
                <p className="text-sm">
                  {((error as AxiosError<{ message?: string }>)?.response?.data?.message) ??
                    (error instanceof Error ? error.message : "Unknown error")}
                </p>
              ) : (
                <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-jobs", search] })}
              >
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && jobs.length === 0 && <p className="text-gray-500">No jobs found.</p>}

          {!isLoading && jobs.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TH>Title</TH>
                    <TH>Location</TH>
                    <TH>Type</TH>
                    <TH>Status</TH>
                    <TH>Deadline</TH>
                    <TH>Actions</TH>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {jobs.map((job, idx) => {
                    const key = job._id ?? `job-${idx}`;
                    return (
                      <JobRow
                        key={key}
                        job={job}
                        onEdit={() => handleOpenModal(job)}
                        onDelete={(jobId: string) => {
                          if (!jobId) return;
                          deleteJobMutation.mutate(jobId);
                        }}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <JobModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        initialData={editingJob}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["admin-jobs", search] })}
      />
    </motion.div>
  );
}
