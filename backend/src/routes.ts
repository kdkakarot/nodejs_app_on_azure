import { Router, Request, Response } from "express";
import { getJob, getAllJobs } from "./jobStore";
import { startJob } from "./jobRunner";
import { CreateJobRequest } from "./types";

const router = Router();

/** POST /api/jobs — Submit a new PDF processing job */
router.post("/", (req: Request<{}, {}, CreateJobRequest>, res: Response) => {
  try {
    const { inputFolder, outputFolder } = req.body;

    if (!inputFolder || !outputFolder) {
      res.status(400).json({
        error: "Both inputFolder and outputFolder are required.",
      });
      return;
    }

    const job = startJob(inputFolder, outputFolder);

    res.status(201).json({
      id: job.id,
      status: job.status,
      message: "Job submitted successfully. Poll /api/jobs/:id for status.",
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/** GET /api/jobs — List all jobs */
router.get("/", (_req: Request, res: Response) => {
  const jobs = getAllJobs();
  res.json(jobs);
});

/** GET /api/jobs/:id — Get a specific job's status/logs */
router.get("/:id", (req: Request, res: Response) => {
  const job = getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found." });
    return;
  }
  res.json(job);
});

export default router;
