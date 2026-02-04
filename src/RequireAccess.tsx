import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useWallet } from "./context/WalletContext";

export default function RequireAccess() {
  const loc = useLocation();
  const walletAny = useWallet() as any;

  const walletConnected = !!walletAny?.connected;
  const loggedIn = localStorage.getItem("svt_logged_in") === "1";

  const ok = walletConnected || loggedIn;

  // public routes (не блокуємо)
  const isPublic =
    loc.pathname === "/" ||
    loc.pathname === "/rules" ||
    loc.pathname === "/about" ||
    loc.pathname === "/support";

  if (isPublic) return <Outlet />;

  if (!ok) return <Navigate to="/" replace />; // або /connect якщо є така сторінка

  return <Outlet />;
}
