import { createContext, useState } from "react";

const AuthContext = createContext<AuthContextProps | null>(null);
export default AuthContext;

export function AuthContextProvider({ children }: AuthContextProviderProps) {

  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  const authContextValue = {
    username,
    accessToken,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}


type AuthContextProps = {
  username: string,
  accessToken: string,
  refreshToken: string,
}

type AuthContextProviderProps = {
  children: React.ReactNode,
}