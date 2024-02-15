import { useContext, useState } from "react";
import logo from "/public/RunToSolveLogo.svg";
import Image from "next/image";
import AuthContext from "./auth-context";
import { AuthStatus } from "./auth-context";
import LoginForm from "./login-form";


export default function LoginModal({ isOpen, setIsOpen }: LoginFormProps) {

  return (
    <dialog className={`modal ${isOpen && 'modal-open'} modal-bottom sm:modal-middle`}>
      <div className="modal-box">
        <div className="modal-action">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>
        <LoginForm />
      </div>
    </dialog>
  );
}

type LoginFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}