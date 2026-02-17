// Type definitions for PDF Automation
export type JobStatus = "queued" | "running" | "success" | "failed";

export interface JobFile {
  pdf: string;
  txt: string;
  status: string;
  error?: string;
}

export interface JobResult {
  total: number;
  success: number;
  failed: number;
  files: JobFile[];
}

export interface Job {
  id: string;
  status: JobStatus;
  inputFolder: string;
  outputFolder: string;
  createdAt: string;
  updatedAt: string;
  logs: string[];
  result?: JobResult;
}

export interface CreateJobResponse {
  id: string;
  status: string;
  message: string;
}
