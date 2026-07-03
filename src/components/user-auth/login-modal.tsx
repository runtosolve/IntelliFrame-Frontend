import { Modal } from "antd";
import LoginForm from "./login-form";


export default function LoginModal({ isOpen, setIsOpen }: LoginFormProps) {

  return (
    <Modal
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={null}
    >
      <LoginForm />
    </Modal>
  );
}

type LoginFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
