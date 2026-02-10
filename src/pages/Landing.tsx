'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  ArrowRight,
  Coins,
  Zap,
  LineChart,
  Gift,
  Wallet,
  Rocket,
  Sparkles,
  Quote,
  ShieldCheck,
  Users,
  Lock,
  Globe,
  MessageCircle,
} from 'lucide-react'

const Home: React.FC = () => {
  const [scrollY, setScrollY] = useState(0)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY || 0)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'scale-100', 'translate-y-0')
            entry.target.classList.remove('opacity-0', 'scale-95', 'translate-y-16')
          }
        })
      },
      { threshold: 0.2 }
    )

    sectionRefs.current.forEach((ref) => ref && observer.observe(ref))
    return () => observer.disconnect()
  }, [])

  const parallax = (f: number) => ({ transform: `translateY(${scrollY * f}px)` })

  // Typing + glitch
  const slogans = [
    'Yield • Predictions • Allocations',
    'AI Clarity in DeFi Chaos',
    'Non-Custodial. Real Utility.',
    'Multichain. One Dashboard.',
  ]
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [idx, setIdx] = useState(0)
  const [speed, setSpeed] = useState(60)

  useEffect(() => {
    const cur = slogans[idx % slogans.length]

    const tick = () => {
      if (!deleting) {
        setText((p) => cur.slice(0, p.length + 1))
        setSpeed(50 + Math.random() * 50)
        if (text.length + 1 === cur.length) setTimeout(() => setDeleting(true), 2200)
      } else {
        setText((p) => p.slice(0, -1))
        setSpeed(30)
        if (text.length - 1 === 0) {
          setDeleting(false)
          setIdx((p) => p + 1)
          setSpeed(700)
        }
      }
    }

    const t = setTimeout(tick, speed)
    return () => clearTimeout(t)
  }, [text, deleting, idx, speed])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f1d] via-[#0a0e17] to-black text-white font-sans">
      {/* Hero – full width */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-5 sm:px-8">
        {/* Background images placeholders */}
        <video
  autoPlay
  muted
  loop
  playsInline
  className="absolute inset-0 w-full h-full backdrop-blur-lg object-cover opacity-30"
>
  <source src="/test1.mp4" type="video/mp4" />
  {/* Fallback якщо відео не завантажиться */}
  <img 
    src="/echo.png" 
    alt="Fallback background" 
    className="absolute inset-0 w-full h-full object-cover"
  />
</video>
        <img
          src="/echo.png"
          alt="Floating neon orb placeholder"
          className="absolute top-20 left-10 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-40 animate-pulse-slow"
          style={parallax(0.15)}
        />
        <img
          src="/echo.png"
          alt="Floating neon orb 2 placeholder"
          className="absolute bottom-20 right-10 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full blur-3xl opacity-30 animate-pulse-slow delay-1000"
          style={parallax(0.08)}
        />

        <div className="relative z-10 text-center max-w-6xl">
          <div className="inline-block mb-6 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium tracking-wide">
            <Sparkles className="inline w-4 h-4 mr-2 text-[#60a5fa]" />
            Advanced DeFi Hub • Launched 2026
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-none tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#c084fc]">
              One Hub.
            </span>{' '}
            <br className="sm:hidden" />
            Infinite Yield.
          </h1>

          <div className="text-xl sm:text-2xl md:text-3xl font-mono text-[#a0d2ff]/90 mb-10 h-10 flex items-center justify-center glitch" data-text={text}>
            {text}
            <span className="animate-blink ml-1">|</span>
          </div>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Stake smarter across chains. Predict fast with multipliers. Earn real allocation points for launches. All in one non-custodial dashboard powered by AI clarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a
              href="/app"
              className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] font-bold text-lg shadow-2xl shadow-blue-700/30 hover:shadow-blue-600/50 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Launch App</span>
              <ArrowRight className="inline ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
            </a>

            <a
              href="#tokenomics"
              className="px-10 py-5 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/40 transition-all text-lg font-medium"
            >
              View Tokenomics
            </a>
          </div>
        </div>
      </section>

      {/* Features – full width */}
      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        className="py-20 sm:py-32 opacity-0 scale-95 translate-y-16 transition-all duration-1000 ease-out bg-gradient-to-b from-black/80 to-[#0a0e17]"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
            Core Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: 'AI-Optimized Yield Vaults',
                desc: 'Auto-compounding strategies across stablecoins, BNB, ETH, SOL. Real-time APY optimization based on market conditions and risk profile.',
              },
              {
                icon: LineChart,
                title: 'Prediction Arena',
                desc: '5-minute rounds on major pairs. Multipliers up to 10x, streak bonuses, detailed session stats (win rate, ROI, risk-adjusted performance).',
              },
              {
                icon: Gift,
                title: 'Quests & Airdrop Engine',
                desc: 'Daily/weekly missions, NFT rewards, boosted allocation points for private launches and IDOs. Earn whitelists and early access.',
              },
              {
                icon: Wallet,
                title: 'Non-Custodial Multi-Chain Vaults',
                desc: 'Personal vaults per chain. Deposit once — use in staking, predictions, launches. You always control private keys.',
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="group bg-gradient-to-b from-[#0f172a]/80 to-black/60 border border-white/5 rounded-3xl p-8 hover:border-[#60a5fa]/40 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 backdrop-blur-sm"
              >
                <f.icon className="w-14 h-14 text-[#60a5fa] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-gray-300 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tokenomics – full width */}
      <section
        ref={(el) => (sectionRefs.current[1] = el)}
        id="tokenomics"
        className="py-20 sm:py-32 bg-gradient-to-b from-black to-[#0a0e17] opacity-0 scale-95 translate-y-16 transition-all duration-1000 ease-out"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-[#60a5fa] to-[#c084fc]">
            Tokenomics
          </h2>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
            {/* Pie Chart */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px]">
              <img
                src="/echo.png"
                alt="Tokenomics background placeholder"
                className="absolute inset-0 w-full h-full object-contain opacity-20"
              />

              

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-6xl font-black">100M</p>
                  <p className="text-2xl text-gray-400">$FDR Total Supply</p>
                </div>
              </div>
            </div>

            {/* Legends around */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-base max-w-xl w-full">
              {[
                { color: '#3b82f6', label: 'Liquidity & Farming Rewards', perc: '40%' },
                { color: '#8b5cf6', label: 'Ecosystem Growth & Quests', perc: '15%' },
                { color: '#60a5fa', label: 'Treasury & Future Development', perc: '15%' },
                { color: '#a78bfa', label: 'Team & Advisors (vested)', perc: '20%' },
                { color: '#c084fc', label: 'Private / Strategic Rounds', perc: '10%' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 group">
                  <div className={`w-6 h-6 rounded-full bg-[${item.color}] group-hover:scale-125 transition-transform shadow-lg shadow-black/50`} />
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-gray-400">{item.perc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap – full width */}
      <section
        ref={(el) => (sectionRefs.current[2] = el)}
        className="py-20 sm:py-32 opacity-0 scale-95 translate-y-16 transition-all duration-1000 ease-out bg-black/60"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Roadmap 2026–2027
          </h2>

          <div className="relative">
            <div className="absolute left-6 md:left-1/2 h-full w-1 bg-gradient-to-b from-[#60a5fa] via-[#a78bfa] to-[#c084fc] transform md:-translate-x-1/2" />

            <div className="space-y-16 md:space-y-24">
              {[
                {
                  q: 'Q1 2026',
                  t: 'Genesis Launch',
                  d: 'Core smart contracts deployment. Initial yield vaults, 5-min prediction arena v1, staking incentives. First liquidity bootstrap on BNB Chain & Ethereum.',
                },
                {
                  q: 'Q2 2026',
                  t: 'AI Clarity & Mobile',
                  d: 'Launch AI-powered session analytics & yield optimizer. Native mobile apps (iOS + Android). Improved UI/UX with glassmorphism elements.',
                },
                {
                  q: 'Q3 2026',
                  t: 'Multichain Expansion',
                  d: 'Integrate Polygon, Solana, Arbitrum. Advanced quests with NFT rewards. Cross-chain bridges & unified dashboard view.',
                },
                {
                  q: 'Q4 2026',
                  t: 'Governance & Utility Boost',
                  d: 'Full DAO launch. $FDR staking for governance voting power. Allocation multipliers for long-term holders. Deflationary burn from prediction fees.',
                },
                {
                  q: '2027',
                  t: 'RWA & Institutional Grade',
                  d: 'Real-world asset yield strategies. Institutional vaults with KYC/AML options. Longer-term prediction markets. Partnerships with traditional finance players.',
                },
              ].map((m, i) => (
                <div
                  key={m.q}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="md:w-1/3 text-left md:text-center">
                    <span className="text-3xl font-bold text-[#60a5fa]">{m.q}</span>
                  </div>

                  <div className="md:w-2/3 bg-gradient-to-br from-[#0f172a]/90 to-black/70 border border-white/5 rounded-3xl p-8 backdrop-blur-md hover:border-[#60a5fa]/40 transition-all">
                    <h3 className="text-3xl font-bold mb-4">{m.t}</h3>
                    <p className="text-gray-300 text-lg leading-relaxed">{m.d}</p>
                  </div>

                  <div className="absolute left-6 md:left-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] border-4 border-[#0a0e17] transform md:-translate-x-1/2 shadow-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust – full width */}
      <section
        ref={(el) => (sectionRefs.current[3] = el)}
        className="py-20 sm:py-32 opacity-0 scale-95 translate-y-16 transition-all duration-1000 ease-out bg-gradient-to-b from-[#0a0e17] to-black"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Security & Trust
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: ShieldCheck,
                title: 'Non-Custodial Architecture',
                desc: 'You always hold your private keys. We never have access to your funds. All operations on-chain.',
              },
              {
                icon: Lock,
                title: 'Audited Smart Contracts',
                desc: 'Multiple audits by top firms (Certik, PeckShield placeholders). Bug bounty program up to $500K.',
              },
              {
                icon: Globe,
                title: 'Decentralized Infrastructure',
                desc: 'Hosted on IPFS & Arweave for frontend. Oracles from Chainlink. No single point of failure.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-gradient-to-b from-[#0f172a]/80 to-black/60 border border-white/5 rounded-3xl p-10 backdrop-blur-sm hover:border-[#60a5fa]/40 transition-all">
                <item.icon className="w-16 h-16 text-[#60a5fa] mb-6 mx-auto block" />
                <h3 className="text-2xl font-bold text-center mb-4">{item.title}</h3>
                <p className="text-gray-300 text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Socials – full width */}
      <section
        ref={(el) => (sectionRefs.current[4] = el)}
        className="py-20 sm:py-32 opacity-0 scale-95 translate-y-16 transition-all duration-1000 ease-out bg-black/70"
      >
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-[#60a5fa] to-[#c084fc]">
            Join the Community
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Be part of the future of DeFi. Discuss strategies, share wins, get early access to launches and quests.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://x.com/yourproject"
              target="_blank"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#1DA1F2]/50 hover:bg-white/10 transition-all backdrop-blur-md"
            >
              <img src="https://via.placeholder.com/48/000000/ffffff?text=X" alt="X logo placeholder" className="w-8 h-8" />
              Follow on X
            </a>

            <a
              href="https://t.me/yourproject"
              target="_blank"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#0088cc]/50 hover:bg-white/10 transition-all backdrop-blur-md"
            >
              <img src="https://via.placeholder.com/48/000000/ffffff?text=TG" alt="Telegram logo placeholder" className="w-8 h-8" />
              Telegram Channel
            </a>

            <a
              href="https://discord.gg/yourproject"
              target="_blank"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#5865F2]/50 hover:bg-white/10 transition-all backdrop-blur-md"
            >
              <img src="https://via.placeholder.com/48/000000/ffffff?text=Discord" alt="Discord logo placeholder" className="w-8 h-8" />
              Join Discord
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#c084fc]">
            Ready to Own the Future?
          </h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of users farming with clarity, predicting with edge, and earning real utility tokens.
          </p>
          <a
            href="/app"
            className="inline-flex items-center gap-4 px-12 py-6 rounded-3xl bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#c084fc] text-2xl font-bold shadow-2xl shadow-purple-700/40 hover:shadow-purple-600/60 hover:scale-105 transition-all duration-300"
          >
            Enter the Hub Now <ArrowRight className="w-8 h-8" />
          </a>
        </div>
      </section>

     
    </div>
  )
}

export default Home