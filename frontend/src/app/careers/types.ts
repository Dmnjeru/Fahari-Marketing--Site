// frontend/src/app/careers/types.ts
export type Job = {
  _id: string;
  title: string;
  location: string;
  type: string; // "Full-time" | "Part-time" ...
  description: string;
  requirements?: string[];
  status?: string;
  createdAt: string;
  updatedAt?: string;
};
