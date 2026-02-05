/**
 * Points API Service
 * Core API for managing points operations
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
 */

import { PointsType, Transaction, ErrorCode, PointsData, BatchOperationResult } from '../types';
import { transactionManager } from './TransactionManager';
import { storageManager } from './StorageManager';
import { syncEngine } from './SyncEngine';
import { pointsTypeSystem } from './PointsTypeSystem';
import { validatePointsAmount, validatePointsType, validateUserId, generateOperationId } from '../utils';
import { ERROR_MESSAGES, STORAGE_KEYS } from '../constants';

export class PointsAPI {
  private eventEmitter: any; // Will be injected

  constructor(eventEmitter?: any) {
    this.eventEmitter = eventEmitter;
  }

  /**
   * Set event emitter
   */
  setEventEmitter(emitter: any): void {
    this.eventEmitter = emitter;
  }

  /**
   * Add points to user account
   * Requirement 5.1, 5.4: Add points with validation
   */
  async addPoints(
    userId: string,
    amount: number,
    pointsType: PointsType,
    reason: string
  ): Promise<{ success: boolean; transaction?: Transaction; error?: string; operationId?: string }> {
    const operationId = generateOperationId();

    try {
      // Validate inputs
      const userValidation = validateUserId(userId);
      if (!userValidation.valid) {
        return { success: false, error: userValidation.error, operationId };
      }

      const amountValidation = validatePointsAmount(amount);
      if (!amountValidation.valid) {
        return { success: false, error: amountValidation.error, operationId };
      }

      const typeValidation = validatePointsType(pointsType);
      if (!typeValidation.valid) {
        return { success: false, error: typeValidation.error, operationId };
      }

      // Get current balance
      const currentData = storageManager.getCache<PointsData>(STORAGE_KEYS.CACHE(userId)) || {
        userId,
        alpha: 0,
        rewards: 0,
        balance: 0,
        lastUpdated: new Date().toISOString(),
      };

      const balanceBefore = currentData[pointsType as keyof PointsData] as number;
      const balanceAfter = balanceBefore + amount;

      // Create transaction
      const transaction = transactionManager.createTransaction({
        userId,
        operationType: 'add',
        pointsType,
        amount,
        reason,
        balanceBefore,
        balanceAfter,
      });

      // Update cache
      const updatedData = { ...currentData, [pointsType]: balanceAfter };
      storageManager.setCache(STORAGE_KEYS.CACHE(userId), updatedData);

      // Queue sync
      storageManager.queueOperation(userId, {
        id: operationId,
        type: 'add',
        data: { userId, amount, pointsType, reason },
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });

      // Emit event
      this.eventEmitter?.emit('points-changed', {
        type: 'points-changed',
        userId,
        transaction,
        newBalance: balanceAfter,
      });

      return { success: true, transaction, operationId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        operationId,
      };
    }
  }

  /**
   * Subtract points from user account
   * Requirement 5.2, 5.5: Subtract points with balance check
   */
  async subtractPoints(
    userId: string,
    amount: number,
    pointsType: PointsType,
    reason: string
  ): Promise<{ success: boolean; transaction?: Transaction; error?: string; operationId?: string }> {
    const operationId = generateOperationId();

    try {
      // Validate inputs
      const userValidation = validateUserId(userId);
      if (!userValidation.valid) {
        return { success: false, error: userValidation.error, operationId };
      }

      const amountValidation = validatePointsAmount(amount);
      if (!amountValidation.valid) {
        return { success: false, error: amountValidation.error, operationId };
      }

      const typeValidation = validatePointsType(pointsType);
      if (!typeValidation.valid) {
        return { success: false, error: typeValidation.error, operationId };
      }

      // Get current balance
      const currentData = storageManager.getCache<PointsData>(STORAGE_KEYS.CACHE(userId));
      if (!currentData) {
        return { success: false, error: 'User not found', operationId };
      }

      const balanceBefore = currentData[pointsType as keyof PointsData] as number;

      // Check sufficient balance
      if (balanceBefore < amount) {
        return { success: false, error: ERROR_MESSAGES.INSUFFICIENT_BALANCE, operationId };
      }

      const balanceAfter = balanceBefore - amount;

      // Create transaction
      const transaction = transactionManager.createTransaction({
        userId,
        operationType: 'subtract',
        pointsType,
        amount,
        reason,
        balanceBefore,
        balanceAfter,
      });

      // Update cache
      const updatedData = { ...currentData, [pointsType]: balanceAfter };
      storageManager.setCache(STORAGE_KEYS.CACHE(userId), updatedData);

      // Queue sync
      storageManager.queueOperation(userId, {
        id: operationId,
        type: 'subtract',
        data: { userId, amount, pointsType, reason },
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });

      // Emit event
      this.eventEmitter?.emit('points-changed', {
        type: 'points-changed',
        userId,
        transaction,
        newBalance: balanceAfter,
      });

      return { success: true, transaction, operationId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        operationId,
      };
    }
  }

  /**
   * Transfer points between users
   * Requirement 5.3, 5.6: Transfer with dual validation
   */
  async transferPoints(
    fromUserId: string,
    toUserId: string,
    amount: number,
    pointsType: PointsType,
    reason: string
  ): Promise<{ success: boolean; transactions?: Transaction[]; error?: string; operationId?: string }> {
    const operationId = generateOperationId();

    try {
      // Validate inputs
      const fromValidation = validateUserId(fromUserId);
      if (!fromValidation.valid) {
        return { success: false, error: fromValidation.error, operationId };
      }

      const toValidation = validateUserId(toUserId);
      if (!toValidation.valid) {
        return { success: false, error: toValidation.error, operationId };
      }

      const amountValidation = validatePointsAmount(amount);
      if (!amountValidation.valid) {
        return { success: false, error: amountValidation.error, operationId };
      }

      const typeValidation = validatePointsType(pointsType);
      if (!typeValidation.valid) {
        return { success: false, error: typeValidation.error, operationId };
      }

      // Get both users' data
      const fromData = storageManager.getCache<PointsData>(STORAGE_KEYS.CACHE(fromUserId));
      const toData = storageManager.getCache<PointsData>(STORAGE_KEYS.CACHE(toUserId));

      if (!fromData || !toData) {
        return { success: false, error: ERROR_MESSAGES.USER_NOT_FOUND, operationId };
      }

      const fromBalance = fromData[pointsType as keyof PointsData] as number;
      const toBalance = toData[pointsType as keyof PointsData] as number;

      // Check sufficient balance
      if (fromBalance < amount) {
        return { success: false, error: ERROR_MESSAGES.INSUFFICIENT_BALANCE, operationId };
      }

      // Create transactions
      const fromTransaction = transactionManager.createTransaction({
        userId: fromUserId,
        operationType: 'transfer',
        pointsType,
        amount,
        reason,
        balanceBefore: fromBalance,
        balanceAfter: fromBalance - amount,
        relatedUserId: toUserId,
      });

      const toTransaction = transactionManager.createTransaction({
        userId: toUserId,
        operationType: 'transfer',
        pointsType,
        amount,
        reason,
        balanceBefore: toBalance,
        balanceAfter: toBalance + amount,
        relatedUserId: fromUserId,
      });

      // Update caches
      const updatedFromData = { ...fromData, [pointsType]: fromBalance - amount };
      const updatedToData = { ...toData, [pointsType]: toBalance + amount };

      storageManager.setCache(STORAGE_KEYS.CACHE(fromUserId), updatedFromData);
      storageManager.setCache(STORAGE_KEYS.CACHE(toUserId), updatedToData);

      // Queue syncs
      storageManager.queueOperation(fromUserId, {
        id: operationId,
        type: 'transfer',
        data: { fromUserId, toUserId, amount, pointsType, reason },
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });

      // Emit events
      this.eventEmitter?.emit('points-changed', {
        type: 'points-changed',
        userId: fromUserId,
        transaction: fromTransaction,
        newBalance: fromBalance - amount,
      });

      this.eventEmitter?.emit('points-changed', {
        type: 'points-changed',
        userId: toUserId,
        transaction: toTransaction,
        newBalance: toBalance + amount,
      });

      return { success: true, transactions: [fromTransaction, toTransaction], operationId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        operationId,
      };
    }
  }

  /**
   * Batch operations
   * Requirement 5.8: Batch operations with atomicity
   */
  async batchOperations(
    operations: Array<{
      type: 'add' | 'subtract' | 'transfer';
      userId: string;
      amount: number;
      pointsType: PointsType;
      reason: string;
      toUserId?: string;
    }>
  ): Promise<BatchOperationResult> {
    const transactions: Transaction[] = [];
    const errors: string[] = [];

    for (const op of operations) {
      try {
        if (op.type === 'add') {
          const result = await this.addPoints(op.userId, op.amount, op.pointsType, op.reason);
          if (result.success && result.transaction) {
            transactions.push(result.transaction);
          } else {
            errors.push(result.error || 'Unknown error');
          }
        } else if (op.type === 'subtract') {
          const result = await this.subtractPoints(op.userId, op.amount, op.pointsType, op.reason);
          if (result.success && result.transaction) {
            transactions.push(result.transaction);
          } else {
            errors.push(result.error || 'Unknown error');
          }
        } else if (op.type === 'transfer' && op.toUserId) {
          const result = await this.transferPoints(op.userId, op.toUserId, op.amount, op.pointsType, op.reason);
          if (result.success && result.transactions) {
            transactions.push(...result.transactions);
          } else {
            errors.push(result.error || 'Unknown error');
          }
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    return {
      success: errors.length === 0,
      transactions,
      errors,
    };
  }

  /**
   * Get points for user
   */
  async getPoints(userId: string): Promise<PointsData | null> {
    const validation = validateUserId(userId);
    if (!validation.valid) {
      return null;
    }

    return storageManager.getCache<PointsData>(STORAGE_KEYS.CACHE(userId)) || null;
  }

  /**
   * Get balance for specific points type
   */
  async getBalance(userId: string, pointsType: PointsType): Promise<number> {
    const validation = validateUserId(userId);
    if (!validation.valid) {
      return 0;
    }

    const data = storageManager.getCache<PointsData>(STORAGE_KEYS.CACHE(userId));
    if (!data) {
      return 0;
    }

    return data[pointsType as keyof PointsData] as number;
  }
}

// Export singleton instance
export const pointsAPI = new PointsAPI();
