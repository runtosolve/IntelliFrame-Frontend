import { useContext } from "react";
import logo from "/public/RunToSolveLogo.svg";
import Image from "next/image";
import { Alert, Button, Input } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import AuthContext from "./auth-context";
import { AuthStatus } from "./auth-context";


export default function LoginForm() {

  const authContextValue = useContext(AuthContext);

  return (
    <div className="w-full min-w-80 max-w-lg px-4">
      <form onSubmit={authContextValue.logInUser}>

        <div className="flex justify-center">
          <Image
            src={logo}
            alt="Logo"
            className="w-1/2 min-w-[160px]"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-[#555] mb-1">
              Email
            </label>
            <Input
              name="email"
              id="email"
              type="text"
              autoComplete="email"
              size="large"
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Your email address"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-[#555] mb-1">
              Password
            </label>
            <Input.Password
              name="password"
              id="password"
              autoComplete="current-password"
              size="large"
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Your password"
              required
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            className="w-full sm:w-64"
            loading={authContextValue.loginStatus === AuthStatus.Pending}
          >
            Sign in
          </Button>
        </div>
      </form>
      {
        authContextValue.loginStatus === AuthStatus.Failure &&
        <Alert
          className="mt-4"
          type="error"
          showIcon
          message="Sign-in has failed. Please try again."
        />
      }
      {
        authContextValue.loginStatus === AuthStatus.LoggedIn &&
        <Alert
          className="mt-4"
          type="success"
          showIcon
          message="You have successfully signed in."
        />
      }
    </div>
  );
}
