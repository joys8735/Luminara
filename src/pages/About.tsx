import React from 'react';
import { Layers, Shield, Zap, Globe, Users } from 'lucide-react';
const About = () => {
  const team = [{
    name: 'Alex Johnson',
    role: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    bio: 'Alex has over 10 years of experience in blockchain technology and previously founded two successful startups.'
  }, {
    name: 'Sarah Chen',
    role: 'CTO',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: 'Sarah is a Solana core contributor with extensive experience in building scalable blockchain applications.'
  }, {
    name: 'Michael Rodriguez',
    role: 'Head of Product',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    bio: 'Michael brings 8 years of product management experience from leading Web3 companies.'
  }, {
    name: 'Emily Wong',
    role: 'Marketing Director',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop',
    bio: 'Emily has led marketing campaigns for several successful crypto projects and ICOs.'
  }];
  return <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          About SolanaVerse
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Building the future of decentralized finance on the Solana blockchain
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Our Vision
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            SolanaVerse is building a comprehensive ecosystem of decentralized
            applications on the Solana blockchain. Our mission is to make DeFi
            accessible to everyone by providing intuitive, fast, and low-cost
            financial services.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            We believe in the power of blockchain technology to revolutionize
            finance and create a more inclusive global economy. By leveraging
            Solana's high-performance infrastructure, we're building
            applications that can scale to millions of users while maintaining
            security, decentralization, and user privacy.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Why Solana?
          </h2>
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  High Performance
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Solana can process up to 65,000 transactions per second,
                  making it one of the fastest blockchains available.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Low Cost
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Transaction fees on Solana are a fraction of a cent, making it
                  accessible for all users regardless of transaction size.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Growing Ecosystem
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Solana has a thriving ecosystem of developers, projects, and
                  users, creating network effects that benefit all participants.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Our Products
          </h2>
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Coins className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  SVT Token
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Our utility token that powers the entire ecosystem, providing
                  governance rights and various benefits.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Gem className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  NFT Collection
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Exclusive NFTs with real utility, providing access to premium
                  features and revenue sharing.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  DeFi Platform
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  A suite of DeFi applications including staking, lending, and
                  trading, all built on Solana.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Our Team
          </h2>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
              <div className="mx-auto h-24 w-24 rounded-full overflow-hidden mb-4">
                <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {member.name}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                {member.role}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {member.bio}
              </p>
            </div>)}
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Join the SolanaVerse Community
          </h2>
          <p className="mb-6">
            Be part of our growing community and help shape the future of
            decentralized finance on Solana.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium">
              Join Discord
            </button>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium">
              Follow on Twitter
            </button>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium">
              Join Telegram
            </button>
          </div>
        </div>
      </div>
    </div>;
};
const Coins = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>;
const Gem = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12l4 6-10 13L2 9Z" />
    <path d="M11 3 8 9l4 13 4-13-3-6" />
    <path d="M2 9h20" />
  </svg>;
export default About;