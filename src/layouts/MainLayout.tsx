// layouts/MainLayout.tsx
import React, { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import ScrollToTop from "../components/ScrollToTop";
import SkeletonPage from "../components/SkeletonPage";
import { useWallet } from "../context/WalletContext";
import { ExternalLink, LinkIcon, Lock } from "lucide-react";
import { WalletConnectModal } from "../components/WalletConnectModal";

function LockScreen() {
  const [connectOpen, setConnectOpen] = useState(false);

  return (
    <div className="max-w-md mt-20 mx-auto rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] p-8  shadow-2xl">
      <div className="flex justify-center text-sm font-semibold text-[#e0e0e0] mb-3">
        <Lock className="w-4 h-4 mr-2" /> Access Required
      </div>
      <div className="text-xs text-[#a0a0a0] leading-relaxed mb-6">
        Please login with Google and connect your wallet to access this content.
      </div>
      <div className="text-xs text-[#707070] border border-[#1f1f1f] bg-[#0f0f0f] rounded-lg p-4 text-left mb-6">
        <div className="text-[#e0e0e0] font-semibold mb-2">Steps to access:</div>
        <ul className="list-none space-y-2">
          <li className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full  flex items-center justify-center text-white text-xs">
              1
            </div>
            <span>Login with Google from sidebar</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs">
              2
            </div>
            <span>Link your wallet (Phantom/MetaMask)</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs">
              3
            </div>
            <span>Access all features</span>
          </li>
        </ul>
      </div>
      <div className="text-xs text-[#a0a0a0]">
        Use the sidebar on the left to get started
      </div>
      <div className="text-center mt-3 w-full z-[0] ">
          
            <button
              onClick={() => setConnectOpen(true)}
              className="w-full h-10 rounded-full bg-gradient-to-r from-[#3b82f6]/20 to-[#1d4ed8]/30 text-white text-xs font-medium flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-3 h-3" />
              Link Wallet to Continue
            </button>
         
        </div>

        <WalletConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
    </div>
    
  );
}

export default function MainLayout() {
  const { pathname } = useLocation();
  const { connected } = useWallet();

  const isLanding = pathname === "/";
  const isFullscreen = pathname === "/token-sale";
  const shouldShowSidebar = !isLanding && !isFullscreen;

  const isPublic =
    pathname === "/" ||
    pathname === "/rules" ||
    pathname === "/about" ||
    pathname === "/support";

  // Динамічне читання з localStorage — без useState для hasGoogleUser
  const hasGoogleUser = !!localStorage.getItem("google_user");

  // Force re-render після змін стану wallet або localStorage
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "google_user") {
        forceUpdate((x) => x + 1); // примусово перерендер
      }
    };

    window.addEventListener("storage", handleStorage);
    // Перевірка при кожному рендері
    forceUpdate((x) => x + 1);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Додатково реагуємо на зміну connected
  useEffect(() => {
    forceUpdate((x) => x + 1);
  }, [connected]);

  const connectedWallet = !!connected;
  const canShowContent = hasGoogleUser && connectedWallet;

  const canShowContentDesktop = isPublic || canShowContent;
  const canShowContentMobile = connectedWallet;



  if (isFullscreen) {
    return (
      <div className="min-h-screen ui-card">
        <main className="w-full min-h-screen px-4 md:px-32 py-6">
          <Suspense fallback={<SkeletonPage />}>
            <Outlet />
          </Suspense>
        </main>
        <ScrollToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {shouldShowSidebar && (
        <aside className="lg:block lg:w-64 flex-shrink-0">
          <Sidebar />
        </aside>
      )}

      <div className="flex-1 flex mt-[50px] flex-col min-w-0">
        {/* Header */}
        {canShowContentMobile && !isPublic && <Header />}
        {shouldShowSidebar && canShowContent && <Header />}

        {/* Кнопка Link Wallet */}
        

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden pb-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-8">
            <Suspense fallback={<SkeletonPage />}>
              <div className="hidden lg:block">
                {canShowContentDesktop ? <Outlet /> : <LockScreen />}
              </div>

              <div className="block lg:hidden">
                {canShowContentMobile ? <Outlet /> : <LockScreen />}
              </div>
            </Suspense>
          </div>

          {hasGoogleUser && !isPublic && connectedWallet && (
            <footer
              className="
                fixed bottom-0 z-[50]
                ui-inner backdrop-blur
                
                text-[10px] text-[#eee]/70
                h-8
                left-0 lg:left-64
                w-full lg:w-[calc(100%-16rem)]
              "
            >
              <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 grid grid-cols-3 items-center">
                {/* LEFT */}
                <div>
                  <div className="flex flex-row gap-3">
                    © {new Date().getFullYear()} SolanaVerse
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-[#707070] hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-2 h-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span>Docs</span>
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-[#707070] hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-2 h-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span>Twitter</span>
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-[#707070] hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-2 h-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span>Telegram</span>
                    </a>
                  </div>
                </div>

                {/* CENTER */}
                <div className="flex items-center justify-center gap-2 text-[#8ab4ff]">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Live on Solana
                </div>

                {/* RIGHT */}
                <div className="flex items-center justify-end gap-3">
                  <span>v1.0.0</span>
                  <span>•</span>
                  <span className="text-emerald-400">Binance Smart Chain Mainnet</span>
                  <span>•</span>
                  <span>Wallet: {connected ? "Connected" : "Not connected"}</span>
                </div>
              </div>
            </footer>
          )}
        </main>
      </div>

      <ScrollToTop />
    </div>
  );
}

function googleLogin() {
  throw new Error("Function not implemented.");
}