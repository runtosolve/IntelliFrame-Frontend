import { useEffect, useRef, useState } from "react";
import { LogoutOutlined } from "@ant-design/icons";
import { useAuthContext } from "./auth-context";

const DEFAULT_AVATAR = "/admin-avatar.svg";

export default function UserProfile() {
  const { email, signOut } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const dismiss = (event: KeyboardEvent | PointerEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") {
          setOpen(false);
          triggerRef.current?.focus();
        }
      } else if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [open]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  };

  return (
    <div className="user-profile" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`profile-trigger ${open ? "open" : ""}`}
        aria-label="Open account profile"
        aria-expanded={open}
        aria-controls="account-profile-menu"
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={DEFAULT_AVATAR} alt="" />
      </button>

      {open && (
        <div id="account-profile-menu" className="profile-menu" role="menu" aria-label="Account profile">
          <div className="profile-menu-header">
            <div className="profile-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DEFAULT_AVATAR} alt="" />
            </div>
            <div className="profile-identity">
              <strong>IMETCO ADMIN</strong>
              <span>{email || "Signed in"}</span>
            </div>
          </div>

          <button
            type="button"
            className="profile-logout"
            role="menuitem"
            disabled={signingOut}
            onClick={handleSignOut}
          >
            <LogoutOutlined aria-hidden />
            <span>{signingOut ? "Signing out…" : "Sign out"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
