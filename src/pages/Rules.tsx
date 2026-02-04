import React from 'react';
import { Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';
export function Rules() {
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#e0e0e0]">
          Rules & Guidelines
        </h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">
          Important information about participating in SolanaVerse and using our
          platform
        </p>
      </div>

      {/* General Information */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="bg-[#1a1a1a] border border-[#1f1f1f] p-2 rounded-lg mr-3">
            <Info className="h-5 w-5 text-[#3b82f6]" />
          </div>
          <h2 className="text-lg font-semibold text-[#e0e0e0]">
            General Information
          </h2>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-[#a0a0a0] leading-relaxed">
            SolanaVerse is an IDO platform built on the Solana blockchain. By
            participating in token sales or using our platform, you agree to
            abide by these rules and guidelines.
          </p>
          <p className="text-sm text-[#a0a0a0] leading-relaxed">
            The SolanaVerse token (SVT) is a utility token providing various
            benefits within our ecosystem. It is not intended as an investment
            and should not be purchased for speculative purposes.
          </p>
        </div>
      </div>

      {/* Eligibility */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="bg-[#1a1a1a] border border-[#1f1f1f] p-2 rounded-lg mr-3">
            <AlertTriangle className="h-5 w-5 text-[#3b82f6]" />
          </div>
          <h2 className="text-lg font-semibold text-[#e0e0e0]">
            Eligibility & Restrictions
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-2">
              Participant Eligibility
            </h3>
            <p className="text-xs text-[#a0a0a0] mb-2">
              To participate, you must:
            </p>
            <ul className="space-y-1 ml-4">
              <li className="text-xs text-[#a0a0a0]">
                • Be at least 18 years old
              </li>
              <li className="text-xs text-[#a0a0a0]">
                • Not be from a restricted country
              </li>
              <li className="text-xs text-[#a0a0a0]">
                • Complete KYC verification for large purchases
              </li>
              <li className="text-xs text-[#a0a0a0]">
                • Have a compatible Solana wallet
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-2">
              Restricted Countries
            </h3>
            <p className="text-xs text-[#a0a0a0] mb-2">
              Citizens and residents of these countries cannot participate:
            </p>
            <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
              <p className="text-xs text-[#a0a0a0]">
                United States, China, North Korea, Iran, Syria, Cuba, and any
                country where participation would violate local laws
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Token Sale Rules */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="bg-[#1a1a1a] border border-[#1f1f1f] p-2 rounded-lg mr-3">
            <CheckCircle className="h-5 w-5 text-[#3b82f6]" />
          </div>
          <h2 className="text-lg font-semibold text-[#e0e0e0]">
            Token Sale Rules
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-2">
              Purchase Limits
            </h3>
            <ul className="space-y-1 ml-4">
              <li className="text-xs text-[#a0a0a0]">
                • Minimum purchase: 100 SVT
              </li>
              <li className="text-xs text-[#a0a0a0]">
                • Maximum without KYC: 5,000 SVT
              </li>
              <li className="text-xs text-[#a0a0a0]">
                • Maximum with KYC: No limit
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-2">
              Payment Methods
            </h3>
            <ul className="space-y-1 ml-4">
              <li className="text-xs text-[#a0a0a0]">• SOL (Solana)</li>
              <li className="text-xs text-[#a0a0a0]">• USDC (on Solana)</li>
              <li className="text-xs text-[#a0a0a0]">• USDT (on Solana)</li>
              <li className="text-xs text-[#a0a0a0]">• BNB (via MetaMask)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-2">
              Token Distribution
            </h3>
            <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#707070]">Public Sale</span>
                  <span className="text-[#e0e0e0]">60%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#707070]">Team & Advisors</span>
                  <span className="text-[#e0e0e0]">15% (12mo lock)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#707070]">Ecosystem & Marketing</span>
                  <span className="text-[#e0e0e0]">15%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#707070]">Reserve</span>
                  <span className="text-[#e0e0e0]">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="bg-[#1a1a1a] border border-[#1f1f1f] p-2 rounded-lg mr-3">
            <Shield className="h-5 w-5 text-[#3b82f6]" />
          </div>
          <h2 className="text-lg font-semibold text-[#e0e0e0]">
            Security & Privacy
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-2">
              Wallet Security
            </h3>
            <p className="text-xs text-[#a0a0a0] mb-2">We recommend:</p>
            <ul className="space-y-1 ml-4">
              <li className="text-xs text-[#a0a0a0]">
                • Use hardware wallet when possible
              </li>
              <li className="text-xs text-[#a0a0a0]">
                • Never share private keys or seed phrase
              </li>
              <li className="text-xs text-[#a0a0a0]">
                • Enable two-factor authentication
              </li>
              <li className="text-xs text-[#a0a0a0]">
                • Be cautious of phishing attempts
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-2">
              Privacy Policy
            </h3>
            <p className="text-xs text-[#a0a0a0] mb-2">
              We collect information for:
            </p>
            <ul className="space-y-1 ml-4">
              <li className="text-xs text-[#a0a0a0]">• KYC/AML compliance</li>
              <li className="text-xs text-[#a0a0a0]">
                • Account functionality
              </li>
              <li className="text-xs text-[#a0a0a0]">• Customer support</li>
              <li className="text-xs text-[#a0a0a0]">
                • Security and fraud prevention
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#e0e0e0] mb-4">
          Terms & Conditions
        </h2>
        <div className="space-y-3">
          <p className="text-xs text-[#a0a0a0] leading-relaxed">
            By participating in SolanaVerse, you agree to:
          </p>
          <ul className="space-y-1 ml-4">
            <li className="text-xs text-[#a0a0a0]">
              • Purchase tokens for utility, not investment
            </li>
            <li className="text-xs text-[#a0a0a0]">
              • Accept that we may refuse service for any reason
            </li>
            <li className="text-xs text-[#a0a0a0]">
              • Understand cryptocurrency risks
            </li>
            <li className="text-xs text-[#a0a0a0]">
              • Not use platform for illegal activities
            </li>
            <li className="text-xs text-[#a0a0a0]">
              • Comply with all applicable laws
            </li>
          </ul>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-6 text-center">
        <h2 className="text-base font-semibold text-[#e0e0e0] mb-2">
          Need Assistance?
        </h2>
        <p className="text-sm text-[#a0a0a0] mb-4">
          If you have questions about our rules or need help, our support team
          is here.
        </p>
        <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2 rounded-lg text-sm font-medium">
          Contact Support
        </button>
      </div>
    </div>;
}
export default Rules;