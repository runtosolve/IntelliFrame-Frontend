import Link from "next/link";
import Image from "next/image";
import logo from "/public/ImetcoLogo.svg";
import UserProfile from "../user-auth/user-profile";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand-lockup">
          <Link href="/" className="brand-logo" aria-label="IMETCO IntelliFrame RF home">
            <Image src={logo} alt="IMETCO" priority />
          </Link>
          <span className="brand-divider" aria-hidden />
          <div className="brand-product">
            <strong>IntelliFrame RF</strong>
            <span>Structural analysis</span>
          </div>
        </div>
        <UserProfile />
      </div>
    </header>
  );
}
