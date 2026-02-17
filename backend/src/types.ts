export type JobStatus = "queued" | "running" | "success" | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  inputFolder: string;
  outputFolder: string;
  createdAt: string;
  updatedAt: string;
  logs: string[];
  result?: {
    total: number;
    success: number;
    failed: number;
    files: Array<{
      pdf: string;
      txt: string;
      status: string;
      error?: string;
    }>;
  };
}

export interface CreateJobRequest {
  inputFolder: string;
  outputFolder: string;
}
