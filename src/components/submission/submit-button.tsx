import { useState } from "react";
import { Alert, Button } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { PurLinLineState } from "../hooks/use-purlin-line";
import { mapStateToJSON } from "./submission-utils";
import { AnalaysisData, processRawData } from "../results/results-display";
import { useAuthContext } from "../user-auth/auth-context";

export default function SubmitButton({ input, onUpdate }: SubmitButtonProps) {
  const { isAuthenticated, getFreshTokens, openLoginModal } = useAuthContext();
  const [submitStaus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const handleClick = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setSubmitStatus("running");
    onUpdate(null);

    // Refresh tokens first; getSession silently renews them via the refresh
    // token, so a page left open past the 1h token lifetime still works.
    let tokens: { accessToken: string; idToken: string };
    try {
      tokens = await getFreshTokens();
    } catch {
      setSubmitStatus("not-authenticated");
      openLoginModal();
      return;
    }

    try {
      // The API Gateway Lambda authorizer verifies Cognito ACCESS tokens
      // (tokenUse: "access"). Send the access token — an id token is rejected
      // with a 403 that carries no CORS headers, which the browser then blocks.
      const response = await fetch(`https://api.runtosolve.com/purlinline/base`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: mapStateToJSON(input)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setSubmitStatus("not-authenticated");
          openLoginModal();
          throw new Error("User is not authenticated");
        }
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
        <Alert type="success" showIcon title="Analysis has been completed" />
      );
    case "error":
      return (
        <Alert type="error" showIcon title="Sorry, there is a problem with server" />
      );
    case "not-authenticated":
      return (
        <Alert type="warning" showIcon title="Please sign in to run analysis" />
      );
    default:
      return <></>;
  }
};

type SubmitButtonProps = {
  input: PurLinLineState;
  onUpdate: (data: AnalaysisData | null) => void;
};

type SubmitStatus = "idle" | "running" | "ready" | "error" | "not-authenticated";

type StatusAlertProps = {
  status: SubmitStatus;
};
