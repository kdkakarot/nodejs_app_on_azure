import { Job } from "./types";

/** In-memory job store */
const jobs = new Map<string, Job>();

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function getAllJobs(): Job[] {
  return Array.from(jobs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createJob(job: Job): void {
  jobs.set(job.id, job);
}

export function updateJob(id: string, updates: Partial<Job>): Job | undefined {
  const existing = jobs.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  jobs.set(id, updated);
  return updated;
}

export function appendLog(id: string, message: string): void {
  const job = jobs.get(id);
  if (job) {
    job.logs.push(`[${new Date().toISOString()}] ${message}`);
    job.updatedAt = new Date().toISOString();
  }
}
