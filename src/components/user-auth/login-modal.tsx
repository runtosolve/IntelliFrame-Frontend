import { useState } from "react";
import Image from "next/image";
import logo from "/public/RunToSolveLogo.svg";
import { Alert, Button, Input, Modal, Tabs } from "antd";
import { LockOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { useAuthContext } from "./auth-context";

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal } = useAuthContext();
  const [activeTab, setActiveTab] = useState("sign-in");

  return (
    <Modal
      open={loginModalOpen}
      onCancel={closeLoginModal}
      footer={null}
      width={400}
      destroyOnClose
    >
      <div className="flex justify-center mt-2 mb-1">
        <Image src={logo} alt="Logo" className="w-40" />
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        items={[
          {
            key: "sign-in",
            label: "Sign in",
            children: <SignInForm />,
          },
          {
            key: "sign-up",
            label: "Create account",
            children: <SignUpForm onDone={() => setActiveTab("sign-in")} />,
          },
        ]}
      />
    </Modal>
  );
}

function SignInForm() {
  const { signIn, closeLoginModal } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setPending(true);
    try {
      await signIn(email.trim(), password);
      closeLoginModal();
    } catch (err: any) {
      setError(err?.message || "Sign-in failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label htmlFor="modal-email" className="block text-[13px] font-medium text-[#555] mb-1">
          Email
        </label>
        <Input
          id="modal-email"
          type="email"
          autoComplete="email"
          prefix={<MailOutlined className="text-gray-400" />}
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onPressEnter={handleSubmit}
        />
      </div>
      <div>
        <label htmlFor="modal-password" className="block text-[13px] font-medium text-[#555] mb-1">
          Password
        </label>
        <Input.Password
          id="modal-password"
          autoComplete="current-password"
          prefix={<LockOutlined className="text-gray-400" />}
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onPressEnter={handleSubmit}
        />
      </div>
      {error && <Alert type="error" showIcon title={error} />}
      <Button
        type="primary"
        block
        loading={pending}
        disabled={!email || !password}
        onClick={handleSubmit}
      >
        Sign in
      </Button>
    </div>
  );
}

function SignUpForm({ onDone }: { onDone: () => void }) {
  const { signUp, confirmSignUp, signIn, closeLoginModal } = useAuthContext();
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError("");
    setPending(true);
    try {
      await signUp(email.trim(), password);
      setStep("confirm");
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const handleConfirm = async () => {
    setError("");
    setPending(true);
    try {
      await confirmSignUp(email.trim(), code.trim());
      // Account confirmed; sign the user in right away
      try {
        await signIn(email.trim(), password);
        closeLoginModal();
      } catch {
        onDone();
      }
    } catch (err: any) {
      setError(err?.message || "Confirmation failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (step === "confirm") {
    return (
      <div className="space-y-4 pt-2">
        <Alert
          type="info"
          showIcon
          title={`We sent a verification code to ${email}. Enter it below to activate your account.`}
        />
        <Input
          autoComplete="one-time-code"
          prefix={<SafetyOutlined className="text-gray-400" />}
          placeholder="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onPressEnter={handleConfirm}
        />
        {error && <Alert type="error" showIcon title={error} />}
        <Button type="primary" block loading={pending} disabled={!code} onClick={handleConfirm}>
          Confirm and sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label htmlFor="signup-email" className="block text-[13px] font-medium text-[#555] mb-1">
          Email
        </label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          prefix={<MailOutlined className="text-gray-400" />}
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-[13px] font-medium text-[#555] mb-1">
          Password
        </label>
        <Input.Password
          id="signup-password"
          autoComplete="new-password"
          prefix={<LockOutlined className="text-gray-400" />}
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <Alert type="error" showIcon title={error} />}
      <Button
        type="primary"
        block
        loading={pending}
        disabled={!email || !password}
        onClick={handleSignUp}
      >
        Create account
      </Button>
    </div>
  );
}
