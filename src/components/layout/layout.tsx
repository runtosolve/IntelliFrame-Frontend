import Footer from "./footer";
import Header from "./header";

export default function Layout({ children } : LayoutProps) {
  return (
    <>
      <Header/>
      <main className="w-full my-12 flex flex-col justify-center items-center">
        {children}
      </main>
      <Footer/>
    </>
  );
}

type LayoutProps = {
  children: React.ReactNode;
}