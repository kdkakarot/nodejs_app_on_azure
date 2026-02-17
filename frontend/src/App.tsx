import { useState, useEffect, useCallback, useRef } from "react";
import { submitJob, getJob } from "./api";
import type { Job } from "./types";
import "./App.css";

console.log('[App.tsx] Module loaded');

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    queued: "#f59e0b",
    running: "#3b82f6",
    success: "#10b981",
    failed: "#ef4444",
  };
  return (
    <span
      className="status-badge"
      style={{ background: colors[status] || "#6b7280" }}
    >
      {status.toUpperCase()}
    </span>
  );
}

function App() {
  console.log('[App] Component rendering');
  const [inputFolder, setInputFolder] = useState("");
  const [outputFolder, setOutputFolder] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (jobId: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const job = await getJob(jobId);
          setCurrentJob(job);
          if (job.status === "success" || job.status === "failed") {
            stopPolling();
          }
        } catch {
          // keep polling
        }
      }, 1500);
    },
    [stopPolling]
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCurrentJob(null);

    if (!inputFolder.trim() || !outputFolder.trim()) {
      setError("Both input and output folder paths are required.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitJob(inputFolder.trim(), outputFolder.trim());
      setCurrentJob({
        id: response.id,
        status: "queued",
        inputFolder: inputFolder.trim(),
        outputFolder: outputFolder.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        logs: [],
      });
      startPolling(response.id);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>PDF Automation</h1>
        <p>Extract text from PDF files to your output folder</p>
      </header>

      <main className="app-main">
        <form className="job-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="inputFolder">Input PDF Folder (NAS path)</label>
            <input
              id="inputFolder"
              type="text"
              placeholder="e.g. \\\\nas-server\\pdfs  or  D:\\input_PDF"
              value={inputFolder}
              onChange={(e) => setInputFolder(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="outputFolder">Output Folder (NAS path)</label>
            <input
              id="outputFolder"
              type="text"
              placeholder="e.g. \\\\nas-server\\output  or  D:\\output_extract"
              value={outputFolder}
              onChange={(e) => setOutputFolder(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Job"}
          </button>
        </form>

        {currentJob && (
          <section className="job-status">
            <h2>
              Job: <code>{currentJob.id.slice(0, 8)}...</code>{" "}
              <StatusBadge status={currentJob.status} />
            </h2>

            <div className="job-details">
              <p>
                <strong>Input:</strong> {currentJob.inputFolder}
              </p>
              <p>
                <strong>Output:</strong> {currentJob.outputFolder}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(currentJob.createdAt).toLocaleString()}
              </p>
            </div>

            {currentJob.result && (
              <div className="job-result">
                <h3>Results</h3>
                <p>
                  Total: {currentJob.result.total} | Success:{" "}
                  {currentJob.result.success} | Failed:{" "}
                  {currentJob.result.failed}
                </p>
                {currentJob.result.files.length > 0 && (
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th>PDF</th>
                        <th>Output TXT</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentJob.result.files.map((f, i) => (
                        <tr key={i}>
                          <td>{f.pdf}</td>
                          <td>{f.txt}</td>
                          <td>
                            <StatusBadge status={f.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {currentJob.logs.length > 0 && (
              <div className="job-logs">
                <h3>Logs</h3>
                <pre>
                  {currentJob.logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </pre>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
