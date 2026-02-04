import React, { useEffect, useState, useRef } from 'react';
import {
  Bell,
  User,
  Shield,
  LogIn,
  Gift,
  LogOut,
  FileText,
  PlusCircle,
  CheckCheck,
  TrendingUp,
  X,
  Activity,
  Star,
  Settings,
  ArrowRight,
  PieChart,
  Wallet,
  DollarSign,
  Sparkles,
  Crown,
  Menu,
} from 'lucide-react';
import ThemeToggle from "../components/ThemeToggle";
import { useWallet } from '../context/WalletContext';
import { Link, useNavigate } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import AuthModal from './AuthModal';
import { toast } from 'sonner';
import { button } from 'framer-motion/client';
import { HeaderRewardsPill } from '../components/HeaderRewardsPill';
import { usePremium } from '../context/PremiumContext';

type NotificationType = 'investment' | 'airdrop' | 'stake' | 'system';

interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  status: 'unread' | 'read';
  link?: string;
}

// Конфігурація мереж
interface NetworkConfig {
  chainId: number;
  name: string;
  shortName: string;
  rpcUrl?: string;
  icon: string;
  currencySymbol: string;
  blockExplorerUrl?: string;
}

const NETWORKS: Record<number, NetworkConfig> = {
  56: {
    chainId: 56,
    name: 'Binance Smart Chain Mainnet',
    shortName: 'BSC',
    icon: '/icons/bnb.png',
    currencySymbol: 'BNB',
  },
  97: {
    chainId: 97,
    name: 'Binance Smart Chain Testnet',
    shortName: 'BSC Testnet',
    icon: '/icons/bnb.png',
    currencySymbol: 'tBNB',
  },
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    shortName: 'Polygon',
    icon: '/icons/polygon.png',
    currencySymbol: 'MATIC',
  },
  80001: {
    chainId: 80001,
    name: 'Polygon Mumbai Testnet',
    shortName: 'Polygon Mumbai',
    icon: '/icons/polygon.png',
    currencySymbol: 'MATIC',
  },
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    shortName: 'ETH',
    icon: '/icons/eth.png',
    currencySymbol: 'ETH',
  },
};

const TARGET_NETWORK_ID = 97; // За замовчуванням BSC Testnet, змінити на 56 для Mainnet

export function Header() {
  const {
    connected,
    publicKey,
    chainId,
    isCorrectNetwork,
    switchNetwork,
    walletType,
    disconnectWallet,
  } = useWallet();

  const navigate = useNavigate();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [tokenPrice, setTokenPrice] = useState(0.05);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<HTMLDivElement | null>(null);

  const { hasPremium, expiresAt } = usePremium();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      type: 'investment',
      title: 'Investment confirmed',
      description: 'You invested 250 USDT into MetaVerse NFT Fund.',
      time: '2 min ago',
      status: 'unread',
      link: '/investments',
    },
    {
      id: 2,
      type: 'airdrop',
      title: 'New airdrop available',
      description: 'Claim your SolanaVerse community airdrop.',
      time: '8 min ago',
      status: 'unread',
      link: '/airdrop',
    },
    {
      id: 3,
      type: 'stake',
      title: 'Staking rewards updated',
      description: 'Your locked staking just accrued +0.42 SVT.',
      time: '21 min ago',
      status: 'read',
      link: '/staking',
    },
    {
      id: 4,
      type: 'system',
      title: 'Security notice',
      description: 'Remember to verify URLs before connecting your wallet.',
      time: '1 hour ago',
      status: 'read',
      link: '/rules',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  // Отримуємо інформацію про поточну мережу
  const currentNetwork = chainId ? NETWORKS[chainId] : NETWORKS[TARGET_NETWORK_ID];
  const targetNetwork = NETWORKS[TARGET_NETWORK_ID];

  useEffect(() => {
    const interval = setInterval(() => {
      setTokenPrice((prev) => {
        const change = (Math.random() - 0.5) * 0.001;
        return Math.max(0.04, Math.min(0.06, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (n: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === n.id ? { ...item, status: 'read' } : item
      )
    );
    setShowNotifDropdown(false);
    if (n.link) navigate(n.link);
  };

  // Закриття дропдаунів при кліку поза
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node) &&
        networkRef.current &&
        !networkRef.current.contains(e.target as Node)
      ) {
        setShowNotifDropdown(false);
        setShowNetworkDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSwitchNetwork = async (targetChainId: number) => {
    try {
      if (walletType !== 'metamask') {
        toast.error('Зміна мережі доступна тільки для MetaMask');
        return;
      }

      await switchNetwork(targetChainId);
      setShowNetworkDropdown(false);
      toast.success(`Мережу змінено на ${NETWORKS[targetChainId]?.name || targetChainId}`);
    } catch (error: any) {
      toast.error(error.message || 'Помилка при зміні мережі');
    }
  };

  const handleAddNetwork = async (networkId: number) => {
    const network = NETWORKS[networkId];
    if (!network || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${networkId.toString(16)}`,
            chainName: network.name,
            nativeCurrency: {
              name: network.currencySymbol,
              symbol: network.currencySymbol,
              decimals: 18,
            },
            rpcUrls: [getRpcUrl(networkId)],
            blockExplorerUrls: [getExplorerUrl(networkId)],
          },
        ],
      });
      
      toast.success(`Мережа ${network.name} додана до MetaMask`);
      setShowNetworkDropdown(false);
    } catch (error: any) {
      toast.error(`Помилка додавання мережі: ${error.message}`);
    }
  };

  const getRpcUrl = (chainId: number): string => {
    const rpcs: Record<number, string> = {
      56: 'https://bsc-dataseed.binance.org/',
      97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      137: 'https://polygon-rpc.com',
      80001: 'https://rpc-mumbai.maticvigil.com',
      1: 'https://mainnet.infura.io/v3/',
    };
    return rpcs[chainId] || '';
  };

  const getExplorerUrl = (chainId: number): string => {
    const explorers: Record<number, string> = {
      56: 'https://bscscan.com',
      97: 'https://testnet.bscscan.com',
      137: 'https://polygonscan.com',
      80001: 'https://mumbai.polygonscan.com',
      1: 'https://etherscan.io',
    };
    return explorers[chainId] || '';
  };

  // Мобильное уведомление
  const MobileNotificationDrawer = () => (
    showNotifDropdown && (
      <div className="md:hidden fixed inset-0 z-50">
        <div 
          className="absolute inset-0 bg-black/70"
          onClick={() => setShowNotifDropdown(false)}
        />
        <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[#121212] border-l border-[#1f1f1f]">
          <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#e0e0e0]">Notifications</div>
              <div className="text-[11px] text-[#707070]">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </div>
            </div>
            <button
              onClick={() => setShowNotifDropdown(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
            >
              <X className="w-5 h-5 text-[#a0a0a0]" />
            </button>
          </div>

          <div className="h-[calc(100vh-80px)] overflow-y-auto p-2">
            {notifications.map((n) => {
              const isUnread = n.status === 'unread';
              let icon: JSX.Element;
              if (n.type === 'investment')
                icon = <TrendingUp className="w-5 h-5 text-[#22c55e]" />;
              else if (n.type === 'airdrop')
                icon = <Gift className="w-5 h-5 text-[#facc15]" />;
              else if (n.type === 'stake')
                icon = <Shield className="w-5 h-5 text-[#3b82f6]" />;
              else icon = <Activity className="w-5 h-5 text-[#a855f7]" />;

              return (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl mb-2 ${
                    isUnread ? 'bg-[#1a1a1a]/60' : 'bg-[#1a1a1a]'
                  }`}
                >
                  <div className="mt-0.5">{icon}</div>
                  <div className="flex-1 text-left">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-[#e0e0e0]">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[#707070]">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a0a0a0]">
                      {n.description}
                    </p>
                  </div>
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] mt-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    )
  );

  return (
    <>
      {/* HEADER */}
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--header)] border-b border-[#1f1f1f]/60 flex items-center justify-between px-10  z-40 md:left-64">
        {/* LEFT: Мобильный вид */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Десктоп вид цены */}
          <div className="hidden md:flex relative items-center h-11 gap-3 px-3 py-2 ui-card rounded-lg">
            <div className="pointer-events-none absolute inset-0 rounded-xl card-gradient-soft"/>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#707070]">Price Sale</span>
              <span className="text-[12px] font-semibold text-[#3b82f6]">
               $0.04 {/* $ {tokenPrice.toFixed(4)} */}
              </span>
            </div>
            
            <button
              onClick={() => navigate('/token-sale')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#eee]/15 ui-inner text-[#e0e0e0] transition-colors text-[11px]"
            >
              <img src="../icons/usdt.png" alt="svt" className="w-4 h-4" />
              <span className="font-medium">Buy SVT</span>
            </button>
          </div>
          
          <HeaderRewardsPill />
        </div>

        {/* RIGHT: buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Мобильная кнопка премиум */}
          {!hasPremium && (
            <Link 
              to="/sub" 
              className="md:hidden w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#1f1f1f] flex items-center justify-center"
            >
              <Crown className="w-4 h-4 text-[#facc15]" />
            </Link>
          )}

          <button
            onClick={() => navigate('/airdrop')}
            className="w-9 h-9 rounded-lg ui-card hover:ui-inner flex items-center justify-center transition-colors"
          >
            <Gift className="w-4 h-4 text-[#a0a0a0]" />
          </button>

          {/* 🔔 Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifDropdown((v) => !v);
                setShowNetworkDropdown(false);
              }}
              className="relative w-9 h-9 rounded-lg ui-card hover:ui-inner flex items-center justify-center transition-colors"
            >
              <Bell className="w-4 h-4 text-[#a0a0a0]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#3b82f6] rounded-full" />
              )}
            </button>

            {/* Десктоп DROPDOWN */}
            {showNotifDropdown && (
              <div className="hidden md:block absolute right-0 mt-2 w-80 bg-[var(--header)] border border-[#1f1f1f] rounded-xl shadow-2xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
                  <div>
                    <div className="text-xs font-semibold text-[#e0e0e0]">
                      Notifications
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : 'All caught up'}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, status: 'read' }))
                      )
                    }
                    className="text-[10px] text-[#3b82f6] hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  {notifications.map((n) => {
                    const isUnread = n.status === 'unread';
                    let icon: JSX.Element;
                    if (n.type === 'investment')
                      icon = (
                        <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                      );
                    else if (n.type === 'airdrop')
                      icon = <Gift className="w-4 h-4 text-[#facc15]" />;
                    else if (n.type === 'stake')
                      icon = <Shield className="w-4 h-4 text-[#3b82f6]" />;
                    else icon = <Activity className="w-4 h-4 text-[#a855f7]" />;

                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#1a1a1a] transition-colors ${
                          isUnread ? 'bg-[#1a1a1a]/60' : ''
                        }`}
                      >
                        <div className="mt-0.5">{icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-semibold text-[#e0e0e0]">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-[#707070]">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#a0a0a0]">
                            {n.description}
                          </p>
                        </div>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mt-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setShowNotifDropdown(false);
                    navigate('/notifications');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 border-t border-[#1f1f1f] text-[11px] text-[#3b82f6] hover:bg-[#1a1a1a] transition-colors"
                >
                  View all notifications
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="block w-0.5 h-7 border-l border-[#eee]/20"></div>

          {/* 🌐 Network Selector */}
          <div className="relative" ref={networkRef}>
            <button
              onClick={() => {
                setShowNetworkDropdown((v) => !v);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 rounded-lg bg-[#eee]/10 hover:bg-[#0a1025] px-3 py-[8px] transition-colors"
            >
              {/* Network icon */}
              <div className="flex h-6 w-6 items-center justify-center rounded-lg ">
                <img
                  src={currentNetwork?.icon || "/icons/bnb.png"}
                  alt={currentNetwork?.shortName || "Network"}
                  className="h-5 w-5 object-contain"
                />
              </div>

              {/* Network info */}
              <div className="flex-1 leading-tight text-left">
                <div className="text-[11px] hidden md:block font-medium text-[#e0e0e0]">
                  Network
                  {chainId && !isCorrectNetwork && (
                    <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-red-500/20 text-red-400 rounded">
                      Wrong
                    </span>
                  )}
                </div>
                <div className="text-[10px] hidden md:block text-[#707070]">
                   {currentNetwork?.name || "Not Connected"}
                  {/* {chainId && (
                    <span className="ml-1 text-[9px] opacity-70">
                      ({chainId})
                    </span>
                  )} */}
                </div>
              </div>
            </button>

            {/* Network Dropdown */}
            {showNetworkDropdown && (
              <div className="absolute right-0 mt-3 w-64 ui-card rounded-xl shadow-2xl z-50">
                <div className="p-3 border-b border-[#1f1f1f]">
                  <div className="text-xs font-semibold text-[#e0e0e0]">
                    Select Network
                  </div>
                  <div className="text-[10px] text-[#707070]">
                    {isCorrectNetwork ? (
                      <span className="text-green-400">✓ Correct network</span>
                    ) : (
                      <span className="text-red-400">⚠ Switch to {targetNetwork.name}</span>
                    )}
                  </div>
                </div>

                <div className="py-2 max-h-60 overflow-y-auto">
                  {Object.values(NETWORKS).map((network) => (
                    <button
                      key={network.chainId}
                      onClick={() => handleSwitchNetwork(network.chainId)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#eee]/10 transition-colors ${
                        chainId === network.chainId ? 'ui-inner' : ''
                      } ${
                        network.chainId === TARGET_NETWORK_ID ? 'border-l-1 border-[#3b82f6]' : ''
                      }`}
                    >
                      <img
                        src={network.icon}
                        alt={network.shortName}
                        className="h-6 w-6 object-contain"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-[#e0e0e0]">
                          {network.shortName}
                          {network.chainId === TARGET_NETWORK_ID && (
                            <span className="ml-2 text-[10px] bg-[#3b82f6]/20 text-[#3b82f6] px-1.5 py-0.5 rounded">
                              Target
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#707070] truncate">
                          {network.name}
                        </div>
                      </div>
                      {chainId === network.chainId && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </button>
                  ))}
                </div>

                {!isCorrectNetwork && chainId && walletType === 'metamask' && (
                  <button
                    onClick={() => handleSwitchNetwork(TARGET_NETWORK_ID)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t border-[#1f1f1f] text-xs font-medium text-white bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] hover:opacity-90 transition-opacity"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Switch to {targetNetwork.shortName}
                  </button>
                )}

                {walletType !== 'metamask' && (
                  <div className="p-3 border-t border-[#1f1f1f]">
                    <div className="text-[10px] text-[#a0a0a0] text-center">
                      Network switching available only for MetaMask
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Мобильный нотификации drawer */}
          <MobileNotificationDrawer />

          {/* Auth / Wallet */}
          {!connected && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex h-9 items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#1f1f1f] text-[#e0e0e0] transition-colors text-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="font-medium">Sign In</span>
              </button>
              <WalletConnect />
            </div>
          )}

          {/* Мобильные auth кнопки */}
          {!connected && (
            <div className="md:hidden">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#1f1f1f] flex items-center justify-center"
              >
                <LogIn className="w-4 h-4 text-[#e0e0e0]" />
              </button>
            </div>
          )}
        </div>
      </header>
      

      {/* Отступ для мобильного хедера */}
      <div className="h-16 md:hidden" />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </>
  );
}

function SparklesIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-[#facc15]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l1.8 4.6L18 8.4l-4.2 1.8L12 15l-1.8-4.8L6 8.4l4.2-1.8L12 2z" />
      <path d="M5 15l1 2.5L8.5 18l-2.5 1L5 21.5 4 19 1.5 18 4 17z" />
      <path d="M18 13l.8 2 2 0.8-2 0.8L18 19l-.8-2-2-.8 2-.8z" />
    </svg>
  );
}

export default Header;