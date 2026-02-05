/**
 * Transaction Manager Service
 * Manages transaction creation, history, and immutability
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { Transaction, TransactionFilter, OperationType, PointsType } from '../types';
import { generateTransactionId, getCurrentTimestamp } from '../utils';

export class TransactionManager {
  private transactions: Map<string, Transaction> = new Map();
  private userTransactions: Map<string, string[]> = new Map(); // userId -> transactionIds
  private readonly immutableTransactions: Set<string> = new Set();

  /**
   * Create a new transaction
   * Requirement 3.1, 3.2: Creates immutable transaction record with all required fields
   */
  createTransaction(data: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const transaction: Transaction = {
      ...data,
      id: generateTransactionId(),
      timestamp: getCurrentTimestamp(),
    };

    // Store transaction
    this.transactions.set(transaction.id, transaction);
    this.immutableTransactions.add(transaction.id);

    // Index by user
    if (!this.userTransactions.has(transaction.userId)) {
      this.userTransactions.set(transaction.userId, []);
    }
    this.userTransactions.get(transaction.userId)!.push(transaction.id);

    return transaction;
  }

  /**
   * Get transaction by ID
   */
  getTransaction(id: string): Transaction | null {
    return this.transactions.get(id) || null;
  }

  /**
   * Get transaction history for a user
   * Requirement 3.3: Returns records sorted by timestamp descending
   */
  getHistory(userId: string, filter?: TransactionFilter): Transaction[] {
    const transactionIds = this.userTransactions.get(userId) || [];
    let transactions = transactionIds
      .map((id) => this.transactions.get(id)!)
      .filter((tx) => tx !== undefined);

    // Apply filters
    if (filter) {
      transactions = this.applyFilters(transactions, filter);
    }

    // Sort by timestamp descending
    transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return transactions;
  }

  /**
   * Apply filters to transactions
   * Requirement 3.4: Support filtering by points_type, operation_type, date_range
   */
  private applyFilters(transactions: Transaction[], filter: TransactionFilter): Transaction[] {
    return transactions.filter((tx) => {
      // Filter by points type
      if (filter.pointsType && tx.pointsType !== filter.pointsType) {
        return false;
      }

      // Filter by operation type
      if (filter.operationType && tx.operationType !== filter.operationType) {
        return false;
      }

      // Filter by date range
      if (filter.startDate) {
        const startDate = new Date(filter.startDate).getTime();
        if (new Date(tx.timestamp).getTime() < startDate) {
          return false;
        }
      }

      if (filter.endDate) {
        const endDate = new Date(filter.endDate).getTime();
        if (new Date(tx.timestamp).getTime() > endDate) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get paginated history
   */
  getPaginatedHistory(userId: string, filter?: TransactionFilter): Transaction[] {
    let transactions = this.getHistory(userId, filter);

    // Apply pagination
    if (filter?.offset) {
      transactions = transactions.slice(filter.offset);
    }

    if (filter?.limit) {
      transactions = transactions.slice(0, filter.limit);
    }

    return transactions;
  }

  /**
   * Attempt to modify transaction (should fail)
   * Requirement 3.5: Prevent modification of historical transaction records
   */
  updateTransaction(id: string, data: Partial<Transaction>): boolean {
    if (this.immutableTransactions.has(id)) {
      throw new Error(`Cannot modify immutable transaction: ${id}`);
    }
    return false;
  }

  /**
   * Attempt to delete transaction (should fail)
   * Requirement 3.5: Prevent deletion of historical transaction records
   */
  deleteTransaction(id: string): boolean {
    if (this.immutableTransactions.has(id)) {
      throw new Error(`Cannot delete immutable transaction: ${id}`);
    }
    return false;
  }

  /**
   * Get transaction count for user
   */
  getTransactionCount(userId: string): number {
    return this.userTransactions.get(userId)?.length || 0;
  }

  /**
   * Get transactions by operation type
   */
  getTransactionsByType(userId: string, operationType: OperationType): Transaction[] {
    return this.getHistory(userId, { operationType });
  }

  /**
   * Get transactions by points type
   */
  getTransactionsByPointsType(userId: string, pointsType: PointsType): Transaction[] {
    return this.getHistory(userId, { pointsType });
  }

  /**
   * Get transactions in date range
   */
  getTransactionsByDateRange(userId: string, startDate: string, endDate: string): Transaction[] {
    return this.getHistory(userId, { startDate, endDate });
  }

  /**
   * Get total points added for user
   */
  getTotalPointsAdded(userId: string, pointsType?: PointsType): number {
    const transactions = this.getHistory(userId, { operationType: 'add', pointsType });
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Get total points subtracted for user
   */
  getTotalPointsSubtracted(userId: string, pointsType?: PointsType): number {
    const transactions = this.getHistory(userId, { operationType: 'subtract', pointsType });
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Get total points transferred out
   */
  getTotalPointsTransferredOut(userId: string, pointsType?: PointsType): number {
    const transactions = this.getHistory(userId, { operationType: 'transfer', pointsType });
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Get total points transferred in
   */
  getTotalPointsTransferredIn(userId: string, pointsType?: PointsType): number {
    const transactions = Array.from(this.transactions.values()).filter(
      (tx) => tx.relatedUserId === userId && tx.operationType === 'transfer' && (!pointsType || tx.pointsType === pointsType)
    );
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Get transaction statistics
   */
  getStatistics(userId: string): {
    totalTransactions: number;
    totalAdded: number;
    totalSubtracted: number;
    totalTransferredOut: number;
    totalTransferredIn: number;
    byType: Record<PointsType, { added: number; subtracted: number }>;
  } {
    const transactions = this.getHistory(userId);

    const stats = {
      totalTransactions: transactions.length,
      totalAdded: this.getTotalPointsAdded(userId),
      totalSubtracted: this.getTotalPointsSubtracted(userId),
      totalTransferredOut: this.getTotalPointsTransferredOut(userId),
      totalTransferredIn: this.getTotalPointsTransferredIn(userId),
      byType: {
        alpha: {
          added: this.getTotalPointsAdded(userId, 'alpha'),
          subtracted: this.getTotalPointsSubtracted(userId, 'alpha'),
        },
        rewards: {
          added: this.getTotalPointsAdded(userId, 'rewards'),
          subtracted: this.getTotalPointsSubtracted(userId, 'rewards'),
        },
        balance: {
          added: this.getTotalPointsAdded(userId, 'balance'),
          subtracted: this.getTotalPointsSubtracted(userId, 'balance'),
        },
      },
    };

    return stats;
  }

  /**
   * Clear all transactions (for testing)
   */
  clearAll(): void {
    this.transactions.clear();
    this.userTransactions.clear();
    this.immutableTransactions.clear();
  }

  /**
   * Get all transactions (for debugging)
   */
  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Export transactions for a user
   */
  exportUserTransactions(userId: string): Transaction[] {
    return this.getHistory(userId);
  }
}

// Export singleton instance
export const transactionManager = new TransactionManager();
