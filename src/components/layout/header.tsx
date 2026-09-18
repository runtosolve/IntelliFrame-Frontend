import Link from "next/link";
import Image from "next/image";
import logo from "/public/ImetcoLogo.svg";
import { Button, Dropdown } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useAuthContext } from "../user-auth/auth-context";

const MOBILE_MENU_ITEMS = [
  {
    key: "purlinline",
    label: <Link href="/">PurlinLine.jl</Link>,
  },
  {
    key: "github",
    label: <Link href="https://github.com/runtosolve">GitHub</Link>,
  },
  {
    key: "contact",
    label: <Link href="https://www.linkedin.com/in/cris-moen-3b42a34/">Contact us</Link>,
  },
];

export default function Header() {
  const auth = useAuthContext();

  return (
    <header className="nav-bar h-16 border-b border-gray-200 bg-white text-gray-900 flex justify-center">
      <div className="w-full max-w-screen-2xl px-4 lg:px-6 h-full flex items-center place-content-between">
        <div className="md:hidden">
          <Dropdown menu={{ items: MOBILE_MENU_ITEMS }} trigger={["click"]}>
            <Button type="text" title="menu-dropdown" icon={<MenuOutlined />} />
          </Dropdown>
        </div>

        <div className="w-52">
          <Link href="/" className="w-full h-full">
            <Image src={logo} alt="Logo" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {auth.isAuthenticated && (
            <span className="text-sm text-gray-600">{auth.email}</span>
          )}
          <Link href="https://www.linkedin.com/in/cris-moen-3b42a34/">
            <Button>Contact us</Button>
          </Link>
          {auth.isAuthenticated ? (
            <Button onClick={auth.signOut}>Sign out</Button>
          ) : (
            <Button type="primary" onClick={auth.openLoginModal}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
