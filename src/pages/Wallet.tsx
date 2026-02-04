import React, { useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import {
  Wallet as WalletIcon,
  DollarSign,
  ArrowDownToLine,
  ArrowUpRight,
  Shield,
  Copy,
  Sparkles,
  Link as LinkIcon,
  Coins,
  Info,
  ArrowRightLeft,
} from "lucide-react";
import QRCode from "react-qr-code";

type TokenSymbol = "USDT" | "USDC" | "BNB" | "SOL" | "ETH" | "XRP" | "DOGE";
type NetworkId = "bsc" | "ethereum" | "solana";

interface NetworkOption {
  id: NetworkId;
  label: string;
  short: string;
}

interface WalletAsset {
  id: string;
  symbol: TokenSymbol;
  name: string;
  icon: string;
  networks: NetworkOption[];
  defaultNetwork: NetworkId;
  fakeBalance: number;
  fakeUsdPrice: number;
}

interface GeneratedAddress {
  assetId: string;
  networkId: NetworkId;
  address: string;
}

function formatShortWallet(addr?: string | null): string {
  if (!addr) return "Not linked";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function generateFakeAddress(symbol: string, network: NetworkId) {
  const prefix =
    network === "solana"
      ? "So"
      : network === "bsc"
      ? "0x"
      : "0x";
  const random = Array.from({ length: 38 })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
  return `${prefix}${random}`;
}

function SpanDot() {
  return (
    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
  );
}

export default function Wallets() {
  const { connected, wallet } = useWallet() as any;

  const linkedWallet =
    (wallet && wallet.publicKey && wallet.publicKey.toBase58?.()) || null;

  const assets: WalletAsset[] = [
    {
      id: "usdt",
      symbol: "USDT",
      name: "Tether",
      icon: "/icons/usdt.png",
      networks: [
        { id: "bsc", label: "BNB Smart Chain", short: "BSC" },
        { id: "ethereum", label: "Ethereum", short: "ETH" },
        { id: "solana", label: "Solana", short: "SOL" },
      ],
      defaultNetwork: "bsc",
      fakeBalance: 350.75,
      fakeUsdPrice: 1,
    },
    {
      id: "usdc",
      symbol: "USDC",
      name: "USD Coin",
      icon: "/icons/usdc.png",
      networks: [
        { id: "bsc", label: "BNB Smart Chain", short: "BSC" },
        { id: "ethereum", label: "Ethereum", short: "ETH" },
        { id: "solana", label: "Solana", short: "SOL" },
      ],
      defaultNetwork: "ethereum",
      fakeBalance: 120,
      fakeUsdPrice: 1,
    },
    {
      id: "bnb",
      symbol: "BNB",
      name: "BNB",
      icon: "/icons/bnb.png",
      networks: [{ id: "bsc", label: "BNB Smart Chain", short: "BSC" }],
      defaultNetwork: "bsc",
      fakeBalance: 4.2,
      fakeUsdPrice: 900,
    },
    {
      id: "sol",
      symbol: "SOL",
      name: "Solana",
      icon: "/icons/sol.png",
      networks: [{ id: "solana", label: "Solana", short: "SOL" }],
      defaultNetwork: "solana",
      fakeBalance: 18.5,
      fakeUsdPrice: 160,
    },
    {
      id: "eth",
      symbol: "ETH",
      name: "Ethereum",
      icon: "/icons/eth.png",
      networks: [{ id: "ethereum", label: "Ethereum", short: "ETH" }],
      defaultNetwork: "ethereum",
      fakeBalance: 0.9,
      fakeUsdPrice: 3400,
    },
    {
      id: "xrp",
      symbol: "XRP",
      name: "XRP",
      icon: "/icons/xrp.png",
      networks: [
        { id: "ethereum", label: "Ethereum (wrapped)", short: "wXRP" },
      ],
      defaultNetwork: "ethereum",
      fakeBalance: 520,
      fakeUsdPrice: 1.2,
    },
    {
      id: "doge",
      symbol: "DOGE",
      name: "Dogecoin",
      icon: "/icons/doge.png",
      networks: [
        { id: "ethereum", label: "Ethereum (wrapped)", short: "wDOGE" },
      ],
      defaultNetwork: "ethereum",
      fakeBalance: 1500,
      fakeUsdPrice: 0.25,
    },
  ];

  const [selectedAssetId, setSelectedAssetId] = useState<string>("usdt");
  const [selectedNetworkByAsset, setSelectedNetworkByAsset] = useState<
    Record<string, NetworkId>
  >(() =>
    assets.reduce((acc, asset) => {
      acc[asset.id] = asset.defaultNetwork;
      return acc;
    }, {} as Record<string, NetworkId>)
  );

  const [addresses, setAddresses] = useState<Record<string, GeneratedAddress>>(
    {}
  );
  const [copied, setCopied] = useState<string | null>(null);

  // withdraw state (mock)
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawTarget, setWithdrawTarget] = useState("");

  const selectedAsset =
    assets.find((a) => a.id === selectedAssetId) ?? assets[0];

  const currentNetworkId =
    selectedNetworkByAsset[selectedAsset.id] || selectedAsset.defaultNetwork;
  const currentNetwork =
    selectedAsset.networks.find((n) => n.id === currentNetworkId) ??
    selectedAsset.networks[0];

  const currentKey = `${selectedAsset.id}-${currentNetworkId}`;
  const currentAddress = addresses[currentKey]?.address ?? "";

  const totalUsd = useMemo(
    () =>
      assets.reduce(
        (sum, a) => sum + a.fakeBalance * a.fakeUsdPrice,
        0
      ),
    [assets]
  );

  const handleGenerateAddress = () => {
    // тільки 1 раз: якщо вже є — нічого не робимо
    if (addresses[currentKey]?.address) return;

    const addr = generateFakeAddress(selectedAsset.symbol, currentNetworkId);
    setAddresses((prev) => ({
      ...prev,
      [currentKey]: {
        assetId: selectedAsset.id,
        networkId: currentNetworkId,
        address: addr,
      },
    }));
  };

  const handleCopy = async () => {
    if (!currentAddress) return;
    try {
      await navigator.clipboard.writeText(currentAddress);
      setCopied(currentKey);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  const handleNetworkChange = (assetId: string, networkId: NetworkId) => {
    setSelectedNetworkByAsset((prev) => ({
      ...prev,
      [assetId]: networkId,
    }));
  };

  const canWithdraw =
    connected &&
    currentAddress.length > 0 &&
    withdrawAmount !== "" &&
    Number(withdrawAmount) > 0 &&
    Number(withdrawAmount) <= selectedAsset.fakeBalance &&
    withdrawTarget.length > 4;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWithdraw) return;

    // тут потім підв'яжеш реальний бекенд
    console.log("Mock withdraw:", {
      asset: selectedAsset.symbol,
      network: currentNetworkId,
      amount: withdrawAmount,
      to: withdrawTarget,
    });

    setWithdrawAmount("");
    setWithdrawTarget("");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1">
              <WalletIcon className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span className="text-[11px] text-[#a0a0a0]">
                Multi-chain balances • deposit / withdraw across platform
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#e0e0e0]">
              Wallets & balances
            </h1>
            <p className="text-sm text-[#a0a0a0]">
              One place for your USDT, BNB, SOL and other assets — ready for
              staking, airdrops and prediction rounds.
            </p>
          </div>

          <div className="space-y-2 text-right">
            <div className="flex items-center justify-end gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] border ${
                  connected
                    ? "border-[#22c55e]/40 bg-[#022c22] text-[#bbf7d0]"
                    : "border-[#1f1f1f] bg-[#050816] text-[#707070]"
                }`}
              >
                <SpanDot />
                {connected ? "Wallet connected" : "Wallet not connected"}
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end text-[11px] text-[#707070]">
              <LinkIcon className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>Linked wallet:</span>
            </div>
            <div className="font-mono text-sm text-[#e0e0e0]">
              {formatShortWallet(linkedWallet)}
            </div>
            <div className="text-[11px] text-[#707070]">
              On-chain activity буде відзеркалено у внутрішніх балансах.
            </div>
          </div>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#707070]">Total balance</span>
            <DollarSign className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-xl font-semibold text-[#e0e0e0]">
            ${totalUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#707070] mt-1">
            Sum across all supported assets
          </div>
        </div>

        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#707070]">
              Available for strategies
            </span>
            <Coins className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div className="text-lg font-semibold text-[#e0e0e0]">
            ${Math.round(totalUsd * 0.72).toFixed(2)}
          </div>
          <div className="text-[11px] text-[#707070] mt-1">
            Can be routed into staking, investments, airdrops
          </div>
        </div>

        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#707070]">Top asset</span>
            <Sparkles className="w-4 h-4 text-[#facc15]" />
          </div>
          {(() => {
            const sorted = [...assets].sort(
              (a, b) =>
                b.fakeBalance * b.fakeUsdPrice -
                a.fakeBalance * a.fakeUsdPrice
            );
            const top = sorted[0];
            return (
              <>
                <div className="flex items-center gap-2">
                  <img
                    src={top.icon}
                    alt={top.symbol}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-sm font-semibold text-[#e0e0e0]">
                    {top.symbol}
                  </span>
                </div>
                <div className="text-[11px] text-[#707070] mt-1">
                  ${(top.fakeBalance * top.fakeUsdPrice).toFixed(2)} USD eq.
                </div>
              </>
            );
          })()}
        </div>

        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#707070]">Security</span>
            <Shield className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="text-sm font-semibold text-[#e0e0e0]">
            Segregated deposit wallets
          </div>
          <div className="text-[11px] text-[#707070] mt-1">
            One address per asset & network. Легко звіряти ончейн-рух з
            внутрішнім кабінетом.
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: assets list + info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-5 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_70%)]" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[#e0e0e0]">
                  Assets
                </span>
                <span className="text-[11px] text-[#707070]">
                  {assets.length} supported tokens
                </span>
              </div>

              <div className="space-y-1.5">
                {assets.map((asset) => {
                  const isActive = asset.id === selectedAsset.id;
                  const netId = selectedNetworkByAsset[asset.id];
                  const netLabel =
                    asset.networks.find((n) => n.id === netId)?.short ??
                    asset.networks[0].short;
                  const usdValue =
                    asset.fakeBalance * asset.fakeUsdPrice;

                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all border ${
                        isActive
                          ? "border-[#3b82f6] bg-[#050816]"
                          : "border-[#1f1f1f] bg-[#050816] hover:border-[#3b82f6]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#050816] border border-[#1f1f1f] flex items-center justify-center overflow-hidden">
                          <img
                            src={asset.icon}
                            alt={asset.symbol}
                            className="w-4 h-4 object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <div className="text-[12px] font-semibold text-[#e0e0e0]">
                            {asset.symbol}
                            <span className="ml-1 text-[10px] text-[#707070]">
                              · {netLabel}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#707070]">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[12px] text-[#e0e0e0]">
                          {asset.fakeBalance.toFixed(4)}
                        </div>
                        <div className="text-[10px] text-[#707070]">
                          ${usdValue.toFixed(2)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-[#3b82f6]" />
              <span className="text-[#e0e0e0] font-semibold">
                How balances are used
              </span>
            </div>
            <p className="text-[#a0a0a0]">
              Internal balances підтягуються в Staking, Investments, Airdrop та
              Predictions. Юзер депає один раз — далі просто використовує
              баланс в екосистемі.
            </p>
            <p className="text-[#707070]">
              Коли зробиш бекенд — просто кредитиш сюди депозити з ончейна
              (per token + network).
            </p>
          </div>
        </div>

        {/* RIGHT: selected asset details, deposit + withdraw */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-4">
              {/* top row */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#050816] border border-[#1f1f1f] flex items-center justify-center overflow-hidden">
                    <img
                      src={selectedAsset.icon}
                      alt={selectedAsset.symbol}
                      className="w-9 h-9 object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#e0e0e0]">
                        {selectedAsset.symbol}
                      </h2>
                      <span className="text-[11px] text-[#707070]">
                        {selectedAsset.name}
                      </span>
                    </div>
                    <div className="text-xs text-[#707070] mt-1">
                      Network:{" "}
                      <span className="text-[#e0e0e0]">
                        {currentNetwork.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-[#707070]">Balance</div>
                  <div className="text-sm font-semibold text-[#e0e0e0]">
                    {selectedAsset.fakeBalance.toFixed(4)}{" "}
                    {selectedAsset.symbol}
                  </div>
                  <div className="text-[11px] text-[#707070]">
                    ≈ $
                    {(
                      selectedAsset.fakeBalance * selectedAsset.fakeUsdPrice
                    ).toFixed(2)}{" "}
                    USD
                  </div>
                </div>
              </div>

              {/* network selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap gap-2">
                  {selectedAsset.networks.map((net) => {
                    const active = net.id === currentNetworkId;
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() =>
                          handleNetworkChange(selectedAsset.id, net.id)
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 border transition-all ${
                          active
                            ? "border-[#3b82f6] bg-[#050816] text-[#e0e0e0]"
                            : "border-[#1f1f1f] bg-[#050816] text-[#a0a0a0] hover:border-[#3b82f6]/60"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                        <span className="text-[11px]">
                          {net.short} · {net.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] text-[#707070]">
                  One address per asset / network. Address is permanent once
                  generated.
                </div>
              </div>

              {/* deposit + withdraw blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DEPOSIT */}
                <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowDownToLine className="w-4 h-4 text-[#3b82f6]" />
                      <span className="text-[11px] font-semibold text-[#e0e0e0]">
                        Deposit address
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={currentAddress ? undefined : handleGenerateAddress}
                      disabled={!!currentAddress}
                      className={`text-[11px] rounded-full border px-3 py-1 transition-all ${
                        currentAddress
                          ? "border-[#1f1f1f] bg-[#050816] text-[#707070] cursor-not-allowed"
                          : "border-[#3b82f6]/40 bg-[#050816] text-[#e0e0e0] hover:bg-[#0b1120]"
                      }`}
                    >
                      {currentAddress ? "Address generated" : "Generate address"}
                    </button>
                  </div>

                  {currentAddress ? (
                    <>
                      <div className="text-[11px] text-[#707070]">
                        Send{" "}
                        <span className="text-[#e0e0e0]">
                          {selectedAsset.symbol}
                        </span>{" "}
                        on {currentNetwork.label} only. Other tokens / networks
                        will not be credited.
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-1 rounded-lg bg-[#0b1120] border border-[#1f1f1f] px-3 py-2.5 flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-mono text-[11px] text-[#e0e0e0] break-all">
                              {currentAddress}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 rounded-full border border-[#1f1f1f] bg-[#050816] px-2 py-1 text-[11px] text-[#e0e0e0] hover:border-[#3b82f6]/60"
                          >
                            <Copy className="w-3 h-3" />
                            <span>
                              {copied === currentKey ? "Copied" : "Copy"}
                            </span>
                          </button>
                        </div>

                        <div className="w-24 h-24 rounded-xl bg-[#050816] border border-[#1f1f1f] flex items-center justify-center">
                          {currentAddress ? (
                            <QRCode
                              value={currentAddress}
                              size={80}
                              bgColor="transparent"
                              fgColor="#e5e7eb"
                            />
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-[#707070]">
                      Address is not generated yet. Create it once and reuse for
                      all future deposits.
                    </div>
                  )}
{/* Quick actions under deposit + withdraw */}
<div className="mt-4 bg-[#050816] border border-[#1f1f1f] rounded-xl p-3 flex flex-wrap gap-2 justify-between text-xs">
  <span className="text-[11px] text-[#707070]">
    Use {selectedAsset.symbol} across platform:
  </span>
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      className="px-3 py-1 rounded-full border border-[#3b82f6]/50 bg-[#050816] text-[11px] text-[#e0e0e0] hover:bg-[#0b1120] transition-all"
      // onClick={() => navigate('/staking')}
    >
      Stake
    </button>
    <button
      type="button"
      className="px-3 py-1 rounded-full border border-[#3b82f6]/30 bg-[#050816] text-[11px] text-[#e0e0e0] hover:border-[#3b82f6]/60 transition-all"
      // onClick={() => navigate('/investments')}
    >
      Invest
    </button>
    <button
      type="button"
      className="px-3 py-1 rounded-full border border-[#1f1f1f] bg-[#050816] text-[11px] text-[#a0a0a0] hover:border-[#3b82f6]/40 transition-all"
      // onClick={() => navigate('/predictions')}
    >
      Predictions
    </button>
    
  </div>
</div>
                </div>

                {/* WITHDRAW */}
                <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-[#3b82f6]" />
                      <span className="text-[11px] font-semibold text-[#e0e0e0]">
                        Withdraw to external wallet
                      </span>
                    </div>
                    <span className="text-[10px] text-[#707070]">
                      Network: {currentNetwork.short}
                    </span>
                  </div>

                  <form className="space-y-3" onSubmit={handleWithdraw}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[#707070]">
                          Amount
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setWithdrawAmount(
                              selectedAsset.fakeBalance.toString()
                            )
                          }
                          className="text-[10px] text-[#3b82f6]"
                        >
                          Max
                        </button>
                      </div>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder={`0.0 ${selectedAsset.symbol}`}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#1f1f1f] rounded-lg text-[12px] text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
                        min={0}
                      />
                      <div className="text-[10px] text-[#707070] mt-1">
                        Available:{" "}
                        {selectedAsset.fakeBalance.toFixed(4)}{" "}
                        {selectedAsset.symbol}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] text-[#707070] mb-1">
                        Destination address
                      </span>
                      <input
                        type="text"
                        value={withdrawTarget}
                        onChange={(e) => setWithdrawTarget(e.target.value)}
                        placeholder="Paste external wallet address"
                        className="w-full px-3 py-2 bg-[#121212] border border-[#1f1f1f] rounded-lg text-[12px] text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!canWithdraw}
                      className={`w-full py-2.5 rounded-lg text-[12px] font-medium flex items-center justify-center gap-2 transition-all ${
                        canWithdraw
                          ? "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                          : "bg-[#121212] text-[#707070] border border-[#1f1f1f] cursor-not-allowed"
                      }`}
                    >
                      Withdraw {selectedAsset.symbol}
                    </button>

                    <div className="text-[10px] text-[#707070]">
                      This is UI-preview. Later ти просто підключиш бекенд,
                      який:
                      <br />– перевіряє баланс та адресу
                      <br />– створює транзакцію в мережі {currentNetwork.label}
                      <br />– логить запис в history.
                    </div>
                  </form>
                </div>
              </div>

              <div className="text-[10px] text-[#707070]">
                Always double-check token, network and destination address before
                sending funds.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
