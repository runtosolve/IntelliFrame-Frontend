import Footer from "./footer";
import Header from "./header";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full my-12 flex flex-col justify-center items-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}

type LayoutProps = {
  children: React.ReactNode;
}
