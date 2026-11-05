import { useRef, useState } from "react";
import { Button, message } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { PurLinLineState } from "../hooks/use-purlin-line";
import { mapStateToJSON } from "./submission-utils";
import { AnalaysisData, processRawData } from "../results/results-display";
import { CALCULATE_TIMEOUT_MS } from "@/config/api";
import {
  ApiError,
  downloadJobFile,
  jobStatusLabel,
  runJob,
  type AnalysisResult,
  type JobStatus,
} from "@/api/jobs";

export default function SubmitButton({ input, analysisType = "existing", onUpdate }: SubmitButtonProps) {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const handleClick = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setRunning(true);
    setStatus(null);
    onUpdate(null);

    try {
      const payload = JSON.parse(mapStateToJSON(input, analysisType)) as Record<string, unknown>;
      const job = await runJob("/intelliframe/base", payload, {
        signal: controller.signal,
        timeoutMs: CALCULATE_TIMEOUT_MS,
        onStatus: (next) => setStatus(next.status),
      });

      let result = job.result;
      if (!result && job.download_url) {
        const { blob } = await downloadJobFile(job, controller.signal);
        result = JSON.parse(await blob.text()) as AnalysisResult;
      }
      if (!result || typeof result.applied_pressure !== "number") {
        throw new Error("Analysis finished without a usable result. Please try again.");
      }

      onUpdate(processRawData(input, result), input);
      message.success("Analysis has been completed");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        message.error("Analysis timed out. Please try again.");
      } else if (err instanceof ApiError && err.status === 401) {
        message.error("Your session expired. Please sign in again.");
      } else if (err instanceof TypeError) {
        message.error("Sorry, there is a problem with the server");
      } else {
        message.error(err instanceof Error ? err.message : "Analysis failed");
      }
      console.error(err);
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setRunning(false);
        setStatus(null);
      }
    }
  };

  const label = running
    ? (status ? jobStatusLabel(status) : "Submitting…")
    : "Run analysis";

  return (
    <Button
      name="submit-button"
      type="primary"
      size="large"
      className="run-analysis-button"
      icon={<ThunderboltOutlined />}
      loading={running}
      disabled={running}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}

type SubmitButtonProps = {
  input: PurLinLineState;
  analysisType?: "existing" | "retrofit";
  onUpdate: (data: AnalaysisData | null, submittedInput?: PurLinLineState) => void;
};
