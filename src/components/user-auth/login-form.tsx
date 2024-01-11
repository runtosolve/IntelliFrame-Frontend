import { useState } from "react";
import logo from "/public/RunToSolveLogo.svg";
import Image from "next/image";

export default function LoginForm({ isOpen, setIsOpen }) {
  // const { login, error } = useUserAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // login(username, password);
  };

  return (
    <dialog className={`modal ${isOpen && 'modal-open'} modal-bottom sm:modal-middle`} id="my_modal_1">
      <div className="modal-box">
        <form>
          <div className="modal-action">
            <button
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
                  id="username"
                  type="text"
                  placeholder="Username"
                  className="input input-bordered w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="input input-bordered w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button className="btn btn-neutral btn-block sm:btn-wide ">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}