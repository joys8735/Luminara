import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useProject } from '../context/ProjectContext';
import { Coins, Gem, CreditCard, Calendar, Gift } from 'lucide-react';
import ProjectTimer from '../components/ProjectTimer';
import UserBalanceCard from '../components/UserBalanceCard';
import DailyRewardCard from '../components/DailyRewardCard';
import TokenSaleProgress from '../components/TokenSaleProgress';
const Dashboard = () => {
  const {
    connected
  } = useWallet();
  const {
    tokenInfo,
    nftInfo,
    timers
  } = useProject();
  return <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SolanaVerse Dashboard
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Welcome to the future of decentralized finance on Solana
          </p>
        </div>
        <div className="flex-shrink-0">
          <ProjectTimer startDate={timers.icoStart} endDate={timers.icoEnd} label="ICO Ends In" />
        </div>
      </div>
      {!connected && <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="mb-4">
            Connect your Solana wallet to access all features and participate in
            the ICO.
          </p>
          <button onClick={() => {}} className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium">
            Connect Wallet
          </button>
        </div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300">
              Token Price
            </h2>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Coins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${tokenInfo.price}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            +5.3% last 24h
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300">
              NFT Floor Price
            </h2>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <Gem className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {nftInfo.price} SOL
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            +2.1% last 24h
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300">
              Total Raised
            </h2>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${(tokenInfo.sold * tokenInfo.price).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {(tokenInfo.sold / tokenInfo.totalSupply * 100).toFixed(1)}% of
            goal
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300">
              NFT Minted
            </h2>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {nftInfo.sold.toLocaleString()} /{' '}
            {nftInfo.totalSupply.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {(nftInfo.sold / nftInfo.totalSupply * 100).toFixed(1)}% minted
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TokenSaleProgress />
        </div>
        <div className="space-y-6">
          {connected ? <>
              <UserBalanceCard />
              <DailyRewardCard />
            </> : <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Daily Rewards
                </h2>
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                  <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Connect your wallet to claim daily rewards and view your token
                balance.
              </p>
              <button onClick={() => {}} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                Connect Wallet
              </button>
            </div>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/token-sale" className="block">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 text-white h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Token Sale</h2>
              <Coins className="h-6 w-6" />
            </div>
            <p className="mb-4">
              Participate in our token sale and be part of the SolanaVerse
              ecosystem.
            </p>
            <div className="mt-auto pt-4">
              <span className="inline-flex items-center text-sm font-medium text-white">
                Buy Tokens
                <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </span>
            </div>
          </div>
        </Link>
        <Link to="/nft-sale" className="block">
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl p-6 text-white h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">NFT Sale</h2>
              <Gem className="h-6 w-6" />
            </div>
            <p className="mb-4">
              Mint exclusive SolanaVerse NFTs with unique utilities in our
              ecosystem.
            </p>
            <div className="mt-auto pt-4">
              <span className="inline-flex items-center text-sm font-medium text-white">
                Explore NFTs
                <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>;
};
export default Dashboard;