import Link from "next/link";
import Image from "next/image";
import logo from "/public/RunToSolveLogo.svg";
import { useContext, useState } from "react";
import LoginForm from "../user-auth/login-form";
import AuthContext, { LoginStatus } from "../user-auth/auth-context";
import AccountButton from "../user-auth/account-button";

export default function Header() {

  const authContextValue = useContext(AuthContext);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="nav-bar h-16 border-b-1 bg-white text-gray-900 flex items-center place-content-between ">

        <div className="ml-6 md:hidden dropdown">
          <div tabIndex={0} role="button" title="menu-dropdown">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded">
            <li><Link href="/purlinline">PurlineLine.jl</Link></li>
            <li><Link href="https://github.com/runtosolve">GitHub</Link></li>
            <li><Link href="https://www.linkedin.com/in/cris-moen-3b42a34/">Contact us</Link></li>
          </ul>
        </div>

        <div className="ml-6 w-52">
          <Link href="/" className="w-full h-full">
            <Image
              src={logo}
              alt="Logo"
            />
          </Link>
        </div>

        <div className="hidden mr-6 md:flex gap-6 font-semibold">
          <Link href="/purlinline">
            <button className="btn btn-outline btn-sm rounded-lg">
              PurlinLine.jl
            </button>
          </Link>
          <Link href="https://github.com/runtosolve">
            <button className="btn btn-outline btn-sm rounded-lg">
              GitHub
            </button>
          </Link>
          <Link href="https://www.linkedin.com/in/cris-moen-3b42a34/">
            <button className="btn btn-outline btn-sm rounded-lg">
              Contact us
            </button>
          </Link>
          <div>
            {authContextValue.loginStatus !== LoginStatus.Success ? (
              <button className="btn btn-neutral btn-sm rounded-lg" onClick={() => setIsModalOpen(true)}>
                Sign in
              </button>
            ) : (<AccountButton />)}

          </div>
        </div>

        <LoginForm isOpen={isModalOpen} setIsOpen={setIsModalOpen} />

      </header>
    </>
  );
}