import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { toast } from 'sonner';
import { Wallet, Copy, ExternalLink, History, BarChart3, Gem, Coins, Clock, Filter, ArrowUpRight, ArrowDownLeft, Search, Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TransactionItem = ({ transaction }: { transaction: any }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case 'mint':
        return <Gem className="h-4 w-4 text-purple-400" />;
      case 'stake':
        return <Coins className="h-4 w-4 text-blue-400" />;
      default:
        return <History className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center py-3 border-b border-[#1f1f1f] last:border-0">
      <div className="bg-[#1a1a1a] border border-[#1f1f1f] p-2 rounded-full mr-3">
        {getTypeIcon(transaction.type)}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-[#e0e0e0]">{transaction.description}</span>
          <span className={`text-sm font-medium ${transaction.type === 'send' ? 'text-red-400' : 'text-green-400'}`}>
            {transaction.type === 'send' ? '-' : '+'}
            {transaction.amount} {transaction.token}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[#707070]">{transaction.date}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(transaction.status)}`}>
            {transaction.status}
          </span>
        </div>
      </div>
    </div>
  );
};

const NFTItem = ({ nft }: { nft: any }) => {
  return (
    <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg overflow-hidden transition-all duration-300 hover:border-[#3b82f6] hover:shadow-lg group">
      <div className="h-32 overflow-hidden">
        <img src={nft.image} alt={nft.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-[#e0e0e0] truncate">{nft.name}</h3>
        <div className="flex justify-between items-center">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              nft.rarity === 'Legendary'
                ? 'bg-amber-500 text-white'
                : nft.rarity === 'Epic'
                ? 'bg-purple-500 text-white'
                : nft.rarity === 'Rare'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-500 text-white'
            }`}
          >
            {nft.rarity}
          </span>
          <span className="text-xs text-[#707070]">#{nft.id}</span>
        </div>
      </div>
    </div>
  );
};

const WalletDashboard = () => {
  const { connected, publicKey, balance } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const viewOnExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey}`, '_blank');
    }
  };

  // Mock data
  const walletData = {
    solBalance: balance,
    usdcBalance: 125.75,
    svtBalance: 12500,
    totalValueUSD: balance * 25 + 125.75 + 12500 * 0.025,
    nfts: [
      { id: 1289, name: 'Celestial #1289', image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=400&auto=format&fit=crop', rarity: 'Legendary' },
      { id: 2456, name: 'Celestial #2456', image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop', rarity: 'Epic' },
      { id: 3789, name: 'Celestial #3789', image: 'https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?q=80&w=400&auto=format&fit=crop', rarity: 'Rare' },
      { id: 4567, name: 'Celestial #4567', image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=400&auto=format&fit=crop', rarity: 'Common' }
    ],
    transactions: [
      { id: 1, type: 'receive', description: 'Received SOL', amount: '0.5', token: 'SOL', date: 'Nov 11, 13:45', status: 'completed' },
      { id: 2, type: 'mint', description: 'Minted Celestial NFT', amount: '0.1', token: 'SOL', date: 'Nov 10, 09:15', status: 'completed' },
      { id: 3, type: 'send', description: 'Sent SOL', amount: '0.25', token: 'SOL', date: 'Nov 9, 18:45', status: 'completed' },
      { id: 4, type: 'stake', description: 'Staked SVT', amount: '500', token: 'SVT', date: 'Nov 8, 11:20', status: 'completed' },
      { id: 5, type: 'receive', description: 'Daily Login Reward', amount: '10', token: 'SVT', date: 'Nov 11, 01:00', status: 'completed' }
    ],
    borrowedNFTs: [
      { id: 5432, name: 'Celestial #5432', image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=400&auto=format&fit=crop', rarity: 'Epic', returnDate: 'Nov 18, 2025' }
    ]
  };

  if (!connected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-8 max-w-md w-full text-center space-y-6">
          <div className="bg-[#3b82f6]/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Wallet className="h-8 w-8 text-[#3b82f6]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#e0e0e0]">Wallet Not Connected</h2>
          <p className="text-sm text-[#707070]">Connect your wallet to view balances, NFTs, and transaction history.</p>
          <button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center text-sm">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#e0e0e0]">Wallet Dashboard</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">Manage assets, NFTs, staking, and borrowing in one place</p>
      </div>

      {/* Connected Wallet Block */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-6 space-y-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <div>
              <div className="text-xs text-[#707070]">Connected Wallet</div>
              <div className="flex items-center mt-0.5">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                <div className="font-mono text-sm text-[#e0e0e0] truncate max-w-[180px] md:max-w-xs">
                  {publicKey}
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyAddress}
              className="bg-[#1a1a1a] border border-[#1f1f1f] hover:border-[#3b82f6] p-2 rounded-lg transition-all duration-200 hover:scale-105"
              title="Copy Address"
            >
              {copied ? <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <Copy className="h-4 w-4 text-[#707070]" />}
            </button>
            <button
              onClick={viewOnExplorer}
              className="bg-[#1a1a1a] border border-[#1f1f1f] hover:border-[#3b82f6] p-2 rounded-lg transition-all duration-200 hover:scale-105"
              title="View on Explorer"
            >
              <ExternalLink className="h-4 w-4 text-[#707070]" />
            </button>
          </div>
        </div>

        {/* Balances Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
            <div className="text-xs text-[#707070] mb-1">SOL Balance</div>
            <div className="text-lg font-bold text-[#e0e0e0]">{walletData.solBalance} SOL</div>
            <div className="text-xs text-[#707070] mt-0.5">${(walletData.solBalance * 25).toFixed(2)}</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
            <div className="text-xs text-[#707070] mb-1">USDC Balance</div>
            <div className="text-lg font-bold text-[#e0e0e0]">{walletData.usdcBalance} USDC</div>
            <div className="text-xs text-[#707070] mt-0.5">${walletData.usdcBalance.toFixed(2)}</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
            <div className="text-xs text-[#707070] mb-1">SVT Balance</div>
            <div className="text-lg font-bold text-[#e0e0e0]">{walletData.svtBalance.toLocaleString()} SVT</div>
            <div className="text-xs text-[#707070] mt-0.5">${(walletData.svtBalance * 0.025).toFixed(2)}</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
            <div className="text-xs text-[#707070] mb-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Total Value
            </div>
            <div className="text-lg font-bold text-[#3b82f6]">${walletData.totalValueUSD.toFixed(2)}</div>
            <div className="text-xs text-[#707070] mt-0.5">Across all assets</div>
          </div>
        </div>
      </div>

      {/* Tabs — ВИПРАВЛЕНО: рівномірний розподіл, іконки + текст, чітка активність */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="border-b border-[#1f1f1f]">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3, color: '#3b82f6' },
              { id: 'nfts', label: 'NFTs', icon: Gem, color: '#8b5cf6' },
              { id: 'transactions', label: 'Transactions', icon: History, color: '#10b981' },
              { id: 'borrowed', label: 'Borrowed', icon: Clock, color: '#f59e0b' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center py-3 px-2 text-xs font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? `border-[${tab.color}] text-[${tab.color}]`
                    : 'border-transparent text-[#707070] hover:text-[#e0e0e0] hover:bg-[#1a1a1a]'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-1.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <h2 className="text-lg font-semibold text-[#e0e0e0]">Quick Actions</h2>
                <div className="flex gap-3">
                  <Link to="/nft-market" className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center text-sm">
                    Buy NFTs
                  </Link>
                  <Link to="/token-sale" className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center text-sm">
                    Buy Tokens
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-[#e0e0e0] mb-3">Your NFTs</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {walletData.nfts.slice(0, 3).map(nft => (
                      <NFTItem key={nft.id} nft={nft} />
                    ))}
                  </div>
                  {walletData.nfts.length > 3 && (
                    <div className="mt-3 text-center">
                      <button onClick={() => setActiveTab('nfts')} className="text-xs text-[#3b82f6] hover:text-[#2563eb] hover:underline">
                        View all {walletData.nfts.length} NFTs
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#e0e0e0] mb-3">Recent Activity</h3>
                  <div className="space-y-0">
                    {walletData.transactions.slice(0, 3).map(transaction => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                  {walletData.transactions.length > 3 && (
                    <div className="mt-3 text-center">
                      <button onClick={() => setActiveTab('transactions')} className="text-xs text-[#3b82f6] hover:text-[#2563eb] hover:underline">
                        View all transactions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NFTs Tab */}
          {activeTab === 'nfts' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <h2 className="text-lg font-semibold text-[#e0e0e0]">Your NFT Collection</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#707070]" />
                    <input
                      type="text"
                      placeholder="Search NFTs..."
                      className="pl-10 pr-3 py-2.5 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm placeholder-[#707070] focus:outline-none focus:border-[#3b82f6] w-full md:w-64"
                    />
                  </div>
                  <button className="bg-[#1a1a1a] border border-[#1f1f1f] hover:border-[#3b82f6] p-2.5 rounded-lg transition-colors">
                    <Filter className="h-5 w-5 text-[#707070]" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {walletData.nfts.map(nft => (
                  <NFTItem key={nft.id} nft={nft} />
                ))}
              </div>

              <div className="text-center">
                <Link to="/nft-market" className="inline-flex items-center bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-all hover:scale-105">
                  <Zap className="h-4 w-4 mr-1.5" />
                  Go to Marketplace
                </Link>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <h2 className="text-lg font-semibold text-[#e0e0e0]">Transaction History</h2>
                <div className="flex gap-3">
                  <select className="px-4 py-2.5 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-sm focus:outline-none focus:border-[#3b82f6]">
                    <option>All Types</option>
                    <option>Send</option>
                    <option>Receive</option>
                    <option>Mint</option>
                    <option>Stake</option>
                  </select>
                  <button className="bg-[#1a1a1a] border border-[#1f1f1f] hover:border-[#3b82f6] p-2.5 rounded-lg transition-colors">
                    <Filter className="h-5 w-5 text-[#707070]" />
                  </button>
                </div>
              </div>

              <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-4">
                <div className="space-y-0">
                  {walletData.transactions.map(transaction => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Borrowed NFTs Tab */}
          {activeTab === 'borrowed' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <h2 className="text-lg font-semibold text-[#e0e0e0]">Borrowed NFTs</h2>
                <Link to="/nft-borrowing" className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center">
                  Borrow More
                </Link>
              </div>

              {walletData.borrowedNFTs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {walletData.borrowedNFTs.map(nft => (
                    <div key={nft.id} className="bg-[#121212] border border-[#1f1f1f] rounded-lg overflow-hidden hover:border-[#f59e0b] transition-all">
                      <div className="h-32 overflow-hidden">
                        <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 space-y-2">
                        <h3 className="text-sm font-medium text-[#e0e0e0] truncate">{nft.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500 text-white font-medium">
                            {nft.rarity}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-[#f59e0b]">
                          <Clock className="h-3 w-3 mr-1" />
                          Return by: {nft.returnDate}
                        </div>
                        <button className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-medium py-1.5 px-3 rounded transition-all hover:scale-105 flex items-center justify-center">
                          <Shield className="h-3 w-3 mr-1" />
                          Return NFT
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-8 text-center">
                  <div className="bg-[#1a1a1a] p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-7 w-7 text-[#707070]" />
                  </div>
                  <h3 className="text-lg font-medium text-[#e0e0e0] mb-1">No Active Borrows</h3>
                  <p className="text-sm text-[#707070] mb-4">You haven't borrowed any NFTs yet</p>
                  <Link to="/nft-borrowing" className="inline-flex items-center text-[#3b82f6] hover:text-[#2563eb] text-sm hover:underline">
                    Explore borrowing options
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;