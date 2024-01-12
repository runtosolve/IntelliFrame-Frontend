import { useContext, useState } from "react";
import logo from "/public/RunToSolveLogo.svg";
import Image from "next/image";
import AuthContext from "./auth-context";
import { LoginStatus } from "./auth-context";


export default function LoginForm({ isOpen, setIsOpen }: LoginFormProps) {
  
  const authContextValue = useContext(AuthContext);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <dialog className={`modal ${isOpen && 'modal-open'} modal-bottom sm:modal-middle`}>
      <div className="modal-box">
        <form onSubmit={authContextValue.loginUser}>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="flex justify-center">
            <Image
              src={logo}
              alt="Logo"
              className="w-1/2 min-w-[160px]"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block font-medium text-gray-900">
                Username
              </label>
              <div className="mt-2">
                <input
                  name="username" 
                  id="username"
                  type="text"
                  autoComplete="username"
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  name="password"
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button type="submit" className="btn btn-neutral btn-block sm:btn-wide">
              Sign in
            </button>
          </div>
        </form>
        {
          authContextValue.loginStatus === LoginStatus.Failure &&
          <div role="alert" className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-md">
            Sign-in has failed. Please try again.
          </div>
        }
        {
          authContextValue.loginStatus === LoginStatus.Success &&
          <div role="alert" className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-md">
            You have successfully signed in.
          </div>
        }
      </div>
    </dialog>
  );
}

type LoginFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}