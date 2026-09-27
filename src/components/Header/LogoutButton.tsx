"use client";

import { useState } from "react";
import { useUser } from "contexts/UserContext";
import { IconLogout } from "@tabler/icons-react";

export function LogoutButton() {
  const { logout } = useUser();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await logout();
  }

  return (
    <button
      className="group relative inline-flex items-center justify-center overflow-hidden border border-red-500/40 bg-red-950/30 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-red-400 transition-all duration-200 hover:border-red-500 hover:bg-red-600 hover:text-white disabled:opacity-50"
      type="button"
      onClick={onClick}
      disabled={loading}
    >
      <span className="relative z-10 flex items-center gap-1.5">
        <IconLogout size={14} />
        {loading ? "Saliendo..." : "Salir"}
      </span>
    </button>
  );
}
