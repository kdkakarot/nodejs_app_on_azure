import { spawn } from "child_process";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Job } from "./types";
import { createJob, updateJob, appendLog } from "./jobStore";

/** Resolve the path to the PDF processor exe */
function getExePath(): string {
  return path.resolve(__dirname, "..", "..", "pdf_processin_exe", "pdf_processor.exe");
}

/** Validate that a path string looks reasonable */
function validatePath(p: string): string | null {
  if (!p || typeof p !== "string") return "Path is required.";
  const trimmed = p.trim();
  if (trimmed.length === 0) return "Path cannot be empty.";
  if (trimmed.length > 500) return "Path is too long.";
  return null;
}

export function startJob(inputFolder: string, outputFolder: string): Job {
  const inputErr = validatePath(inputFolder);
  if (inputErr) throw new Error(`Invalid input folder: ${inputErr}`);

  const outputErr = validatePath(outputFolder);
  if (outputErr) throw new Error(`Invalid output folder: ${outputErr}`);

  const job: Job = {
    id: uuidv4(),
    status: "queued",
    inputFolder: inputFolder.trim(),
    outputFolder: outputFolder.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    logs: [],
  };

  createJob(job);
  appendLog(job.id, "Job created, queued for processing.");

  // Run async — don't await
  runExe(job.id, job.inputFolder, job.outputFolder);

  return job;
}

async function runExe(jobId: string, inputFolder: string, outputFolder: string): Promise<void> {
  const exePath = getExePath();

  updateJob(jobId, { status: "running" });
  appendLog(jobId, `Starting exe: ${exePath}`);
  appendLog(jobId, `Input: ${inputFolder}`);
  appendLog(jobId, `Output: ${outputFolder}`);

  return new Promise<void>((resolve) => {
    const child = spawn(exePath, ["--input", inputFolder, "--output", outputFolder], {
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      const text = data.toString();
      stdout += text;
      // Stream each line as a log entry
      text
        .split("\n")
        .filter((l: string) => l.trim())
        .forEach((line: string) => appendLog(jobId, line.trim()));
    });

    child.stderr.on("data", (data: Buffer) => {
      const text = data.toString();
      stderr += text;
      text
        .split("\n")
        .filter((l: string) => l.trim())
        .forEach((line: string) => appendLog(jobId, `[STDERR] ${line.trim()}`));
    });

    child.on("error", (err) => {
      appendLog(jobId, `Process error: ${err.message}`);
      updateJob(jobId, { status: "failed" });
      resolve();
    });

    child.on("close", (code) => {
      if (code === 0) {
        // Try to parse result JSON from stdout
        try {
          const marker = "__RESULT_JSON__";
          const idx = stdout.indexOf(marker);
          if (idx !== -1) {
            const jsonStr = stdout.substring(idx + marker.length).trim();
            const result = JSON.parse(jsonStr);
            updateJob(jobId, { status: "success", result });
          } else {
            updateJob(jobId, { status: "success" });
          }
        } catch {
          updateJob(jobId, { status: "success" });
        }
        appendLog(jobId, "Processing completed successfully.");
      } else {
        appendLog(jobId, `Process exited with code ${code}.`);
        updateJob(jobId, { status: "failed" });
      }
      resolve();
    });
  });
}
