import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { toast } from "sonner";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Award,
  Gift,
  Sparkles,
  Shield,
  Copy,
  ExternalLink,
  Loader2,
  BadgeCheck,
  Bot,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { WhitelistQueue } from "../components/WhitelistQueue";
import { WhitelistTicketBadge } from "../components/WhitelistTicketBadge";

const LS_KEY = "sv_whitelist_application_v1";

type ApplicationStatus = "not_applied" | "pending" | "approved" | "rejected";

type WhitelistApplication = {
  wallet: string;
  email: string;
  discord: string;
  twitter: string;

  // mini verification UI
  verifiedDiscord: boolean;
  verifiedTwitter: boolean;

  // optional fields
  notes?: string;

  submittedAt: number;
  status: ApplicationStatus;
};

function shorten(addr?: string | null) {
  if (!addr) return "—";
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function Whitelist() {
  const { connected, publicKey } = useWallet();

  // form fields
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [twitter, setTwitter] = useState("");
  const [notes, setNotes] = useState("");

  // UI states
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>("not_applied");
  const [error, setError] = useState("");
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);

  // mini verification states (UI only)
  const [verifiedDiscord, setVerifiedDiscord] = useState(false);
  const [verifiedTwitter, setVerifiedTwitter] = useState(false);
  const [verifying, setVerifying] = useState<null | "discord" | "twitter">(null);

  // accordion
  const [faqOpen, setFaqOpen] = useState(true);
  const [whyOpen, setWhyOpen] = useState(true);

  // ===== demo stats (can be wired later) =====
  const MAX_SPOTS = 5000;
  const [spotsTaken, setSpotsTaken] = useState(1000); // demo
  const discount = 20; // %
  const earlyAccessHours = 24;

  const progressPct = useMemo(() => clamp((spotsTaken / MAX_SPOTS) * 100, 0, 100), [spotsTaken]);

  // eligibility score (anti-bot / trust UI)
  const eligibilityScore = useMemo(() => {
    const walletScore = connected ? 30 : 0;
    const socialsScore =
      (verifiedDiscord ? 20 : 0) +
      (verifiedTwitter ? 20 : 0);

    const completenessScore =
      (email.trim() ? 10 : 0) +
      (discord.trim() ? 10 : 0) +
      (twitter.trim() ? 10 : 0);

    // small bonus if user adds notes
    const notesScore = notes.trim().length >= 20 ? 10 : 0;

    return clamp(walletScore + socialsScore + completenessScore + notesScore, 0, 100);
  }, [connected, verifiedDiscord, verifiedTwitter, email, discord, twitter, notes]);

  const eligibilityLabel =
    eligibilityScore >= 80 ? "Strong" : eligibilityScore >= 55 ? "Medium" : "Low";

  const eligibilityBar =
    eligibilityScore >= 80
      ? "bg-[#22c55e]"
      : eligibilityScore >= 55
      ? "bg-[#facc15]"
      : "bg-[#ef4444]";

  // Requirements checklist
  const checklist = useMemo(() => {
    return [
      { id: 1, label: "Connect your wallet", done: connected },
      { id: 2, label: "Add email address", done: !!email.trim() },
      { id: 3, label: "Add Discord username", done: !!discord.trim() },
      { id: 4, label: "Add X (Twitter) handle", done: !!twitter.trim() },
      { id: 5, label: "Verify Discord (UI)", done: verifiedDiscord },
      { id: 6, label: "Verify Twitter (UI)", done: verifiedTwitter },
      { id: 7, label: "Optional: add short notes (20+ chars)", done: notes.trim().length >= 20 },
    ];
  }, [connected, email, discord, twitter, verifiedDiscord, verifiedTwitter, notes]);

  const completedCount = checklist.filter((c) => c.done).length;

  // Load saved application
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as WhitelistApplication;

      // only restore if same wallet (or wallet empty because user not connected at load)
      if (parsed?.wallet && publicKey && parsed.wallet !== publicKey) return;

      setEmail(parsed.email || "");
      setDiscord(parsed.discord || "");
      setTwitter(parsed.twitter || "");
      setNotes(parsed.notes || "");
      setVerifiedDiscord(!!parsed.verifiedDiscord);
      setVerifiedTwitter(!!parsed.verifiedTwitter);

      setSubmitted(parsed.status !== "not_applied");
      setStatus(parsed.status || "pending");
      setSubmittedAt(parsed.submittedAt || null);
    } catch {
      // ignore
    }
  }, [publicKey]);

  // Save to localStorage
  useEffect(() => {
    if (!publicKey) return;
    const payload: WhitelistApplication = {
      wallet: publicKey,
      email,
      discord,
      twitter,
      notes,
      verifiedDiscord,
      verifiedTwitter,
      submittedAt: submittedAt || Date.now(),
      status,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }, [publicKey, email, discord, twitter, notes, verifiedDiscord, verifiedTwitter, submittedAt, status]);

  const copyWallet = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      toast.success("Wallet address copied");
    } catch {
      toast.error("Clipboard blocked");
    }
  };

  const fakeVerify = async (type: "discord" | "twitter") => {
    if (!connected) {
      toast.error("Connect wallet first");
      return;
    }
    setVerifying(type);
    await new Promise((r) => setTimeout(r, 1100));

    if (type === "discord") {
      setVerifiedDiscord(true);
      toast.success("Discord verified ✅ (UI)");
    } else {
      setVerifiedTwitter(true);
      toast.success("Twitter verified ✅ (UI)");
    }
    setVerifying(null);
  };

  const resetApplication = () => {
    setSubmitted(false);
    setStatus("not_applied");
    setSubmittedAt(null);
    setError("");
    toast.message("Draft cleared");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected) {
      setError("Please connect your wallet first");
      return;
    }
    if (!email.trim() || !discord.trim() || !twitter.trim()) {
      setError("Please fill out all required fields");
      return;
    }

    // require at least one verification for “professional feel”
    if (!verifiedDiscord && !verifiedTwitter) {
      setError("Please verify at least one social account (Discord or Twitter)");
      return;
    }

    setSubmitted(true);
    setStatus("pending");
    setSubmittedAt(Date.now());
    setError("");

    // demo spots change
    setSpotsTaken((prev) => Math.min(MAX_SPOTS, prev + 1));

    toast.success("Application submitted ✅");
  };

  // Demo: auto-approve if score high (only UI)
  useEffect(() => {
    if (!submitted || status !== "pending") return;
    if (eligibilityScore >= 85) {
      const t = setTimeout(() => setStatus("approved"), 1400);
      return () => clearTimeout(t);
    }
  }, [submitted, status, eligibilityScore]);

  const statusBadge = useMemo(() => {
    if (!submitted) return { label: "Not applied", cls: "border-[#1f1f1f] bg-[#1a1a1a] text-[#a0a0a0]" };
    if (status === "pending") return { label: "Pending Review", cls: "border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]" };
    if (status === "approved") return { label: "Approved", cls: "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]" };
    return { label: "Rejected", cls: "border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]" };
  }, [submitted, status]);

  const mintLimit = status === "approved" ? 3 : 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-[#e0e0e0]">NFT Whitelist</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">
          Apply for early access to our exclusive NFT collection. Verified accounts improve approval odds.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {[
    {
      icon: Users,
      title: "Whitelist spots",
      value: `${spotsTaken.toLocaleString()} / ${MAX_SPOTS.toLocaleString()}`,
      footer: `${progressPct.toFixed(1)}% filled`,
      extra: (
        <div className="mt-3 h-1.5 bg-[#0b0b0b] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#3b82f6] to-[#00d1ff]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ),
    },
    {
      icon: Award,
      title: "Whitelist discount",
      value: `${discount}% OFF`,
      footer: "Applied at mint checkout (presale only)",
    },
    {
      icon: Clock,
      title: "Early access",
      value: `${earlyAccessHours} Hours`,
      footer: "Mint before public sale opens",
    },
    {
      icon: Shield,
      title: "Eligibility score",
      value: `${eligibilityScore}/100`,
      footer: eligibilityLabel,
      extra: (
        <div className="mt-3 h-1.5 bg-[#0b0b0b] rounded-full overflow-hidden">
          <div
            className={`h-full ${eligibilityBar}`}
            style={{ width: `${eligibilityScore}%` }}
          />
        </div>
      ),
    },
  ].map((s, i) => (
    <div
      key={i}
      className="ui-card rounded-2xl p-5 relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -inset-0.5 opacity-10 " />
      <div className="relative z-10">
        <s.icon className="absolute h-24 w-24 opacity-5 z-[-1] -right-3 top-1/3 text-[#3b82f6]" />
        <div className="text-xs text-[#707070]">{s.title}</div>
        <div className="text-lg font-semibold text-[#e0e0e0] mt-1">
          {s.value}
        </div>
        {s.extra}
        <div className="mt-2 text-[10px] text-[#707070]">{s.footer}</div>
      </div>
    </div>
  ))}
</div>


      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="ui-card rounded-2xl p-6 relative overflow-hidden">
  <div className="pointer-events-none absolute -inset-0.5 opacity-10 " />
  <div className="relative z-10">

            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-[#e0e0e0]">Whitelist Application</h2>
                <p className="text-xs text-[#707070] mt-1">
                  Add socials + verify at least one. Your status updates here automatically.
                </p>
              </div>


              <div className={`text-[11px] px-3 py-1 rounded-full border ${statusBadge.cls}`}>
                {statusBadge.label}
              </div>
            </div>

            {/* Alerts */}
            {!connected && (
              <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-4 mb-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-[#a0a0a0] mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-[#e0e0e0]">Wallet not connected</div>
                    <div className="text-xs text-[#707070] mt-1">Connect your wallet to apply.</div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-[#1a1a1a] border border-[#ef4444]/30 rounded-lg p-4 mb-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-[#ef4444] mt-0.5" />
                  <div className="text-xs text-[#e0e0e0]">{error}</div>
                </div>
              </div>
            )}

            {/* Submitted screen */}
            {submitted ? (
              <div className="ui-inner rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#eee]/5 flex items-center justify-center">
                    {status === "approved" ? (
                      <BadgeCheck className="w-6 h-6 text-[#22c55e]" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-[#3b82f6]" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#e0e0e0]">
                      {status === "approved" ? "Approved" : "Application submitted!"}
                    </div>
                    <div className="text-xs text-[#a0a0a0] mt-1">
                      {status === "pending"
                        ? "Your application is under review. We'll notify you via email."
                        : status === "approved"
                        ? `You're whitelisted. Mint limit: ${mintLimit} NFTs with ${discount}% discount.`
                        : "Your application was rejected. You can re-apply later."}
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="ui-card rounded-lg p-3">
                        <div className="text-[10px] text-[#707070]">Wallet</div>
                        <div className="text-xs text-[#e0e0e0] mt-1 flex items-center justify-between gap-3">
                          <span className="break-all">{shorten(publicKey)}</span>
                          <button
                            onClick={copyWallet}
                            className="px-2 py-1 rounded text-[10px] text-[#a0a0a0]"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Copy className="w-3 h-3" /> Copy
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="ui-card rounded-lg p-3">
                        <div className="text-[10px] text-[#707070]">Submitted</div>
                        <div className="text-xs text-[#e0e0e0] mt-1">
                          {submittedAt ? new Date(submittedAt).toLocaleString() : "—"}
                        </div>
                        <div className="text-[10px] text-[#707070] mt-2">
                          Score: <span className="text-[#e0e0e0]">{eligibilityScore}/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={resetApplication}
                        className="px-4 py-2 rounded-lg bg-[#eee]/5 hover:bg-[#111] text-xs text-[#a0a0a0]"
                      >
                        Clear draft
                      </button>

                      <button
                        onClick={() => toast.message("Coming soon: open mint page")}
                        className="px-4 py-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-xs text-white"
                      >
                        Go to Mint (soon)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Wallet */}
                <div>
                  <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">Wallet Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={publicKey || ""}
                      readOnly
                      className="flex-1 px-3 py-2 ui-inner rounded-lg text-[#707070] text-sm"
                    />
                    <button
                      type="button"
                      onClick={copyWallet}
                      disabled={!publicKey}
                      className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                        publicKey
                          ? "bg-[#0a0a0a] border-[#1f1f1f] hover:bg-[#111] text-[#a0a0a0]"
                          : "bg-[#1a1a1a] border-[#1f1f1f] text-[#707070] cursor-not-allowed"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Copy
                      </span>
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 ui-inner rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>

                {/* Discord */}
                <div>
                  <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">Discord Username</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="username#1234"
                      value={discord}
                      onChange={(e) => setDiscord(e.target.value)}
                      className="flex-1 px-3 py-2 ui-inner rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                    />
                    <button
                      type="button"
                      onClick={() => fakeVerify("discord")}
                      disabled={!connected || verifying !== null || verifiedDiscord || !discord.trim()}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        !connected || verifying !== null || verifiedDiscord || !discord.trim()
                          ? "bg-[#0a0a0a] text-[#707070] cursor-not-allowed"
                          : "bg-[#3b82f6]/10 text-[#3b82f6] hover:bg-[#3b82f6]/20"
                      }`}
                    >
                      {verifying === "discord" ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" /> Verifying
                        </span>
                      ) : verifiedDiscord ? (
                        "Verified"
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                </div>

                {/* Twitter */}
                <div>
                  <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">X (Twitter) Handle</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="@username"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="flex-1 px-3 py-2 ui-inner rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                    />
                    <button
                      type="button"
                      onClick={() => fakeVerify("twitter")}
                      disabled={!connected || verifying !== null || verifiedTwitter || !twitter.trim()}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        !connected || verifying !== null || verifiedTwitter || !twitter.trim()
                          ? "bg-[#0a0a0a] text-[#707070] cursor-not-allowed"
                          : "bg-[#3b82f6]/10 text-[#3b82f6] hover:bg-[#3b82f6]/20"
                      }`}
                    >
                      {verifying === "twitter" ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" /> Verifying
                        </span>
                      ) : verifiedTwitter ? (
                        "Verified"
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
                    Optional Notes (helps review)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us why you should get whitelisted (community activity, holdings, etc.)"
                    rows={3}
                    className="w-full px-3 py-2 ui-inner rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                  />
                  <div className="mt-1 text-[10px] text-[#707070]">
                    Tip: 20+ characters adds a small eligibility boost (UI).
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!connected}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                    !connected
                      ? "bg-[#1a1a1a] text-[#707070] cursor-not-allowed border border-[#1f1f1f]"
                      : "btn-primary text-white"
                  }`}
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>

              <div className="grid mt-4 grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="bg-[#eee]/5 rounded-xl p-6">
          <button
            onClick={() => setWhyOpen((p) => !p)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-sm font-semibold text-[#e0e0e0]">How approval works</h2>
            {whyOpen ? (
              <ChevronUp className="w-4 h-4 text-[#a0a0a0]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#a0a0a0]" />
            )}
          </button>

          {whyOpen && (
            <div className="mt-4 space-y-3 text-xs text-[#a0a0a0]">
              <p>
                We prioritize real users and active community members. Verification improves your eligibility score and reduces bot risk.
              </p>
              <ul className="space-y-1 ml-4">
                <li>• Connected wallet + filled fields increase score</li>
                <li>• Verified social accounts add the biggest boost</li>
                <li>• Notes help reviewers understand your activity</li>
              </ul>
              <div className="ui-inner rounded-lg p-3 text-[11px] text-[#707070]">
                This is UI logic for now. Later: real OAuth verification + backend review queue.
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#eee]/5 rounded-xl p-6">
          <button
            onClick={() => setFaqOpen((p) => !p)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-sm font-semibold text-[#e0e0e0]">Whitelist FAQ</h2>
            {faqOpen ? (
              <ChevronUp className="w-4 h-4 text-[#a0a0a0]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#a0a0a0]" />
            )}
          </button>

          {faqOpen && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#e0e0e0] mb-2">How do I qualify?</h3>
                <p className="text-xs text-[#a0a0a0] mb-2">
                  Fill the form + verify at least one social account. Higher eligibility score improves your chances.
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="text-xs text-[#a0a0a0]">• Active Discord member</li>
                  <li className="text-xs text-[#a0a0a0]">• Complete Airdrop tasks</li>
                  <li className="text-xs text-[#a0a0a0]">• Refer friends who join</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#e0e0e0] mb-2">When will I know?</h3>
                <p className="text-xs text-[#a0a0a0]">
                  Reviews are typically within 48 hours. (UI demo: high score can auto-approve.)
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#e0e0e0] mb-2">How many NFTs can I mint?</h3>
                <p className="text-xs text-[#a0a0a0]">
                  Approved users can mint up to 3 NFTs during presale at a {discount}% discount.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

          </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="ui-card  rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 card-gradient-soft" />
              <div className="relative z-10">

            <h2 className="text-sm font-semibold text-[#e0e0e0] mb-3">Whitelist Status</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#707070]">Status</span>
                <span className={`font-medium ${statusBadge.cls} px-2 py-0.5 rounded border`}>
                  {statusBadge.label}
                </span>
              </div>
          <WhitelistQueue status={status} score={eligibilityScore} />
          <WhitelistTicketBadge status={status} />

              <div className="flex justify-between text-xs">
                <span className="text-[#707070]">Wallet</span>
                <span className="font-medium text-[#e0e0e0]">{shorten(publicKey)}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-[#707070]">Application Date</span>
                <span className="font-medium text-[#e0e0e0]">
                  {submittedAt ? new Date(submittedAt).toLocaleDateString() : "N/A"}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-[#707070]">Mint Limit</span>
                <span className="font-medium text-[#e0e0e0]">{mintLimit || "—"}</span>
              </div>
            </div>

            <div className="mt-4 ui-inner rounded-lg p-3">
              <div className="text-[11px] text-[#a0a0a0] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#3b82f6]" />
                Higher score = faster review (UI) + better priority later.
              </div>
            </div>
          </div>
          </div>

          {/* Benefits */}
          <div className="ui-card rounded-2xl p-5 relative overflow-hidden">
            <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
              <div className="relative z-10">

            <h2 className="text-sm font-semibold text-[#e0e0e0] mb-3">Whitelist Benefits</h2>
            <ul className="space-y-2">
              <li className="flex items-start text-xs text-[#a0a0a0]">
                <CheckCircle className="h-3 w-3 text-[#3b82f6] mr-2 mt-0.5 flex-shrink-0" />
                Guaranteed allocation (if approved)
              </li>
              <li className="flex items-start text-xs text-[#a0a0a0]">
                <CheckCircle className="h-3 w-3 text-[#3b82f6] mr-2 mt-0.5 flex-shrink-0" />
                {discount}% discount on mint price
              </li>
              <li className="flex items-start text-xs text-[#a0a0a0]">
                <CheckCircle className="h-3 w-3 text-[#3b82f6] mr-2 mt-0.5 flex-shrink-0" />
                Early access {earlyAccessHours}h before public
              </li>
              <li className="flex items-start text-xs text-[#a0a0a0]">
                <CheckCircle className="h-3 w-3 text-[#3b82f6] mr-2 mt-0.5 flex-shrink-0" />
                Exclusive airdrops for members
              </li>
            </ul>
          </div>
            </div>

          {/* Checklist */}
          <div className="ui-card rounded-2xl p-5 relative overflow-hidden">
            {/* <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" /> */}
              <div className="relative z-10">

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#e0e0e0]">Checklist</h2>
              <span className="text-[10px] text-[#707070]">
                {completedCount}/{checklist.length} done
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between ui-inner rounded-lg px-3 py-2"
                >
                  <span className={`text-xs ${c.done ? "text-[#e0e0e0]" : "text-[#a0a0a0]"}`}>
                    {c.label}
                  </span>
                  <span
                    className={`text-[10px] px-3 py-0.5 rounded-lg border ${
                      c.done
                        ? "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]"
                        : "border-[#eee]/10 bg-[#eee]/5 text-[#707070]"
                    }`}
                  >
                    {c.done ? "Done" : "Missing"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Why & FAQ accordions */}
      
    </div>
  );
}

export default Whitelist;
