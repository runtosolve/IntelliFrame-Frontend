import ClientInput from "@/components/client-input";

export default function Home() {
  return (
    <>
      <header className="bg-gray-800 text-gray-100 flex items-center px-4">
        <img
          className="h-8 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=500"
          alt="Logo"
        />
        <div className="text-lg px-2 py-2 m-2">
          PurlinLine Designer
        </div>
      </header>
      <main className="w-full flex justify-center">
        <ClientInput/>
      </main>
      <footer
        className="mx-4 my-4 border-t border-gray-200 text-center"
      >
        <div className="py-4 text-gray-600">
          &copy; 2023 RunToSolve, LLC. All rights reserved
        </div>
      </footer>
    </>
  )
}
