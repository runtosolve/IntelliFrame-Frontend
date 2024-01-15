import { useContext } from "react";
import Footer from "./footer";
import Header from "./header";
import { AuthContextProvider } from "../user-auth/auth-context";

export default function Layout({ children }: LayoutProps) {


  return (
    <>
      <AuthContextProvider>
        <Header />
        <main className="w-full my-12 flex flex-col justify-center items-center">
          {children}
        </main>
        <Footer />
      </AuthContextProvider>
    </>
  );
}

type LayoutProps = {
  children: React.ReactNode;
}