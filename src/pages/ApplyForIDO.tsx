import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Upload,
  AlertTriangle,
  Check,
  ShieldCheck,
  Rocket,
  Wallet,
  FileText,
  Users,
  Info,
  Globe2,
  Link2,
  Twitter,
  MessageCircle
} from 'lucide-react';

export function ApplyForIDO() {
  const { connected } = useWallet();

  const [formData, setFormData] = useState({
    projectName: '',
    tokenSymbol: '',
    website: '',
    email: '',
    telegram: '',
    twitter: '',
    description: '',
    tokenomics: '',
    fundingGoal: '',
    tokenPrice: '',
    category: '',
    teamMembers: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [whitepaperFile, setWhitepaperFile] = useState<File | null>(null);
  const [deckFile, setDeckFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<'basic' | 'standard' | 'premium'>('standard');

  const tariffs = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$2,500',
      tag: 'For early-stage teams',
      features: [
        'IDO listing on SolanaVerse',
        'Standard pool configuration',
        'Basic marketing package',
        'Community announcement',
        'Standard support (email / Telegram)',
        '7-day campaign duration',
      ],
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '$5,000',
      tag: 'Most common setup',
      features: [
        'Everything in Basic',
        'Featured homepage placement',
        'Social media promotion',
        'Tokenomics consultation call',
        'Priority support',
        '14-day campaign duration',
        '1x AMA session with community',
      ],
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$10,000',
      tag: 'For serious launches',
      features: [
        'Everything in Standard',
        'Dedicated marketing campaign',
        'Influencer / KOL partnerships',
        'Full tokenomics review & audit',
        'Smart contract review (UI-only)',
        '24/7 priority support',
        '30-day campaign duration',
        'Multiple AMA sessions',
        'Press release distribution',
      ],
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setLogoFile(e.target.files[0]);
  };

  const handleWhitepaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setWhitepaperFile(e.target.files[0]);
  };

  const handleDeckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setDeckFile(e.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // тут потім підвʼяжеш API / on-chain логіку, поки що просто success state
    setSubmitted(true);
  };

  const isFormValid = () => {
    const requiredFields = [
      'projectName',
      'tokenSymbol',
      'website',
      'email',
      'description',
      'tokenomics',
      'fundingGoal',
      'tokenPrice',
    ];
    const baseOk =
      requiredFields.every(field => (formData as any)[field]) &&
      logoFile &&
      whitepaperFile;

    return !!baseOk;
  };

  // SUCCESS VIEW
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_60%)]" />
          <div className="relative z-10">
            <div className="bg-[#0b1120] border border-[#1f1f1f] p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-[#3b82f6]" />
            </div>
            <h2 className="text-xl font-semibold text-[#e0e0e0] mb-3">
              Application submitted
            </h2>
            <p className="text-sm text-[#a0a0a0] mb-6">
              Thank you for submitting your project. Our team will review your
              application and get back to you within 5–7 business days with the
              next steps and a launch timeline.
            </p>

            <div className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-[#3b82f6] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-medium text-[#e0e0e0] mb-1">
                    What happens now?
                  </h3>
                  <p className="text-xs text-[#a0a0a0]">
                    We&apos;ll validate tokenomics, check your links and
                    materials, and contact you at the provided email / Telegram
                    for a quick follow-up call.
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-[#707070]">
                If you need to update your submission, reply to the confirmation
                email with additional details or updated documents.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN VIEW
  return (
    <div className="space-y-6">
      {/* HERO + overview */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-5 md:p-6 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-0.5 opacity-20 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]" />
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#020617] px-3 py-1 text-[11px] text-[#9ca3af]">
              <Rocket className="h-3.5 w-3.5 text-[#3b82f6]" />
              <span>Launch your IDO on SolanaVerse</span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#e5e7eb]">
                Apply for IDO
              </h1>
              <p className="mt-1 text-xs md:text-sm text-[#9ca3af] max-w-xl">
                Submit your project for a curated IDO on SolanaVerse. We review
                tokenomics, product fit and community traction before confirming
                a launch slot.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-xl p-3">
                <div className="flex items-center gap-2 text-[#a0a0a0] mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#3b82f6]" />
                  <span className="font-medium text-[#e0e0e0]">Step 1</span>
                </div>
                <p className="text-[#a0a0a0]">
                  Submit details, tokenomics and core docs for review.
                </p>
              </div>
              <div className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-xl p-3">
                <div className="flex items-center gap-2 text-[#a0a0a0] mb-1">
                  <Users className="h-3.5 w-3.5 text-[#22c55e]" />
                  <span className="font-medium text-[#e0e0e0]">Step 2</span>
                </div>
                <p className="text-[#a0a0a0]">
                  Our team validates your setup and proposes launch parameters.
                </p>
              </div>
              <div className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-xl p-3">
                <div className="flex items-center gap-2 text-[#a0a0a0] mb-1">
                  <Wallet className="h-3.5 w-3.5 text-[#facc15]" />
                  <span className="font-medium text-[#e0e0e0]">Step 3</span>
                </div>
                <p className="text-[#a0a0a0]">
                  Lock in schedule, finalize marketing tier and go live.
                </p>
              </div>
            </div>
          </div>

          {/* Mini summary card */}
          <div className="w-full max-w-xs bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl p-4 space-y-3 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#a0a0a0]">Selected package</span>
              <span className="text-xs font-semibold text-[#e0e0e0]">
                {
                  tariffs.find(t => t.id === selectedTariff)?.name
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a0a0a0]">Payment model</span>
              <span className="text-[#e0e0e0]">One-time, off-chain</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a0a0a0]">Review time</span>
              <span className="text-[#e0e0e0]">5–7 business days</span>
            </div>
            <div className="h-px bg-[#1f1f1f]" />
            <div className="flex items-start gap-2 text-[#707070]">
              <Info className="h-3.5 w-3.5 mt-0.5" />
              <span>
                IDO configuration (caps, price, vesting) will be finalized
                together with our team after your application is approved.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tariffs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#e0e0e0]">
          Choose your launch package
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tariffs.map(tariff => {
            const isSelected = selectedTariff === tariff.id;
            return (
              <div
                key={tariff.id}
                className={`bg-[#121212] border rounded-2xl p-5 relative overflow-hidden transition-all ${
                  isSelected
                    ? 'border-[#3b82f6] bg-[#020617]'
                    : 'border-[#1f1f1f] hover:border-[#2a2a2a]'
                }`}
              >
                <div className="pointer-events-none absolute -inset-0.5 opacity-10 bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_70%)]" />
                <div className="relative z-10">
                  {tariff.popular && (
                    <div className="mb-3">
                      <span className="bg-[#3b82f6] text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <div className="mb-4 text-center space-y-1">
                    <h3 className="text-lg font-semibold text-[#e0e0e0]">
                      {tariff.name}
                    </h3>
                    <div className="text-2xl font-bold text-[#3b82f6]">
                      {tariff.price}
                    </div>
                    <p className="text-[10px] text-[#707070]">
                      {tariff.tag}
                    </p>
                    <p className="text-[10px] text-[#707070]">
                      One-time payment, no hidden fees
                    </p>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {tariff.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start text-[11px] text-[#a0a0a0]"
                      >
                        <Check className="h-3 w-3 text-[#3b82f6] mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setSelectedTariff(tariff.id as any)}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                      isSelected
                        ? 'bg-[#3b82f6] text-white'
                        : 'bg-[#1a1a1a] text-[#e0e0e0] hover:bg-[#222] border border-[#1f1f1f]'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wallet warning */}
      {!connected && (
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4">
          <div className="flex">
            <AlertTriangle className="h-4 w-4 text-[#facc15] flex-shrink-0 mt-0.5 mr-3" />
            <div>
              <h3 className="text-xs font-medium text-[#e0e0e0]">
                Wallet not connected
              </h3>
              <p className="mt-1 text-xs text-[#707070]">
                Connect your Solana wallet before submitting an application so we
                can link your project to the correct owner address.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Application form */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Requirements */}
          <div className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-[#e0e0e0] mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#3b82f6]" />
              Application requirements
            </h3>
            <ul className="space-y-1">
              <li className="text-xs text-[#a0a0a0]">• Complete all required fields</li>
              <li className="text-xs text-[#a0a0a0]">
                • Upload project logo (PNG / JPG, max 2MB)
              </li>
              <li className="text-xs text-[#a0a0a0]">
                • Upload whitepaper (PDF, max 10MB)
              </li>
              <li className="text-xs text-[#a0a0a0]">
                • Provide accurate team and tokenomics information
              </li>
            </ul>
          </div>

          {/* Basic info */}
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-1">
              Basic information
            </h3>
            <p className="text-[11px] text-[#707070] mb-3">
              Tell us who you are and where users can explore your project.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
                  Project name *
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
                  Token symbol *
                </label>
                <input
                  type="text"
                  name="tokenSymbol"
                  value={formData.tokenSymbol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5 flex items-center gap-1">
                  <Globe2 className="h-3 w-3 text-[#707070]" />
                  Website URL *
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5 flex items-center gap-1">
                  <Link2 className="h-3 w-3 text-[#707070]" />
                  Contact email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-1">
              Social links
            </h3>
            <p className="text-[11px] text-[#707070] mb-3">
              We use this to assess community presence and communication channels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5 flex items-center gap-1">
                  <MessageCircle className="h-3 w-3 text-[#707070]" />
                  Telegram
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5 flex items-center gap-1">
                  <Twitter className="h-3 w-3 text-[#707070]" />
                  Twitter / X
                </label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
          </div>

          {/* Project details */}
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-1">
              Project details
            </h3>
            <p className="text-[11px] text-[#707070] mb-3">
              Give us a clear picture of what you&apos;re building and how the
              token fits in.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
                  Project description *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
                  Tokenomics *
                </label>
                <textarea
                  name="tokenomics"
                  rows={3}
                  value={formData.tokenomics}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                  required
                />
                <p className="mt-1 text-[10px] text-[#707070]">
                  Describe token distribution, vesting schedule, utility and how
                  IDO tokens fit into the supply.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
                    Funding goal (USD) *
                  </label>
                  <input
                    type="number"
                    name="fundingGoal"
                    value={formData.fundingGoal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
                    Token price (USD) *
                  </label>
                  <input
                    type="number"
                    name="tokenPrice"
                    value={formData.tokenPrice}
                    onChange={handleChange}
                    step="0.00001"
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Files */}
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-1">
              File uploads
            </h3>
            <p className="text-[11px] text-[#707070] mb-3">
              These documents are used only for internal due diligence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Logo */}
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-2">
                  Logo *
                </label>
                <div className="border-2 border-dashed border-[#1f1f1f] rounded-lg p-4 text-center bg-[#1a1a1a]">
                  {logoFile ? (
                    <div className="space-y-1">
                      <p className="text-xs text-[#e0e0e0] truncate">
                        {logoFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => setLogoFile(null)}
                        className="text-[10px] text-[#a0a0a0] hover:text-[#e0e0e0]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-6 w-6 text-[#707070] mx-auto mb-2" />
                      <span className="text-[10px] text-[#707070] block">
                        PNG, JPG (max 2MB)
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleLogoChange}
                        accept="image/*"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Whitepaper */}
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-2">
                  Whitepaper *
                </label>
                <div className="border-2 border-dashed border-[#1f1f1f] rounded-lg p-4 text-center bg-[#1a1a1a]">
                  {whitepaperFile ? (
                    <div className="space-y-1">
                      <p className="text-xs text-[#e0e0e0] truncate">
                        {whitepaperFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => setWhitepaperFile(null)}
                        className="text-[10px] text-[#a0a0a0] hover:text-[#e0e0e0]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-6 w-6 text-[#707070] mx-auto mb-2" />
                      <span className="text-[10px] text-[#707070] block">
                        PDF (max 10MB)
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleWhitepaperChange}
                        accept=".pdf"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Deck */}
              <div>
                <label className="block text-xs font-medium text-[#a0a0a0] mb-2">
                  Pitch deck
                </label>
                <div className="border-2 border-dashed border-[#1f1f1f] rounded-lg p-4 text-center bg-[#1a1a1a]">
                  {deckFile ? (
                    <div className="space-y-1">
                      <p className="text-xs text-[#e0e0e0] truncate">
                        {deckFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => setDeckFile(null)}
                        className="text-[10px] text-[#a0a0a0] hover:text-[#e0e0e0]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-6 w-6 text-[#707070] mx-auto mb-2" />
                      <span className="text-[10px] text-[#707070] block">
                        PDF, PPT, PPTX
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleDeckChange}
                        accept=".pdf,.ppt,.pptx"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl p-4">
            <div className="flex items-center mb-3">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-[#3b82f6] bg-[#0a0a0a] border-[#1f1f1f] rounded focus:ring-[#3b82f6]"
                required
              />
            </div>
            <label
              htmlFor="terms"
              className="ml-1 text-xs text-[#a0a0a0] block mb-3"
            >
              I confirm that all information is accurate and understand that
              SolanaVerse may decline or postpone the IDO if due diligence
              fails.
            </label>

            <button
              type="submit"
              disabled={!connected || !isFormValid()}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                !connected || !isFormValid()
                  ? 'bg-[#1a1a1a] text-[#707070] cursor-not-allowed border border-[#1f1f1f]'
                  : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
              }`}
            >
              Submit application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyForIDO;
