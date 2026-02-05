/**
 * Unified Points System - Constants
 * Defines all constants used throughout the points system
 */

import { PointsTypeMetadata, LevelThreshold, Achievement } from '../types';

// ============================================================================
// Points Type Metadata
// ============================================================================

export const POINTS_TYPE_METADATA: Record<string, PointsTypeMetadata> = {
  alpha: {
    type: 'alpha',
    name: 'Alpha Points',
    description: 'Points earned through staking and lock-up periods',
    icon: '⚡',
    color: '#FF6B6B',
  },
  rewards: {
    type: 'rewards',
    name: 'Reward Points',
    description: 'Points earned through daily activities and challenges',
    icon: '🎁',
    color: '#4ECDC4',
  },
  balance: {
    type: 'balance',
    name: 'Platform Balance',
    description: 'User account balance for platform transactions',
    icon: '💰',
    color: '#45B7D1',
  },
};

// ============================================================================
// Level Thresholds
// ============================================================================

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  {
    level: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    bonusPoints: 100,
  },
  {
    level: 'Silver',
    minPoints: 500,
    maxPoints: 1999,
    bonusPoints: 100,
  },
  {
    level: 'Gold',
    minPoints: 2000,
    maxPoints: Infinity,
    bonusPoints: 100,
  },
];

// ============================================================================
// Default Achievements
// ============================================================================

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-points',
    name: 'First Steps',
    description: 'Earn your first 100 points',
    icon: '🎯',
    pointsThreshold: 100,
    rewardPoints: 10,
  },
  {
    id: 'hundred-points',
    name: 'Century',
    description: 'Reach 100 points',
    icon: '💯',
    pointsThreshold: 100,
    rewardPoints: 25,
  },
  {
    id: 'five-hundred-points',
    name: 'Silver Milestone',
    description: 'Reach 500 points',
    icon: '🥈',
    pointsThreshold: 500,
    rewardPoints: 50,
  },
  {
    id: 'two-thousand-points',
    name: 'Gold Milestone',
    description: 'Reach 2000 points',
    icon: '🥇',
    pointsThreshold: 2000,
    rewardPoints: 100,
  },
  {
    id: 'five-thousand-points',
    name: 'Platinum Milestone',
    description: 'Reach 5000 points',
    icon: '💎',
    pointsThreshold: 5000,
    rewardPoints: 200,
  },
];

// ============================================================================
// Cache Configuration
// ============================================================================

export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const SYNC_RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // exponential backoff
export const CIRCUIT_BREAKER_THRESHOLD = 5; // failures before circuit opens
export const CIRCUIT_BREAKER_TIMEOUT = 60000; // 60 seconds

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  CACHE: (userId: string) => `points:cache:${userId}`,
  QUEUE: (userId: string) => `points:queue:${userId}`,
  MIGRATED: (userId: string) => `points:migrated:${userId}`,
  SYNC_STATE: (userId: string) => `points:sync-state:${userId}`,
};

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
  MIN_POINTS_AMOUNT: 0,
  MAX_POINTS_AMOUNT: 1000000000, // 1 billion
  VALID_POINTS_TYPES: ['alpha', 'rewards', 'balance'] as const,
};

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  INVALID_AMOUNT: 'Amount must be greater than 0',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this operation',
  USER_NOT_FOUND: 'User not found',
  INVALID_POINTS_TYPE: 'Invalid points type',
  SYNC_FAILED: 'Failed to sync with Supabase',
  NETWORK_ERROR: 'Network error occurred',
  VALIDATION_ERROR: 'Validation error',
  DUPLICATE_OPERATION: 'Duplicate operation detected',
  UNAUTHORIZED: 'Unauthorized access',
  INTERNAL_ERROR: 'Internal server error',
};
