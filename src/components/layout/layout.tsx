import Footer from "./footer";
import Header from "./header";

export default function Layout({ children, align = "center" }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-1 w-full flex flex-col items-center ${align === "top" ? "my-6" : "my-12 justify-center"}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

type LayoutProps = {
  children: React.ReactNode;
  align?: "center" | "top";
}
