import Link from "next/link";
import Image from "next/image";
import logo from "/public/RunToSolveLogo.svg";

export default function Header() {
  return (
    <>
      <header className="nav-bar h-16 border-b-1 bg-white text-gray-900 flex items-center place-content-between ">
        <div className="ml-6 w-52">
          <Link href="/" className="w-full h-full">
            <Image
              src={logo}
              alt="Logo"
            />
          </Link>
        </div>
        <div className="mr-6 flex gap-6 font-semibold">
          <Link href="/purlinline">
            <button className="btn btn-outline btn-sm">
              PurlinLine.jl
            </button>
          </Link>
          <Link href="https://github.com/runtosolve">
            <button className="btn btn-outline btn-sm">
              GitHub
            </button>
          </Link>
          <Link href="mailto:cris.moen@runtosolve.com">
            <button className="btn btn-outline btn-sm">
              Contact us
            </button>
          </Link>
        </div>
      </header>
    </>
  );
}