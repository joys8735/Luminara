import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useProject } from '../context/ProjectContext';
import { Gem, Copy, AlertCircle } from 'lucide-react';
import ProjectTimer from '../components/ProjectTimer';
const NFTCard = ({
  id,
  name,
  image,
  price,
  onMint
}) => {
  return <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="h-48 bg-gray-200 dark:bg-gray-700">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {name} #{id}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
          <div className="font-medium text-gray-900 dark:text-white">
            {price} SOL
          </div>
        </div>
        <button onClick={() => onMint(id)} className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg">
          Mint NFT
        </button>
      </div>
    </div>;
};
const NFTSale = () => {
  const {
    connected,
    generateAddress
  } = useWallet();
  const {
    nftInfo,
    timers
  } = useProject();
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [paymentAddress, setPaymentAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const handleMint = id => {
    if (!connected) return;
    setSelectedNFT(id);
    const address = generateAddress();
    setPaymentAddress(address);
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // Mock NFT data
  const nfts = [{
    id: 1,
    name: 'SolanaVerse Genesis',
    image: 'https://images.unsplash.com/photo-1634972109823-9a5e73ba1363?q=80&w=1000&auto=format&fit=crop',
    price: nftInfo.price
  }, {
    id: 2,
    name: 'SolanaVerse Nexus',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    price: nftInfo.price
  }, {
    id: 3,
    name: 'SolanaVerse Quantum',
    image: 'https://images.unsplash.com/photo-1644760244572-e3580082bb4e?q=80&w=1000&auto=format&fit=crop',
    price: nftInfo.price
  }, {
    id: 4,
    name: 'SolanaVerse Astral',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop',
    price: nftInfo.price
  }, {
    id: 5,
    name: 'SolanaVerse Ethereal',
    image: 'https://images.unsplash.com/photo-1633537066008-1a51a3e34aaf?q=80&w=1000&auto=format&fit=crop',
    price: nftInfo.price
  }, {
    id: 6,
    name: 'SolanaVerse Cosmic',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=1000&auto=format&fit=crop',
    price: nftInfo.price
  }];
  return <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            NFT Sale
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Mint exclusive SolanaVerse NFTs with unique utilities in our
            ecosystem
          </p>
        </div>
        <div className="flex-shrink-0">
          <ProjectTimer startDate={timers.nftSaleStart} endDate={timers.nftSaleEnd} label="NFT Sale Ends In" />
        </div>
      </div>
      {!connected && <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Wallet not connected
              </h3>
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                Please connect your wallet to mint NFTs.
              </p>
            </div>
          </div>
        </div>}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            NFT Collection
          </h2>
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
            <Gem className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Minted
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {nftInfo.sold.toLocaleString()} /{' '}
              {nftInfo.totalSupply.toLocaleString()}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full" style={{
            width: `${nftInfo.sold / nftInfo.totalSupply * 100}%`
          }}></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map(nft => <NFTCard key={nft.id} id={nft.id} name={nft.name} image={nft.image} price={nft.price} onMint={handleMint} />)}
        </div>
      </div>
      {selectedNFT && paymentAddress && <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Complete Your Purchase
          </h2>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Send {nftInfo.price} SOL to this Solana address
            </h3>
            <div className="flex">
              <input type="text" readOnly value={paymentAddress} className="flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-l-md px-3 py-2 text-sm" />
              <button onClick={copyToClipboard} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-r-md flex items-center">
                <Copy className="h-4 w-4" />
                <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Your NFT will be automatically sent to your connected wallet after
              payment confirmation.
            </p>
          </div>
        </div>}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          NFT Benefits
        </h2>
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  1
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Exclusive Access
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                NFT holders get exclusive access to premium features and early
                product releases.
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold">
                  2
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Staking Rewards
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Stake your NFTs to earn passive income with enhanced APY
                compared to regular token staking.
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-bold">
                  3
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Governance Rights
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                NFT holders get voting power in project governance decisions
                proportional to their holdings.
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  4
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Revenue Sharing
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                A portion of platform revenue is distributed to NFT holders on a
                quarterly basis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default NFTSale;