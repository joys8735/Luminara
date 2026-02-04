// hooks/useTradingSim.ts
import { useState, useEffect } from 'react';

interface PortfolioItem {
  symbol: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  pnl?: number;
}

interface Tournament {
  id: string;
  name: string;
  prizePool: number;
  participants: number;
  startTime: number;
  endTime: number;
  yourRank?: number;
  entryFee: number;
}

export function useTradingSim() {
  const [balance, setBalance] = useState<number>(100000);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [skills, setSkills] = useState({
    technicalAnalysis: 1,
    riskManagement: 1,
    marketTiming: 1,
    patience: 1
  });
  
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    largestWin: 0,
    largestLoss: 0,
    winRate: 0,
    profitFactor: 0
  });

  // Завантаження збереженої гри
  useEffect(() => {
    const saved = localStorage.getItem('trading_sim_data');
    if (saved) {
      const data = JSON.parse(saved);
      setBalance(data.balance || 100000);
      setPortfolio(data.portfolio || []);
      setTradeHistory(data.tradeHistory || []);
      setSkills(data.sills || defaultSkills);
      setStats(data.stats || defaultStats);
    }
    
    // Завантажуємо активні турніри
    loadActiveTournaments();
  }, []);

  // Збереження гри
  useEffect(() => {
    const saveData = {
      balance,
      portfolio,
      tradeHistory,
      skills,
      stats,
      lastSave: Date.now()
    };
    localStorage.setItem('trading_sim_data', JSON.stringify(saveData));
  }, [balance, portfolio, tradeHistory, skills, stats]);

  // Купівля
  const buy = (symbol: string, amount: number, price: number) => {
    const cost = amount * price;
    
    if (cost > balance) {
      throw new Error('Insufficient funds');
    }
    
    // Оновлюємо баланс
    setBalance(prev => prev - cost);
    
    // Додаємо в портфоліо або оновлюємо існуючу позицію
    setPortfolio(prev => {
      const existing = prev.find(p => p.symbol === symbol);
      
      if (existing) {
        const totalAmount = existing.amount + amount;
        const newAvgPrice = ((existing.amount * existing.avgPrice) + (amount * price)) / totalAmount;
        
        return prev.map(p => 
          p.symbol === symbol 
            ? { ...p, amount: totalAmount, avgPrice: newAvgPrice }
            : p
        );
      } else {
        return [...prev, {
          symbol,
          amount,
          avgPrice: price,
          currentPrice: price,
          pnl: 0,
          pnlPercent: 0
        }];
      }
    });
    
    // Додаємо в історію
    const trade: Trade = {
      id: `trade_${Date.now()}`,
      symbol,
      type: 'buy',
      amount,
      price,
      timestamp: Date.now()
    };
    
    setTradeHistory(prev => [trade, ...prev]);
    updateStatsAfterTrade(trade, 'buy');
    updateSkills('buy');
  };

  // Продаж
  const sell = (symbol: string, amount: number, price: number) => {
    const portfolioItem = portfolio.find(p => p.symbol === symbol);
    
    if (!portfolioItem || portfolioItem.amount < amount) {
      throw new Error('Insufficient holdings');
    }
    
    const revenue = amount * price;
    const cost = amount * portfolioItem.avgPrice;
    const pnl = revenue - cost;
    
    // Оновлюємо баланс
    setBalance(prev => prev + revenue);
    
    // Оновлюємо портфоліо
    setPortfolio(prev => {
      const newAmount = portfolioItem.amount - amount;
      
      if (newAmount <= 0) {
        return prev.filter(p => p.symbol !== symbol);
      }
      
      return prev.map(p => 
        p.symbol === symbol 
          ? { ...p, amount: newAmount }
          : p
      );
    });
    
    // Додаємо в історію
    const trade: Trade = {
      id: `trade_${Date.now()}`,
      symbol,
      type: 'sell',
      amount,
      price,
      timestamp: Date.now(),
      pnl
    };
    
    setTradeHistory(prev => [trade, ...prev]);
    updateStatsAfterTrade(trade, 'sell', pnl);
    updateSkills('sell', pnl > 0);
    
    return pnl;
  };

  // Оновлення цін портфоліо
  const updatePortfolioPrices = (prices: Record<string, number>) => {
    setPortfolio(prev => prev.map(item => {
      const currentPrice = prices[item.symbol] || item.currentPrice;
      const pnl = (currentPrice - item.avgPrice) * item.amount;
      const pnlPercent = ((currentPrice - item.avgPrice) / item.avgPrice) * 100;
      
      return {
        ...item,
        currentPrice,
        pnl,
        pnlPercent
      };
    }));
  };

  // Оновлення навичок
  const updateSkills = (action: 'buy' | 'sell', profitable?: boolean) => {
    setSkills(prev => {
      const updates: any = {};
      
      switch (action) {
        case 'buy':
          updates.marketTiming = Math.min(100, prev.marketTiming + 0.1);
          break;
        case 'sell':
          updates.patience = Math.min(100, prev.patience + 0.1);
          if (profitable) {
            updates.riskManagement = Math.min(100, prev.riskManagement + 0.2);
          }
          break;
      }
      
      return { ...prev, ...updates };
    });
  };

  // Оновлення статистики
  const updateStatsAfterTrade = (trade: Trade, type: 'buy' | 'sell', pnl?: number) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalTrades += 1;
      
      if (type === 'sell' && pnl !== undefined) {
        newStats.totalProfit += pnl;
        
        if (pnl > 0) {
          newStats.winningTrades += 1;
          if (pnl > newStats.largestWin) newStats.largestWin = pnl;
        } else {
          newStats.losingTrades += 1;
          if (pnl < newStats.largestLoss) newStats.largestLoss = pnl;
        }
        
        newStats.winRate = (newStats.winningTrades / (newStats.winningTrades + newStats.losingTrades)) * 100;
        
        const totalWins = newStats.totalProfit > 0 ? newStats.totalProfit : 1;
        const totalLosses = Math.abs(newStats.totalProfit < 0 ? newStats.totalProfit : 0);
        newStats.profitFactor = totalWins / (totalLosses || 1);
      }
      
      return newStats;
    });
  };

  // Завантаження турнірів
  const loadActiveTournaments = () => {
    const mockTournaments: Tournament[] = [
      {
        id: 'weekly_challenge',
        name: 'Weekly Trading Challenge',
        prizePool: 5000,
        participants: 247,
        startTime: Date.now() - 86400000, // Почався день тому
        endTime: Date.now() + 6 * 86400000, // Закінчиться через 6 днів
        entryFee: 100
      },
      {
        id: 'quick_daily',
        name: 'Quick Daily Tournament',
        prizePool: 1000,
        participants: 89,
        startTime: Date.now(),
        endTime: Date.now() + 86400000,
        entryFee: 10
      }
    ];
    
    setActiveTournaments(mockTournaments);
  };

  // Приєднатися до турніру
  const joinTournament = (tournamentId: string) => {
    const tournament = activeTournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    if (balance < tournament.entryFee) {
      throw new Error('Insufficient balance for entry fee');
    }
    
    // Списуємо вступний внесок
    setBalance(prev => prev - tournament.entryFee);
    
    // Тут буде запит до бекенду для приєднання
    console.log(`Joined tournament: ${tournamentId}`);
    
    return true;
  };

  // Розрахунок загального PnL
  const totalPortfolioValue = portfolio.reduce((sum, item) => sum + (item.currentPrice * item.amount), 0);
  const totalPnl = portfolio.reduce((sum, item) => sum + item.pnl, 0);
  const totalAssets = balance + totalPortfolioValue;

  return {
    // Стан
    balance,
    portfolio,
    tradeHistory,
    activeTournaments,
    skills,
    stats,
    
    // Розрахункові значення
    totalPortfolioValue,
    totalPnl,
    totalAssets,
    
    // Методи
    buy,
    sell,
    updatePortfolioPrices,
    joinTournament,
    
    // Допоміжні
    getPortfolioItem: (symbol: string) => portfolio.find(p => p.symbol === symbol),
    getRecentTrades: (limit: number = 5) => tradeHistory.slice(0, limit)
  };
}