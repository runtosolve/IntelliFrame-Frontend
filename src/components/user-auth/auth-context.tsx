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
  email: string;
  accessToken: string;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  email: "",
  accessToken: "",
  loginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  signIn: async () => {},
  signUp: async () => {},
  confirmSignUp: async () => {},
  signOut: () => {},
});

export default AuthContext;

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Restore an existing session from local storage (client only)
  useEffect(() => {
    const currentUser = getUserPool().getCurrentUser();
    if (!currentUser) return;
    currentUser.getSession((err: Error | null, session: any) => {
      if (err || !session?.isValid()) return;
      setEmail(currentUser.getUsername());
      setAccessToken(session.getAccessToken().getJwtToken());
    });
  }, []);

  const signIn = useCallback((username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      const user = new CognitoUser({ Username: username, Pool: getUserPool() });
      user.authenticateUser(
        new AuthenticationDetails({ Username: username, Password: password }),
        {
          onSuccess: (session) => {
            setEmail(username);
            setAccessToken(session.getAccessToken().getJwtToken());
            resolve();
          },
          onFailure: reject,
        },
      );
    });
  }, []);

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
    email,
    accessToken,
    loginModalOpen,
    openLoginModal: () => setLoginModalOpen(true),
    closeLoginModal: () => setLoginModalOpen(false),
    signIn,
    signUp,
    confirmSignUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
