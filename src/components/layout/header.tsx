import Link from "next/link";
import Image from "next/image";
import logo from "/public/RunToSolveLogo.svg";
import { useAuth } from "react-oidc-context";

export default function Header() {
  const auth = useAuth();

  const signOut = () => {
    const clientId = "57mvrdlt25lavm7epi144h67h3";
    const logoutUri = "https://purlinline-app.runtosolve.com";
    const cognitoDomain = "https://runtosolve-auth.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  return (
    <header className="nav-bar h-16 border-b-1 bg-white text-gray-900 flex justify-center">
      <div className="flex-1 max-w-screen-xl h-full flex items-center place-content-between">
        <div className="ml-6 w-52">
          <Link href="/" className="w-full h-full">
            <Image src={logo} alt="Logo" />
          </Link>
        </div>
        <div className="mr-6 flex items-center gap-4">
          {auth.isAuthenticated && (
            <span className="text-sm text-gray-600">{auth.user?.profile.email}</span>
          )}
          <Link href="https://www.linkedin.com/in/cris-moen-3b42a34/">
            <button className="btn btn-outline btn-sm rounded-lg">Contact us</button>
          </Link>
          {auth.isAuthenticated && (
            <button className="btn btn-outline btn-sm rounded-lg" onClick={signOut}>
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
