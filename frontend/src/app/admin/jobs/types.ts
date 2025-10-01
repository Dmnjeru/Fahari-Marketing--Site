// frontend/src/app/admin/jobs/types.ts

export interface Job {
  _id: string;
  id?: string; // fallback for APIs returning "id"
  title: string;
  description: string; // required for JobModal
  department?: string;
  location: string;
  type: string; // Full-time, Part-time, etc.
  status: "active" | "closed" | "draft"; // match JobModal
  applicationDeadline?: string | null;
  createdAt: string;
  updatedAt?: string;

  // Optional extended job details
  requirements?: string[];
  responsibilities?: string[];
  tags?: string[];
  salaryRange?: string;
  slug?: string;

  // 🔑 Custom application questions (aligned with backend / JobModal)
  dynamicQuestions?: {
    questionText: string; // <-- aligned with backend Job.dynamicQuestions
    type: "text" | "textarea" | "select" | "checkbox" | "radio" | "file";
    required?: boolean;
    options?: string[]; // for select, checkbox, radio
    _id?: string; // optional id when populated from DB
  }[];

  // 🔑 Analytics / extra fields (optional)
  applicationsCount?: number; // total applications submitted
  views?: number; // how many times job viewed
}
