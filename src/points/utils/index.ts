/**
 * Unified Points System - Utility Functions
 * Helper functions for the points system
 */

import { v4 as uuidv4 } from 'uuid';
import { PointsType, UserLevel } from '../types';
import { LEVEL_THRESHOLDS, VALIDATION } from '../constants';

/**
 * Generate a unique operation ID for debugging
 */
export function generateOperationId(): string {
  return `op_${uuidv4()}`;
}

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(): string {
  return `tx_${uuidv4()}`;
}

/**
 * Validate points amount
 */
export function validatePointsAmount(amount: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { valid: false, error: 'Amount must be a positive integer' };
  }
  if (amount > VALIDATION.MAX_POINTS_AMOUNT) {
    return { valid: false, error: `Amount cannot exceed ${VALIDATION.MAX_POINTS_AMOUNT}` };
  }
  return { valid: true };
}

/**
 * Validate points type
 */
export function validatePointsType(type: string): { valid: boolean; error?: string } {
  if (!VALIDATION.VALID_POINTS_TYPES.includes(type as PointsType)) {
    return { valid: false, error: `Invalid points type: ${type}` };
  }
  return { valid: true };
}

/**
 * Validate user ID
 */
export function validateUserId(userId: string): { valid: boolean; error?: string } {
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return { valid: false, error: 'Invalid user ID' };
  }
  return { valid: true };
}

/**
 * Calculate level based on total points
 */
export function calculateLevel(totalPoints: number): UserLevel {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalPoints >= threshold.minPoints && totalPoints <= threshold.maxPoints) {
      return threshold.level;
    }
  }
  return 'Bronze'; // default fallback
}

/**
 * Get level threshold info
 */
export function getLevelThreshold(level: UserLevel) {
  return LEVEL_THRESHOLDS.find((t) => t.level === level);
}

/**
 * Check if points cross a level threshold
 */
export function checkLevelThreshold(oldPoints: number, newPoints: number): { leveledUp: boolean; newLevel?: UserLevel } {
  const oldLevel = calculateLevel(oldPoints);
  const newLevel = calculateLevel(newPoints);

  if (oldLevel !== newLevel) {
    return { leveledUp: true, newLevel };
  }

  return { leveledUp: false };
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parse ISO timestamp
 */
export function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * Check if cache is expired
 */
export function isCacheExpired(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp > ttl;
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  delays: number[] = [1000, 2000, 4000, 8000, 16000],
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < delays.length) {
        onRetry?.(attempt + 1, lastError);
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if two objects are equal
 */
export function isEqual<T>(obj1: T, obj2: T): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Merge objects (shallow merge)
 */
export function merge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}

/**
 * Format points for display
 */
export function formatPoints(points: number): string {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
