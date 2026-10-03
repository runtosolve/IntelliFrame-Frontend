import { useState } from "react";
import { Button, message } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { PurLinLineState } from "../hooks/use-purlin-line";
import { mapStateToJSON } from "./submission-utils";
import { AnalaysisData, processRawData } from "../results/results-display";
import { API_URL } from "@/config/api";

export default function SubmitButton({ input, onUpdate }: SubmitButtonProps) {
  const [running, setRunning] = useState(false);

  const handleClick = async () => {
    setRunning(true);
    onUpdate(null);

    const submittedInput = mapStateToJSON(input);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: submittedInput,
      });

      if (!response.ok) {
        message.error("Sorry, there is a problem with the server");
        throw new Error("Server error");
      }

      const data = await response.json();
      onUpdate(processRawData(input, data), submittedInput);
      message.success("Analysis has been completed");
    } catch (err) {
      if (err instanceof TypeError) {
        message.error("Sorry, there is a problem with the server");
      }
      console.error(err);
    } finally {
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
  onUpdate: (data: AnalaysisData | null, analyzedInput?: string) => void;
};
