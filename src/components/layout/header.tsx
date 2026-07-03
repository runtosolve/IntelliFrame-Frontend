import Link from "next/link";
import Image from "next/image";
import logo from "/public/RunToSolveLogo.svg";
import { useContext } from "react";
import { Button, Dropdown } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import AuthContext, { AuthStatus } from "../user-auth/auth-context";
import AccountButton from "../user-auth/account-button";

const MOBILE_MENU_ITEMS = [
  {
    key: "purlinline",
    label: <Link href="/purlinline">PurlinLine.jl</Link>,
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

  const authContextValue = useContext(AuthContext);

  return (
    <>
      <header className="nav-bar h-16 border-b border-gray-200 bg-white text-gray-900 flex justify-center">
        <div className="flex-1 max-w-screen-xl h-full flex items-center place-content-between">
          <div className="ml-6 md:hidden">
            <Dropdown menu={{ items: MOBILE_MENU_ITEMS }} trigger={["click"]}>
              <Button type="text" title="menu-dropdown" icon={<MenuOutlined />} />
            </Dropdown>
          </div>

          <div className="ml-6 w-52">
            <Link href="/" className="w-full h-full">
              <Image
                src={logo}
                alt="Logo"
              />
            </Link>
          </div>

          <div className="hidden mr-6 md:flex items-center gap-3">
            <Link href="https://www.linkedin.com/in/cris-moen-3b42a34/">
              <Button>
                Contact us
              </Button>
            </Link>
            {authContextValue.loginStatus !== AuthStatus.LoggedIn ? (
              <Link href="/login">
                <Button>
                  Login
                </Button>
              </Link>
            ) : (<AccountButton />)}
            {authContextValue.loginStatus !== AuthStatus.LoggedIn && (
              <Link href="/register">
                <Button type="primary">
                  Sign up free
                </Button>
              </Link>
            )}
          </div>

        </div>

      </header>
    </>
  );
}
