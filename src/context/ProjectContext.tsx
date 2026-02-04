import React, { useState, createContext, useContext } from 'react';
interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: number;
  price: number;
  sold: number;
}
interface NFTInfo {
  name: string;
  totalSupply: number;
  price: number;
  sold: number;
}
interface ProjectTimers {
  icoStart: Date;
  icoEnd: Date;
  nftSaleStart: Date;
  nftSaleEnd: Date;
}
interface ProjectContextType {
  tokenInfo: TokenInfo;
  nftInfo: NFTInfo;
  timers: ProjectTimers;
  isWhitelisted: boolean;
  claimDailyReward: () => void;
  lastRewardClaim: Date | null;
  canClaimReward: boolean;
}
const ProjectContext = createContext<ProjectContextType>({
  tokenInfo: {
    name: 'SolanaVerse Token',
    symbol: 'SVT',
    totalSupply: 1000000000,
    price: 0.025,
    sold: 350000000
  },
  nftInfo: {
    name: 'SolanaVerse NFT',
    totalSupply: 10000,
    price: 0.5,
    sold: 2345
  },
  timers: {
    icoStart: new Date('2023-12-01T00:00:00Z'),
    icoEnd: new Date('2024-02-28T23:59:59Z'),
    nftSaleStart: new Date('2023-12-15T00:00:00Z'),
    nftSaleEnd: new Date('2024-01-15T23:59:59Z')
  },
  isWhitelisted: false,
  claimDailyReward: () => {},
  lastRewardClaim: null,
  canClaimReward: false
});
export const useProject = () => useContext(ProjectContext);
interface ProjectProviderProps {
  children: ReactNode;
}
export const ProjectProvider = ({
  children
}: ProjectProviderProps) => {
  const [tokenInfo] = useState<TokenInfo>({
    name: 'SolanaVerse Token',
    symbol: 'SVT',
    totalSupply: 1000000000,
    price: 0.025,
    sold: 350000000
  });
  const [nftInfo] = useState<NFTInfo>({
    name: 'SolanaVerse NFT',
    totalSupply: 10000,
    price: 0.5,
    sold: 2345
  });
  const [timers] = useState<ProjectTimers>({
    icoStart: new Date('2023-12-01T00:00:00Z'),
    icoEnd: new Date('2024-02-28T23:59:59Z'),
    nftSaleStart: new Date('2023-12-15T00:00:00Z'),
    nftSaleEnd: new Date('2024-01-15T23:59:59Z')
  });
  const [isWhitelisted] = useState(false);
  const [lastRewardClaim, setLastRewardClaim] = useState<Date | null>(null);
  const [canClaimReward, setCanClaimReward] = useState(true);
  const claimDailyReward = () => {
    setLastRewardClaim(new Date());
    setCanClaimReward(false);
    // In a real implementation, this would call a contract to claim tokens
    // For now, we'll just set a timeout to simulate the 24-hour cooldown
    setTimeout(() => {
      setCanClaimReward(true);
    }, 60000); // Set to 1 minute for demo purposes
  };
  const value = {
    tokenInfo,
    nftInfo,
    timers,
    isWhitelisted,
    claimDailyReward,
    lastRewardClaim,
    canClaimReward
  };
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};