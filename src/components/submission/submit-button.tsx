import { useState } from "react";
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
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        name="submit-button"
        className="w-36 h-10 bg-gray-800 hover:bg-gray-600 text-gray-100 rounded"
        onClick={handleClick}
        disabled={submitStaus == "running"}
      >
        <div className="w-full h-full flex justify-center items-center space-x-2">
          {submitStaus == "running" && <span className="loading loading-bars loading-sm text-success"></span>}
          <span>{submitStaus == "running" ? "Running" : "Run"}</span>
        </div>
      </button>
      <StatusAlert status={submitStaus} />
    </div>
  );
}

const StatusAlert = ({ status }: StatusAlertProps) => {
  switch (status) {
    case "ready":
      return (
        <label htmlFor="submit-button" className="bg-green-100 text-green-700 text-center text-sm px-2 py-0.5">
          Analysis has been completed
        </label>
      );
    case "error":
      return (
        <label htmlFor="submit-button" className="bg-red-100 text-red-700 text-center text-sm px-2 py-0.5">
          Sorry, there is a problem with server
        </label>
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
