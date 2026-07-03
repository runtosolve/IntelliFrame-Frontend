import { useState } from "react";
import { Alert, Button } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { PurLinLineState } from "../hooks/use-purlin-line";
import { mapStateToJSON } from "./submission-utils";
import { AnalaysisData, processRawData } from "../results/results-display";

export default function SubmitButton({ input, onUpdate, accessToken }: SubmitButtonProps) {
  const [submitStaus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const handleClick = async () => {
    setSubmitStatus("running");
    onUpdate(null);

    try {
      const response = await fetch(`https://api.runtosolve.com/purlinline/base`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: mapStateToJSON(input)
      });

      if (!response.ok) {
        setSubmitStatus("error");
        throw new Error("Server error");
      }

      const data = await response.json();
      setSubmitStatus("ready");
      onUpdate(processRawData(input, data));
    } catch (err) {
      // Network failures reject before a status is set; don't leave the button loading forever
      setSubmitStatus(prev => prev === "running" ? "error" : prev);
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm px-4 py-2.5 flex items-center gap-3">
      <Button
        name="submit-button"
        type="primary"
        className="w-28"
        style={{ background: "#f5a623", borderColor: "#f5a623", fontWeight: 600 }}
        icon={<ThunderboltOutlined />}
        loading={submitStaus == "running"}
        onClick={handleClick}
      >
        {(submitStaus == "running") ? ("Running") : ("Run")}
      </Button>
      <StatusAlert status={submitStaus} />
    </div>
  );
}

const StatusAlert = ({ status }: StatusAlertProps) => {
  switch (status) {
    case "ready":
      return (
        <Alert type="success" showIcon message="Analysis has been completed" />
      );
    case "error":
      return (
        <Alert type="error" showIcon message="Sorry, there is a problem with server" />
      );
    default:
      return <></>;
  }
};

type SubmitButtonProps = {
  input: PurLinLineState;
  onUpdate: (data: AnalaysisData | null) => void;
  accessToken: string;
};

type SubmitStatus = "idle" | "running" | "ready" | "error";

type StatusAlertProps = {
  status: SubmitStatus;
};
