import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Alert, Button, Divider, Input } from "antd";
import {
  GoogleOutlined,
  LockOutlined,
  LoginOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import logo from "/public/IMETCO.png";
import { useAuthContext } from "@/components/user-auth/auth-context";
import { isAuthConfigured } from "@/config/auth";

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

function SignInPanel() {
  const { signIn, confirmNewPassword, signInWithGoogle } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"credentials" | "newPassword">("credentials");
  const [pending, setPending] = useState<"google" | "password" | "newPassword" | null>(null);
  const [error, setError] = useState("");

  const onGoogle = async () => {
    setError("");
    setPending("google");
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed.";
      setError(message);
      setPending(null);
    }
  };

  const onPassword = async (event?: FormEvent) => {
    event?.preventDefault();
    setError("");
    setPending("password");
    try {
      const outcome = await signIn(email.trim(), password);
      if (outcome.status === "newPasswordRequired") {
        setStep("newPassword");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      setError(message);
    } finally {
      setPending(null);
    }
  };

  const onNewPassword = async (event?: FormEvent) => {
    event?.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setPending("newPassword");
    try {
      await confirmNewPassword(newPassword);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not set the new password. Try signing in again.";
      setError(message);
    } finally {
      setPending(null);
    }
  };

  if (step === "newPassword") {
    return (
      <>
        <span className="auth-icon"><SafetyCertificateOutlined /></span>
        <span className="auth-eyebrow">First-time sign-in</span>
        <h1>Set a permanent password</h1>
        <p>
          Cognito issued a temporary password for <strong>{email}</strong>. Choose a new password
          to finish signing in.
        </p>

        <form className="auth-password-form" onSubmit={onNewPassword}>
          <Input.Password
            autoComplete="new-password"
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={pending !== null}
            size="large"
          />
          <Input.Password
            autoComplete="new-password"
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={pending !== null}
            size="large"
          />
          {error && <Alert type="error" showIcon message={error} />}
          <Button
            className="auth-signin"
            type="primary"
            size="large"
            htmlType="submit"
            icon={<LoginOutlined />}
            loading={pending === "newPassword"}
            disabled={pending !== null || !newPassword || !confirmPassword}
            block
          >
            Save password and continue
          </Button>
          <Button
            type="link"
            disabled={pending !== null}
            onClick={() => {
              setStep("credentials");
              setError("");
              setPassword("");
            }}
          >
            Back to sign in
          </Button>
        </form>

        <small>Powered by RunToSolve · Cognito + Google Workspace</small>
      </>
    );
  }

  return (
    <>
      <span className="auth-icon"><SafetyCertificateOutlined /></span>
      <span className="auth-eyebrow">Engineering workspace</span>
      <h1>Welcome to IntelliFrame RF Analysis</h1>
      <p>
        Sign in with your company Google account or Cognito credentials to analyse purlin lines
        and generate engineering reports.
      </p>

      <Button
        className="auth-signin auth-google"
        type="primary"
        size="large"
        icon={<GoogleOutlined />}
        loading={pending === "google"}
        disabled={pending !== null}
        onClick={onGoogle}
      >
        Continue with RTS SSO
      </Button>

      <Divider className="auth-divider" plain>
        or use email
      </Divider>

      <form className="auth-password-form" onSubmit={onPassword}>
        <Input
          type="email"
          autoComplete="email"
          prefix={<MailOutlined className="text-gray-400" />}
          placeholder="Work email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending !== null}
          size="large"
        />
        <Input.Password
          autoComplete="current-password"
          prefix={<LockOutlined className="text-gray-400" />}
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={pending !== null}
          size="large"
        />
        {error && <Alert type="error" showIcon message={error} />}
        <Button
          className="auth-signin"
          type="default"
          size="large"
          htmlType="submit"
          icon={<LoginOutlined />}
          loading={pending === "password"}
          disabled={pending !== null || !email.trim() || !password}
          block
        >
          Sign in with email
        </Button>
      </form>

      <small>Powered by RunToSolve · Cognito + Google Workspace</small>
    </>
  );
}

function MisconfiguredPanel() {
  return (
    <>
      <span className="auth-icon auth-icon-error"><SafetyCertificateOutlined /></span>
      <span className="auth-eyebrow">Configuration required</span>
      <h1>Auth is not configured</h1>
      <p>
        Set <code>NEXT_PUBLIC_USER_POOL_ID</code>, <code>NEXT_PUBLIC_USER_POOL_CLIENT_ID</code>, and{" "}
        <code>NEXT_PUBLIC_COGNITO_DOMAIN</code> in the environment, then restart the app.
      </p>
      <small>See auth-cognito-google.md</small>
    </>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, sessionChecked } = useAuthContext();

  if (!sessionChecked) {
    return (
      <AuthShell>
        <span className="auth-icon"><SafetyCertificateOutlined /></span>
        <span className="auth-eyebrow">Engineering workspace</span>
        <h1>IntelliFrame RF</h1>
        <p>Checking your secure session…</p>
      </AuthShell>
    );
  }

  if (!isAuthConfigured()) {
    return (
      <AuthShell>
        <MisconfiguredPanel />
      </AuthShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthShell>
        <SignInPanel />
      </AuthShell>
    );
  }

  return <>{children}</>;
}
