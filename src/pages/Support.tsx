import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Headset, Send, ArrowRight, ChevronDown, ChevronUp, Mail, 
  MessageCircle, HelpCircle, Ticket, Search, BookOpen, 
  Video, FileText, Clock, CheckCircle, AlertCircle, 
  Copy, ExternalLink, Phone, Globe, Shield, Zap,
  Wallet, Coins, Image as ImageIcon, BarChart3, Users
} from 'lucide-react';

const Support = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const categories = [
    { id: 'general', name: 'General', icon: HelpCircle },
    { id: 'wallet', name: 'Wallet', icon: Wallet },
    { id: 'tokens', name: 'Tokens', icon: Coins },
    { id: 'nft', name: 'NFT', icon: ImageIcon },
    { id: 'staking', name: 'Staking', icon: BarChart3 },
    { id: 'account', name: 'Account', icon: Users },
  ];

  const faqData = {
    general: [
      {
        question: 'What is SolanaVerse?',
        answer: 'SolanaVerse is a comprehensive Web3 ecosystem built on Solana blockchain. We offer IDO launchpad services, NFT marketplace, staking pools, governance DAO, and cross-chain bridges. Our platform connects investors with innovative blockchain projects while providing tools for asset management and community participation.',
        popular: true
      },
      {
        question: 'Is SolanaVerse secure?',
        answer: 'Yes, security is our top priority. Our smart contracts are audited by CertiK and SlowMist. We use multi-sig wallets for treasury management, implement real-time monitoring systems, and have a dedicated security team. Additionally, we have a bug bounty program with rewards up to $100,000.'
      },
      {
        question: 'What are the platform fees?',
        answer: 'Platform fees vary by service: IDO participation (2%), NFT marketplace (2.5% + royalty), Staking (0% deposit/withdrawal, 5% reward fee), Token swaps (0.3%). Holding SVT tokens provides fee discounts up to 50% based on your tier level.'
      },
      {
        question: 'How do I stay updated?',
        answer: 'Follow our official channels: Twitter/X (@SolanaVerse), Telegram Announcements, Discord Community, and Medium Blog. Subscribe to our newsletter for weekly updates. Enable push notifications in your account settings for real-time alerts.'
      }
    ],
    wallet: [
      {
        question: 'Which wallets are supported?',
        answer: 'We support Phantom, Solflare, MetaMask (via Snaps), Backpack, Glow, and Ledger hardware wallets. Mobile users can use Trust Wallet and Coinbase Wallet through WalletConnect. Ensure your wallet is updated to the latest version for best compatibility.'
      },
      {
        question: 'How to connect my wallet?',
        answer: 'Click "Connect Wallet" in the top right corner. Select your wallet provider from the list. Approve the connection request in your wallet extension/mobile app. For mobile, scan the QR code with your wallet app. Once connected, you can view your portfolio and interact with the platform.',
        popular: true
      },
      {
        question: 'Connection issues troubleshooting',
        answer: '1) Clear browser cache and cookies. 2) Disable other wallet extensions temporarily. 3) Ensure you are on HTTPS://solanaverse.io. 4) Try incognito/private mode. 5) Update your wallet to latest version. 6) Check if Solana network is operational. If issues persist, contact support with error screenshots.'
      },
      {
        question: 'Is my wallet safe?',
        answer: 'We never store your private keys or seed phrases. All transactions require your explicit approval through your wallet. We recommend using a hardware wallet for large amounts and enabling 2FA in your account settings. Never share your seed phrase with anyone, including our support team.'
      }
    ],
    tokens: [
      {
        question: 'How to participate in IDO?',
        answer: '1) Complete KYC verification. 2) Stake required SVT tokens for tier qualification. 3) Register for the IDO during whitelist period. 4) Contribute funds when pool opens. 5) Claim tokens after TGE. Each tier has different allocation sizes - higher tiers get better rates and guaranteed allocations.',
        popular: true
      },
      {
        question: 'When do I receive my tokens?',
        answer: 'Token distribution varies by project. Most IDOs have a Token Generation Event (TGE) where 20-30% is released initially, followed by linear vesting over 6-12 months. Check the specific project page for detailed vesting schedules. Tokens are automatically airdropped to your connected wallet.'
      },
      {
        question: 'Can I sell IDO tokens immediately?',
        answer: 'This depends on the project vesting schedule. Some have cliff periods (no tokens for first X months), others have immediate partial liquidity. Check the "Vesting" section on each IDO page. Attempting to sell before TGE may result in penalties or blacklist.'
      },
      {
        question: 'What is SVT token utility?',
        answer: 'SVT is our native utility token used for: IDO tier qualification, staking rewards, governance voting, fee discounts, NFT purchases, premium features access, and liquidity mining. Total supply is 100M tokens with deflationary mechanisms including buyback and burn.'
      }
    ],
    nft: [
      {
        question: 'How to mint NFTs?',
        answer: 'Navigate to NFT Drop section, connect wallet, browse available collections. Click "Mint" on desired NFT, select quantity (if allowed), choose payment method (SOL, USDC, or SVT), confirm transaction in wallet. NFT appears in your wallet and profile within minutes.',
        popular: true
      },
      {
        question: 'Where are my NFTs stored?',
        answer: 'NFTs are stored on-chain in your Solana wallet. Metadata and images are stored on Arweave (permanent storage) or IPFS. You can view them in your Profile > NFTs section, or directly in your wallet (Phantom, Solflare) under Collectibles tab.'
      },
      {
        question: 'How to sell my NFTs?',
        answer: 'Go to Profile > My NFTs, select the NFT, click "List for Sale". Set price in SOL, USDC, or SVT. Choose duration (1-30 days). Confirm listing transaction. Your NFT will appear in marketplace. You can cancel listing anytime before sale.'
      },
      {
        question: 'What are creator royalties?',
        answer: 'Creators set royalties (0-10%) during collection creation. When NFT is resold, royalty automatically goes to creator wallet. This supports artists and project development. Platform fee is 2.5% on top of royalty.'
      }
    ],
    staking: [
      {
        question: 'How does staking work?',
        answer: 'Stake SVT tokens to earn passive income and unlock platform benefits. Choose between Flexible (anytime withdrawal, lower APY) or Locked (30-365 days, higher APY). Rewards accrue every epoch (~2 days) and can be claimed or compounded.',
        popular: true
      },
      {
        question: 'What are the current APY rates?',
        answer: 'APY varies by lock period: Flexible (8-12%), 30 days (15-18%), 90 days (22-28%), 180 days (35-42%), 365 days (50-65%). Rates adjust based on total staked amount and platform revenue. Check Staking page for real-time rates.'
      },
      {
        question: 'Can I unstake early?',
        answer: 'Flexible staking: instant withdrawal with 0.5% fee. Locked staking: early withdrawal possible with 10-25% penalty depending on remaining time. Emergency unstake allows withdrawal without waiting but forfeits all pending rewards.'
      },
      {
        question: 'How are rewards calculated?',
        answer: 'Rewards = (Your Stake / Total Staked) × Daily Reward Pool × Multiplier. Multipliers: Flexible (1x), 30d (1.2x), 90d (1.5x), 180d (2x), 365d (2.5x). Rewards compound automatically if you enable "Auto-compound" feature.'
      }
    ],
    account: [
      {
        question: 'How to complete KYC?',
        answer: 'Go to Profile > Verification. Upload government ID (passport/driver license), take selfie for liveness check, provide proof of address (utility bill/bank statement). Verification takes 1-24 hours. Approved users get higher limits and exclusive access.'
      },
      {
        question: 'How to enable 2FA?',
        answer: 'Profile > Security > Two-Factor Authentication. Scan QR code with Google Authenticator or Authy. Enter 6-digit code to confirm. Save backup codes securely. 2FA is required for withdrawals and high-value transactions.'
      },
      {
        question: 'I forgot my password',
        answer: 'Since we are decentralized, there is no traditional password. Your access is through wallet connection. If you lost wallet access, restore using seed phrase. Never share seed phrase. Contact support only through official channels if suspicious activity detected.'
      }
    ]
  };

  const guides = [
    {
      title: 'Getting Started Guide',
      description: 'Complete walkthrough for new users',
      icon: BookOpen,
      readTime: '5 min',
      link: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step visual guides',
      icon: Video,
      readTime: '12 videos',
      link: '#'
    },
    {
      title: 'Documentation',
      description: 'Technical docs and API references',
      icon: FileText,
      readTime: 'Full docs',
      link: '#'
    }
  ];

  const stats = [
    { label: 'Avg Response Time', value: '< 2 hours', icon: Clock },
    { label: 'Resolution Rate', value: '98.5%', icon: CheckCircle },
    { label: 'Active Tickets', value: '24/7', icon: Headset },
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setTicketSubmitted(true);
      toast.success('Ticket #SV-' + Math.floor(Math.random() * 10000) + ' created successfully!');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setCategory('general');
    }, 1000);
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const filteredFAQs = faqData[activeCategory as keyof typeof faqData].filter(
    faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-[#334155] p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <Headset className="h-8 w-8 text-blue-400" />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
              24/7 Support Online
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            How can we help you?
          </h1>
          <p className="text-[#94a3b8] max-w-xl text-lg">
            Search our knowledge base or contact our support team. 
            We typically respond within 2 hours.
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a]/80 border border-[#334155] rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-4 flex items-center gap-4 hover:border-[#334155] transition-colors">
            <div className="p-3 bg-[#1a1a1a] rounded-lg">
              <stat.icon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-[#64748b]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: FAQ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Tabs */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-[#94a3b8] hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-400" />
                Frequently Asked Questions
              </h2>
              <span className="text-xs text-[#64748b]">
                {filteredFAQs.length} results
              </span>
            </div>

            <div className="space-y-3">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8 text-[#64748b]">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No results found. Try different keywords or contact support.</p>
                </div>
              ) : (
                filteredFAQs.map((item, index) => (
                  <div
                    key={index}
                    className="border border-[#1f1f1f] rounded-lg overflow-hidden hover:border-[#334155] transition-colors"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex justify-between items-center p-4 text-left hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">{item.question}</span>
                        {item.popular && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            Popular
                          </span>
                        )}
                      </div>
                      {expandedFAQ === index ? (
                        <ChevronUp className="h-5 w-5 text-blue-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#64748b]" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="p-4 bg-[#1a1a1a] border-t border-[#1f1f1f]">
                        <p className="text-sm text-[#94a3b8] leading-relaxed mb-3">
                          {item.answer}
                        </p>
                        <div className="flex gap-3">
                          <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Helpful
                          </button>
                          <button className="text-xs text-[#64748b] hover:text-[#94a3b8] flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            Ask follow-up
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Guides Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guides.map((guide, index) => (
              <a
                key={index}
                href={guide.link}
                className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-4 hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <guide.icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <ExternalLink className="h-4 w-4 text-[#64748b] group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{guide.title}</h3>
                <p className="text-xs text-[#64748b] mb-2">{guide.description}</p>
                <span className="text-[10px] text-[#475569] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {guide.readTime}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Right Column: Contact & Ticket */}
        <div className="space-y-6">
          {/* Contact Options */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              Quick Contact
            </h3>
            
            <div className="space-y-3">
              <a
                href="https://t.me/solanaverse_support"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#1f1f1f] hover:border-blue-500/50 transition-all group"
              >
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Telegram</div>
                  <div className="text-xs text-[#64748b]">@solanaverse_support</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#64748b] group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </a>

              <a
                href="mailto:support@solanaverse.io"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#1f1f1f] hover:border-blue-500/50 transition-all group"
              >
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Mail className="h-4 w-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Email</div>
                  <div className="text-xs text-[#64748b]">support@solanaverse.io</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#64748b] group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </a>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#1f1f1f]">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Clock className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Live Chat</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online now
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Form */}
          <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-400" />
              Submit Ticket
            </h3>

            {ticketSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Ticket Created!</h4>
                <p className="text-sm text-[#64748b] mb-4">
                  We'll respond to your email within 2 hours.
                </p>
                <button
                  onClick={() => setTicketSubmitted(false)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Submit another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Brief description"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 min-h-[100px] resize-none"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </button>

                <p className="text-[10px] text-[#64748b] text-center">
                  By submitting, you agree to our Privacy Policy and Terms of Service
                </p>
              </form>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-orange-400 mb-1">
                  Security Notice
                </h4>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Never share your seed phrase or private keys. Our team will never ask for them. 
                  Always verify you are on solanaverse.io
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;