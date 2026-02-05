/**
 * Storage Manager Service
 * Manages cache, operation queue, and localStorage backup
 * 
 * Validates: Requirements 9.1, 9.3, 9.4
 */

import { PointsData, SyncOperation, CacheEntry } from '../types';
import { CACHE_TTL_MS, STORAGE_KEYS } from '../constants';
import { isCacheExpired, getCurrentTimestamp } from '../utils';

export class StorageManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get cached points data
   * Requirement 9.1: Returns cached data if not expired
   */
  getCache<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache is expired
    if (isCacheExpired(entry.timestamp, entry.ttl)) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data
   * Requirement 9.3: Update cache immediately on points change
   */
  setCache<T>(key: string, data: T, ttl: number = CACHE_TTL_MS): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Also persist to localStorage as backup
    this.persistToLocalStorage(key, data);
  }

  /**
   * Clear specific cache entry
   */
  clearCache(key: string): void {
    this.memoryCache.delete(key);
    this.removeFromLocalStorage(key);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.memoryCache.clear();
  }

  /**
   * Check if cache exists and is valid
   */
  isCacheValid(key: string): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return false;
    }
    return !isCacheExpired(entry.timestamp, entry.ttl);
  }

  /**
   * Get cache TTL remaining in milliseconds
   */
  getCacheTTLRemaining(key: string): number {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return 0;
    }

    const elapsed = Date.now() - entry.timestamp;
    const remaining = entry.ttl - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Queue an operation for sync
   * Requirement 2.5: Queue operations when offline
   */
  queueOperation(userId: string, operation: SyncOperation): void {
    const queueKey = STORAGE_KEYS.QUEUE(userId);
    const queue = this.getQueue(userId);
    queue.push(operation);
    this.persistToLocalStorage(queueKey, queue);
  }

  /**
   * Get all queued operations for a user
   */
  getQueue(userId: string): SyncOperation[] {
    const queueKey = STORAGE_KEYS.QUEUE(userId);
    const queue = this.getFromLocalStorage<SyncOperation[]>(queueKey);
    return queue || [];
  }

  /**
   * Remove operation from queue
   */
  removeFromQueue(userId: string, operationId: string): void {
    const queueKey = STORAGE_KEYS.QUEUE(userId);
    const queue = this.getQueue(userId);
    const filtered = queue.filter((op) => op.id !== operationId);
    this.persistToLocalStorage(queueKey, filtered);
  }

  /**
   * Clear all queued operations for a user
   */
  clearQueue(userId: string): void {
    const queueKey = STORAGE_KEYS.QUEUE(userId);
    this.removeFromLocalStorage(queueKey);
  }

  /**
   * Get queue size
   */
  getQueueSize(userId: string): number {
    return this.getQueue(userId).length;
  }

  /**
   * Check if queue has operations
   */
  hasQueuedOperations(userId: string): boolean {
    return this.getQueueSize(userId) > 0;
  }

  /**
   * Update operation retry count
   */
  updateOperationRetryCount(userId: string, operationId: string, retryCount: number): void {
    const queue = this.getQueue(userId);
    const operation = queue.find((op) => op.id === operationId);
    if (operation) {
      operation.retryCount = retryCount;
      this.persistToLocalStorage(STORAGE_KEYS.QUEUE(userId), queue);
    }
  }

  /**
   * Persist data to localStorage
   * Requirement 9.4: Persist cache to localStorage as backup
   */
  private persistToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to persist to localStorage: ${key}`, error);
    }
  }

  /**
   * Get data from localStorage
   */
  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to read from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  private removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage: ${key}`, error);
    }
  }

  /**
   * Restore cache from localStorage
   * Requirement 9.5: Restore cache from localStorage on app restart
   */
  restoreCacheFromLocalStorage(userId: string): PointsData | null {
    const cacheKey = STORAGE_KEYS.CACHE(userId);
    const data = this.getFromLocalStorage<PointsData>(cacheKey);
    
    if (data) {
      // Restore to memory cache
      this.setCache(cacheKey, data);
    }

    return data;
  }

  /**
   * Get migration status
   */
  isMigrated(userId: string): boolean {
    const key = STORAGE_KEYS.MIGRATED(userId);
    const migrated = this.getFromLocalStorage<boolean>(key);
    return migrated || false;
  }

  /**
   * Set migration status
   */
  setMigrated(userId: string, migrated: boolean): void {
    const key = STORAGE_KEYS.MIGRATED(userId);
    this.persistToLocalStorage(key, migrated);
  }

  /**
   * Get sync state
   */
  getSyncState(userId: string): string {
    const key = STORAGE_KEYS.SYNC_STATE(userId);
    const state = this.getFromLocalStorage<string>(key);
    return state || 'synced';
  }

  /**
   * Set sync state
   */
  setSyncState(userId: string, state: string): void {
    const key = STORAGE_KEYS.SYNC_STATE(userId);
    this.persistToLocalStorage(key, state);
  }

  /**
   * Clear all data for a user
   */
  clearUserData(userId: string): void {
    this.clearCache(STORAGE_KEYS.CACHE(userId));
    this.clearQueue(userId);
    this.removeFromLocalStorage(STORAGE_KEYS.MIGRATED(userId));
    this.removeFromLocalStorage(STORAGE_KEYS.SYNC_STATE(userId));
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    cacheSize: number;
    queueSize: number;
    localStorageSize: number;
  } {
    let localStorageSize = 0;
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('points:')) {
          localStorageSize += localStorage[key].length;
        }
      }
    } catch (error) {
      console.error('Failed to calculate localStorage size', error);
    }

    return {
      cacheSize: this.memoryCache.size,
      queueSize: 0, // Would need to iterate through all users
      localStorageSize,
    };
  }

  /**
   * Export all data (for debugging)
   */
  exportData(): {
    cache: Record<string, any>;
    localStorage: Record<string, any>;
  } {
    const cache: Record<string, any> = {};
    this.memoryCache.forEach((entry, key) => {
      cache[key] = entry.data;
    });

    const localStorage_data: Record<string, any> = {};
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('points:')) {
          localStorage_data[key] = JSON.parse(localStorage[key]);
        }
      }
    } catch (error) {
      console.error('Failed to export localStorage data', error);
    }

    return {
      cache,
      localStorage: localStorage_data,
    };
  }

  /**
   * Clear all data (for testing)
   */
  clearAll(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('points:')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear all data', error);
    }
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
