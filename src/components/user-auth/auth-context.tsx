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
  refreshUser: () => { },
  registerUser: () => { },
});
export default AuthContext;

export function AuthContextProvider({ children }: AuthContextProviderProps) {

  const [loginStatus, setLoginStatus] = useState(LoginStatus.LoggedOut); // used to display toggle login failure status
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState((""));
  const [refreshToken, setRefreshToken] = useState("");

  useEffect(() => {
    const storedTokenString = localStorage.getItem("authToken");
    if (storedTokenString) {
      refreshUser(JSON.parse(storedTokenString).refresh);
    }
  }, []);

  const handleTokenUpdate = (authToken: AuthToken) => {
    const decodedToken = jwtDecode(authToken.access);
    const username = (decodedToken as typeof decodedToken & { username: string }).username;
    setUsername(username)
    setAccessToken(authToken.access);
    setRefreshToken(authToken.refresh);
    localStorage.setItem("authToken", JSON.stringify(authToken));
    setLoginStatus(LoginStatus.LoggedIn);
  }

  const logInUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoginStatus(LoginStatus.Pending);

    const target = e.target as typeof e.target & {
      username: { value: string },
      password: { value: string },
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/token/`, {
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

  const refreshUser = async (token: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: token,
      }),
    });

    let data = await response.json();

    if (response.status === 200) {
      let authToken = {
        username: (jwtDecode(data.access) as typeof data & { username: string }).username,
        access: data.access,
        refresh: token,
      }
      handleTokenUpdate(authToken);
    }
    else {
      setLoginStatus(LoginStatus.Failure);
      logOutUser();
    }
  }

  const registerUser = async (e: FormEvent<HTMLFormElement>) => {

  }

  const authContextValue = {
    loginStatus,
    username,
    accessToken,
    refreshToken,
    logInUser,
    logOutUser,
    refreshUser,
    registerUser,
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
  refreshUser: (token: string) => void,
  registerUser: (e: FormEvent<HTMLFormElement>) => void,
}

type AuthContextProviderProps = {
  children: React.ReactNode,
}

type AuthToken = {
  username: string,
  access: string,
  refresh: string,
}