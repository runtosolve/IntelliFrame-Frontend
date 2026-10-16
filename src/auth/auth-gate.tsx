import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "antd";
import { LoginOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import logo from "/public/IMETCO.png";

const SESSION_KEY = "purlinline-entered";

const SessionContext = createContext({
  signOut: () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-logo-panel">
          <Image className="auth-logo" src={logo} alt="IMETCO" priority />
        </div>
        {children}
      </section>
    </main>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEntered(window.sessionStorage.getItem(SESSION_KEY) === "1");
    setReady(true);
  }, []);

  const signOut = () => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setEntered(false);
  };

  if (!ready) {
    return (
      <AuthShell>
        <span className="auth-icon"><SafetyCertificateOutlined /></span>
        <span className="auth-eyebrow">Engineering workspace</span>
        <h1>IntelliFrame RF</h1>
      </AuthShell>
    );
  }

  if (!entered) {
    return (
      <AuthShell>
        <span className="auth-icon"><SafetyCertificateOutlined /></span>
        <span className="auth-eyebrow">Engineering workspace</span>
        <h1>Welcome to IntelliFrame RF Analysis</h1>
        <p>
          Open the calculator to check purlin lines and generate engineering reports.
        </p>
        <Button
          className="auth-signin"
          type="primary"
          size="large"
          icon={<LoginOutlined />}
          onClick={() => {
            window.sessionStorage.setItem(SESSION_KEY, "1");
            setEntered(true);
          }}
        >
          Sign in securely
        </Button>
        <small>Powered by RunToSolve</small>
      </AuthShell>
    );
  }

  return (
    <SessionContext.Provider value={{ signOut }}>
      {children}
    </SessionContext.Provider>
  );
}
