/**
 * Unit Tests for TransactionManager
 * Tests transaction creation, history, and immutability
 */

import { TransactionManager } from '../../services/TransactionManager';
import { Transaction } from '../../types';

describe('TransactionManager', () => {
  let manager: TransactionManager;

  beforeEach(() => {
    manager = new TransactionManager();
  });

  describe('createTransaction', () => {
    it('should create transaction with all required fields', () => {
      const tx = manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Daily bonus',
        balanceBefore: 0,
        balanceAfter: 100,
      });

      expect(tx).toHaveProperty('id');
      expect(tx).toHaveProperty('timestamp');
      expect(tx.userId).toBe('user-1');
      expect(tx.operationType).toBe('add');
      expect(tx.pointsType).toBe('rewards');
      expect(tx.amount).toBe(100);
      expect(tx.reason).toBe('Daily bonus');
      expect(tx.balanceBefore).toBe(0);
      expect(tx.balanceAfter).toBe(100);
    });

    it('should generate unique transaction IDs', () => {
      const tx1 = manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Bonus 1',
        balanceBefore: 0,
        balanceAfter: 100,
      });

      const tx2 = manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 50,
        reason: 'Bonus 2',
        balanceBefore: 100,
        balanceAfter: 150,
      });

      expect(tx1.id).not.toBe(tx2.id);
    });

    it('should set timestamp automatically', () => {
      const before = new Date();
      const tx = manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Bonus',
        balanceBefore: 0,
        balanceAfter: 100,
      });
      const after = new Date();

      const txTime = new Date(tx.timestamp);
      expect(txTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(txTime.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('getTransaction', () => {
    it('should retrieve transaction by ID', () => {
      const created = manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Bonus',
        balanceBefore: 0,
        balanceAfter: 100,
      });

      const retrieved = manager.getTransaction(created.id);
      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent transaction', () => {
      expect(manager.getTransaction('non-existent')).toBeNull();
    });
  });

  describe('getHistory', () => {
    it('should return all transactions for user', () => {
      manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Bonus 1',
        balanceBefore: 0,
        balanceAfter: 100,
      });

      manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 50,
        reason: 'Bonus 2',
        balanceBefore: 100,
        balanceAfter: 150,
      });

      const history = manager.getHistory('user-1');
      expect(history).toHaveLength(2);
    });

    it('should return empty array for user with no transactions', () => {
      expect(manager.getHistory('user-2')).toHaveLength(0);
    });

    it('should sort transactions by timestamp descending', () => {
      const tx1 = manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Bonus 1',
        balanceBefore: 0,
        balanceAfter: 100,
      });

      // Simulate time passing
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      const tx2 = manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 50,
        reason: 'Bonus 2',
        balanceBefore: 100,
        balanceAfter: 150,
      });

      jest.useRealTimers();

      const history = manager.getHistory('user-1');
      expect(history[0].id).toBe(tx2.id);
      expect(history[1].id).toBe(tx1.id);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Bonus',
        balanceBefore: 0,
        balanceAfter: 100,
      });

      manager.createTransaction({
        userId: 'user-1',
        operationType: 'subtract',
        pointsType: 'balance',
        amount: 50,
        reason: 'Purchase',
        balanceBefore: 100,
        balanceAfter: 50,
      });

      manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'alpha',
        amount: 200,
        reason: 'Staking',
        balanceBefore: 0,
        balanceAfter: 200,
      });
    });

    it('should filter by points type', () => {
      const filtered = manager.getHistory('user-1', { pointsType: 'rewards' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].pointsType).toBe('rewards');
    });

    it('should filter by operation type', () => {
      const filtered = manager.getHistory('user-1', { operationType: 'add' });
      expect(filtered).toHaveLength(2);
      filtered.forEach((tx) => {
        expect(tx.operationType).toBe('add');
      });
    });

    it('should filter by date range', () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 60000).toISOString();
      const endDate = new Date(now.getTime() + 60000).toISOString();

      const filtered = manager.getHistory('user-1', { startDate, endDate });
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should combine multiple filters', () => {
      const filtered = manager.getHistory('user-1', {
        pointsType: 'rewards',
        operationType: 'add',
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].pointsType).toBe('rewards');
      expect(filtered[0].operationType).toBe('add');
    });
  });

  describe('Immutability', () => {
    it('should prevent transaction modification', () => {
      const tx = manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Bonus',
        balanceBefore: 0,
        balanceAfter: 100,
      });

      expect(() => {
        manager.updateTransaction(tx.id, { amount: 200 });
      }).toThrow();
    });

    it('should prevent transaction deletion', () => {
      const tx = manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Bonus',
        balanceBefore: 0,
        balanceAfter: 100,
      });

      expect(() => {
        manager.deleteTransaction(tx.id);
      }).toThrow();
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Bonus',
        balanceBefore: 0,
        balanceAfter: 100,
      });

      manager.createTransaction({
        userId: 'user-1',
        operationType: 'subtract',
        pointsType: 'rewards',
        amount: 30,
        reason: 'Penalty',
        balanceBefore: 100,
        balanceAfter: 70,
      });

      manager.createTransaction({
        userId: 'user-1',
        operationType: 'add',
        pointsType: 'alpha',
        amount: 200,
        reason: 'Staking',
        balanceBefore: 0,
        balanceAfter: 200,
      });
    });

    it('should get transaction count', () => {
      expect(manager.getTransactionCount('user-1')).toBe(3);
    });

    it('should get total points added', () => {
      expect(manager.getTotalPointsAdded('user-1')).toBe(300);
    });

    it('should get total points subtracted', () => {
      expect(manager.getTotalPointsSubtracted('user-1')).toBe(30);
    });

    it('should get statistics', () => {
      const stats = manager.getStatistics('user-1');
      expect(stats.totalTransactions).toBe(3);
      expect(stats.totalAdded).toBe(300);
      expect(stats.totalSubtracted).toBe(30);
      expect(stats.byType.rewards.added).toBe(100);
      expect(stats.byType.rewards.subtracted).toBe(30);
      expect(stats.byType.alpha.added).toBe(200);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      for (let i = 0; i < 10; i++) {
        manager.createTransaction({
          userId: 'user-1',
          operationType: 'add',
          pointsType: 'rewards',
          amount: 10 * (i + 1),
          reason: `Bonus ${i + 1}`,
          balanceBefore: 0,
          balanceAfter: 10 * (i + 1),
        });
      }
    });

    it('should paginate results', () => {
      const page1 = manager.getPaginatedHistory('user-1', { limit: 3 });
      expect(page1).toHaveLength(3);

      const page2 = manager.getPaginatedHistory('user-1', { limit: 3, offset: 3 });
      expect(page2).toHaveLength(3);

      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });

  describe('Transfer Transactions', () => {
    it('should track transfer with related user ID', () => {
      const tx = manager.createTransaction({
        userId: 'user-1',
        operationType: 'transfer',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Gift',
        balanceBefore: 200,
        balanceAfter: 100,
        relatedUserId: 'user-2',
      });

      expect(tx.relatedUserId).toBe('user-2');
    });

    it('should get total points transferred out', () => {
      manager.createTransaction({
        userId: 'user-1',
        operationType: 'transfer',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Gift 1',
        balanceBefore: 200,
        balanceAfter: 100,
        relatedUserId: 'user-2',
      });

      manager.createTransaction({
        userId: 'user-1',
        operationType: 'transfer',
        pointsType: 'rewards',
        amount: 50,
        reason: 'Gift 2',
        balanceBefore: 100,
        balanceAfter: 50,
        relatedUserId: 'user-3',
      });

      expect(manager.getTotalPointsTransferredOut('user-1')).toBe(150);
    });

    it('should get total points transferred in', () => {
      manager.createTransaction({
        userId: 'user-1',
        operationType: 'transfer',
        pointsType: 'rewards',
        amount: 100,
        reason: 'Gift from user-2',
        balanceBefore: 0,
        balanceAfter: 100,
        relatedUserId: 'user-2',
      });

      manager.createTransaction({
        userId: 'user-1',
        operationType: 'transfer',
        pointsType: 'rewards',
        amount: 50,
        reason: 'Gift from user-3',
        balanceBefore: 100,
        balanceAfter: 150,
        relatedUserId: 'user-3',
      });

      expect(manager.getTotalPointsTransferredIn('user-1')).toBe(150);
    });
  });
});
