import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

const USER_POOL_ID = "us-east-1_tX8VGAryE";
const CLIENT_ID = "57mvrdlt25lavm7epi144h67h3";

function getUserPool() {
  return new CognitoUserPool({ UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID });
}

type AuthContextValue = {
  isAuthenticated: boolean;
  sessionChecked: boolean;
  email: string;
  accessToken: string;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => void;
  getFreshTokens: () => Promise<{ accessToken: string; idToken: string }>;
};

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  sessionChecked: false,
  email: "",
  accessToken: "",
  loginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  signIn: async () => {},
  signUp: async () => {},
  confirmSignUp: async () => {},
  signOut: () => {},
  getFreshTokens: async () => ({ accessToken: "", idToken: "" }),
});

export default AuthContext;

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const applySession = useCallback((session: any) => {
    setEmail(session.getIdToken().payload?.email ?? "");
    setAccessToken(session.getAccessToken().getJwtToken());
  }, []);

  useEffect(() => {
    const currentUser = getUserPool().getCurrentUser();
    if (!currentUser) {
      setSessionChecked(true);
      return;
    }
    currentUser.getSession((err: Error | null, session: any) => {
      if (!err && session?.isValid()) applySession(session);
      setSessionChecked(true);
    });
  }, [applySession]);

  const signIn = useCallback((username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      const user = new CognitoUser({ Username: username, Pool: getUserPool() });
      user.authenticateUser(
        new AuthenticationDetails({ Username: username, Password: password }),
        {
          onSuccess: (session) => {
            applySession(session);
            resolve();
          },
          onFailure: reject,
        },
      );
    });
  }, [applySession]);

  const getFreshTokens = useCallback(() => {
    return new Promise<{ accessToken: string; idToken: string }>((resolve, reject) => {
      const currentUser = getUserPool().getCurrentUser();
      if (!currentUser) {
        reject(new Error("Not signed in"));
        return;
      }
      currentUser.getSession((err: Error | null, session: any) => {
        if (err || !session?.isValid()) {
          setEmail("");
          setAccessToken("");
          reject(err ?? new Error("Session expired"));
          return;
        }
        applySession(session);
        resolve({
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
        });
      });
    });
  }, [applySession]);

  const signUp = useCallback((username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      getUserPool().signUp(
        username,
        password,
        [new CognitoUserAttribute({ Name: "email", Value: username })],
        [],
        (err) => (err ? reject(err) : resolve()),
      );
    });
  }, []);

  const confirmSignUp = useCallback((username: string, code: string) => {
    return new Promise<void>((resolve, reject) => {
      const user = new CognitoUser({ Username: username, Pool: getUserPool() });
      user.confirmRegistration(code, true, (err) => (err ? reject(err) : resolve()));
    });
  }, []);

  const signOut = useCallback(() => {
    getUserPool().getCurrentUser()?.signOut();
    setEmail("");
    setAccessToken("");
  }, []);

  const value: AuthContextValue = {
    isAuthenticated: !!accessToken,
    sessionChecked,
    email,
    accessToken,
    loginModalOpen,
    openLoginModal: () => setLoginModalOpen(true),
    closeLoginModal: () => setLoginModalOpen(false),
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    getFreshTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
