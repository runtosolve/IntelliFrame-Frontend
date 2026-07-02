import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/router";

export default function Callback() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.error) {
      router.replace("/");
    }
  }, [auth.isLoading, auth.error, router]);

  if (auth.error) {
    return <div className="flex items-center justify-center min-h-screen">Authentication error: {auth.error.message}</div>;
  }

  return <div className="flex items-center justify-center min-h-screen">Signing in...</div>;
}
