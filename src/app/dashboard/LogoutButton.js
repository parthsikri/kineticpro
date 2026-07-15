"use client";

import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-bold"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{loading ? "..." : "Log Out"}</span>
    </button>
  );
}
