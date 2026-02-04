import React, { useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { usePremium } from "../context/PremiumContext";
import { toast } from "sonner";
import {
  Search,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  Clock,
  Users,
  Zap,
  Shield,
  Star,
  ExternalLink,
  ShoppingCart,
  TrendingUp,
  Gem,
  Percent,
  X,
} from "lucide-react";

type MarketplaceNFT = {
  id: number;
  name: string;
  image: string;
  price: number;
  seller: string;
  rarity: "Legendary" | "Epic" | "Rare" | "Common";
  priceChange: number;
  listed: string;
  description: string;
  collection: string;
  totalSupply: number;
  owners: number;
  floorPrice: number;
  volume24h: number;
  owned?: boolean;
  lastSalePrice?: number;
};

type PurchaseModalProps = {
  isOpen: boolean;
  nft: MarketplaceNFT | null;
  onClose: () => void;
  onConfirm: () => void;
  isPremium: boolean;
  cashbackPercent: number; // 0.05 / 0.10
};

const BASE_NFTS: MarketplaceNFT[] = [
  {
    id: 1,
    name: "Celestial #1289",
    image:
      "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=400&auto=format&fit=crop",
    price: 0.5,
    seller: "8xyt...FADc",
    rarity: "Legendary",
    priceChange: 12.5,
    listed: "2 hours ago",
    description:
      "Legendary celestial with governance access and 10% staking boost for SVT rewards.",
    collection: "Celestial Beings",
    totalSupply: 10000,
    owners: 3421,
    floorPrice: 0.45,
    volume24h: 127.3,
  },
  {
    id: 2,
    name: "Celestial #2456",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop",
    price: 0.35,
    seller: "9abc...XYZd",
    rarity: "Epic",
    priceChange: -5.2,
    listed: "5 hours ago",
    description:
      "Epic tier celestial with early access to drops, boosted rewards and priority airdrops.",
    collection: "Celestial Beings",
    totalSupply: 10000,
    owners: 2987,
    floorPrice: 0.32,
    volume24h: 89.1,
  },
  {
    id: 3,
    name: "Celestial #3789",
    image:
      "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?q=80&w=400&auto=format&fit=crop",
    price: 0.25,
    seller: "7def...GHIj",
    rarity: "Rare",
    priceChange: 8.3,
    listed: "1 day ago",
    description:
      "Rare celestial with daily login rewards and whitelist priority for new mints.",
    collection: "Celestial Beings",
    totalSupply: 10000,
    owners: 4123,
    floorPrice: 0.22,
    volume24h: 67.8,
  },
  {
    id: 4,
    name: "Celestial #4567",
    image:
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=400&auto=format&fit=crop",
    price: 0.15,
    seller: "6klm...NOpq",
    rarity: "Common",
    priceChange: 3.1,
    listed: "2 days ago",
    description:
      "Common celestial — entry ticket to SolanaVerse ecosystem, basic rewards and community perks.",
    collection: "Celestial Beings",
    totalSupply: 10000,
    owners: 5678,
    floorPrice: 0.14,
    volume24h: 41.2,
  },
];

/**
 * Покупочна модалка з нормальним UI
 */
const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  nft,
  onClose,
  onConfirm,
  isPremium,
  cashbackPercent,
}) => {
  if (!isOpen || !nft) return null;

  const cashbackAmount = +(nft.price * cashbackPercent).toFixed(4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-[#020617] border border-[#1f2937] shadow-2xl relative overflow-hidden">
        {/* glow */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]" />

        <div className="relative z-10">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#111827]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-[#facc15]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#e5e7eb]">
                  Confirm purchase
                </div>
                <div className="text-[11px] text-[#9ca3af]">
                  Review NFT details and cashback before buying (UI-only)
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#020617] border border-[#1f2937] flex items-center justify-center text-[#9ca3af] hover:text-[#e5e7eb]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* body */}
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-4">
            {/* Left: image + main info */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#1f2937] bg-[#020617] overflow-hidden">
                <div className="h-48 bg-[#050816]">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#e5e7eb] truncate">
                        {nft.name}
                      </div>
                      <div className="text-[11px] text-[#9ca3af] truncate">
                        {nft.collection}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] border border-[#1f2937] bg-[#050816] text-[#9ca3af]">
                      {nft.rarity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] line-clamp-3">
                    {nft.description}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-3 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af]">Seller</span>
                  <span className="text-[#e5e5e5] font-medium">
                    {nft.seller}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af]">Owners</span>
                  <span className="text-[#e5e5e5]">
                    {nft.owners.toLocaleString()} holders
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af]">24h volume (collection)</span>
                  <span className="text-[#e5e5e5]">
                    {nft.volume24h} SOL (UI)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9ca3af]">Listed</span>
                  <span className="text-[#e5e5e5]">{nft.listed}</span>
                </div>
              </div>
            </div>

            {/* Right: price breakdown */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-black/40 border border-[#1f2937] flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
                        alt="Solana"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div className="text-[11px] leading-tight">
                      <div className="text-[#9ca3af]">Network</div>
                      <div className="text-[#e5e5e5] font-medium">
                        Solana (UI)
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-[#9ca3af]">
                      Market status
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] border border-[#22c55e]/40 bg-[#022c22] text-[#4ade80]">
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                      Live (UI)
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#111827] pt-3 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9ca3af]">NFT price</span>
                    <span className="text-[#e5e5e5] font-medium">
                      {nft.price} SOL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9ca3af]">Marketplace fee</span>
                    <span className="text-[#e5e5e5] font-medium">0% (UI)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#3b82f6]">
                    <div className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      <span>
                        Cashback {Math.round(cashbackPercent * 100)}%
                        {isPremium ? " (Premium)" : ""}
                      </span>
                    </div>
                    <span className="font-medium">
                      +{cashbackAmount} SOL
                    </span>
                  </div>
                  <div className="border-t border-[#111827] pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#e5e5e5]">
                      Total to pay
                    </span>
                    <span className="text-sm font-semibold text-[#e5e5e5]">
                      {nft.price} SOL
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-3 text-[11px] flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[#3b82f6] mt-0.5" />
                <div>
                  <div className="font-medium text-[#e5e5e5] mb-0.5">
                    UI-only trade confirmation
                  </div>
                  <p className="text-[#9ca3af]">
                    Later this modal will sign a real transaction, route it to
                    your marketplace program and apply cashback from on-chain
                    data. For now it's a safe UI mock.
                  </p>
                  {isPremium ? (
                    <p className="mt-1 text-[#22c55e]">
                      Premium active: you get 10% marketplace cashback (UI).
                    </p>
                  ) : (
                    <p className="mt-1 text-[#9ca3af]">
                      Upgrade to Premium to boost marketplace cashback from 5%
                      to 10%.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onConfirm}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#0ea5e9] hover:from-[#2563eb] hover:to-[#0284c7] text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Confirm purchase
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#020617] border border-[#1f2937] text-[#9ca3af] text-sm font-medium hover:bg-[#0b1120] transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NFTMarketplace: React.FC = () => {
  const { connected, addCashback } = useWallet() as any;
  const { isActivePremium } = usePremium() as any;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");

  const [nfts, setNfts] = useState<MarketplaceNFT[]>(BASE_NFTS);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<MarketplaceNFT | null>(null);

  // Marketplace cashback: 5% звичайний, 10% Premium
  const cashbackPercent = isActivePremium ? 0.1 : 0.05;

  const handleBuyClick = (nft: MarketplaceNFT) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (nft.owned) {
      toast.message("You already own this NFT (UI).");
      return;
    }
    setSelectedNFT(nft);
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedNFT) return;

    const cbAmount = +(selectedNFT.price * cashbackPercent).toFixed(4);

    // UI: позначаємо як куплений
    setNfts((prev) =>
      prev.map((n) =>
        n.id === selectedNFT.id
          ? { ...n, owned: true, lastSalePrice: selectedNFT.price }
          : n
      )
    );

    // UI cashback
    if (typeof addCashback === "function" && cbAmount > 0) {
      try {
        addCashback(cbAmount);
      } catch {
        // ignore
      }
    }

    toast.success(
      `Successfully purchased ${selectedNFT.name} for ${selectedNFT.price} SOL! (UI)`
    );
    if (cbAmount > 0) {
      toast.message(
        `${Math.round(cashbackPercent * 100)}% marketplace cashback credited: ${cbAmount} SOL (UI)`
      );
    }

    setShowConfirmModal(false);
    setSelectedNFT(null);
  };

  const handleListNFT = () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    toast.success("NFT listed successfully on the marketplace! (UI)");
  };

  const filteredNFTs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return nfts
      .filter((nft) => {
        if (!q) return true;
        return (
          nft.name.toLowerCase().includes(q) ||
          nft.collection.toLowerCase().includes(q) ||
          nft.seller.toLowerCase().includes(q)
        );
      })
      .filter((nft) => {
        if (selectedFilter === "all") return true;
        return nft.rarity.toLowerCase() === selectedFilter;
      })
      .sort((a, b) => {
        if (selectedSort === "recent") return b.id - a.id;
        if (selectedSort === "price-low") return a.price - b.price;
        if (selectedSort === "price-high") return b.price - a.price;
        if (selectedSort === "trending")
          return (b.volume24h || 0) - (a.volume24h || 0);
        return 0;
      });
  }, [searchTerm, selectedFilter, selectedSort, nfts]);

  const rarityFilters = [
    { id: "all", label: "All", badge: "Any" },
    { id: "legendary", label: "Legendary", badge: "Top 1%" },
    { id: "epic", label: "Epic", badge: "Top 5%" },
    { id: "rare", label: "Rare", badge: "Top 20%" },
    { id: "common", label: "Common", badge: "Starter" },
  ];

  const ownedCount = nfts.filter((n) => n.owned).length;

  return (
    <div className="space-y-6">
      {/* HERO / HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] p-5">
        {/* glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#3b82f6]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-[#00d1ff]/15 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] text-[#9ca3af] border border-[#1f2937]">
                <Gem className="w-3 h-3 text-[#3b82f6]" />
                SolanaVerse Marketplace
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#022c42] px-2 py-1 text-[10px] font-medium text-[#38bdf8] border border-[#0ea5e9]/40">
                <Sparkles className="w-3 h-3" />
                Live Trading (UI)
              </span>
              {isActivePremium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#022c22] px-2 py-1 text-[10px] font-medium text-[#4ade80] border border-[#22c55e]/40">
                  <Star className="w-3 h-3" />
                  Premium: 10% cashback
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#e5e5e5]">
                NFT Marketplace
              </h1>
              <p className="mt-1 text-xs md:text-sm text-[#9ca3af] max-w-xl leading-snug">
                Trade Celestials inside the SolanaVerse. Buy NFTs, farm rewards
                and flip rare drops — all in one place. This is a UI-only
                marketplace, ready for future smart-contract wiring.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md text-[11px]">
              <div className="bg-black/40 border border-[#111827] rounded-xl px-3 py-2">
                <div className="flex items-center gap-1 text-[#6b7280]">
                  <Zap className="w-3 h-3" />
                  24h Volume (UI)
                </div>
                <div className="mt-1 text-sm font-semibold text-[#e5e5e5]">
                  325.4 SOL
                </div>
              </div>
              <div className="bg-black/40 border border-[#111827] rounded-xl px-3 py-2">
                <div className="flex items-center gap-1 text-[#6b7280]">
                  <Users className="w-3 h-3" />
                  Active traders
                </div>
                <div className="mt-1 text-sm font-semibold text-[#e5e5e5]">
                  1,842
                </div>
              </div>
              <div className="bg-black/40 border border-[#111827] rounded-xl px-3 py-2">
                <div className="flex items-center gap-1 text-[#6b7280]">
                  <Star className="w-3 h-3" />
                  Your NFTs (UI)
                </div>
                <div className="mt-1 text-sm font-semibold text-[#e5e5e5]">
                  {ownedCount} owned
                </div>
              </div>
            </div>
          </div>

          {/* right: network + list button */}
          <div className="flex flex-col items-stretch gap-3 min-w-[230px]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-black/40 border border-[#1f2937] flex items-center justify-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
                    alt="Solana"
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div className="text-[10px] leading-tight">
                  <div className="text-[#9ca3af]">Network</div>
                  <div className="text-[#e5e5e5] font-medium">Solana (UI)</div>
                </div>
              </div>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] border ${
                  connected
                    ? "border-[#22c55e]/40 bg-[#022c22] text-[#4ade80]"
                    : "border-[#1f2937] bg-black/40 text-[#9ca3af]"
                }`}
              >
                <span
                  className={`mr-1 h-1.5 w-1.5 rounded-full ${
                    connected ? "bg-[#22c55e]" : "bg-[#4b5563]"
                  }`}
                />
                {connected ? "Wallet connected" : "Wallet not connected"}
              </span>
            </div>

            <button
              onClick={handleListNFT}
              className={`font-medium py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center text-sm ${
                connected
                  ? "bg-gradient-to-r from-[#3b82f6] to-[#0ea5e9] hover:from-[#2563eb] hover:to-[#0284c7] text-white shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:scale-[1.02]"
                  : "bg-[#020617] border border-[#1f2937] text-[#6b7280] cursor-not-allowed"
              }`}
            >
              <Tag className="h-4 w-4 mr-2" />
              {connected ? "List Your NFT (UI)" : "Connect to List"}
            </button>
          </div>
        </div>
      </div>

      {/* SVT / Marketplace cashback banner */}
      <div className="bg-[#121418]  rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#022c42] flex items-center justify-center border border-[#0ea5e9]/40">
            <Percent className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-xs">
            <div className="text-[#e5e5e5] font-medium">
              Marketplace cashback (UI)
            </div>
            <div className="text-[10px] text-[#9ca3af]">
              Each purchase here adds{" "}
              <span className="text-[#e5e5e5] font-semibold">
                {isActivePremium ? "10%" : "5%"}
              </span>{" "}
              of trade value as SOL cashback to your rewards balance (UI).
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#6b7280]">
          <Info className="w-3 h-3" />
          This marketplace UI is ready to be connected with your smart contracts.
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4b5563]" />
            <input
              type="text"
              placeholder="Search by name, collection or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-[#020617] border border-[#111827] rounded-xl text-[#e5e5e5] text-sm placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-4 py-2.5 bg-[#020617] border border-[#111827] rounded-xl text-[#e5e5e5] text-xs focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="recent">Recently listed</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="trending">Trending by volume</option>
            </select>
          </div>
        </div>

        {/* Rarity chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {rarityFilters.map((f) => {
            const active = selectedFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] border transition-all ${
                  active
                    ? "border-[#3b82f6] bg-[#0b1220] text-[#e5e5e5]"
                    : "border-[#111827] bg-[#020617] text-[#6b7280] hover:border-[#1f2937]"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full ${
                    active
                      ? "bg-[#1d4ed8] text-white"
                      : "bg-[#020617] text-[#4b5563]"
                  }`}
                >
                  {f.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-[10px] text-[#6b7280] flex items-center gap-2">
          <TrendingUp className="h-3 w-3" />
          Showing{" "}
          <span className="text-[#e5e5e5]">{filteredNFTs.length}</span> result
          {filteredNFTs.length !== 1 ? "s" : ""} • Filter:{" "}
          <span className="text-[#e5e5e5] uppercase">{selectedFilter}</span>
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredNFTs.length === 0 && (
        <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-10 text-center">
          <div className="text-lg font-semibold text-[#e5e5e5]">
            No NFTs found
          </div>
          <div className="mt-2 text-sm text-[#9ca3af]">
            Try adjusting search or rarity filters.
          </div>
        </div>
      )}

      {/* NFT GRID */}
      {filteredNFTs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredNFTs.map((nft) => {
            const isTrending = (nft.volume24h || 0) >= 80;

            const rarityColors: Record<string, string> = {
              Legendary:
                "from-amber-500 via-yellow-400 to-amber-300 text-black",
              Epic: "from-purple-500 via-fuchsia-500 to-pink-400 text-white",
              Rare: "from-sky-500 via-cyan-400 to-sky-300 text-white",
              Common: "from-slate-500 via-slate-400 to-gray-300 text-white",
            };

            return (
              <div
                key={nft.id}
                className="relative bg-[#020617] border border-[#111827] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#3b82f6] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] group"
              >
                {/* IMAGE */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* overlay gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020617] via-black/20 to-transparent" />

                  {/* top left tags */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <span className="bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] text-[#e5e5e5] flex items-center border border-[#111827]">
                      <Clock className="h-2.5 w-2.5 mr-1" />
                      {nft.listed}
                    </span>
                    {isTrending && (
                      <span className="bg-[#0b1120]/90 border border-[#38bdf8]/50 px-2 py-0.5 rounded-full text-[9px] text-[#e0f2fe] flex items-center">
                        <TrendingUp className="h-2.5 w-2.5 mr-1" />
                        Trending
                      </span>
                    )}
                    {nft.owned && (
                      <span className="bg-[#022c22]/90 border border-[#22c55e]/60 px-2 py-0.5 rounded-full text-[9px] text-[#bbf7d0] flex items-center">
                        <Star className="h-2.5 w-2.5 mr-1" />
                        Owned (UI)
                      </span>
                    )}
                  </div>

                  {/* rarity pill */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r ${
                        rarityColors[nft.rarity] ||
                        "from-slate-500 to-slate-400 text-white"
                      }`}
                    >
                      {nft.rarity}
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#e5e5e5] text-sm truncate">
                        {nft.name}
                      </h3>
                      <div className="text-[10px] text-[#6b7280]">
                        {nft.collection}
                      </div>
                    </div>
                    <Sparkles className="h-4 w-4 text-[#facc15]" />
                  </div>

                  <p className="text-[10px] text-[#9ca3af] line-clamp-2">
                    {nft.description}
                  </p>

                  {/* small stats row */}
                  <div className="flex items-center justify-between text-[10px] text-[#6b7280]">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {nft.owners.toLocaleString()} holders
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      UI verified
                    </span>
                  </div>

                  {/* price + floor */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#6b7280]">Price</div>
                      <div className="text-sm font-semibold text-[#e5e5e5] flex items-center">
                        {nft.price} SOL
                        <span
                          className={`ml-1 text-[9px] flex items-center ${
                            nft.priceChange > 0
                              ? "text-[#4ade80]"
                              : "text-[#f97373]"
                          }`}
                        >
                          {nft.priceChange > 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {Math.abs(nft.priceChange)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-[#6b7280]">Floor</div>
                      <div className="text-[11px] font-medium text-[#9ca3af]">
                        {nft.floorPrice} SOL
                      </div>
                      {nft.lastSalePrice && nft.owned && (
                        <div className="text-[9px] text-[#22c55e]">
                          Bought: {nft.lastSalePrice} SOL
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-[9px] text-[#6b7280] truncate">
                    Seller:{" "}
                    <span className="text-[#e5e5e5]">{nft.seller}</span>
                  </div>

                  {/* BUY BTN */}
                  <button
                    onClick={() => handleBuyClick(nft)}
                    disabled={!connected || nft.owned}
                    className={`w-full font-medium py-2 px-3 rounded-xl transition-all duration-200 flex items-center justify-center text-sm ${
                      !connected || nft.owned
                        ? "bg-[#020617] border border-[#111827] text-[#6b7280] cursor-not-allowed"
                        : "bg-[#1d4ed8] hover:bg-[#1e40af] text-white hover:scale-[1.02]"
                    }`}
                  >
                    {nft.owned ? (
                      <>
                        <Star className="h-4 w-4 mr-1.5" />
                        Owned (UI)
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-1.5" />
                        {connected ? "Buy now (UI)" : "Connect to buy"}
                      </>
                    )}
                  </button>

                  {/* Explorer */}
                  <button
                    onClick={() =>
                      toast.message("Explorer link (demo)", {
                        description:
                          "Replace with real Solana explorer URL when on-chain data is wired.",
                      })
                    }
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between text-[9px] text-[#6b7280] pt-2 border-t border-[#111827] hover:text-[#9ca3af] transition-colors">
                      <span className="flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        View on Explorer (UI)
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showConfirmModal}
        nft={selectedNFT}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedNFT(null);
        }}
        onConfirm={handleConfirmPurchase}
        isPremium={!!isActivePremium}
        cashbackPercent={cashbackPercent}
      />
    </div>
  );
};

export default NFTMarketplace;
