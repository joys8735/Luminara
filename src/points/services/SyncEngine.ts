/**
 * Sync Engine Service
 * Manages Supabase synchronization with conflict resolution and offline support
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.6, 7.4
 */

import { PointsData, SyncOperation, SyncState } from '../types';
import { storageManager } from './StorageManager';
import { retryWithBackoff } from '../utils';
import { SYNC_RETRY_DELAYS, CIRCUIT_BREAKER_THRESHOLD, CIRCUIT_BREAKER_TIMEOUT } from '../constants';

export class SyncEngine {
  private syncState: Map<string, SyncState> = new Map();
  private failureCount: Map<string, number> = new Map();
  private circuitBreakerTimeout: Map<string, number> = new Map();
  private supabaseClient: any; // Will be injected

  constructor(supabaseClient?: any) {
    this.supabaseClient = supabaseClient;
  }

  /**
   * Set Supabase client
   */
  setSupabaseClient(client: any): void {
    this.supabaseClient = client;
  }

  /**
   * Sync points to Supabase
   * Requirement 2.1, 2.3: Sync local points to Supabase and update cache
   */
  async syncToSupabase(userId: string, pointsData: PointsData): Promise<{ success: boolean; error?: string }> {
    if (!this.supabaseClient) {
      return { success: false, error: 'Supabase client not configured' };
    }

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(userId)) {
      return { success: false, error: 'Circuit breaker is open' };
    }

    this.setSyncState(userId, 'syncing');

    try {
      const result = await retryWithBackoff(
        async () => {
          const { data, error } = await this.supabaseClient
            .from('points')
            .upsert(
              {
                user_id: userId,
                alpha_points: pointsData.alpha,
                reward_points: pointsData.rewards,
                platform_balance: pointsData.balance,
                last_updated: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            )
            .select();

          if (error) {
            throw new Error(error.message);
          }

          return data;
        },
        SYNC_RETRY_DELAYS
      );

      this.resetFailureCount(userId);
      this.setSyncState(userId, 'synced');
      return { success: true };
    } catch (error) {
      this.incrementFailureCount(userId);
      this.setSyncState(userId, 'error');
      return { success: false, error: error instanceof Error ? error.message : 'Sync failed' };
    }
  }

  /**
   * Fetch points from Supabase
   * Requirement 2.1: Fetch latest points from Supabase
   */
  async fetchFromSupabase(userId: string): Promise<PointsData | null> {
    if (!this.supabaseClient) {
      return null;
    }

    try {
      const { data, error } = await this.supabaseClient
        .from('points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Failed to fetch points from Supabase:', error);
        return null;
      }

      return {
        userId: data.user_id,
        alpha: data.alpha_points,
        rewards: data.reward_points,
        balance: data.platform_balance,
        lastUpdated: data.last_updated,
      };
    } catch (error) {
      console.error('Failed to fetch points:', error);
      return null;
    }
  }

  /**
   * Queue operation for sync
   * Requirement 2.2: Queue operation for Supabase synchronization
   */
  queueOperation(userId: string, operation: SyncOperation): void {
    storageManager.queueOperation(userId, operation);
  }

  /**
   * Process queued operations
   * Requirement 2.5: Retry when connection restored
   */
  async processQueue(userId: string): Promise<{ processed: number; failed: number }> {
    const queue = storageManager.getQueue(userId);
    let processed = 0;
    let failed = 0;

    for (const operation of queue) {
      try {
        // Process operation (would call appropriate API method)
        await this.processOperation(operation);
        storageManager.removeFromQueue(userId, operation.id);
        processed++;
      } catch (error) {
        failed++;
        // Update retry count
        const newRetryCount = operation.retryCount + 1;
        storageManager.updateOperationRetryCount(userId, operation.id, newRetryCount);

        // Remove if max retries exceeded
        if (newRetryCount >= SYNC_RETRY_DELAYS.length) {
          storageManager.removeFromQueue(userId, operation.id);
        }
      }
    }

    return { processed, failed };
  }

  /**
   * Process a single operation
   */
  private async processOperation(operation: SyncOperation): Promise<void> {
    // This would be implemented based on operation type
    // For now, just simulate processing
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Resolve conflict using server-as-source strategy
   * Requirement 2.4, 7.4: Server state is source of truth
   */
  resolveConflict(local: PointsData, remote: PointsData): PointsData {
    // Server-as-source: always use remote data
    return remote;
  }

  /**
   * Get sync state
   */
  getSyncState(userId: string): SyncState {
    return this.syncState.get(userId) || 'synced';
  }

  /**
   * Set sync state
   */
  setSyncState(userId: string, state: SyncState): void {
    this.syncState.set(userId, state);
    storageManager.setSyncState(userId, state);
  }

  /**
   * Check if circuit breaker is open
   */
  private isCircuitBreakerOpen(userId: string): boolean {
    const timeout = this.circuitBreakerTimeout.get(userId);
    if (!timeout) {
      return false;
    }

    if (Date.now() > timeout) {
      this.circuitBreakerTimeout.delete(userId);
      this.resetFailureCount(userId);
      return false;
    }

    return true;
  }

  /**
   * Increment failure count
   */
  private incrementFailureCount(userId: string): void {
    const count = (this.failureCount.get(userId) || 0) + 1;
    this.failureCount.set(userId, count);

    if (count >= CIRCUIT_BREAKER_THRESHOLD) {
      this.circuitBreakerTimeout.set(userId, Date.now() + CIRCUIT_BREAKER_TIMEOUT);
    }
  }

  /**
   * Reset failure count
   */
  private resetFailureCount(userId: string): void {
    this.failureCount.delete(userId);
    this.circuitBreakerTimeout.delete(userId);
  }

  /**
   * Get failure count
   */
  getFailureCount(userId: string): number {
    return this.failureCount.get(userId) || 0;
  }

  /**
   * Subscribe to real-time updates
   * Requirement 7.3: Subscribe to real-time changes
   */
  subscribeToUpdates(userId: string, callback: (data: PointsData) => void): () => void {
    if (!this.supabaseClient) {
      return () => {};
    }

    const subscription = this.supabaseClient
      .from(`points:user_id=eq.${userId}`)
      .on('*', (payload: any) => {
        const data: PointsData = {
          userId: payload.new.user_id,
          alpha: payload.new.alpha_points,
          rewards: payload.new.reward_points,
          balance: payload.new.platform_balance,
          lastUpdated: payload.new.last_updated,
        };
        callback(data);
      })
      .subscribe();

    return () => {
      this.supabaseClient.removeSubscription(subscription);
    };
  }

  /**
   * Clear sync state
   */
  clearSyncState(userId: string): void {
    this.syncState.delete(userId);
    this.failureCount.delete(userId);
    this.circuitBreakerTimeout.delete(userId);
  }

  /**
   * Clear all sync state
   */
  clearAllSyncState(): void {
    this.syncState.clear();
    this.failureCount.clear();
    this.circuitBreakerTimeout.clear();
  }
}

// Export singleton instance
export const syncEngine = new SyncEngine();
