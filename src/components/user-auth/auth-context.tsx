import { FormEvent, createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export enum AuthStatus {
  LoggedOut,
  Pending,
  LoggedIn,
  Failure,
  RegisterSuccess,
}

const AuthContext = createContext<AuthContextProps>({
  username: "",
  name: "",
  accessToken: "",
  refreshToken: "",
  loginStatus: AuthStatus.LoggedOut,
  logInUser: () => { },
  logOutUser: () => { },
  refreshUser: () => { },
  registerUser: () => { },
});
export default AuthContext;

export function AuthContextProvider({ children }: AuthContextProviderProps) {

  const [loginStatus, setLoginStatus] = useState(AuthStatus.LoggedOut); // used to display toggle login failure status
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [accessToken, setAccessToken] = useState((""));
  const [refreshToken, setRefreshToken] = useState("");

  useEffect(() => {
    const storedTokenString = localStorage.getItem("authToken");
    if (storedTokenString) {
      refreshUser(JSON.parse(storedTokenString).refresh);
    }
  }, []);

  const handleTokenUpdate = (authToken: AuthToken) => {
    const decodedToken = jwtDecode(authToken.access) as typeof jwtDecode & { username: string, name: string };
    const username = decodedToken.username;
    const name = decodedToken.name;
    setUsername(username)
    if (name && name !== " ") {
      setName(name);
    }
    setAccessToken(authToken.access);
    setRefreshToken(authToken.refresh);
    localStorage.setItem("authToken", JSON.stringify(authToken));
    setLoginStatus(AuthStatus.LoggedIn);
  }

  const logInUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoginStatus(AuthStatus.Pending);
    const target = e.target as typeof e.target & {
      email: { value: string },
      password: { value: string },
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: target.email.value,
          password: target.password.value,
        }),
      });
      let data = await response.json();
  
      if (response.status === 200) {
        handleTokenUpdate(data);
      }
      else setLoginStatus(AuthStatus.Failure);
    } catch (error) {
      setLoginStatus(AuthStatus.Failure);
      console.error(error);
    }

  }

  const logOutUser = () => {
    setLoginStatus(AuthStatus.LoggedOut);
    setUsername("");
    setAccessToken("");
    setRefreshToken("");
    localStorage.removeItem("authToken");
  }

  const refreshUser = async (token: string) => {
    try {
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
        setLoginStatus(AuthStatus.Failure);
        logOutUser();
      }
    } catch (error) {
      setLoginStatus(AuthStatus.Failure);
      logOutUser();
      console.error(error);
    }
    
  }

  const registerUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      email: { value : string },
      password: { value : string },
      first_name: { value : string },
      last_name: { value : string },
      organization: { value : string },
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: target.email.value,
          first_name: target.first_name.value,
          last_name: target.last_name.value,
          organization: target.organization.value,
          username: target.email.value,
          password: target.password.value,
        }),
      });
  
      if (!response.ok) setLoginStatus(AuthStatus.Failure);
      else setLoginStatus(AuthStatus.RegisterSuccess);
    } catch (error) {
      setLoginStatus(AuthStatus.Failure);
      console.error(error);
    }
  }

  const authContextValue = {
    loginStatus,
    username,
    name,
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
  name: string,
  accessToken: string,
  refreshToken: string,
  loginStatus: AuthStatus,
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

