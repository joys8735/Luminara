import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { WalletsModal } from "../components/WalletsModal";
import { Wallet, Menu, X, Copy, ChevronRight, Link as LinkIcon, Check, LogOut, ExternalLink } from "lucide-react";
import { WalletConnectModal } from "../components/WalletConnectModal";
import { useWallet } from "../context/WalletContext";
import ThemeToggle from "../components/ThemeToggle";
import { usePremium } from '../context/PremiumContext';
import { supabase, signInWithGoogle, getProfileId, getCurrentUser } from '../lib/supabase'; // Імпортуємо функції з supabase.ts

import {
  Home,
  Coins,
  Droplets,
  CreditCard,
  Gem,
  ShoppingBag,
  Clock,
  DollarSign,
  BarChart3,
  Gift,
  Target,
  Users,
  HelpCircle,
  User as UserIcon,
  Shield,
  ChevronDown,
  Crown,
} from 'lucide-react';

type NavItem = {
  icon: any;
  path: string;
  label: string;
  badge?: string;
  sale?: string;
  external?: boolean;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Sidebar() {
  const { hasPremium, expiresAt } = usePremium();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { connected, publicKey, walletType, balance, disconnectWallet } = useWallet();
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [walletsOpen, setWalletsOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const disconnect = () => {
    disconnectWallet();
  };

  // ✅ Спрощена перевірка авторизації через Supabase
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Використовуємо функцію getCurrentUser з supabase.ts
        const user = await getCurrentUser();
        
        if (user) {
          const userData = {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
            email: user.email,
            avatar: user.user_metadata?.avatar_url,
          };
          setGoogleUser(userData);
          localStorage.setItem('google_user', JSON.stringify(userData));
        } else {
          // Fallback на localStorage
          const storedUser = localStorage.getItem('google_user');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              setGoogleUser(user);
            } catch (e) {
              localStorage.removeItem('google_user');
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();

    // Слухач змін автентифікації
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            email: session.user.email,
            avatar: session.user.user_metadata?.avatar_url,
          };
          setGoogleUser(userData);
          localStorage.setItem('google_user', JSON.stringify(userData));
        } else {
          setGoogleUser(null);
          localStorage.removeItem('google_user');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ✅ Використовуємо функцію signInWithGoogle з supabase.ts
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google login error:', error);
        alert('Login failed: ' + error.message);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // ✅ Оновлена функція виходу
  const handleGoogleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setGoogleUser(null);
      localStorage.removeItem('google_user');
      localStorage.removeItem('profile_id'); // Очищуємо profile_id
      if (connected) disconnect();
      setLogoutOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ✅ Спрощена функція копіювання адреси гаманця
  const copyWallet = async () => {
    if (!publicKey) return;

    try {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const user = useMemo(() => {
    if (!googleUser) {
      return {
        name: 'Guest',
        email: '',
        role: 'Guest',
        wallet: 'Not connected',
        balance: 0,
        avatarInitial: 'G',
      };
    }

    const walletShort = publicKey 
      ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
      : 'Not connected';
    
    return {
      name: googleUser.name,
      email: googleUser.email,
      role: connected ? 'Premium' : 'Member',
      wallet: walletShort,
      balance: balance || 0,
      avatarInitial: googleUser.name?.charAt(0)?.toUpperCase() || 'U',
    };
  }, [publicKey, balance, googleUser, connected]);

  // Навігаційні списки (залишаємо без змін)
  const main: NavItem[] = [
    { icon: Home, path: '/', label: 'Dashboard' },
    { icon: Coins, path: '/token-sale', label: 'Token Sale', badge: 'IDO', sale: '$0.53' },
    { icon: Droplets, path: '/pools', label: 'Liquidity Pools' },
    { icon: CreditCard, path: '/mining', label: 'Mining' },
    { icon: Gem, path: '/nft-drop', label: 'NFT Drop' },
  ];

  const earn: NavItem[] = [
    { icon: BarChart3, path: '/staking', label: 'Staking' },
    { icon: Clock, path: '/rewards', label: 'Daily Rewards' },
    { icon: DollarSign, path: '/investments', label: 'Investments' },
    { icon: Gift, path: '/airdrop', label: 'Airdrop' },
  ];

  const community: NavItem[] = [
    { icon: Target, path: '/predictions', label: 'Predictions', badge: 'Beta' },
    { icon: Users, path: '/whitelist', label: 'Whitelist' },
    { icon: ShoppingBag, path: '/marketplace', label: 'Marketplace' },
  ];

  const resources: NavItem[] = [
    { icon: HelpCircle, path: '/support', label: 'Support' },
    { icon: Shield, path: '/security', label: 'Security' },
    { icon: ExternalLink, path: 'https://docs.solanaverse.com', label: 'Docs', external: true },
  ];

  const socialLinks = [
    {
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/3840px-Telegram_logo.svg.png',
      url: 'https://t.me/solanaverse',
      label: 'Telegram',
    },
    {
      icon: 'https://images.seeklogo.com/logo-png/49/2/twitter-x-logo-png_seeklogo-492396.png',
      url: 'https://twitter.com/solanaverse',
      label: 'X',
    },
    {
      icon: 'https://www.freepnglogos.com/uploads/discord-logo-png/discord-logo-logodownload-download-logotipos-1.png',
      url: 'https://discord.gg/solanaverse',
      label: 'Discord',
    },
  ];

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // ✅ Компонент секції
  const Section = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="mb-2">
      <div className="px-3 mb-3">
        <div className="text-[11px] tracking-wider uppercase text-[var(--text_main)]/60 font-medium">{title}</div>
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={cx(
                'group relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-[12px] transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-[#3b82f6]/10 to-[#1d4ed8]/5 '
                  : 'hover:bg-[#ffffff]/5'
              )}
            >
              <Icon className={cx(
                'w-3.5 h-3.5 flex-shrink-0 transition-all duration-200',
                isActive ? 'text-[#3b82f6]' : 'text-[#a0a0a0] group-hover:text-[#e0e0e0]'
              )} />
              <span className={cx(
                'truncate font-medium',
                isActive ? 'text-[var(--text_main)]' : 'text-[#b0b0b0] group-hover:text-[#e0e0e0]'
              )}>
                {item.label}
              </span>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#3b82f6]/20 to-[#1d4ed8]/20 border border-[#3b82f6]/30 text-[#3b82f6] font-medium">
                  {item.badge}
                </span>
              )}
              {item.sale && (
                <span className="gap-1 text-[10px]">{item.sale}</span>
              )}
              {item.external && <ExternalLink className="w-3 h-3 text-[#707070]" />}
              <ChevronRight className={cx(
                'w-3 h-3 ml-auto transition-transform duration-200',
                isActive ? 'text-[#3b82f6] opacity-100' : 'text-transparent group-hover:text-[#707070]'
              )} />
            </Link>
          );
        })}
      </div>
    </div>
  );

  const MobileMenuButton = () => (
    <button
      onClick={() => setSidebarOpen(true)}
      className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#1f1f1f] flex items-center justify-center shadow-lg"
    >
      <Menu className="w-5 h-5 text-[#e0e0e0]" />
    </button>
  );

  if (!authChecked) {
    return (
      <>
        <MobileMenuButton />
        <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 z-30 bg-[#0a0a0a] border-r border-[#1f1f1f]">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#3b82f6]"></div>
          </div>
        </aside>
      </>
    );
  }

  const isLoggedIn = !!googleUser;

  return (
    <>
      <MobileMenuButton />
      
      {/* Десктоп сайдбар */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 z-30">
        <div className="h-full bg-[var(--sidebar)] border-r border-[#1f1f1f]/60 flex flex-col w-full">
          {/* Логотип */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[150px] h-10 flex items-center justify-center overflow-hidden">
                  <img
                    src="public/logo3.png"
                    alt="SolanaVerse"
                    className="w-full h-full object-cover opacity-90"
                  />
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Навигация */}
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            <Section title="Main" items={main} />
            <Section title="Earn & Stake" items={earn} />
            <Section title="Community" items={community} />
            <Section title="Resources" items={resources} />
          </div>

          {/* Футер з профілем */}
          <div className="px-0 py-1 border-t border-[#1f1f1f] space-y-3">
            <div className="px-2 py-2 mb-2">
              <div ref={profileRef} className="relative">
                {!isLoggedIn ? (
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full px-4 py-3 text-left -mb-2 text-[12px] text-[#b0b0b0] hover:text-[#e0e0e0] bg-[#eee]/5 rounded-xl hover:bg-[#1a1a1a] transition-colors flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Login with Google</div>
                      <div className="text-[10px] text-[#707070]">Access all features</div>
                    </div>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setProfileOpen((v) => !v)}
                      className={`
                        w-full -mb-2 p-3 ui-card hover:ui-inner
                        transition-all duration-300 ease-in-out
                        flex items-center gap-3 group
                        ${profileOpen ? "rounded-b-2xl" : "rounded-2xl"}
                      `}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 bg-gradient-to-br from-[#4285F4] to-[#34A853]">
                        <span className="text-white font-bold text-[12px]">
                          {user.avatarInitial}
                        </span>
                        {hasPremium && (
                          <Crown className="absolute left-7 mt-5 w-5 h-5 text-[#facc15] bg-[#1a1a1a] rounded-full p-1" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-[12px] text-[#e0e0e0] font-semibold truncate">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-[#a0a0a0] truncate">
                          {user.email}
                        </div>
                      </div>
                      <ChevronDown className={cx(
                        "w-4 h-4 text-[#a0a0a0] transition-transform duration-300",
                        profileOpen && "rotate-180"
                      )} />
                    </button>

                    {/* Дропдаун профілю */}
                    {profileOpen && (
                      <div className="absolute bottom-full left-0 right-0 mt-0 mb-0 rounded-t-2xl ui-card backdrop-blur-xl shadow-2xl overflow-hidden z-50">
                        {connected && (
                          <div className="mx-1 mt-2 p-2 ui-inner shadow-md shadow-gray-900/90 rounded-xl">
                            <div className="flex items-center gap-2">
                              <img className="ml-2 w-6 h-6" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/512px-MetaMask_Fox.svg.png" alt="" />
                              <div className="flex ml-2 items-center justify-between text-[10px]">
                                {user.wallet}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={copyWallet}
                                    className="w-5 h-5 rounded-md ui-card hover:bg-[#171717] flex items-center justify-center ml-1 transition-colors"
                                    title={copied ? "Copied" : "Copy"}
                                  >
                                    {copied ? (
                                      <Check className="w-3 h-3 text-green-400" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-[#a0a0a0]" />
                                    )}
                                  </button>
                                  <button
                                    onClick={disconnect}
                                    className="absolute right-3 w-5 h-5 rounded-md bg-[#121212] hover:bg-[#171717] justify-end transition-colors"
                                    title="Disconnect"
                                  >
                                    <LogOut className="w-5 h-5 text-[#ef4444]/80 px-1 rounded-[5px] border border-[#ef4444]/30" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="py-0 mt-1">
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              setLogoutOpen(true);
                            }}
                            className="w-full px-4 py-2.5 text-left text-[12px] text-[#b0b0b0] hover:text-[#e0e0e0] hover:ui-inner transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#eee]/10 flex items-center justify-center">
                              <LogOut className="w-4 h-4 text-[#a0a0a0]" />
                            </div>
                            <div>
                              <div className="font-medium">Logout</div>
                              <div className="text-[10px] text-[#707070]">Sign out from Google</div>
                            </div>
                          </button>
                          
                          {isLoggedIn && !connected && (
                            <button
                              onClick={() => {
                                setProfileOpen(false);
                                setConnectOpen(true);
                              }}
                              className="w-full px-4 py-2.5 text-left text-[12px] text-[#b0b0b0] hover:text-[#e0e0e0] hover:ui-inner transition-colors flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6]/20 to-[#1d4ed8]/20 border border-[#3b82f6]/30 flex items-center justify-center">
                                <LinkIcon className="w-4 h-4 text-[#3b82f6]" />
                              </div>
                              <div>
                                <div className="font-medium">Link Wallet</div>
                                <div className="text-[10px] text-[#707070]">Phantom or MetaMask</div>
                              </div>
                            </button>
                          )}

                          {connected && (
                            <>
                              <button
                            onClick={() => {
                              setSidebarOpen(false);
                              setConnectOpen(true);
                            }}
                            className="w-full px-4 py-2.5 text-left text-[12px] text-[#b0b0b0] hover:text-[#e0e0e0] hover:ui-inner transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#eee]/10 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-[#a0a0a0]" />
                            </div>
                            <div>
                              <div className="font-medium">Profile</div>
                              <div className="text-[11px] text-[#707070]">Edit your profile</div>
                            </div>
                          </button>

                              <button
                                onClick={() => {
                                  setProfileOpen(false);
                                  setWalletsOpen(true);
                                }}
                                className="w-full px-4 py-2.5 text-left text-[12px] text-[#b0b0b0] hover:text-[#e0e0e0] hover:ui-inner transition-colors flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#eee]/10 flex items-center justify-center">
                                  <Wallet className="w-4 h-4 text-[#a0a0a0]" />
                                </div>
                                <div>
                                  <div className="font-medium">Wallets</div>
                                  <div className="text-[11px] text-[#707070] -mt-0.5">Manage your wallets</div>
                                </div>
                              </button>
                            </>
                          )}
                          
                          
                          {hasPremium ? (
                            <div className="flex justify-between items-center px-5 py-2 bg-[#0f111a] text-emerald-500 text-[10px]">
                              <div className="flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                <span className="font-semibold">Premium Active</span>
                              </div>
                              {expiresAt && (
                                <div className="text-[#a0a0a0] text-[9px]">
                                  {new Date(expiresAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Link
                              to="/sub"
                              onClick={() => setProfileOpen(false)}
                              className="w-full px-4 bg-[#eee]/5 py-2.5 text-left text-[12px] text-[#b0b0b0] hover:text-[#e0e0e0] hover:ui-inner transition-colors flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#eee]/10 flex items-center justify-center">
                                <Crown className="w-4 h-4 text-[#a0a0a0]" />
                              </div>
                              <div>
                                <div className="font-medium">Buy Premium</div>
                                <div className="text-[11px] text-[#707070]">Unlock all features</div>
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Мобільний сайдбар (спрощений) */}
      {sidebarOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 h-screen w-80 max-w-[85vw] z-50">
            <div className="h-full bg-gradient-to-b from-[#0a0a0a] to-[#121212] border-r border-[#1f1f1f] flex flex-col">
              <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-13 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center overflow-hidden">
                      <img
                        src="https://cdn.dribbble.com/userupload/31000853/file/original-061f1229fb2a2f02f8f6bd0584e07788.png"
                        alt="SolanaVerse"
                        className="w-full h-full object-cover opacity-90"
                      />
                    </div>
                    <div>
                      <div className="text-[#e0e0e0] font-bold text-sm">SolanaVerse</div>
                      <div className="text-[#3b82f6] text-[10px] font-medium">Launchpad</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-[#1f1f1f] flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-[#e0e0e0]" />
                  </button>
                </div>

                {/* Профіль для мобільної версії */}
                <div className="rounded-xl bg-[#1a1a1a]/50 border border-[#1f1f1f] p-4 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cx(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      googleUser 
                        ? 'bg-gradient-to-br from-[#4285F4] to-[#34A853]' 
                        : 'bg-[#2a2a2a]'
                    )}>
                      <span className={cx(
                        'font-bold',
                        googleUser ? 'text-white text-lg' : 'text-[#a0a0a0] text-base'
                      )}>
                        {user.avatarInitial}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[#e0e0e0] font-medium text-sm">
                        {user.name}
                      </div>
                      <div className="text-[#707070] text-[11px]">
                        {user.email || 'Guest Account'}
                      </div>
                    </div>
                  </div>
                  
                  {!isLoggedIn ? (
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        handleGoogleLogin();
                      }}
                      className="w-full h-11 rounded-lg bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white text-sm font-medium flex items-center justify-center gap-2 mb-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      </svg>
                      Login with Google
                    </button>
                  ) : !connected ? (
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        setConnectOpen(true);
                      }}
                      className="w-full h-11 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white text-sm font-medium flex items-center justify-center gap-2 mb-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Link Wallet
                    </button>
                  ) : (
                    <div className="text-center py-2 mb-2">
                      <div className="text-[12px] text-[#3b82f6] font-medium flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" />
                        Wallet Connected
                      </div>
                      <div className="text-[10px] text-[#707070] mt-1">{user.wallet}</div>
                    </div>
                  )}
                  
                  {connected && (
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        setWalletsOpen(true);
                      }}
                      className="w-full h-11 rounded-lg border border-[#3b82f6]/30 text-[#3b82f6] text-sm flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      Manage Wallets
                    </button>
                  )}
                </div>
              </div>

              {/* Навігація */}
              <div className="flex-1 overflow-y-auto px-2 pb-3">
                <Section title="Main" items={main} />
                <Section title="Earn & Stake" items={earn} />
                <Section title="Community" items={community} />
                <Section title="Resources" items={resources} />
              </div>

              {/* Соціальні посилання та логаут */}
              <div className="px-3 py-4 border-t border-[#1f1f1f] space-y-4">
                <div className="flex items-center justify-center gap-3">
                  {socialLinks.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-xl bg-[#1a1a1a] border border-[#1f1f1f] flex items-center justify-center"
                    >
                      <img src={s.icon} alt="" className="w-6 h-6 object-contain" />
                    </a>
                  ))}
                </div>

                {isLoggedIn && (
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      setLogoutOpen(true);
                    }}
                    className="w-full h-11 rounded-lg border border-[#ef4444]/30 text-[#ef4444] text-sm flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
      
      <WalletsModal open={walletsOpen} onClose={() => setWalletsOpen(false)} />
      <WalletConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      
      {/* Модалка виходу */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-[#121212] border border-[#1f1f1f] p-5 shadow-2xl">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#e0e0e0]">Log out?</h3>
              <p className="text-xs text-[#707070] mt-1">
                Are you sure you want to sign out from Google?
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setLogoutOpen(false)}
                className="px-4 py-2 text-xs rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-[#b0b0b0]"
              >
                Cancel
              </button>
              <button
                onClick={handleGoogleLogout}
                className="px-4 py-2 text-xs rounded-lg bg-[#ef4444]/15 text-[#ef4444] hover:bg-[#ef4444]/25"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;