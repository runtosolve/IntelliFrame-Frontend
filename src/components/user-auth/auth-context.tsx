import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  confirmSignIn,
  fetchAuthSession,
  getCurrentUser,
  signIn as amplifySignIn,
  signInWithRedirect,
  signOut as amplifySignOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { configureAuth, isAuthConfigured, OIDC_PROVIDER } from "@/config/auth";

export type SignInOutcome =
  | { status: "signedIn" }
  | { status: "newPasswordRequired" };

type AuthContextValue = {
  isAuthenticated: boolean;
  sessionChecked: boolean;
  email: string;
  accessToken: string;
  signIn: (email: string, password: string) => Promise<SignInOutcome>;
  confirmNewPassword: (newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getFreshTokens: () => Promise<{ accessToken: string; idToken: string }>;
};

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  sessionChecked: false,
  email: "",
  accessToken: "",
  signIn: async () => ({ status: "signedIn" }),
  confirmNewPassword: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  getFreshTokens: async () => ({ accessToken: "", idToken: "" }),
});

export default AuthContext;

export function useAuthContext() {
  return useContext(AuthContext);
}

async function readSession(): Promise<{ email: string; accessToken: string } | null> {
  try {
    await getCurrentUser();
    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken?.toString() ?? "";
    if (!accessToken) return null;
    const payload = session.tokens?.idToken?.payload as Record<string, unknown> | undefined;
    const email =
      (typeof payload?.email === "string" && payload.email) ||
      (typeof payload?.["cognito:username"] === "string" && payload["cognito:username"]) ||
      "";
    return { email, accessToken };
  } catch {
    return null;
  }
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);

  const applySession = useCallback((session: { email: string; accessToken: string } | null) => {
    setEmail(session?.email ?? "");
    setAccessToken(session?.accessToken ?? "");
  }, []);

  const refreshSession = useCallback(async () => {
    applySession(await readSession());
  }, [applySession]);

  useEffect(() => {
    configureAuth();
    let cancelled = false;

    (async () => {
      if (!isAuthConfigured()) {
        if (!cancelled) setSessionChecked(true);
        return;
      }
      await refreshSession();
      if (!cancelled) setSessionChecked(true);
    })();

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
        case "signInWithRedirect":
        case "tokenRefresh":
          void refreshSession();
          break;
        case "signedOut":
        case "signInWithRedirect_failure":
          applySession(null);
          break;
        default:
          break;
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [applySession, refreshSession]);

  const signIn = useCallback(async (username: string, password: string): Promise<SignInOutcome> => {
    configureAuth();
    try {
      await amplifySignOut({ global: false });
    } catch {
    }

    const result = await amplifySignIn({ username, password });
    if (result.isSignedIn) {
      applySession(await readSession());
      return { status: "signedIn" };
    }

    if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
      return { status: "newPasswordRequired" };
    }

    throw new Error(
      `Sign-in needs another step (${result.nextStep?.signInStep ?? "unknown"}). Contact your administrator.`,
    );
  }, [applySession]);

  const confirmNewPassword = useCallback(async (newPassword: string) => {
    configureAuth();
    const result = await confirmSignIn({ challengeResponse: newPassword });
    if (!result.isSignedIn) {
      throw new Error(
        `Could not finish password setup (${result.nextStep?.signInStep ?? "unknown"}). Try again.`,
      );
    }
    applySession(await readSession());
  }, [applySession]);

  const signInWithGoogle = useCallback(async () => {
    configureAuth();
    await signInWithRedirect({ provider: { custom: OIDC_PROVIDER } });
  }, []);

  const signOut = useCallback(async () => {
    configureAuth();
    try {
      await amplifySignOut();
    } finally {
      applySession(null);
    }
  }, [applySession]);

  const getFreshTokens = useCallback(async () => {
    const session = await fetchAuthSession({ forceRefresh: true });
    const access = session.tokens?.accessToken?.toString() ?? "";
    const id = session.tokens?.idToken?.toString() ?? "";
    if (!access) {
      applySession(null);
      throw new Error("Session expired");
    }
    const payload = session.tokens?.idToken?.payload as Record<string, unknown> | undefined;
    const nextEmail =
      (typeof payload?.email === "string" && payload.email) || email;
    applySession({ email: nextEmail, accessToken: access });
    return { accessToken: access, idToken: id };
  }, [applySession, email]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(accessToken),
      sessionChecked,
      email,
      accessToken,
      signIn,
      confirmNewPassword,
      signInWithGoogle,
      signOut,
      getFreshTokens,
    }),
    [
      accessToken,
      confirmNewPassword,
      email,
      getFreshTokens,
      sessionChecked,
      signIn,
      signInWithGoogle,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
