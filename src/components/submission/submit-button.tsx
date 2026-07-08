import { useState } from "react";
import { Button, message } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { PurLinLineState } from "../hooks/use-purlin-line";
import { mapStateToJSON } from "./submission-utils";
import { AnalaysisData, processRawData } from "../results/results-display";
import { useAuthContext } from "../user-auth/auth-context";

export default function SubmitButton({ input, onUpdate }: SubmitButtonProps) {
  const { isAuthenticated, getFreshTokens, openLoginModal } = useAuthContext();
  const [running, setRunning] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      message.warning("Please sign in to run analysis");
      openLoginModal();
      return;
    }

    setRunning(true);
    onUpdate(null);

    // Refresh tokens first; getSession silently renews them via the refresh
    // token, so a page left open past the 1h token lifetime still works.
    let accessToken: string;
    try {
      accessToken = (await getFreshTokens()).accessToken;
    } catch {
      setRunning(false);
      message.warning("Please sign in to run analysis");
      openLoginModal();
      return;
    }

    try {
      // The API Gateway Lambda authorizer verifies Cognito ACCESS tokens.
      const response = await fetch(`https://api.runtosolve.com/purlinline/base`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: mapStateToJSON(input)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          message.warning("Please sign in to run analysis");
          openLoginModal();
          throw new Error("User is not authenticated");
        }
        message.error("Sorry, there is a problem with the server");
        throw new Error("Server error");
      }

      const data = await response.json();
      onUpdate(processRawData(input, data));
      message.success("Analysis has been completed");
    } catch (err) {
      // Network failures reject before a status is set; surface a generic error.
      if (err instanceof TypeError) {
        message.error("Sorry, there is a problem with the server");
      }
      console.error(err);
    } finally {
      setRunning(false);
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
        loading={running}
        onClick={handleClick}
      >
        {running ? "Running" : "Run"}
      </Button>
    </div>
  );
}

type SubmitButtonProps = {
  input: PurLinLineState;
  onUpdate: (data: AnalaysisData | null) => void;
};
