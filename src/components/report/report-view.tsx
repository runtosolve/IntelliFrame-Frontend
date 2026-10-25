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
import { REPORT_TIMEOUT_MS, REPORT_URL } from "@/config/api";

type GeneratedReport = {
  url: string;
  filename: string;
  type: ReportType;
  fingerprint: string;
};

function reportFilename(response: Response, project: ProjectInfo, type: ReportType) {
  const header = response.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(header);
  if (match) return match[1];
  const base = project.projectName.trim().replace(/[^A-Za-z0-9._ -]/g, "_") || "IntelliFrame_Report";
  return `${base}${type === "detailed" ? "_detailed" : ""}.pdf`;
}

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
    const timeoutId = window.setTimeout(() => controller.abort(), REPORT_TIMEOUT_MS);
    const fingerprint = reportFingerprint(input, project);
    setRunning(type);
    setError(null);

    try {
      const response = await fetch(REPORT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: mapReportToJSON(input, project, type),
        signal: controller.signal,
      });
      if (!response.ok) {
        let detail = `Server error ${response.status}`;
        try {
          const body = await response.json();
          detail = body.detail ?? body.error ?? detail;
        } catch {
          // not a JSON error body
        }
        throw new Error(detail);
      }
      const blob = await response.blob();
      setReport({
        url: URL.createObjectURL(new Blob([blob], { type: "application/pdf" })),
        filename: reportFilename(response, project, type),
        type,
        fingerprint,
      });
      message.success(type === "detailed" ? "Detailed report is ready" : "Report is ready");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (controllerRef.current === controller) setError("The report timed out. Please try again.");
      } else if (err instanceof TypeError) {
        setError("Sorry, there is a problem with the server.");
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
      console.error(err);
    } finally {
      window.clearTimeout(timeoutId);
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setRunning(null);
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
              Running the existing and retrofitted roof for gravity and uplift and building the report.
              This takes 1-2 minutes.
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
