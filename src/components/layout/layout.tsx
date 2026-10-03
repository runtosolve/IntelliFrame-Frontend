import Footer from "./footer";
import Header from "./header";

export default function Layout({ children, align = "center", flush = false }: LayoutProps) {
  if (flush) {
    return (
      <div className="app-shell app-frame">
        <Header />
        <main className="app-frame-main">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col app-shell">
      <Header />
      <main className={`flex-1 w-full flex flex-col items-center ${align === "top" ? "py-5 md:py-8" : "py-12 justify-center"}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

type LayoutProps = {
  children: React.ReactNode;
  align?: "center" | "top";
  flush?: boolean;
}
