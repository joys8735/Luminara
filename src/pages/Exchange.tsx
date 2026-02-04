// src/pages/Exchange.tsx
import React, { useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  ArrowRight,
  CreditCard,
  Banknote,
  Wallet,
  Shield,
  Repeat2,
  Zap,
  TrendingUp,
  Plus,
  Snowflake,
  History as HistoryIcon,
  ChevronDown,
  X,
  Globe2,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type CryptoSymbol =
  | "SVT"
  | "USDT"
  | "USDC"
  | "BNB"
  | "SOL"
  | "ETH"
  | "XRP"
  | "DOGE";

type FiatSymbol = "USD" | "EUR" | "PLN";

type CurrencySymbol = CryptoSymbol | FiatSymbol;
type CurrencyType = "crypto" | "fiat";

interface CurrencyMeta {
  symbol: CurrencySymbol;
  name: string;
  type: CurrencyType;
  logo: string;
  network?: string;
}

const CURRENCIES: CurrencyMeta[] = [
  { symbol: "SVT", name: "SolanaVerse Token", type: "crypto", logo: "/icons/svt.png", network: "Solana" },
  { symbol: "USDT", name: "Tether", type: "crypto", logo: "/icons/usdt.png", network: "BNB Chain" },
  { symbol: "USDC", name: "USD Coin", type: "crypto", logo: "/icons/usdc.png", network: "Solana" },
  { symbol: "BNB", name: "BNB", type: "crypto", logo: "/icons/bnb.png", network: "BNB Chain" },
  { symbol: "SOL", name: "Solana", type: "crypto", logo: "/icons/sol.png", network: "Solana" },
  { symbol: "ETH", name: "Ethereum", type: "crypto", logo: "/icons/eth.png", network: "Ethereum" },
  { symbol: "XRP", name: "XRP", type: "crypto", logo: "/icons/xrp.png", network: "BNB Chain" },
  { symbol: "DOGE", name: "Dogecoin", type: "crypto", logo: "/icons/doge.png", network: "BNB Chain" },

  { symbol: "USD", name: "US Dollar", type: "fiat", logo: "/icons/usd.png" },
  { symbol: "EUR", name: "Euro", type: "fiat", logo: "/icons/eur.png" },
  { symbol: "PLN", name: "Polish Zloty", type: "fiat", logo: "/icons/pln.png" },
];

const getMeta = (s: CurrencySymbol) =>
  CURRENCIES.find((c) => c.symbol === s)!;

const FX_RATES: Record<CurrencySymbol, number> = {
  SVT: 0.05,
  USDT: 1,
  USDC: 1,
  BNB: 450,
  SOL: 150,
  ETH: 3200,
  XRP: 0.6,
  DOGE: 0.2,

  USD: 1,
  EUR: 1.1,
  PLN: 0.26,
};

type CardBrand = "VISA" | "MASTERCARD";
type CardStatus = "Active" | "Frozen";

interface VirtualCard {
  id: number;
  brand: CardBrand;
  currency: FiatSymbol;
  last4: string;
  balance: number;
  status: CardStatus;
  expiry: string; // MM/YY
  cvv: string;
}

type OperationType =
  | "exchange"
  | "card_topup"
  | "card_create"
  | "card_project"
  | "card_spend";

interface Operation {
  id: number;
  type: OperationType;
  description: string;
  timestamp: string;
}

interface CardSpend {
  id: number;
  cardId: number;
  merchant: string;
  amount: number;
  currency: FiatSymbol;
  timestamp: string;
  category: string;
}

const formatFiat = (v: number, symbol: FiatSymbol | "USD" = "USD") =>
  `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}`;

const formatCrypto = (v: number, symbol: CryptoSymbol) =>
  `${v.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${symbol}`;

const PROJECT_TOKEN: CryptoSymbol = "USDT";
const CARD_ISSUE_COST_USDT = 10;

const Exchange: React.FC = () => {
  const { connected } = useWallet() as any;

  const [cryptoBalances, setCryptoBalances] = useState<
    Record<CryptoSymbol, number>
  >({
    SVT: 1200,
    USDT: 850,
    USDC: 450,
    BNB: 1.5,
    SOL: 12.3,
    ETH: 0.4,
    XRP: 3200,
    DOGE: 20000,
  });

  const [fiatBalances, setFiatBalances] = useState<
    Record<FiatSymbol, number>
  >({
    USD: 1250,
    EUR: 340,
    PLN: 2100,
  });

  const [cards, setCards] = useState<VirtualCard[]>([
    {
      id: 1,
      brand: "VISA",
      currency: "USD",
      last4: "4123",
      balance: 320,
      status: "Active",
      expiry: "12/27",
      cvv: "314",
    },
    {
      id: 2,
      brand: "VISA",
      currency: "EUR",
      last4: "9988",
      balance: 150,
      status: "Frozen",
      expiry: "06/26",
      cvv: "882",
    },
  ]);

  const [operations, setOperations] = useState<Operation[]>([]);
  const [cardSpends, setCardSpends] = useState<CardSpend[]>([]);

  // swap state
  const [fromCurrency, setFromCurrency] = useState<CurrencySymbol>("USDT");
  const [toCurrency, setToCurrency] = useState<CurrencySymbol>("USD"); // To = only fiat
  const [amount, setAmount] = useState<string>("");

  const [openPicker, setOpenPicker] = useState<"from" | "to" | null>(null);

  // cards state
  const [selectedCardId, setSelectedCardId] = useState<number | null>(
    cards[0]?.id ?? null
  );
  const [topupAmount, setTopupAmount] = useState<string>("");
  const [projectTopupAmount, setProjectTopupAmount] = useState<string>("");
  const [projectWithdrawAmount, setProjectWithdrawAmount] =
    useState<string>("");

  const [cardModalOpen, setCardModalOpen] = useState(false);

  // spending sim
  const [spendMerchant, setSpendMerchant] = useState("Binance • P2P");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendCategory, setSpendCategory] = useState("Crypto / Trading");

  // limits / regions (concept only)
  const [monthlyLimit, setMonthlyLimit] = useState("2000");
  const [perTxLimit, setPerTxLimit] = useState("500");
  const [regionMode, setRegionMode] =
    useState<"worldwide" | "europe" | "custom">("europe");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const fromMeta = getMeta(fromCurrency);
  const toMeta = getMeta(toCurrency);

  const isCrypto = (s: CurrencySymbol): s is CryptoSymbol =>
    getMeta(s).type === "crypto";
  const isFiat = (s: CurrencySymbol): s is FiatSymbol =>
    getMeta(s).type === "fiat";

  const estimatedReceive = useMemo(() => {
    const v = Number(amount);
    if (!v || v <= 0) return 0;
    const fromRate = FX_RATES[fromCurrency];
    const toRate = FX_RATES[toCurrency];
    if (!fromRate || !toRate) return 0;
    const usdValue = v * fromRate;
    return usdValue / toRate;
  }, [amount, fromCurrency, toCurrency]);

  const totalCryptoUsd = useMemo(
    () =>
      (Object.entries(cryptoBalances) as [CryptoSymbol, number][]).reduce(
        (acc, [sym, bal]) => acc + bal * FX_RATES[sym],
        0
      ),
    [cryptoBalances]
  );

  const totalFiatUsd = useMemo(
    () =>
      (Object.entries(fiatBalances) as [FiatSymbol, number][]).reduce(
        (acc, [sym, bal]) => acc + bal * FX_RATES[sym],
        0
      ),
    [fiatBalances]
  );

  const totalCardsUsd = useMemo(
    () =>
      cards.reduce(
        (acc, card) => acc + card.balance * FX_RATES[card.currency],
        0
      ),
    [cards]
  );

  const addOperation = (type: OperationType, description: string) => {
    const now = new Date();
    const ts = now.toLocaleString();
    setOperations((prev) => [
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type,
        description,
        timestamp: ts,
      },
      ...prev,
    ]);
  };

  const handleSwapCurrencies = () => {
    // To-side must stay fiat
    const newFrom = toCurrency;
    const newToCandidate = fromCurrency;
    setFromCurrency(newFrom);
    if (isFiat(newToCandidate)) {
      setToCurrency(newToCandidate);
    } else {
      setToCurrency("USD");
      toast.message("To side stays fiat", {
        description: "We keep the estimated side in fiat only.",
      });
    }
  };

  const handlePreset = (v: number) => {
    setAmount(String(v));
  };

  const handleExchange = () => {
    const v = Number(amount);
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!v || v <= 0) {
      toast.error("Enter valid amount to exchange");
      return;
    }
    if (fromCurrency === toCurrency) {
      toast.error("Choose different currencies");
      return;
    }

    const fromRate = FX_RATES[fromCurrency];
    const toRate = FX_RATES[toCurrency];
    if (!fromRate || !toRate) return;

    const receive = (v * fromRate) / toRate;

    if (isCrypto(fromCurrency)) {
      if (cryptoBalances[fromCurrency] < v) {
        toast.error("Not enough balance");
        return;
      }
    } else {
      if (fiatBalances[fromCurrency] < v) {
        toast.error("Not enough balance");
        return;
      }
    }

    if (isCrypto(fromCurrency)) {
      setCryptoBalances((prev) => ({
        ...prev,
        [fromCurrency]: Number((prev[fromCurrency] - v).toFixed(6)),
      }));
    } else {
      setFiatBalances((prev) => ({
        ...prev,
        [fromCurrency]: Number((prev[fromCurrency] - v).toFixed(2)),
      }));
    }

    if (isCrypto(toCurrency)) {
      setCryptoBalances((prev) => ({
        ...prev,
        [toCurrency]: Number((prev[toCurrency] + receive).toFixed(6)),
      }));
    } else {
      setFiatBalances((prev) => ({
        ...prev,
        [toCurrency]: Number((prev[toCurrency] + receive).toFixed(2)),
      }));
    }

    toast.success(
      `Exchanged ${v} ${fromCurrency} → ${receive.toFixed(2)} ${toCurrency}`
    );
    addOperation(
      "exchange",
      `Exchanged ${v.toFixed(4)} ${fromCurrency} → ${receive.toFixed(
        2
      )} ${toCurrency}`
    );
    setAmount("");
  };

  const handleCreateCard = () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (cryptoBalances.USDT < CARD_ISSUE_COST_USDT) {
      toast.error(
        `Not enough USDT. Card issuance costs ${CARD_ISSUE_COST_USDT} USDT.`
      );
      return;
    }

    const newId = Date.now();
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const newCard: VirtualCard = {
      id: newId,
      brand: "VISA",
      currency: "USD",
      last4,
      balance: 0,
      status: "Active",
      expiry: "12/28",
      cvv: String(Math.floor(100 + Math.random() * 900)),
    };

    // списуємо 10 USDT
    setCryptoBalances((prev) => ({
      ...prev,
      USDT: Number((prev.USDT - CARD_ISSUE_COST_USDT).toFixed(4)),
    }));

    setCards((prev) => [newCard, ...prev]);
    setSelectedCardId(newId);

    addOperation(
      "card_create",
      `New VISA card • **** ${last4} (USD) • -${CARD_ISSUE_COST_USDT} USDT`
    );
    toast.success("Virtual VISA card created (10 USDT fee)");
  };

  const selectedCard =
    cards.find((c) => c.id === selectedCardId) || cards[0] || null;

  const handleToggleFreeze = () => {
    if (!selectedCard) return;
    setCards((prev) =>
      prev.map((c) =>
        c.id === selectedCard.id
          ? {
              ...c,
              status: c.status === "Active" ? "Frozen" : "Active",
            }
          : c
      )
    );
    toast.success(
      selectedCard.status === "Active" ? "Card frozen" : "Card unfrozen"
    );
  };

  const handleTopup = () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!selectedCard) {
      toast.error("Choose a card first");
      return;
    }
    const v = Number(topupAmount);
    if (!v || v <= 0) {
      toast.error("Enter valid top up amount");
      return;
    }
    if (fiatBalances[selectedCard.currency] < v) {
      toast.error("Not enough fiat balance");
      return;
    }

    setFiatBalances((prev) => ({
      ...prev,
      [selectedCard.currency]: Number(
        (prev[selectedCard.currency] - v).toFixed(2)
      ),
    }));

    setCards((prev) =>
      prev.map((c) =>
        c.id === selectedCard.id
          ? { ...c, balance: Number((c.balance + v).toFixed(2)) }
          : c
      )
    );

    addOperation(
      "card_topup",
      `Card **** ${selectedCard.last4} +${v.toFixed(2)} ${
        selectedCard.currency
      } from fiat`
    );
    toast.success("Card topped up");
    setTopupAmount("");
  };

  const handleProjectTopup = () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!selectedCard) {
      toast.error("Choose a card first");
      return;
    }
    const v = Number(projectTopupAmount);
    if (!v || v <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    const neededUsd = v * FX_RATES[selectedCard.currency];
    const neededUSDT = neededUsd / FX_RATES[PROJECT_TOKEN];

    if (cryptoBalances[PROJECT_TOKEN] < neededUSDT) {
      toast.error("Not enough balance on project wallet (USDT)");
      return;
    }

    setCryptoBalances((prev) => ({
      ...prev,
      [PROJECT_TOKEN]: Number((prev[PROJECT_TOKEN] - neededUSDT).toFixed(4)),
    }));

    setCards((prev) =>
      prev.map((c) =>
        c.id === selectedCard.id
          ? { ...c, balance: Number((c.balance + v).toFixed(2)) }
          : c
      )
    );

    addOperation(
      "card_project",
      `Card **** ${selectedCard.last4} +${v.toFixed(2)} ${
        selectedCard.currency
      } from project wallet (${neededUSDT.toFixed(4)} ${PROJECT_TOKEN})`
    );
    toast.success("Card topped up from project wallet");
    setProjectTopupAmount("");
  };

  const handleProjectWithdraw = () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!selectedCard) {
      toast.error("Choose a card first");
      return;
    }
    const v = Number(projectWithdrawAmount);
    if (!v || v <= 0) {
      toast.error("Enter valid amount");
      return;
    }
    if (selectedCard.balance < v) {
      toast.error("Not enough card balance");
      return;
    }

    const usdValue = v * FX_RATES[selectedCard.currency];
    const usdtGain = usdValue / FX_RATES[PROJECT_TOKEN];

    setCards((prev) =>
      prev.map((c) =>
        c.id === selectedCard.id
          ? { ...c, balance: Number((c.balance - v).toFixed(2)) }
          : c
      )
    );

    setCryptoBalances((prev) => ({
      ...prev,
      [PROJECT_TOKEN]: Number((prev[PROJECT_TOKEN] + usdtGain).toFixed(4)),
    }));

    addOperation(
      "card_project",
      `Card **** ${selectedCard.last4} -${v.toFixed(2)} ${
        selectedCard.currency
      } → project wallet (+${usdtGain.toFixed(4)} ${PROJECT_TOKEN})`
    );
    toast.success("Sent back to project wallet");
    setProjectWithdrawAmount("");
  };

  const handleSimulateSpend = () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!selectedCard) {
      toast.error("Choose a card first");
      return;
    }
    const v = Number(spendAmount);
    if (!v || v <= 0) {
      toast.error("Enter valid spend amount");
      return;
    }
    if (selectedCard.balance < v) {
      toast.error("Not enough card balance");
      return;
    }

    setCards((prev) =>
      prev.map((c) =>
        c.id === selectedCard.id
          ? { ...c, balance: Number((c.balance - v).toFixed(2)) }
          : c
      )
    );

    const now = new Date();
    const ts = now.toLocaleString();

    const spend: CardSpend = {
      id: Date.now(),
      cardId: selectedCard.id,
      merchant: spendMerchant || "Unknown merchant",
      amount: v,
      currency: selectedCard.currency,
      timestamp: ts,
      category: spendCategory || "General",
    };

    setCardSpends((prev) => [spend, ...prev]);

    addOperation(
      "card_spend",
      `Payment -${v.toFixed(2)} ${selectedCard.currency} • ${
        spend.merchant
      }`
    );
    toast.success("Simulated card payment added");
    setSpendAmount("");
  };

  const selectedCardSpends = useMemo(
    () =>
      selectedCard
        ? cardSpends.filter((s) => s.cardId === selectedCard.id).slice(0, 6)
        : [],
    [selectedCard, cardSpends]
  );

  // currency picker
  const renderCurrencyPicker = (
    role: "from" | "to",
    value: CurrencySymbol,
    onChange: (s: CurrencySymbol) => void
  ) => {
    const meta = getMeta(value);
    const isOpen = openPicker === role;

    const handleSelect = (s: CurrencySymbol) => {
      onChange(s);
      setOpenPicker(null);
    };

    const cryptoList =
      role === "to"
        ? [] // To side = fiat only
        : CURRENCIES.filter((c) => c.type === "crypto");
    const fiatList = CURRENCIES.filter((c) => c.type === "fiat");

    return (
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpenPicker(isOpen ? null : role)}
          className="w-full flex items-center justify-between gap-2 text-xs rounded-lg bg-[#050816] border border-[#1f1f1f] px-2 py-1.5 hover:border-[#3b82f6]/70 transition-all"
        >
          <div className="flex items-center gap-2 min-w-0 text-left">
            <div className="w-7 h-7 rounded-full bg-[#121212] flex items-center justify-center border border-[#1f1f1f] overflow-hidden shrink-0">
              <img
                src={meta.logo}
                alt={meta.symbol}
                className="w-4 h-4 object-contain"
              />
            </div>
            <div className="text-left min-w-0">
              <div className="text-[13px] font-semibold text-[#e0e0e0] truncate">
                {meta.symbol}
              </div>
              <div className="text-[10px] text-[#707070] truncate">
                {meta.name}
                {meta.network ? ` • ${meta.network}` : ""}
              </div>
            </div>
          </div>
          <ChevronDown className="w-3 h-3 text-[#707070] shrink-0" />
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-2 w-72 md:w-80 bg-[#050816] border border-[#1f1f1f] rounded-xl shadow-xl max-h-72 overflow-y-auto">
            {cryptoList.length > 0 && (
              <>
                <div className="px-3 py-2 text-[10px] text-[#707070] uppercase">
                  Crypto
                </div>
                {cryptoList.map((c) => (
                  <button
                    key={c.symbol}
                    type="button"
                    onClick={() => handleSelect(c.symbol)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-[11px] hover:bg-[#111827] transition-all ${
                      c.symbol === value ? "bg-[#111827]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#121212] flex items-center justify-center border border-[#1f1f1f] overflow-hidden shrink-0">
                        <img
                          src={c.logo}
                          alt={c.symbol}
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="text-[#e0e0e0] font-semibold truncate">
                          {c.symbol}
                        </div>
                        <div className="text-[10px] text-[#707070] truncate">
                          {c.name}
                          {c.network ? ` • ${c.network}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      ~$
                      {FX_RATES[c.symbol].toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </button>
                ))}
                <div className="border-t border-[#1f1f1f]" />
              </>
            )}

            <div className="px-3 py-2 text-[10px] text-[#707070] uppercase">
              Fiat
            </div>
            {fiatList.map((c) => (
              <button
                key={c.symbol}
                type="button"
                onClick={() => handleSelect(c.symbol)}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] hover:bg-[#111827] transition-all ${
                  c.symbol === value ? "bg-[#111827]" : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#121212] flex items-center justify-center border border-[#1f1f1f] overflow-hidden shrink-0">
                    <img
                      src={c.logo}
                      alt={c.symbol}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[#e0e0e0] font-semibold truncate">
                      {c.symbol}
                    </div>
                    <div className="text-[10px] text-[#707070] truncate">
                      {c.name}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-[#707070]">
                  FX ~{FX_RATES[c.symbol].toFixed(2)} USD
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050816] px-3 py-1">
              <ArrowLeftRight className="w-3 h-3 text-[#3b82f6]" />
              <span className="text-[11px] text-[#a0a0a0]">
                Crypto ↔ Fiat exchange • Virtual cards
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#e0e0e0]">
              Exchange & Cards Center
            </h1>
            <p className="text-sm text-[#a0a0a0]">
              Swap between crypto and fiat, route funds to virtual VISA cards and
              back to the project wallet — all in one place.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-end gap-2">
              <Shield className="w-4 h-4 text-[#22c55e]" />
              <span className="text-[#a0a0a0]">
                Non-custodial logic • All balances local preview
              </span>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#050816] border border-[#1f1f1f] px-2 py-1">
                <Wallet className="w-3 h-3 text-[#3b82f6]" />
                <span className="text-[11px] text-[#e0e0e0]">
                  SVT, USDT, USDC, BNB, SOL, ETH, XRP, DOGE
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#050816] border border-[#1f1f1f] px-2 py-1">
                <Banknote className="w-3 h-3 text-[#3b82f6]" />
                <span className="text-[11px] text-[#a0a0a0]">
                  USD, EUR, PLN • VISA virtual cards
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {!connected && (
        <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-2xl p-4 text-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#121212] flex items-center justify-center border border-[#1f1f1f]">
            <Wallet className="w-4 h-4 text-[#a0a0a0]" />
          </div>
          <div>
            <div className="text-[#e0e0e0] font-semibold mb-1">
              Wallet not connected
            </div>
            <div className="text-[#707070]">
              Connect your wallet in the header to simulate real balances for
              exchanges, card top ups and project wallet flows.
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-5 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_70%)]" />
          <div className="relative z-10">
            <Wallet className="h-5 w-5 text-[#3b82f6] mb-2" />
            <div className="text-lg font-semibold text-[#e0e0e0]">
              ${(totalCryptoUsd + totalFiatUsd).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-[#707070]">
              Total wallet value (est. in USD)
            </div>
          </div>
        </div>
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-5 bg-[radial-gradient(circle_at_top,_#22c1c3_0,_transparent_70%)]" />
          <div className="relative z-10">
            <Banknote className="h-5 w-5 text-[#22c1c3] mb-2" />
            <div className="text-lg font-semibold text-[#e0e0e0]">
              ${totalFiatUsd.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-[#707070]">
              Fiat balances (USD est.)
            </div>
          </div>
        </div>
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-5 bg-[radial-gradient(circle_at_top,_#a855f7_0,_transparent_70%)]" />
          <div className="relative z-10">
            <CreditCard className="h-5 w-5 text-[#a855f7] mb-2" />
            <div className="text-lg font-semibold text-[#e0e0e0]">
              ${totalCardsUsd.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-[#707070]">
              Virtual cards balance (USD est.)
            </div>
          </div>
        </div>
      </div>

      {/* Balances lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crypto balances */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-5 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_70%)]" />
          <div className="relative z-10 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#3b82f6]" />
                <h2 className="text-sm font-semibold text-[#e0e0e0]">
                  Crypto balances
                </h2>
              </div>
              <span className="text-[11px] text-[#707070]">
                {Object.keys(cryptoBalances).length} tokens
              </span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {CURRENCIES.filter((c) => c.type === "crypto").map((c) => {
                const bal = cryptoBalances[c.symbol as CryptoSymbol];
                const usd = bal * FX_RATES[c.symbol as CryptoSymbol];
                return (
                  <div
                    key={c.symbol}
                    className="flex items-center justify-between bg-[#050816] border border-[#1f1f1f] rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#121212] flex items-center justify-center border border-[#1f1f1f] overflow-hidden">
                        <img
                          src={c.logo}
                          alt={c.symbol}
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] text-[#e0e0e0] font-semibold">
                          {c.symbol}
                        </div>
                        <div className="text-[10px] text-[#707070]">
                          {c.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#e0e0e0]">
                        {bal.toLocaleString(undefined, {
                          maximumFractionDigits: 4,
                        })}{" "}
                        {c.symbol}
                      </div>
                      <div className="text-[10px] text-[#707070]">
                        ≈ ${usd.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fiat balances */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-5 bg-[radial-gradient(circle_at_top,_#22c1c3_0,_transparent_70%)]" />
          <div className="relative z-10 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#22c1c3]" />
                <h2 className="text-sm font-semibold text-[#e0e0e0]">
                  Fiat balances
                </h2>
              </div>
              <span className="text-[11px] text-[#707070]">
                {Object.keys(fiatBalances).length} currencies
              </span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {CURRENCIES.filter((c) => c.type === "fiat").map((c) => {
                const bal = fiatBalances[c.symbol as FiatSymbol];
                const usd = bal * FX_RATES[c.symbol as FiatSymbol];
                return (
                  <div
                    key={c.symbol}
                    className="flex items-center justify-between bg-[#050816] border border-[#1f1f1f] rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#121212] flex items-center justify-center border border-[#1f1f1f] overflow-hidden">
                        <img
                          src={c.logo}
                          alt={c.symbol}
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] text-[#e0e0e0] font-semibold">
                          {c.symbol}
                        </div>
                        <div className="text-[10px] text-[#707070]">
                          {c.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#e0e0e0]">
                        {bal.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        {c.symbol}
                      </div>
                      <div className="text-[10px] text-[#707070]">
                        ≈ ${usd.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: swap + activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* SWAP */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#e0e0e0]">
                  Swap crypto & fiat
                </h2>
                <span className="text-[11px] text-[#707070] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#3b82f6]" />
                  Live-like preview rates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                {/* FROM */}
                <div className="space-y-2">
                  <label className="text-[11px] text-[#a0a0a0]">From</label>
                  <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {renderCurrencyPicker("from", fromCurrency, setFromCurrency)}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="mt-1 text-[11px] text-[#707070] flex justify-between">
                        <span>
                          Balance:{" "}
                          <span className="text-[#e0e0e0]">
                            {isCrypto(fromCurrency)
                              ? formatCrypto(
                                  cryptoBalances[fromCurrency],
                                  fromCurrency
                                )
                              : formatFiat(
                                  fiatBalances[fromCurrency],
                                  fromCurrency
                                )}
                          </span>
                        </span>
                        <span className="text-[#707070]">
                          ≈ $
                          {(
                            (isCrypto(fromCurrency)
                              ? cryptoBalances[fromCurrency]
                              : fiatBalances[fromCurrency]) *
                            FX_RATES[fromCurrency]
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {[50, 100, 200, 500, 1000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handlePreset(v)}
                          className="px-2 py-1 rounded-full bg-[#111827] border border-[#1f1f1f] text-[#a0a0a0] hover:border-[#3b82f6]/60 transition-all"
                        >
                          {v}
                          {isCrypto(fromCurrency) ? "" : ` ${fromCurrency}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SWAP BUTTON */}
                <div className="flex justify-center mt-3 md:mt-6">
                  <button
                    type="button"
                    onClick={handleSwapCurrencies}
                    className="rounded-full bg-[#050816] border border-[#1f1f1f] p-2 hover:border-[#3b82f6]/70 transition-all"
                  >
                    <Repeat2 className="w-4 h-4 text-[#e0e0e0]" />
                  </button>
                </div>

                {/* TO */}
                <div className="space-y-2">
                  <label className="text-[11px] text-[#a0a0a0]">
                    To (estimated, fiat only)
                  </label>
                  <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {renderCurrencyPicker("to", toCurrency, setToCurrency)}
                    </div>
                    <div className="text-sm font-semibold text-[#e0e0e0]">
                      {estimatedReceive > 0
                        ? estimatedReceive.toFixed(2)
                        : "0.00"}{" "}
                      {toCurrency}
                    </div>
                    <div className="text-[11px] text-[#707070]">
                      Rate: 1 {fromCurrency} ≈{" "}
                      <span className="text-[#e0e0e0] font-semibold">
                        {(
                          FX_RATES[fromCurrency] / FX_RATES[toCurrency]
                        ).toFixed(4)}{" "}
                        {toCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExchange}
                disabled={!amount || Number(amount) <= 0}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  !amount || Number(amount) <= 0 || !connected
                    ? "bg-[#050816] border border-[#1f1f1f] text-[#707070] cursor-not-allowed"
                    : "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                Confirm exchange
              </button>
            </div>
          </div>

          {/* Operations history */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#22c1c3_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 text-[#3b82f6]" />
                  <h2 className="text-sm font-semibold text-[#e0e0e0]">
                    Recent activity
                  </h2>
                </div>
                <span className="text-[11px] text-[#707070]">
                  {operations.length} operations
                </span>
              </div>

              {operations.length === 0 ? (
                <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-4 text-center text-[#707070]">
                  Exchanges and card actions will appear here.
                </div>
              ) : (
                <div className="space-y-2">
                  {operations.slice(0, 6).map((op) => (
                    <div
                      key={op.id}
                      className="flex items-center justify-between bg-[#050816] border border-[#1f1f1f] rounded-xl px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#121212] flex items-center justify-center border border-[#1f1f1f]">
                          {op.type === "exchange" && (
                            <ArrowLeftRight className="w-4 h-4 text-[#3b82f6]" />
                          )}
                          {op.type === "card_topup" && (
                            <Banknote className="w-4 h-4 text-[#22c1c3]" />
                          )}
                          {op.type === "card_create" && (
                            <CreditCard className="w-4 h-4 text-[#a855f7]" />
                          )}
                          {op.type === "card_project" && (
                            <Wallet className="w-4 h-4 text-[#facc15]" />
                          )}
                          {op.type === "card_spend" && (
                            <CreditCard className="w-4 h-4 text-[#f97316]" />
                          )}
                        </div>
                        <div>
                          <div className="text-[11px] text-[#e0e0e0]">
                            {op.description}
                          </div>
                          <div className="text-[10px] text-[#707070]">
                            {op.timestamp}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-[#707070] uppercase">
                        {op.type === "exchange"
                          ? "Exchange"
                          : op.type === "card_topup"
                          ? "Card top up"
                          : op.type === "card_create"
                          ? "New card"
                          : op.type === "card_spend"
                          ? "Card spend"
                          : "Project flow"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: virtual cards + spending */}
        <div className="space-y-4">
          {/* Cards header + selected card */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#a855f7_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#a855f7]" />
                  <h2 className="text-sm font-semibold text-[#e0e0e0]">
                    Virtual VISA cards
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCard && (
                    <button
                      type="button"
                      onClick={() => setCardModalOpen(true)}
                      className="inline-flex items-center gap-1 rounded-full bg-[#050816] border border-[#1f1f1f] px-3 py-1 text-[11px] text-[#e0e0e0] hover:border-[#3b82f6]/60 transition-all"
                    >
                      <SettingsIcon />
                      Manage
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCreateCard}
                    className="inline-flex items-center gap-1 rounded-full bg-[#050816] border border-[#1f1f1f] px-3 py-1 text-[11px] text-[#e0e0e0] hover:border-[#3b82f6]/60 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    New VISA (10 USDT)
                  </button>
                </div>
              </div>

              {/* Selected card visual */}
              {selectedCard && (
                <div className="transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:-rotate-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
                  <div className="bg-gradient-to-br from-[#0b1020] via-[#111827] to-[#1e1b4b] rounded-2xl p-4 text-xs text-[#e0e0e0] relative overflow-hidden border border-[#1f1f1f]">
                    <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#a0a0a0]">
                          SolanaVerse Virtual
                        </span>
                        <span className="text-[11px] font-semibold tracking-widest">
                          VISA
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg tracking-[0.15em]">
                          **** **** **** {selectedCard.last4}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#facc15] to-[#f97316] opacity-80" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] mt-1">
                        <div>
                          <div className="text-[#a0a0a0]">Card holder</div>
                          <div className="font-semibold">SolanaVerse User</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#a0a0a0]">Valid thru</div>
                          <div className="font-semibold">
                            {selectedCard.expiry}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#a0a0a0]">CVV</div>
                          <div className="font-semibold tracking-[0.25em]">
                            {selectedCard.cvv}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <div>
                          <div className="text-[#a0a0a0]">Balance</div>
                          <div className="font-semibold">
                            {selectedCard.balance.toFixed(2)}{" "}
                            {selectedCard.currency}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#a0a0a0]">Status</div>
                          <div
                            className={
                              selectedCard.status === "Active"
                                ? "text-emerald-400 font-semibold flex items-center gap-1"
                                : "text-[#f97373] font-semibold flex items-center gap-1"
                            }
                          >
                            {selectedCard.status === "Active" ? (
                              <Zap className="w-3 h-3" />
                            ) : (
                              <Snowflake className="w-3 h-3" />
                            )}
                            {selectedCard.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cards list */}
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCardId(card.id)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border text-[11px] transition-all ${
                      selectedCard && selectedCard.id === card.id
                        ? "bg-[#050816] border-[#3b82f6]"
                        : "bg-[#050816] border-[#1f1f1f] hover:border-[#3b82f6]/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#121212] flex items-center justify-center border border-[#1f1f1f]">
                        <CreditCard className="w-4 h-4 text-[#a0a0a0]" />
                      </div>
                      <div>
                        <div className="text-[#e0e0e0] font-semibold">
                          **** {card.last4}
                        </div>
                        <div className="text-[10px] text-[#707070]">
                          VISA • {card.currency}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#e0e0e0] font-semibold">
                        {card.balance.toFixed(2)} {card.currency}
                      </div>
                      <div className="text-[10px] text-[#707070]">
                        {card.status}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-[#707070]">
                All card data is local preview. Later we can plug real issuer /
                processor or keep it as UX layer for accounts.
              </p>
            </div>
          </div>

          {/* Card spending history */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#f97316_0,_transparent_60%)]" />
            <div className="relative z-10 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 text-[#f97316]" />
                  <h2 className="text-sm font-semibold text-[#e0e0e0]">
                    Card spending (preview)
                  </h2>
                </div>
                <span className="text-[11px] text-[#707070]">
                  {selectedCardSpends.length} records
                </span>
              </div>

              {selectedCard && (
                <>
                  {/* simulate spend */}
                  <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3 space-y-2">
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={spendMerchant}
                        onChange={(e) => setSpendMerchant(e.target.value)}
                        placeholder="Merchant / service"
                        className="w-full bg-transparent border border-[#1f1f1f] rounded-lg px-3 py-1.5 text-[11px] text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={spendAmount}
                          onChange={(e) => setSpendAmount(e.target.value)}
                          placeholder="Amount"
                          className="w-full bg-transparent border border-[#1f1f1f] rounded-lg px-3 py-1.5 text-[11px] text-[#e0e0e0] outline-none focus:border-[#3b82f6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[11px] text-[#707070] flex items-center px-2">
                          {selectedCard.currency}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={spendCategory}
                        onChange={(e) => setSpendCategory(e.target.value)}
                        placeholder="Category (e.g. Subscriptions, Travel)"
                        className="w-full bg-transparent border border-[#1f1f1f] rounded-lg px-3 py-1.5 text-[11px] text-[#e0e0e0] outline-none focus:border-[#3b82f6]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateSpend}
                      disabled={!spendAmount || Number(spendAmount) <= 0}
                      className={`mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[11px] font-medium transition-all ${
                        !spendAmount || Number(spendAmount) <= 0 || !connected
                          ? "bg-[#050816] border border-[#1f1f1f] text-[#707070] cursor-not-allowed"
                          : "bg-[#f97316] hover:bg-[#ea580c] text-white"
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      Simulate card payment
                    </button>
                  </div>

                  {selectedCardSpends.length === 0 ? (
                    <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-4 text-center text-[#707070]">
                      When you simulate payments, they will appear here with
                      merchant, category and timestamp.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {selectedCardSpends.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between bg-[#050816] border border-[#1f1f1f] rounded-xl px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#121212] flex items-center justify-center border border-[#1f1f1f]">
                              <Globe2 className="w-3.5 h-3.5 text-[#f97316]" />
                            </div>
                            <div>
                              <div className="text-[11px] text-[#e0e0e0]">
                                {s.merchant}
                              </div>
                              <div className="text-[10px] text-[#707070]">
                                {s.category}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] text-[#f97373] font-semibold">
                              -{s.amount.toFixed(2)} {s.currency}
                            </div>
                            <div className="text-[10px] text-[#707070]">
                              {s.timestamp}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card controls modal */}
      <AnimatePresence>
        {cardModalOpen && selectedCard && (
          <motion.div
            className="fixed -inset-10 z-40 flex items-center justify-center backdrop-blur bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-3xl rounded-2xl border border-[#1f1f1f] bg-[#050816] p-5 overflow-hidden"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
            >
              <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-[radial-gradient(circle_at_top,_#22c1c3_0,_transparent_60%)]" />
              <div className="relative z-10 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#22c1c3]" />
                    <h3 className="text-sm font-semibold text-[#e0e0e0]">
                      Manage VISA card • **** {selectedCard.last4}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCardModalOpen(false)}
                    className="rounded-full bg-[#111827] p-2 text-[#707070] hover:text-[#e0e0e0]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Small summary */}
                <div className="bg-[#070b14] border border-[#1f1f1f] rounded-xl p-3 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="text-[#707070]">Balance</div>
                    <div className="font-semibold text-[#e0e0e0]">
                      {selectedCard.balance.toFixed(2)} {selectedCard.currency}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#707070]">Status</div>
                    <div
                      className={
                        selectedCard.status === "Active"
                          ? "text-emerald-400 font-semibold flex items-center gap-1 justify-end"
                          : "text-[#f97373] font-semibold flex items-center gap-1 justify-end"
                      }
                    >
                      {selectedCard.status === "Active" ? (
                        <Zap className="w-3 h-3" />
                      ) : (
                        <Snowflake className="w-3 h-3" />
                      )}
                      {selectedCard.status}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Top up from fiat */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#a0a0a0]">
                        Top up from fiat wallet
                      </span>
                      <span className="text-[11px] text-[#707070]">
                        Wallet:{" "}
                        <span className="text-[#e0e0e0] font-semibold">
                          {fiatBalances[selectedCard.currency].toFixed(2)}{" "}
                          {selectedCard.currency}
                        </span>
                      </span>
                    </div>
                    <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3 space-y-2">
                      <input
                        type="number"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        {[25, 50, 100, 250].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setTopupAmount(String(v))}
                            className="px-2 py-1 rounded-full bg-[#111827] border border-[#1f1f1f] text-[#a0a0a0] hover:border-[#3b82f6]/60 transition-all"
                          >
                            {v} {selectedCard.currency}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleTopup}
                        disabled={!topupAmount || Number(topupAmount) <= 0}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                          !topupAmount || Number(topupAmount) <= 0 || !connected
                            ? "bg-[#050816] border border-[#1f1f1f] text-[#707070] cursor-not-allowed"
                            : "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        Top up from fiat
                      </button>
                    </div>
                  </div>

                  {/* Project wallet flows */}
                  <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#a0a0a0]">
                        Project wallet (USDT on BNB Chain)
                      </span>
                      <span className="text-[11px] text-[#707070]">
                        Balance:{" "}
                        <span className="text-[#e0e0e0] font-semibold">
                          {cryptoBalances[PROJECT_TOKEN].toFixed(4)}{" "}
                          {PROJECT_TOKEN}
                        </span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#a0a0a0]">
                          Top up card from project
                        </span>
                        <span className="text-[#707070]">
                          FX: USDT → {selectedCard.currency}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={projectTopupAmount}
                        onChange={(e) => setProjectTopupAmount(e.target.value)}
                        placeholder={`Amount in ${selectedCard.currency}`}
                        className="w-full bg-transparent border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={handleProjectTopup}
                        disabled={
                          !projectTopupAmount ||
                          Number(projectTopupAmount) <= 0
                        }
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[11px] font-medium transition-all ${
                          !projectTopupAmount ||
                          Number(projectTopupAmount) <= 0 ||
                          !connected
                            ? "bg-[#050816] border border-[#1f1f1f] text-[#707070] cursor-not-allowed"
                            : "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                        }`}
                      >
                        <Wallet className="w-4 h-4" />
                        Top up from project
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[#1f1f1f] space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#a0a0a0]">
                          Withdraw to project wallet
                        </span>
                        <span className="text-[#707070]">
                          Card:{" "}
                          <span className="text-[#e0e0e0] font-semibold">
                            {selectedCard.balance.toFixed(2)}{" "}
                            {selectedCard.currency}
                          </span>
                        </span>
                      </div>
                      <input
                        type="number"
                        value={projectWithdrawAmount}
                        onChange={(e) =>
                          setProjectWithdrawAmount(e.target.value)
                        }
                        placeholder={`Amount in ${selectedCard.currency}`}
                        className="w-full bg-transparent border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-[#e0e0e0] outline-none focus:border-[#3b82f6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={handleProjectWithdraw}
                        disabled={
                          !projectWithdrawAmount ||
                          Number(projectWithdrawAmount) <= 0
                        }
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[11px] font-medium transition-all ${
                          !projectWithdrawAmount ||
                          Number(projectWithdrawAmount) <= 0 ||
                          !connected
                            ? "bg-[#050816] border border-[#1f1f1f] text-[#707070] cursor-not-allowed"
                            : "bg-[#111827] hover:border-[#3b82f6]/60 border border-[#1f1f1f] text-[#e0e0e0]"
                        }`}
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                        Send back to project
                      </button>
                    </div>
                  </div>
                </div>

                {/* Limits & regions (concept) */}
                <div className="bg-[#050816] border border-[#1f1f1f] rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 text-[11px]">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#3b82f6]" />
                    <span className="font-semibold text-[#e0e0e0]">
                      Limits & regions (concept)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div className="text-[#707070] mb-1">
                        Monthly limit ({selectedCard.currency})
                      </div>
                      <input
                        type="number"
                        value={monthlyLimit}
                        onChange={(e) => setMonthlyLimit(e.target.value)}
                        className="w-full bg-transparent border border-[#1f1f1f] rounded-lg px-2 py-1.5 text-[11px] text-[#e0e0e0] outline-none focus:border-[#3b82f6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div>
                      <div className="text-[#707070] mb-1">
                        Per transaction
                      </div>
                      <input
                        type="number"
                        value={perTxLimit}
                        onChange={(e) => setPerTxLimit(e.target.value)}
                        className="w-full bg-transparent border border-[#1f1f1f] rounded-lg px-2 py-1.5 text-[11px] text-[#e0e0e0] outline-none focus:border-[#3b82f6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#22c1c3]" />
                        <span className="text-[#a0a0a0]">Allowed regions</span>
                      </div>
                      <div className="flex gap-1">
                        {(["worldwide", "europe", "custom"] as const).map(
                          (mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setRegionMode(mode)}
                              className={`px-2 py-1 rounded-full border text-[10px] ${
                                regionMode === mode
                                  ? "bg-[#111827] border-[#3b82f6] text-[#e0e0e0]"
                                  : "bg-[#050816] border-[#1f1f1f] text-[#707070]"
                              }`}
                            >
                              {mode === "worldwide"
                                ? "Worldwide"
                                : mode === "europe"
                                ? "EU / UK"
                                : "Custom"}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#a0a0a0]">
                        Online-only protection
                      </span>
                      <button
                        type="button"
                        onClick={() => setOnlineOnly((prev) => !prev)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-all ${
                          onlineOnly
                            ? "bg-[#3b82f6] border-[#3b82f6]"
                            : "bg-[#050816] border-[#1f1f1f]"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            onlineOnly ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="text-[10px] text-[#707070]">
                      All these settings are conceptual for now. Later we can
                      sync them with a real card processor or keep them as
                      visual hints for limits in the dApp.
                    </div>
                  </div>
                </div>

                {/* Freeze / unfreeze */}
                <button
                  type="button"
                  onClick={handleToggleFreeze}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#1f1f1f] bg-[#050816] px-4 py-2 text-[11px] text-[#a0a0a0] hover:border-[#3b82f6]/60 transition-all"
                >
                  {selectedCard.status === "Active" ? (
                    <>
                      <Snowflake className="w-4 h-4" />
                      Freeze card
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Unfreeze card
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// helper-іконка
const SettingsIcon: React.FC = () => (
  <svg
    className="w-3.5 h-3.5 text-[#3b82f6]"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M10.325 4.317a1.75 1.75 0 0 1 3.35 0l.203.793c.09.353.35.64.694.777l.764.305a1.75 1.75 0 0 1 .936 2.39l-.36.72c-.16.321-.16.699 0 1.02l.36.72a1.75 1.75 0 0 1-.936 2.39l-.764.305a1.25 1.25 0 0 0-.694.777l-.203.793a1.75 1.75 0 0 1-3.35 0l-.203-.793a1.25 1.25 0 0 0-.694-.777l-.764-.305a1.75 1.75 0 0 1-.936-2.39l.36-.72a1.25 1.25 0 0 0 0-1.02l-.36-.72a1.75 1.75 0 0 1 .936-2.39l.764-.305a1.25 1.25 0 0 0 .694-.777l.203-.793Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default Exchange;
