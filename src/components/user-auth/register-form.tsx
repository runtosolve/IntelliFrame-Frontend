import logo from "/public/RunToSolveLogo.svg";
import Image from "next/image";

export default function RegisterForm(props: React.HTMLProps<HTMLDivElement>) {
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
          Create your account
        </h1>

        <form>
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
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block font-medium text-gray-900">
                Full name
              </label>
              <div className="mt-2">
                <input
                  name="name"
                  id="name"
                  type="text"
                  autoComplete="name"
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

            <div>
              <label htmlFor="password" className="block font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  name="password"
                  id="password"
                  type="text"
                  autoComplete="new-password"
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
      </div>
    </div>
  );
}