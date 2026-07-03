import logo from "/public/RunToSolveLogo.svg";
import Image from "next/image";
import { Alert, Button, Input } from "antd";
import { BankOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";

import AuthContext, { AuthStatus } from "./auth-context";
import { useContext } from "react";

export default function RegisterForm(props: React.HTMLProps<HTMLDivElement>) {

  const authContextValue = useContext(AuthContext);

  return (
    <div {...props}>
      <div className="w-full min-w-80 max-w-lg px-4">
        <div className="flex justify-center">
          <Image
            src={logo}
            alt="Logo"
            className="w-1/2 min-w-[160px]"
          />
        </div>

        <h1 className="text-center text-3xl font-bold mt-2 mb-6">
          Create your account for free
        </h1>

        <form onSubmit={authContextValue.registerUser}>
          <div className="space-y-4">

            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-[#555] mb-1">
                Email
              </label>
              <Input
                name="email"
                id="email"
                type="email"
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
                id="password_register"
                autoComplete="new-password"
                size="large"
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Your password"
                required
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="first_name" className="block text-[13px] font-medium text-[#555] mb-1">
                  First name
                </label>
                <Input
                  name="first_name"
                  id="first_name"
                  type="text"
                  autoComplete="given-name"
                  size="large"
                  placeholder="Your first name"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="last_name" className="block text-[13px] font-medium text-[#555] mb-1">
                  Last name
                </label>
                <Input
                  name="last_name"
                  id="last_name"
                  type="text"
                  autoComplete="family-name"
                  size="large"
                  placeholder="Your last name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="organization" className="block text-[13px] font-medium text-[#555] mb-1">
                Organization
              </label>
              <Input
                name="organization"
                id="organization"
                type="text"
                autoComplete="organization"
                size="large"
                prefix={<BankOutlined className="text-gray-400" />}
                placeholder="Your organization name"
                required
              />
            </div>

            <div className="flex justify-center mt-8">
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="w-full sm:w-64"
              >
                Create an account
              </Button>
            </div>
          </div>

        </form>
        {
          authContextValue.loginStatus === AuthStatus.RegisterSuccess && (
            <Alert
              className="mt-4"
              type="success"
              showIcon
              message="You have successfully registered. Please simply login."
            />
          )
        }
        {
          authContextValue.loginStatus === AuthStatus.Failure && (
            <Alert
              className="mt-4"
              type="error"
              showIcon
              message="Registration has failed. Please try again."
            />
          )
        }

      </div>
    </div>
  );
}
