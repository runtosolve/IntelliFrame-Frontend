import Link from "next/link";
import Image from "next/image";
import logo from "/public/RunToSolveLogo.svg";

export default function Header() {
  return (
    <header className="nav-bar h-16 border-b-1 bg-white text-gray-900 flex justify-center">
      <div className="flex-1 max-w-screen-xl h-full flex items-center place-content-between">
        <div className="ml-6 w-52">
          <Link href="/" className="w-full h-full">
            <Image src={logo} alt="Logo" />
          </Link>
        </div>
        <div className="hidden mr-6 md:flex gap-6 font-semibold">
          <Link href="https://www.linkedin.com/in/cris-moen-3b42a34/">
            <button className="btn btn-outline btn-sm rounded-lg">
              Contact us
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
