// A question that the admin can define dynamically for each job application
export interface DynamicQuestion {
  _id?: string;  // Comes from MongoDB subdocument
  questionText: string;  // <-- match backend
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "file";
  required?: boolean;
  options?: string[];
  addedBy?: string; // optional (admin who added it)
}

// Representation of a job posting
export interface Job {
  _id: string;
  title: string;
  slug: string;  // <-- backend has this
  description: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship" | "Temporary" | "Remote";
  department?: string;
  salaryRange?: string;
  requirements?: string[];
  responsibilities?: string[];
  tags?: string[];
  applicationDeadline?: string;
  status?: "active" | "closed" | "draft";
  postedBy?: string;

  dynamicQuestions?: DynamicQuestion[];

  views?: number;
  applicationsCount?: number;

  createdAt?: string;
  updatedAt?: string;
}

// A job application submitted by a candidate
export interface JobApplication {
  _id?: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  phone?: string;
  coverLetter?: string;
  resumeUrl?: string;  
  answers?: Record<string, string | string[]>; // responses to dynamic questions
  createdAt?: string;
}
