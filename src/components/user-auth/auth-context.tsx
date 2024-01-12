import { FormEvent, createContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

export enum LoginStatus {
  Idle,
  Pending,
  Success,
  Failure,
}

const AuthContext = createContext<AuthContextProps>({
  username: "",
  accessToken: "",
  refreshToken: "",
  loginStatus: LoginStatus.Idle,
  loginUser: () => {},
});
export default AuthContext;

export function AuthContextProvider({ children }: AuthContextProviderProps) {

  const [loginStatus, setLoginStatus] = useState(LoginStatus.Idle); // used to display toggle login failure status
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  const loginUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoginStatus(LoginStatus.Pending);

    const target = e.target as typeof e.target & { 
      username: { value: string },
      password: { value: string },
    }

    let response = await fetch("http://localhost:8000/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: target.username.value,
        password: target.password.value,
      }),
    });
    let data = await response.json();

    if (response.status === 200) {
      setUsername(jwtDecode(data.access))
      setAccessToken(data.access);
      setRefreshToken(data.refresh);
      localStorage.setItem("authTokens", JSON.stringify(data));
      setLoginStatus(LoginStatus.Success);
    }
    else setLoginStatus(LoginStatus.Failure);
  }
  
  const authContextValue = {
    loginStatus,
    username,
    accessToken,
    refreshToken,
    loginUser,
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
  loginStatus: LoginStatus,
  loginUser: (e: FormEvent<HTMLFormElement>) => void,
}

type AuthContextProviderProps = {
  children: React.ReactNode,
}

