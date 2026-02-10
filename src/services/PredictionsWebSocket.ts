// WebSocket Service for real-time updates

export type UpdateType = 'crypto' | 'sports' | 'news';

export interface PredictionUpdate {
  type: UpdateType;
  id: number;
  data: any;
  timestamp: number;
}

class PredictionsWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: PredictionUpdate) => void>> = new Map();
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  // Підключення до WebSocket
  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      // Використовуй свій WebSocket сервер
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Підписатись на всі категорії
        this.subscribe('crypto');
        this.subscribe('sports');
        this.subscribe('news');
      };

      this.ws.onmessage = (event) => {
        try {
          const update: PredictionUpdate = JSON.parse(event.data);
          this.notifyListeners(update);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.ws = null;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  // Спроба перепідключення
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Підписка на категорію
  subscribe(type: UpdateType) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        type,
      }));
    }
  }

  // Відписка від категорії
  unsubscribe(type: UpdateType) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        type,
      }));
    }
  }

  // Додати слухача
  addListener(key: string, callback: (data: PredictionUpdate) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
  }

  // Видалити слухача
  removeListener(key: string, callback: (data: PredictionUpdate) => void) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  // Повідомити всіх слухачів
  private notifyListeners(update: PredictionUpdate) {
    this.listeners.forEach((callbacks) => {
      callbacks.forEach((callback) => {
        try {
          callback(update);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    });
  }

  // Відключення
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  // Перевірка статусу
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const predictionsWS = new PredictionsWebSocketService();

// Hook для використання в React компонентах
export function usePredictionsWebSocket(
  callback: (data: PredictionUpdate) => void,
  key: string = 'default'
) {
  React.useEffect(() => {
    predictionsWS.addListener(key, callback);

    return () => {
      predictionsWS.removeListener(key, callback);
    };
  }, [callback, key]);

  return {
    isConnected: predictionsWS.isConnected(),
    subscribe: (type: UpdateType) => predictionsWS.subscribe(type),
    unsubscribe: (type: UpdateType) => predictionsWS.unsubscribe(type),
  };
}

// Імпорт React для hook
import React from 'react';
