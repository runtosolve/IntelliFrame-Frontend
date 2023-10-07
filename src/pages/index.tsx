import ClientInput from "@/components/client-input";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <header className="h-16 font-serif border-b-1 bg-white shadow-lg text-gray-900 flex items-center place-content-between space-x-6">
        <Image
          width={100} 
          height={100}
          src="/RunToSolveLogo.svg"
          alt="Logo"
          className="h-full w-auto py-2 px-6"
        />
        <div className="h-full px-16 text-md font-medium text-gray-700 flex items-center">
          PurlinLine Designer
        </div>
      </header>
      <main className="py-12 w-full flex justify-center bg-gray-100">
        <ClientInput/>
      </main>
      <footer
        className="bg-slate-950 border-t border-gray-100 text-gray-100 text-center"
      >
        <div className="py-6">
          &copy; 2023 RunToSolve, LLC. All rights reserved
        </div>
      </footer>
    </>
  )
}
