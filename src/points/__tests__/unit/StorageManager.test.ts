/**
 * Unit Tests for StorageManager
 * Tests cache, queue, and localStorage management
 */

import { StorageManager } from '../../services/StorageManager';
import { SyncOperation, PointsData } from '../../types';
import { CACHE_TTL_MS, STORAGE_KEYS } from '../../constants';

describe('StorageManager', () => {
  let manager: StorageManager;

  beforeEach(() => {
    manager = new StorageManager();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  describe('Cache Management', () => {
    it('should set and get cache', () => {
      const data = { userId: 'user-1', alpha: 100, rewards: 50, balance: 200, lastUpdated: '2024-01-01' };
      manager.setCache('test-key', data);
      expect(manager.getCache('test-key')).toEqual(data);
    });

    it('should return null for non-existent cache', () => {
      expect(manager.getCache('non-existent')).toBeNull();
    });

    it('should expire cache after TTL', () => {
      const data = { userId: 'user-1', alpha: 100, rewards: 50, balance: 200, lastUpdated: '2024-01-01' };
      manager.setCache('test-key', data, 5000);
      
      expect(manager.getCache('test-key')).toEqual(data);
      
      // Advance time past TTL
      jest.advanceTimersByTime(6000);
      expect(manager.getCache('test-key')).toBeNull();
    });

    it('should use default TTL if not specified', () => {
      const data = { userId: 'user-1', alpha: 100, rewards: 50, balance: 200, lastUpdated: '2024-01-01' };
      manager.setCache('test-key', data);
      
      expect(manager.getCache('test-key')).toEqual(data);
      
      // Advance time past default TTL
      jest.advanceTimersByTime(CACHE_TTL_MS + 1000);
      expect(manager.getCache('test-key')).toBeNull();
    });

    it('should clear specific cache', () => {
      manager.setCache('key1', { data: 1 });
      manager.setCache('key2', { data: 2 });
      
      manager.clearCache('key1');
      
      expect(manager.getCache('key1')).toBeNull();
      expect(manager.getCache('key2')).toEqual({ data: 2 });
    });

    it('should clear all cache', () => {
      manager.setCache('key1', { data: 1 });
      manager.setCache('key2', { data: 2 });
      
      manager.clearAllCache();
      
      expect(manager.getCache('key1')).toBeNull();
      expect(manager.getCache('key2')).toBeNull();
    });

    it('should check if cache is valid', () => {
      manager.setCache('test-key', { data: 1 }, 5000);
      
      expect(manager.isCacheValid('test-key')).toBe(true);
      
      jest.advanceTimersByTime(6000);
      expect(manager.isCacheValid('test-key')).toBe(false);
    });

    it('should get cache TTL remaining', () => {
      manager.setCache('test-key', { data: 1 }, 5000);
      
      const remaining1 = manager.getCacheTTLRemaining('test-key');
      expect(remaining1).toBeGreaterThan(0);
      expect(remaining1).toBeLessThanOrEqual(5000);
      
      jest.advanceTimersByTime(2000);
      const remaining2 = manager.getCacheTTLRemaining('test-key');
      expect(remaining2).toBeLessThan(remaining1);
      
      jest.advanceTimersByTime(4000);
      expect(manager.getCacheTTLRemaining('test-key')).toBe(0);
    });

    it('should persist cache to localStorage', () => {
      const data = { userId: 'user-1', alpha: 100, rewards: 50, balance: 200, lastUpdated: '2024-01-01' };
      manager.setCache('test-key', data);
      
      const stored = localStorage.getItem('test-key');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toEqual(data);
    });
  });

  describe('Queue Management', () => {
    it('should queue operation', () => {
      const operation: SyncOperation = {
        id: 'op-1',
        type: 'add',
        data: { amount: 100 },
        timestamp: '2024-01-01T00:00:00Z',
        retryCount: 0,
      };
      
      manager.queueOperation('user-1', operation);
      const queue = manager.getQueue('user-1');
      
      expect(queue).toHaveLength(1);
      expect(queue[0]).toEqual(operation);
    });

    it('should get queue for user', () => {
      const op1: SyncOperation = {
        id: 'op-1',
        type: 'add',
        data: { amount: 100 },
        timestamp: '2024-01-01T00:00:00Z',
        retryCount: 0,
      };
      const op2: SyncOperation = {
        id: 'op-2',
        type: 'subtract',
        data: { amount: 50 },
        timestamp: '2024-01-01T00:00:01Z',
        retryCount: 0,
      };
      
      manager.queueOperation('user-1', op1);
      manager.queueOperation('user-1', op2);
      
      const queue = manager.getQueue('user-1');
      expect(queue).toHaveLength(2);
    });

    it('should remove operation from queue', () => {
      const operation: SyncOperation = {
        id: 'op-1',
        type: 'add',
        data: { amount: 100 },
        timestamp: '2024-01-01T00:00:00Z',
        retryCount: 0,
      };
      
      manager.queueOperation('user-1', operation);
      expect(manager.getQueue('user-1')).toHaveLength(1);
      
      manager.removeFromQueue('user-1', 'op-1');
      expect(manager.getQueue('user-1')).toHaveLength(0);
    });

    it('should clear queue for user', () => {
      const operation: SyncOperation = {
        id: 'op-1',
        type: 'add',
        data: { amount: 100 },
        timestamp: '2024-01-01T00:00:00Z',
        retryCount: 0,
      };
      
      manager.queueOperation('user-1', operation);
      expect(manager.getQueue('user-1')).toHaveLength(1);
      
      manager.clearQueue('user-1');
      expect(manager.getQueue('user-1')).toHaveLength(0);
    });

    it('should get queue size', () => {
      const op1: SyncOperation = {
        id: 'op-1',
        type: 'add',
        data: { amount: 100 },
        timestamp: '2024-01-01T00:00:00Z',
        retryCount: 0,
      };
      const op2: SyncOperation = {
        id: 'op-2',
        type: 'subtract',
        data: { amount: 50 },
        timestamp: '2024-01-01T00:00:01Z',
        retryCount: 0,
      };
      
      manager.queueOperation('user-1', op1);
      manager.queueOperation('user-1', op2);
      
      expect(manager.getQueueSize('user-1')).toBe(2);
    });

    it('should check if queue has operations', () => {
      expect(manager.hasQueuedOperations('user-1')).toBe(false);
      
      const operation: SyncOperation = {
        id: 'op-1',
        type: 'add',
        data: { amount: 100 },
        timestamp: '2024-01-01T00:00:00Z',
        retryCount: 0,
      };
      
      manager.queueOperation('user-1', operation);
      expect(manager.hasQueuedOperations('user-1')).toBe(true);
    });

    it('should update operation retry count', () => {
      const operation: SyncOperation = {
        id: 'op-1',
        type: 'add',
        data: { amount: 100 },
        timestamp: '2024-01-01T00:00:00Z',
        retryCount: 0,
      };
      
      manager.queueOperation('user-1', operation);
      manager.updateOperationRetryCount('user-1', 'op-1', 3);
      
      const queue = manager.getQueue('user-1');
      expect(queue[0].retryCount).toBe(3);
    });

    it('should persist queue to localStorage', () => {
      const operation: SyncOperation = {
        id: 'op-1',
        type: 'add',
        data: { amount: 100 },
        timestamp: '2024-01-01T00:00:00Z',
        retryCount: 0,
      };
      
      manager.queueOperation('user-1', operation);
      
      const queueKey = STORAGE_KEYS.QUEUE('user-1');
      const stored = localStorage.getItem(queueKey);
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toHaveLength(1);
    });
  });

  describe('Migration Status', () => {
    it('should check migration status', () => {
      expect(manager.isMigrated('user-1')).toBe(false);
    });

    it('should set migration status', () => {
      manager.setMigrated('user-1', true);
      expect(manager.isMigrated('user-1')).toBe(true);
    });

    it('should persist migration status to localStorage', () => {
      manager.setMigrated('user-1', true);
      
      const key = STORAGE_KEYS.MIGRATED('user-1');
      const stored = localStorage.getItem(key);
      expect(stored).toBe('true');
    });
  });

  describe('Sync State', () => {
    it('should get default sync state', () => {
      expect(manager.getSyncState('user-1')).toBe('synced');
    });

    it('should set sync state', () => {
      manager.setSyncState('user-1', 'syncing');
      expect(manager.getSyncState('user-1')).toBe('syncing');
    });

    it('should persist sync state to localStorage', () => {
      manager.setSyncState('user-1', 'error');
      
      const key = STORAGE_KEYS.SYNC_STATE('user-1');
      const stored = localStorage.getItem(key);
      expect(stored).toBe('"error"');
    });
  });

  describe('User Data Management', () => {
    it('should clear all user data', () => {
      const data = { userId: 'user-1', alpha: 100, rewards: 50, balance: 200, lastUpdated: '2024-01-01' };
      manager.setCache(STORAGE_KEYS.CACHE('user-1'), data);
      
      const operation: SyncOperation = {
        id: 'op-1',
        type: 'add',
        data: { amount: 100 },
        timestamp: '2024-01-01T00:00:00Z',
        retryCount: 0,
      };
      manager.queueOperation('user-1', operation);
      manager.setMigrated('user-1', true);
      manager.setSyncState('user-1', 'syncing');
      
      manager.clearUserData('user-1');
      
      expect(manager.getCache(STORAGE_KEYS.CACHE('user-1'))).toBeNull();
      expect(manager.getQueue('user-1')).toHaveLength(0);
      expect(manager.isMigrated('user-1')).toBe(false);
      expect(manager.getSyncState('user-1')).toBe('synced');
    });
  });

  describe('Storage Statistics', () => {
    it('should get storage stats', () => {
      manager.setCache('key1', { data: 1 });
      manager.setCache('key2', { data: 2 });
      
      const stats = manager.getStorageStats();
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('queueSize');
      expect(stats).toHaveProperty('localStorageSize');
      expect(stats.cacheSize).toBeGreaterThan(0);
    });
  });

  describe('Data Export', () => {
    it('should export all data', () => {
      manager.setCache('key1', { data: 1 });
      manager.setCache('key2', { data: 2 });
      
      const exported = manager.exportData();
      expect(exported).toHaveProperty('cache');
      expect(exported).toHaveProperty('localStorage');
    });
  });

  describe('Clear All', () => {
    it('should clear all data', () => {
      manager.setCache('key1', { data: 1 });
      manager.setCache('key2', { data: 2 });
      
      manager.clearAll();
      
      expect(manager.getCache('key1')).toBeNull();
      expect(manager.getCache('key2')).toBeNull();
    });
  });

  describe('Restore from localStorage', () => {
    it('should restore cache from localStorage', () => {
      const data: PointsData = {
        userId: 'user-1',
        alpha: 100,
        rewards: 50,
        balance: 200,
        lastUpdated: '2024-01-01',
      };
      
      // Manually set in localStorage
      const cacheKey = STORAGE_KEYS.CACHE('user-1');
      localStorage.setItem(cacheKey, JSON.stringify(data));
      
      // Clear memory cache
      manager.clearAllCache();
      
      // Restore from localStorage
      const restored = manager.restoreCacheFromLocalStorage('user-1');
      expect(restored).toEqual(data);
      
      // Should also be in memory cache now
      expect(manager.getCache(cacheKey)).toEqual(data);
    });
  });
});
