// src/services/WebSocketService.ts
type PriceUpdateListener = (data: PriceUpdate) => void;
type SportsUpdateListener = (data: SportsUpdate) => void;

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  high: number;
  low: number;
  volume: string;
  timestamp: number;
}

export interface SportsUpdate {
  id: number;
  name: string;
  status: 'upcoming' | 'live' | 'completed';
  prediction: string;
  odds: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  wins: number;
  winRate: number;
  trend: 'up' | 'down' | 'stable';
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private priceListeners: PriceUpdateListener[] = [];
  private sportsListeners: SportsUpdateListener[] = [];
  private leaderboardListeners: ((data: LeaderboardEntry[]) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private simulationIntervals: NodeJS.Timeout[] = [];
  private isManuallyDisconnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.isManuallyDisconnected) return;

    try {
      // Бінанс WebSocket для крипто
      const binanceStream = 'wss://stream.binance.com:9443/ws/!ticker@arr';
      this.ws = new WebSocket(binanceStream);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            data.forEach(ticker => {
              try {
                const update: PriceUpdate = {
                  symbol: ticker.s,
                  price: parseFloat(ticker.c),
                  change: parseFloat(ticker.P),
                  high: parseFloat(ticker.h),
                  low: parseFloat(ticker.l),
                  volume: (parseFloat(ticker.q) / 1000000).toFixed(2) + 'M',
                  timestamp: ticker.E
                };
                this.notifyPriceListeners(update);
              } catch (e) {
                // Silently skip problematic ticker data
              }
            });
          }
        } catch (e) {
          // Silently handle JSON parse errors
        }
      };

      this.ws.onerror = (event) => {
        console.warn('⚠️ WebSocket error, will reconnect...', event?.type || 'unknown');
      };

      this.ws.onclose = () => {
        if (!this.isManuallyDisconnected && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log('🔄 WebSocket closed, attempting to reconnect...');
          this.reconnect();
        }
      };
    } catch (e) {
      console.warn('⚠️ WebSocket connection error:', (e as Error).message);
      if (!this.isManuallyDisconnected) {
        this.reconnect();
      }
    }
  }

  private reconnect() {
    if (this.isManuallyDisconnected) return;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(5000 * this.reconnectAttempts, 15000);
      this.reconnectTimeout = setTimeout(() => this.connect(), delay);
    }
  }

  private notifyPriceListeners(update: PriceUpdate) {
    this.priceListeners.forEach(listener => listener(update));
  }

  private notifySportsListeners(update: SportsUpdate) {
    this.sportsListeners.forEach(listener => listener(update));
  }

  private notifyLeaderboardListeners(data: LeaderboardEntry[]) {
    this.leaderboardListeners.forEach(listener => listener(data));
  }

  onPriceUpdate(listener: PriceUpdateListener) {
    this.priceListeners.push(listener);
    return () => {
      this.priceListeners = this.priceListeners.filter(l => l !== listener);
    };
  }

  onSportsUpdate(listener: SportsUpdateListener) {
    this.sportsListeners.push(listener);
    return () => {
      this.sportsListeners = this.sportsListeners.filter(l => l !== listener);
    };
  }

  onLeaderboardUpdate(listener: (data: LeaderboardEntry[]) => void) {
    this.leaderboardListeners.push(listener);
    return () => {
      this.leaderboardListeners = this.leaderboardListeners.filter(l => l !== listener);
    };
  }

  // Симуляція sports обновлень
  startSportsSimulation() {
    const interval = setInterval(() => {
      const sportsUpdate: SportsUpdate = {
        id: Math.floor(Math.random() * 8),
        name: 'Live Match',
        status: Math.random() > 0.5 ? 'live' : 'upcoming',
        prediction: Math.random() > 0.5 ? 'Home' : 'Away',
        odds: 1.5 + Math.random() * 2,
        timestamp: Date.now()
      };
      this.notifySportsListeners(sportsUpdate);
    }, 5000);
    this.simulationIntervals.push(interval);
  }

  // Симуляція leaderboard обновлень
  startLeaderboardSimulation() {
    const interval = setInterval(() => {
      const leaderboard: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        name: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'][i],
        points: Math.floor(Math.random() * 5000) + 1000,
        wins: Math.floor(Math.random() * 100),
        winRate: Math.floor(Math.random() * 100),
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
      }));
      this.notifyLeaderboardListeners(leaderboard);
    }, 10000);
    this.simulationIntervals.push(interval);
  }

  disconnect() {
    this.isManuallyDisconnected = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.simulationIntervals.forEach(interval => clearInterval(interval));
    this.simulationIntervals = [];
  }

  reconnect() {
    this.isManuallyDisconnected = false;
    this.reconnectAttempts = 0;
    this.connect();
  }
}

export const wsService = new WebSocketService();
