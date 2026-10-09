import { useState } from "react";
import { Button, message } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { PurLinLineState } from "../hooks/use-purlin-line";
import { mapGeometryToJSON, mapStateToJSON } from "./submission-utils";
import { AnalaysisData, processRawData } from "../results/results-display";
import { API_URL, CALCULATE_TIMEOUT_MS } from "@/config/api";

export default function SubmitButton({ input, analysisType = "existing", onUpdate }: SubmitButtonProps) {
  const [running, setRunning] = useState(false);

  const handleClick = async () => {
    setRunning(true);
    onUpdate(null);

    const submittedInput = mapStateToJSON(input, analysisType);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), CALCULATE_TIMEOUT_MS);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: submittedInput,
        signal: controller.signal,
      });

      if (!response.ok) {
        message.error("Sorry, there is a problem with the server");
        throw new Error("Server error");
      }

      const data = await response.json();
      onUpdate(processRawData(input, data), mapGeometryToJSON(input));
      message.success("Analysis has been completed");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        message.error("Analysis timed out. Please try again.");
      } else if (err instanceof TypeError) {
        message.error("Sorry, there is a problem with the server");
      }
      console.error(err);
    } finally {
      window.clearTimeout(timeoutId);
      setRunning(false);
    }
  };

  return (
    <Button
      name="submit-button"
      type="primary"
      size="large"
      className="run-analysis-button"
      icon={<ThunderboltOutlined />}
      loading={running}
      onClick={handleClick}
    >
      {running ? "Running analysis" : "Run analysis"}
    </Button>
  );
}

type SubmitButtonProps = {
  input: PurLinLineState;
  analysisType?: "existing" | "retrofit";
  onUpdate: (data: AnalaysisData | null, analyzedInput?: string) => void;
};
