/**
 * Unified Points System - Core Type Definitions
 * Defines all TypeScript interfaces and types for the points system
 */

// ============================================================================
// Points Type System
// ============================================================================

export type PointsType = 'alpha' | 'rewards' | 'balance';

export interface PointsTypeMetadata {
  type: PointsType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface PointsData {
  userId: string;
  alpha: number;
  rewards: number;
  balance: number;
  lastUpdated: string;
}

// ============================================================================
// Transaction System
// ============================================================================

export type OperationType = 'add' | 'subtract' | 'transfer' | 'achievement_bonus' | 'level_bonus' | 'migration';

export interface Transaction {
  id: string;
  userId: string;
  operationType: OperationType;
  pointsType: PointsType;
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;
  relatedUserId?: string; // for transfers
}

export interface TransactionFilter {
  pointsType?: PointsType;
  operationType?: OperationType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Achievement System
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsThreshold: number;
  rewardPoints: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

// ============================================================================
// Level System
// ============================================================================

export type UserLevel = 'Bronze' | 'Silver' | 'Gold';

export interface LevelThreshold {
  level: UserLevel;
  minPoints: number;
  maxPoints: number;
  bonusPoints: number;
}

export interface UserLevelData {
  userId: string;
  currentLevel: UserLevel;
  totalPoints: number;
  lastLevelUpAt?: string;
}

// ============================================================================
// Sync System
// ============================================================================

export type SyncState = 'syncing' | 'synced' | 'error' | 'offline';

export interface SyncOperation {
  id: string;
  type: 'add' | 'subtract' | 'transfer';
  data: any;
  timestamp: string;
  retryCount: number;
}

// ============================================================================
// Migration System
// ============================================================================

export interface MigrationData {
  alphaPoints: number;
  rewardPoints: number;
  platformBalance: number;
  achievements: Array<{ id: string; unlockedAt: string }>;
}

export interface MigrationResult {
  success: boolean;
  migratedRecords: number;
  transactionsCreated: number;
  error?: string;
}

// ============================================================================
// Event System
// ============================================================================

export type EventType = 'points-changed' | 'achievement-unlocked' | 'level-up' | 'sync-complete' | 'sync-error' | 'offline' | 'online';

export interface PointsChangedEvent {
  type: 'points-changed';
  userId: string;
  transaction: Transaction;
  newBalance: number;
}

export interface AchievementUnlockedEvent {
  type: 'achievement-unlocked';
  userId: string;
  achievement: Achievement;
  bonusPoints: number;
}

export interface LevelUpEvent {
  type: 'level-up';
  userId: string;
  newLevel: UserLevel;
  bonusPoints: number;
}

export interface SyncCompleteEvent {
  type: 'sync-complete';
  userId: string;
  timestamp: string;
}

export interface SyncErrorEvent {
  type: 'sync-error';
  userId: string;
  error: string;
  timestamp: string;
}

export type PointsEvent = PointsChangedEvent | AchievementUnlockedEvent | LevelUpEvent | SyncCompleteEvent | SyncErrorEvent;

// ============================================================================
// Error Handling
// ============================================================================

export enum ErrorCode {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_POINTS_TYPE = 'INVALID_POINTS_TYPE',
  SYNC_FAILED = 'SYNC_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_OPERATION = 'DUPLICATE_OPERATION',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    operationId: string;
    timestamp: string;
    context?: Record<string, any>;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface AddPointsResponse {
  success: boolean;
  transaction?: Transaction;
  error?: string;
  operationId?: string;
}

export interface SubtractPointsResponse {
  success: boolean;
  transaction?: Transaction;
  error?: string;
  operationId?: string;
}

export interface TransferPointsResponse {
  success: boolean;
  transactions?: Transaction[];
  error?: string;
  operationId?: string;
}

export interface BatchOperationResult {
  success: boolean;
  transactions: Transaction[];
  errors: string[];
}

// ============================================================================
// Cache and Storage
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface StorageData {
  cache: Record<string, CacheEntry<any>>;
  queue: SyncOperation[];
  migrationStatus: Record<string, boolean>;
}
