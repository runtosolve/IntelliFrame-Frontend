import { FormEvent, createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export enum LoginStatus {
  LoggedOut,
  Pending,
  LoggedIn,
  Failure,
}

const AuthContext = createContext<AuthContextProps>({
  username: "",
  accessToken: "",
  refreshToken: "",
  loginStatus: LoginStatus.LoggedOut,
  logInUser: () => { },
  logOutUser: () => { },
});
export default AuthContext;

export function AuthContextProvider({ children }: AuthContextProviderProps) {

  const [loginStatus, setLoginStatus] = useState(LoginStatus.LoggedOut); // used to display toggle login failure status
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState((""));
  const [refreshToken, setRefreshToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      handleTokenUpdate(JSON.parse(storedToken));
      setLoginStatus(LoginStatus.LoggedIn);
    }
  }, []);

  const handleTokenUpdate = (authToken: AuthToken) => {
    const decodedToken = jwtDecode(authToken.access);
    const username = (decodedToken as typeof decodedToken & { username: string }).username;
    setUsername(username)
    setAccessToken(authToken.access);
    setRefreshToken(authToken.refresh);
  }

  const logInUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoginStatus(LoginStatus.Pending);

    const target = e.target as typeof e.target & {
      username: { value: string },
      password: { value: string },
    }

    let response = await fetch("http://localhost:8000/api/user/token/", {
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
      handleTokenUpdate(data);
      localStorage.setItem("authToken", JSON.stringify(data));
      setLoginStatus(LoginStatus.LoggedIn);
    }
    else setLoginStatus(LoginStatus.Failure);
  }

  const logOutUser = () => {
    setLoginStatus(LoginStatus.LoggedOut);
    setUsername("");
    setAccessToken("");
    setRefreshToken("");
    localStorage.removeItem("authToken");
  }

  const authContextValue = {
    loginStatus,
    username,
    accessToken,
    refreshToken,
    logInUser,
    logOutUser,
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
  logInUser: (e: FormEvent<HTMLFormElement>) => void,
  logOutUser: () => void,
}

type AuthContextProviderProps = {
  children: React.ReactNode,
}

type AuthToken = {
  username: string,
  access: string,
  refresh: string,
}