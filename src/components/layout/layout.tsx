import { useContext } from "react";
import Footer from "./footer";
import Header from "./header";
import { AuthContextProvider } from "../user-auth/auth-context";

export default function Layout({ children }: LayoutProps) {


  return (
    <div className="min-h-screen flex flex-col">
      <AuthContextProvider>
        <Header />
        <main className="flex-1 w-full my-12 flex flex-col justify-center items-center">
          {children}
        </main>
        <Footer />
      </AuthContextProvider>
    </div>
  );
}

type LayoutProps = {
  children: React.ReactNode;
}