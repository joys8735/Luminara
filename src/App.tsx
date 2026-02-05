// App.tsx — повний робочий код
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { WalletProvider } from "./context/WalletContext";
import MainLayout from "./layouts/MainLayout";
import LandingLayout from "./layouts/LandingLayout";
import { PremiumProvider } from "./context/PremiumContext";
import FloatingPromo from '@/components/StickyImageBlock';
import { AuthCallback } from "./components/AuthCallback";

// Lazy сторінки
const Landing = lazy(() => import("./pages/Landing"));
const Home = lazy(() => import("./pages/Home"));
const TokenSale = lazy(() => import("./pages/TokenSale"));
const Pools = lazy(() => import("./pages/Pools"));
const Mining = lazy(() => import("./pages/Mining"));
const NFTDrop = lazy(() => import("./pages/NFTDrop"));
const NFTMarketplace = lazy(() => import("./pages/NFTMarketplace"));
const Investments = lazy(() => import("./pages/Investments"));
const Staking = lazy(() => import("./pages/Staking"));
const Airdrop = lazy(() => import("./pages/Airdrop"));
const Predictions = lazy(() => import("./pages/Predictions"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Whitelist = lazy(() => import("./pages/Whitelist"));
const ApplyForIDO = lazy(() => import("./pages/ApplyForIDO"));
const Rules = lazy(() => import("./pages/Rules"));
const About = lazy(() => import("./pages/About"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Support = lazy(() => import("./pages/Support"));
const Rewards = lazy(() => import("./pages/DailyRewards"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Exchange = lazy(() => import("./pages/Exchange"));
const Sub = lazy(() => import("./pages/Subscription"));
const NotFound = lazy(() => import("./pages/NotFound"));

export function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
            <PremiumProvider>
              <Suspense
                fallback={
                  <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
                    <div className="text-white text-2xl animate-pulse">Loading...</div>
                  </div>
                }
              >
                <Routes>
                  {/* Лендінг — окремий лейаут на всю ширину */}
                  <Route
                    path="/"
                    element={
                      <LandingLayout>
                        <Landing />
                      </LandingLayout>
                    }
                  />

                  {/* Усі інші сторінки — через MainLayout */}
                  <Route element={<MainLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/token-sale" element={<TokenSale />} />
                    <Route path="/pools" element={<Pools />} />
                    <Route path="/mining" element={<Mining />} />
                    <Route path="/nft-drop" element={<NFTDrop />} />
                    <Route path="/nft-marketplace" element={<NFTMarketplace />} />
                    <Route path="/investments" element={<Investments />} />
                    <Route path="/staking" element={<Staking />} />
                    <Route path="/airdrop" element={<Airdrop />} />
                    <Route path="/predictions" element={<Predictions />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/whitelist" element={<Whitelist />} />
                    <Route path="/apply-for-ido" element={<ApplyForIDO />} />
                    <Route path="/rules" element={<Rules />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/rewards" element={<Rewards />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/exchange" element={<Exchange />} />
                    <Route path="/sub" element={<Sub />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>

              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'var(--bg-card)',
                    color: "#e0e0e0",
                    border: "1px solid #9e9e9e53",
                    margin: "20px",
                  },
                }}
              />
              <FloatingPromo />
            </PremiumProvider>
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;