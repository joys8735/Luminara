import React, { useState } from 'react';
import { toast } from 'sonner';
import { Headset, Send, ArrowRight, ChevronDown, ChevronUp, Mail, MessageCircle, HelpCircle, Ticket } from 'lucide-react';

const Support = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const faqItems = [
    {
      question: 'What is SolanaVerse?',
      answer: 'SolanaVerse is a premier IDO platform on Solana blockchain, offering token sales, NFT drops, staking, and community governance.'
    },
    {
      question: 'How do I connect my wallet?',
      answer: 'Click on "Connect Wallet" in the header, select Phantom or MetaMask, and follow the prompts to authorize the connection.'
    },
    {
      question: 'How to participate in token sale?',
      answer: 'Connect your wallet, enter the amount in USD, select payment method, generate address, and send the payment. Tokens will be delivered after confirmation.'
    },
    {
      question: 'What is staking and how does it work?',
      answer: 'Staking allows you to lock SVT tokens to earn rewards and unlock higher tiers. Choose flexible or locked options in the Staking section.'
    },
    {
      question: 'How to mint NFTs?',
      answer: 'Go to NFT Drop page, connect wallet, select quantity and payment method, then mint. NFTs will appear in your wallet.'
    },
    {
      question: 'What if I have issues with transactions?',
      answer: 'Check your wallet connection and network. If issues persist, create a support ticket or contact us via Telegram.'
    },
    {
      question: 'How to claim rewards?',
      answer: 'In the Dashboard, go to Staking section and click "Claim" for available rewards. They will be added to your balance.'
    }
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill all fields');
      return;
    }
    // Simulate ticket submission
    toast.success('Ticket submitted successfully! Our team will respond within 24 hours.');
    setName('');
    setEmail('');
    setMessage('');
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#e0e0e0]">Support Center</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">
          Get help with SolanaVerse features, troubleshooting, and more
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="https://t.me/solanaverse_support"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#3b82f6] transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#1a1a1a] p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#e0e0e0]">Telegram Support</h3>
              <p className="text-xs text-[#707070] mt-1">Instant chat with our team</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-[#707070] group-hover:text-[#3b82f6] group-hover:translate-x-1 transition-all" />
        </a>

        <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#3b82f6] transition-all duration-200 flex items-center justify-between group cursor-pointer" onClick={handleSubmitTicket}>
          <div className="flex items-center gap-4">
            <div className="bg-[#1a1a1a] p-3 rounded-full">
              <Ticket className="h-6 w-6 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#e0e0e0]">Create Ticket</h3>
              <p className="text-xs text-[#707070] mt-1">Submit a detailed request</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-[#707070] group-hover:text-[#3b82f6] group-hover:translate-x-1 transition-all" />
        </div>
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#e0e0e0] mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2 text-[#3b82f6]" />
          Submit a Support Ticket
        </h2>
        <form onSubmit={handleSubmitTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6] min-h-[100px]"
              placeholder="Describe your issue..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 text-sm flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            Submit Ticket
          </button>
        </form>
      </div>
      {/* FAQ Section */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#e0e0e0] mb-4 flex items-center">
          <HelpCircle className="h-5 w-5 mr-2 text-[#3b82f6]" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-[#1f1f1f] rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-[#1a1a1a] transition-colors"
              >
                <span className="text-sm font-medium text-[#e0e0e0]">{item.question}</span>
                {expandedFAQ === index ? (
                  <ChevronUp className="h-5 w-5 text-[#707070]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#707070]" />
                )}
              </button>
              {expandedFAQ === index && (
                <div className="p-4 bg-[#1a1a1a] border-t border-[#1f1f1f] text-sm text-[#a0a0a0]">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
      

      

      {/* Ticket Form */}
      
    </div>
  );
};

export default Support;