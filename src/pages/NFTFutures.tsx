import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Clock } from 'lucide-react';
const NFTFutures = () => {
  const {
    connected
  } = useWallet();
  const [selectedContract, setSelectedContract] = useState(null);
  const futuresContracts = [{
    id: 1,
    collection: 'Celestials',
    currentPrice: 0.5,
    futurePrice: 0.65,
    expiryDate: '2024-01-15',
    volume: 1250,
    change24h: 8.5,
    leverage: '5x'
  }, {
    id: 2,
    collection: 'MetaVerse Pioneers',
    currentPrice: 1.2,
    futurePrice: 1.05,
    expiryDate: '2024-01-20',
    volume: 890,
    change24h: -3.2,
    leverage: '3x'
  }, {
    id: 3,
    collection: 'DeFi Dragons',
    currentPrice: 0.8,
    futurePrice: 1.1,
    expiryDate: '2024-01-25',
    volume: 2100,
    change24h: 15.3,
    leverage: '10x'
  }];
  const handleTrade = (contract, position) => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    toast.success(`${position} position opened for ${contract.collection} futures!`);
  };
  return <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          NFT Futures Trading
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Speculate on future NFT prices with leveraged positions
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div className="text-2xl font-bold mb-1">$4.2M</div>
          <div className="text-white/80 text-sm">24h Trading Volume</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8" />
          </div>
          <div className="text-2xl font-bold mb-1">1,247</div>
          <div className="text-white/80 text-sm">Active Contracts</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div className="text-2xl font-bold mb-1">+18.5%</div>
          <div className="text-white/80 text-sm">Average Profit</div>
        </div>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start">
          <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              High Risk Trading
            </h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              Futures trading involves significant risk. Only trade with funds
              you can afford to lose.
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {futuresContracts.map(contract => <div key={contract.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {contract.collection} Futures
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm font-medium">
                      {contract.leverage}
                    </span>
                    <span className={`flex items-center text-sm font-medium ${contract.change24h > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {contract.change24h > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      {Math.abs(contract.change24h)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Current Price
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {contract.currentPrice} SOL
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Future Price
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {contract.futurePrice} SOL
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Expiry Date
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {contract.expiryDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      24h Volume
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {contract.volume} SOL
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-3">
                <button onClick={() => handleTrade(contract, 'Long')} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Long (Buy)
                </button>
                <button onClick={() => handleTrade(contract, 'Short')} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center">
                  <TrendingDown className="mr-2 h-5 w-5" />
                  Short (Sell)
                </button>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
};
export default NFTFutures;