import { useContext } from "react";
import { Button, Dropdown } from "antd";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import AuthContext from "./auth-context";

export default function AccountButton() {

  const authContextValue = useContext(AuthContext);

  const items = [
    {
      key: "signed-in-as",
      icon: <UserOutlined />,
      label: `Signed in as ${authContextValue.name || authContextValue.username}`,
      disabled: true,
    },
    {
      type: "divider" as const,
    },
    {
      key: "sign-out",
      icon: <LogoutOutlined />,
      label: "Sign out",
      onClick: () => authContextValue.logOutUser(),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
      <Button icon={<UserOutlined />}>
        Account <DownOutlined className="text-xs" />
      </Button>
    </Dropdown>
  );
}
