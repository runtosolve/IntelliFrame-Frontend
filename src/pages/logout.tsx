import { useAuth } from "react-oidc-context";

export default function SignedOut() {
  const auth = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p>You have been signed out.</p>
      <button className="btn btn-outline btn-sm rounded-lg" onClick={() => auth.signinRedirect()}>
        Sign in
      </button>
    </div>
  );
}
