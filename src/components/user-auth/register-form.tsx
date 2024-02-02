import logo from "/public/RunToSolveLogo.svg";
import Image from "next/image";

import AuthContext, { AuthStatus } from "./auth-context";
import { useContext } from "react";

export default function RegisterForm(props: React.HTMLProps<HTMLDivElement>) {

  const authContextValue = useContext(AuthContext);

  return (
    <div {...props}>
      <div className="max-w-screen-md">
        <div className="flex justify-center">
          <Image
            src={logo}
            alt="Logo"
            className="w-1/2 min-w-[160px]"
          />
        </div>

        <h1 className="text-center text-3xl font-bold mt-2 mb-4">
          Create your account for free
        </h1>

        <form onSubmit={authContextValue.registerUser}>
          <div className="space-y-4">

            <div>
              <label htmlFor="email" className="block font-medium text-gray-900">
                Email
              </label>
              <div className="mt-2">
                <input
                  name="email"
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Your email address"
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  name="password"
                  id="password_register"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Your password"
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="first name" className="block font-medium text-gray-900">
                  First name
                </label>
                <div className="mt-2">
                  <input
                    name="first_name"
                    id="first_name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Your first name"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>
              <div className="flex-1">
                <label htmlFor="last name" className="block font-medium text-gray-900">
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    name="last_name"
                    id="last_name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Your last name"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block font-medium text-gray-900">
                Organization
              </label>
              <div className="mt-2">
                <input
                  name="organization"
                  id="organization"
                  type="text"
                  autoComplete="organization"
                  placeholder="Your organization name"
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>



            <div className="flex justify-center mt-8">
              <button type="submit" className="btn btn-neutral btn-block sm:btn-wide">
                Create an account
              </button>
            </div>
          </div>

        </form>
        {
          authContextValue.loginStatus === AuthStatus.RegisterSuccess && (
            <div role="alert" className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-md">
              You have successfully registered. Please simply login.
            </div>
          )
        }

      </div>
    </div>
  );
}