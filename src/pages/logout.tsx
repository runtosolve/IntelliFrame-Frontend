import { useAuth } from "react-oidc-context";
import { Button } from "antd";

export default function SignedOut() {
  const auth = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p>You have been signed out.</p>
      <Button type="primary" onClick={() => auth.signinRedirect()}>
        Sign in
      </Button>
    </div>
  );
}
