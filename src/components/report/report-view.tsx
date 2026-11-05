import { Alert, Button, Empty, Spin, message } from "antd";
import { DownloadOutlined, FileTextOutlined, ProfileOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { PurLinLineState } from "../hooks/use-purlin-line";
import {
  ProjectInfo,
  ReportType,
  mapReportToJSON,
  reportFingerprint,
} from "../submission/submission-utils";
import { REPORT_TIMEOUT_MS } from "@/config/api";
import {
  ApiError,
  downloadJobFile,
  jobStatusLabel,
  runJob,
  type JobStatus,
} from "@/api/jobs";

type GeneratedReport = {
  url: string;
  filename: string;
  type: ReportType;
  fingerprint: string;
  jobId?: string;
};

export default function ReportView({
  input,
  project,
  onStaleChange,
}: {
  input: PurLinLineState;
  project: ProjectInfo;
  onStaleChange?: (stale: boolean) => void;
}) {
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [running, setRunning] = useState<ReportType | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const stale = report !== null && report.fingerprint !== reportFingerprint(input, project);

  useEffect(() => {
    onStaleChange?.(stale);
  }, [stale, onStaleChange]);

  useEffect(() => () => {
    if (report) URL.revokeObjectURL(report.url);
  }, [report]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const generate = async (type: ReportType) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const fingerprint = reportFingerprint(input, project);
    setRunning(type);
    setJobStatus(null);
    setError(null);

    try {
      const payload = JSON.parse(mapReportToJSON(input, project, type)) as Record<string, unknown>;
      const job = await runJob("/intelliframe/export-pdf", payload, {
        signal: controller.signal,
        timeoutMs: REPORT_TIMEOUT_MS,
        onStatus: (next) => setJobStatus(next.status),
      });

      const { blob, filename } = await downloadJobFile(job, controller.signal);
      const url = URL.createObjectURL(new Blob([blob], { type: job.content_type || "application/pdf" }));

      setReport((previous) => {
        if (previous) URL.revokeObjectURL(previous.url);
        return {
          url,
          filename,
          type,
          fingerprint,
          jobId: job.job_id,
        };
      });
      message.success(type === "detailed" ? "Detailed report is ready" : "Report is ready");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (controllerRef.current === controller) setError("The report timed out. Please try again.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Your session expired. Please sign in again.");
      } else if (err instanceof TypeError) {
        setError("Sorry, there is a problem with the server.");
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
      console.error(err);
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setRunning(null);
        setJobStatus(null);
      }
    }
  };

  const download = () => {
    if (!report) return;
    const a = document.createElement("a");
    a.href = report.url;
    a.download = report.filename;
    a.click();
  };

  const progressLabel = jobStatus
    ? jobStatusLabel(jobStatus)
    : "Submitting…";

  return (
    <div className="report-panel">
      <div className="report-actions">
        <Button
          type="primary"
          size="large"
          icon={<FileTextOutlined />}
          loading={running === "summary"}
          disabled={running !== null && running !== "summary"}
          onClick={() => generate("summary")}
        >
          {report && report.type === "summary" ? "Regenerate report" : "Generate report"}
        </Button>
        <Button
          size="large"
          icon={<ProfileOutlined />}
          loading={running === "detailed"}
          disabled={running !== null && running !== "detailed"}
          onClick={() => generate("detailed")}
        >
          Detailed report
        </Button>
        {report && (
          <Button size="large" icon={<DownloadOutlined />} disabled={running !== null} onClick={download}>
            Download PDF
          </Button>
        )}
      </div>

      {error && (
        <Alert className="stale-alert" type="error" showIcon message="The report could not be generated" description={error} />
      )}

      {running ? (
        <div className="report-empty">
          <div className="report-progress">
            <Spin size="large" />
            <p>
              {progressLabel} Running the existing and retrofitted roof for gravity and uplift and
              building the report. This can take a few minutes.
            </p>
          </div>
        </div>
      ) : report ? (
        <div className="report-shell">
          <iframe src={report.url} title="Engineering report" className="report-frame" />
        </div>
      ) : (
        <div className="report-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Generate the engineering report for the current inputs"
          />
        </div>
      )}
    </div>
  );
}
