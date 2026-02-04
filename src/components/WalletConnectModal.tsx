// components/WalletConnectModal.tsx
import React, { useEffect, useState } from "react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Twitter,
  Send,
  LogOut,
  User,
  Wallet,
  Link,
  Shield,
} from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { WalletsModal } from "../components/WalletsModal";
import { useProfile } from "../hooks/useProfile";
import { UserProfile } from "../components/UserProfile";
import { toast } from "sonner";
import { ProfileEditor } from "./ProfileEditor";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withTimeout<T>(p: Promise<T>, ms: number) {
  let t: any;
  const timeout = new Promise<T>((_, rej) => {
    t = setTimeout(
      () => rej(new Error("Connection timeout. Please try again.")),
      ms,
    );
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(t);
  }
}

type WalletType = "phantom" | "metamask";

function isUserCancelled(msg: string) {
  return /user rejected|rejected|denied|cancel/i.test(msg);
}

export function WalletConnectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { walletState, connectWallet, disconnectWallet } = useWallet();
  const [connectingType, setConnectingType] = useState<WalletType | null>(null);
  const [phase, setPhase] = useState<
    "idle" | "connecting" | "verifying" | "cancelled"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [popupCheck, setPopupCheck] = useState<NodeJS.Timeout | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  // Використовуємо новий useProfile хук
  const {
    profile,
    loginWithGoogle,
    logout,
    getGoogleUser,
    isLoading: isProfileLoading,
    refreshProfile, // ← додай це
  } = useProfile();

  const googleUser = getGoogleUser();

  useEffect(() => {
    if (open && profile) {
      
    }
  }, [profile, open]);

  const [userStats] = useState({
    level: 1,
    alphaPoints: 1250,
    nftCount: 3,
    boxesOpened: 42,
    referralCode: "ALPHA123",
    joinedDate: "2024-01-15",
  });

  const isBusy = phase !== "idle";

  // ✅ Очистка интервалов при unmount
  useEffect(() => {
    return () => {
      if (popupCheck) {
        clearInterval(popupCheck);
      }
    };
  }, [popupCheck]);

  // ✅ Копирование адреса в буфер обмена
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // ✅ Google login с Supabase
  const handleGoogleLogin = async () => {
    if (isBusy) return;

    setPhase("connecting");
    setError(null);

    try {
      await loginWithGoogle();
      // Автоматично перенаправить на Google OAuth
    } catch (error: any) {
      console.error("Google login error:", error);
      setPhase("idle");
      setError(error.message || "Failed to login with Google");
    }
  };

  // ✅ Logout Google через Supabase
  // В WalletConnectModal.tsx оновіть handleLogoutGoogle:
  const handleLogoutGoogle = async () => {
    try {
      await logout();
      // Додайте small delay для оновлення стану
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  // ✅ Logout Wallet
  const handleLogoutWallet = (type: WalletType) => {
    if (type === "metamask") {
      disconnectWallet();
    } else if (type === "phantom") {
      disconnectWallet();
    }
  };

  // ✅ Сброс состояния при закрытии
  useEffect(() => {
    if (!open) {
      setConnectingType(null);
      setPhase("idle");
      setError(null);
      if (popupCheck) {
        clearInterval(popupCheck);
        setPopupCheck(null);
      }
    }
  }, [open]);

  const handleConnect = async (type: WalletType) => {
    if (isBusy) return;
    setError(null);
    setConnectingType(type);
    setPhase("connecting");
    try {
      await withTimeout(connectWallet(type), 25000);
      setPhase("verifying");
      await sleep(300);
      setPhase("idle");
    } catch (e: any) {
      const msg = String(e?.message || e || "");
      if (isUserCancelled(msg)) {
        setPhase("cancelled");
        setError("Connection cancelled by user");
      } else {
        setPhase("idle");
        setError("Connection failed. Please try again.");
      }
    } finally {
      setConnectingType(null);
    }
  };

  // ✅ Подключение Telegram
  const connectTelegram = () => {
    toast("Telegram connection will be implemented soon!");
  };

  // ✅ Подключение Twitter
  const connectTwitter = () => {
    toast("Twitter connection will be implemented soon!");
  };

  const [walletsOpen, setWalletsOpen] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  if (!open) return null;
  const isEvmConnected = !!walletState.evmAddress;

  const baseBtn =
    "relative w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ui-card";
  const idleHover = "hover:ui-inner hover:border-[#3b82f6]";
  const disabledCls = "opacity-70 cursor-not-allowed";

  const formatAddress = (address: string | null) => {
    if (!address) return "Not connected";
    if (address.length > 12) {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    return address;
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center z-[999] p-4" >
      <div className="ui-card rounded-xl max-w-[110vh] w-full p-6 relative max-h-[85vh] overflow-y-auto custom-scroll">
        {/* Close button */}
        <button
          onClick={() => !isBusy && onClose()}
          className={`absolute top-4 right-4 transition-colors z-10 ${
            isBusy
              ? "text-[#3a3a3a] cursor-not-allowed"
              : "text-[#707070] hover:text-[#e0e0e0]"
          }`}
          disabled={isBusy}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Заголовок */}
        <div className="mb-6">
          <h2 className="text-lg font-normal text-[#e0e0e0] flex items-center gap-2">
            <User className="w-5 h-5" />
            {googleUser ? "User Profile" : "Connect to continue"}
          </h2>
          <p className="text-xs text-[#a0a0a0]">
            {googleUser
              ? "Manage your connected accounts"
              : "Choose your preferred login method"}
          </p>
        </div>

        {/* Лоадер при загрузке профиля */}
        {isProfileLoading && (
          <div className="mb-4 p-4 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-sm text-[#707070]">Loading profile...</span>
          </div>
        )}

        {/* Профиль пользователя (если авторизован) */}
        {googleUser && (
          <div className="mb-6">
            {/* Профіль користувача */}
            {profile ? (
              <>
                {googleUser && (
                  <div
                    key={`profile-section-${profile?.avatar || "default"}-${profile?.last_updated || ""}`}
                  >
                    {profile ? (
                      <>
                        {/* <UserProfile 
                            googleUser={googleUser} 
                            onEditClick={() => setShowProfileEditor(true)} 
                          /> */}
                        <ProfileEditor
                          isOpen={showProfileEditor}
                          onClose={() => {
                            setShowProfileEditor(false);
                            refreshProfile();
                            setForceUpdateKey((prev) => prev + 1); // force re-render
                          }}
                        />

                        <div key={forceUpdateKey}>
                          <UserProfile
                            googleUser={googleUser}
                            onEditClick={() => setShowProfileEditor(true)}
                          />
                        </div>
                      </>
                    ) : !isProfileLoading ? (
                      <div className="p-4 rounded-xl ui-inner mb-4">
                        <p className="text-sm text-[#a0a0a0] text-center">
                          Creating your profile...
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
                {/* <ProfileEditor 
                  isOpen={showProfileEditor}
                  onClose={() => {
                    setShowProfileEditor(false);
                    refreshProfile();          // ← тепер це існує і спрацює
                  }}
                /> */}
              </>
            ) : !isProfileLoading ? (
              <div className="p-4 rounded-xl ui-inner mb-4">
                <p className="text-sm text-[#a0a0a0] text-center">
                  Creating your profile...
                </p>
              </div>
            ) : null}

            {/* Quick Stats */}
            

            {/* Connected Accounts Section */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="py-4">
                <h4 className="text-xs uppercase tracking-wider text-[#6b7280] mb-2 font-medium">
                  CONNECTED ACCOUNT
                </h4>
                {/* Google Account */}
                <div className="flex items-center justify-between p-3 mb-2 rounded-lg ui-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 ui-inner rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-[#e0e0e0]">
                        Google
                      </div>
                      <div className="text-[11px] text-[#a0a0a0]">
                        {googleUser.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLogoutGoogle}
                      className="p-2 hover:ui-inner rounded-lg transition-colors"
                      title="Disconnect Google"
                    >
                      <LogOut className="w-4 h-4 text-[#707070]" />
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* MetaMask */}
                  {isEvmConnected ? (
                    <div className={`${baseBtn} ui-inner cursor-default`}>
                      <div className="relative z-10 w-9 h-9 rounded-lg ui-inner overflow-hidden flex items-center justify-center">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/512px-MetaMask_Fox.svg.png"
                          alt="MetaMask"
                          className="w-7 h-7 object-contain"
                        />
                      </div>

                      <div className="relative z-10 flex-1 text-left">
                        <div className="text-[12px] font-medium text-white">
                          MetaMask
                        </div>
                        <div className="text-[11px] text-[#a0a0a0]">
                          {formatAddress(walletState.evmAddress)}
                          <button
                            onClick={() =>
                              copyToClipboard(walletState.evmAddress!, "evm")
                            }
                            className="mx-2 hover:ui-inner rounded-lg transition-colors"
                            title="Copy address"
                          >
                            {copiedAddress === "evm" ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-[#707070]" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="">
                        <button
                          className="text-xs px-3 py-1 rounded-md ui-inner text-[#eee]/70"
                          onClick={() => {
                            setWalletsOpen(true);
                          }}
                        >
                          Wallet Center
                        </button>
                      </div>

                      <button
                        onClick={() => handleLogoutWallet("metamask")}
                        className="p-2 hover:ui-inner rounded-lg transition-colors"
                        title="Disconnect"
                      >
                        <LogOut className="w-4 h-4 text-[#707070]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect("metamask")}
                      disabled={isBusy}
                      className={`${baseBtn} ${isBusy ? disabledCls : idleHover}`}
                    >
                      <div className="relative z-10 w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/512px-MetaMask_Fox.svg.png"
                          alt="MetaMask"
                          className="w-7 h-7 object-contain"
                        />
                      </div>
                      <div className="relative z-10 flex-1 text-left">
                        <div className="text-sm font-semibold text-[#e0e0e0] group-hover:text-white transition-colors">
                          MetaMask
                        </div>
                        <div className="text-xs text-[#707070]  group-hover:text-[#a0a0a0] transition-colors">
                          {connectingType === "metamask" && phase !== "idle"
                            ? "Connecting..."
                            : "EVM wallet"}
                        </div>
                      </div>
                      {connectingType === "metamask" && phase !== "idle" && (
                        <div className="w-4 h-4 border-2 border-[#3b82f6] border-t-transparent  rounded-full animate-spin"></div>
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-xs uppercase tracking-wider text-[#6b7280] mb-2 font-medium">
                  SOCIAL INTEGRATIONS
                </h4>

                {/* Telegram */}
                <div className="flex items-center justify-between p-3 px-3 rounded-lg ui-card mb-2">
                  <div className="flex items-center gap-2">
                    <div className="ui-inner w-9 h-9 rounded-lg flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/3840px-Telegram_logo.svg.png"
                        className="w-6 h-6"
                        alt=""
                      />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-[#e0e0e0]">
                        Telegram
                      </div>
                      <div className="text-[11px] text-[#a0a0a0]">
                        Connect for notifications
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={connectTelegram}
                    className="text-xs px-3 py-1.5 bg-[#0088cc]/50 hover:bg-[#0077b3] text-white rounded-lg transition-colors"
                  >
                    Connect
                  </button>
                </div>

                {/* Twitter */}
                <div className="flex items-center justify-between p-3 px-3 rounded-lg ui-card">
                  <div className="flex items-center gap-2">
                    <div className="ui-inner w-9 h-9 rounded-lg flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/X_icon.svg/960px-X_icon.svg.png"
                        className="w-6 h-6"
                        alt=""
                      />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-[#e0e0e0]">
                        Twitter (X)
                      </div>
                      <div className="text-[11px] text-[#a0a0a0]">
                        Share achievements
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={connectTwitter}
                    className="text-xs px-3 py-1.5 bg-[#1DA1F2]/50 hover:bg-[#0c8de4] text-white rounded-lg transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Если не авторизован с Google - показываем кнопку входа */}
        {!googleUser && !isProfileLoading && (
          <>
            <button
              onClick={handleGoogleLogin}
              disabled={isBusy}
              className={`w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white font-medium text-sm rounded-lg transition-all duration-200 mb-4 shadow-lg ${
                isBusy
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:from-[#3b7ae8] hover:to-[#2e9c57]"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {phase === "connecting"
                ? "Connecting..."
                : "Continue with Google"}
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1f1f1f]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#121212] text-[#707070]">
                  Or connect wallet directly
                </span>
              </div>
            </div>

            {/* Wallet Buttons для неавторизованных */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleConnect("metamask")}
                disabled={isBusy}
                className={`${baseBtn} ${isBusy ? disabledCls : idleHover}`}
              >
                <div className="relative z-10 w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/512px-MetaMask_Fox.svg.png"
                    alt="MetaMask"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div className="relative z-10 flex-1 text-left">
                  <div className="text-sm font-semibold text-[#e0e0e0] group-hover:text-white transition-colors">
                    MetaMask
                  </div>
                  <div className="text-xs text-[#707070] group-hover:text-[#a0a0a0] transition-colors">
                    {connectingType === "metamask" && phase !== "idle"
                      ? "Connecting..."
                      : "EVM wallet"}
                  </div>
                </div>
                {connectingType === "metamask" && phase !== "idle" && (
                  <div className="w-4 h-4 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>

              <button
                onClick={() => handleConnect("phantom")}
                disabled={isBusy}
                className={`${baseBtn} ${isBusy ? disabledCls : idleHover}`}
              >
                <div className="relative z-10 w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src="https://coinlaunch.space/media/images/4/8/5/0/4850.sp3ow1.192x192.png"
                    alt="Phantom"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div className="relative z-10 flex-1 text-left">
                  <div className="text-sm font-semibold text-[#e0e0e0] group-hover:text-white transition-colors">
                    Phantom Wallet
                  </div>
                  <div className="text-xs text-[#707070] group-hover:text-[#a0a0a0] transition-colors">
                    {connectingType === "phantom" && phase !== "idle"
                      ? "Connecting..."
                      : "Solana wallet"}
                  </div>
                </div>
                {connectingType === "phantom" && phase !== "idle" && (
                  <div className="w-4 h-4 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>
            </div>
          </>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Terms */}
        <div className="mt-6 p-3 ui-inner rounded-lg">
          <p className="text-xs text-[#eee]/55 text-center leading-relaxed">
            By connecting, you agree to our{" "}
            <span className="text-[#3b82f6] hover:underline cursor-pointer">
              Terms
            </span>{" "}
            and{" "}
            <span className="text-[#3b82f6] hover:underline cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
