// src/app/admin/jobs/types.ts
export interface Job {
  _id: string;
  title: string;
  description: string; // <-- required for JobModal
  department?: string;
  location: string;
  type: string; // Full-time, Part-time, etc.
  status: "active" | "closed" | "draft"; // match JobModal
  applicationDeadline?: string | null;
  createdAt: string;
  updatedAt?: string;
  requirements?: string[];
  responsibilities?: string[];
  tags?: string[];
  salaryRange?: string;
  slug?: string;
}
