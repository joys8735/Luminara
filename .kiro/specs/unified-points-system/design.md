# Design Document: Unified Points System

## Overview

The Unified Points System consolidates three separate point types (Alpha Points, Reward Points, Platform Balance) into a single, coherent system with Supabase backend synchronization, comprehensive transaction history, achievements, and level progression. The system provides:

- **Unified Type System**: Single interface for all point types with consistent metadata
- **Supabase Sync**: Real-time synchronization across devices with conflict resolution
- **Transaction History**: Immutable audit trail of all operations
- **Achievements & Levels**: Gamification with automatic unlock and level-up bonuses
- **Robust API**: Add, subtract, transfer operations with validation and error handling
- **Data Migration**: Seamless migration from localStorage to Supabase
- **Offline Support**: Queue operations when offline, sync when connection restored
- **Real-time Events**: Emit events for UI updates and external integrations

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│              (usePoints, useAchievements, etc.)              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Points Manager (Core Logic)                     │
│  ├─ Points Operations (add, subtract, transfer)             │
│  ├─ Achievement System                                       │
│  ├─ Level Calculation                                        │
│  └─ Event Emission                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐    ┌────────▼──────────┐
│  Local Storage   │    │  Supabase Client  │
│  ├─ Cache       │    │  ├─ Points Table  │
│  ├─ Queue       │    │  ├─ Transactions  │
│  └─ Backup      │    │  ├─ Achievements │
└──────────────────┘    │  └─ Real-time Sub│
                        └───────────────────┘
```

### Component Architecture

**Points Manager**: Central orchestrator managing all point operations
- Validates operations
- Updates local cache
- Queues Supabase operations
- Emits events
- Handles offline scenarios

**Storage Layer**: Dual-layer persistence
- Memory cache (5-minute TTL)
- localStorage backup
- Supabase as source of truth

**Sync Engine**: Handles Supabase synchronization
- Queues operations when offline
- Retries with exponential backoff
- Resolves conflicts (server-as-source)
- Maintains sync state

**Achievement Engine**: Tracks achievements and levels
- Monitors point thresholds
- Unlocks achievements
- Calculates levels
- Awards bonuses

## Components and Interfaces

### 1. Points Type System

```typescript
type PointsType = 'alpha' | 'rewards' | 'balance';

interface PointsTypeMetadata {
  type: PointsType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface PointsData {
  userId: string;
  alpha: number;
  rewards: number;
  balance: number;
  lastUpdated: string;
}

interface PointsTypeSystem {
  getMetadata(type: PointsType): PointsTypeMetadata;
  isValidType(type: string): boolean;
  getAllTypes(): PointsTypeMetadata[];
}
```

### 2. Transaction System

```typescript
type OperationType = 'add' | 'subtract' | 'transfer' | 'achievement_bonus' | 'level_bonus' | 'migration';

interface Transaction {
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

interface TransactionFilter {
  pointsType?: PointsType;
  operationType?: OperationType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface TransactionSystem {
  createTransaction(data: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction>;
  getHistory(userId: string, filter?: TransactionFilter): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | null>;
}
```

### 3. Achievement System

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsThreshold: number;
  rewardPoints: number;
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

interface AchievementSystem {
  defineAchievements(achievements: Achievement[]): void;
  getAchievements(): Achievement[];
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  checkAndUnlockAchievements(userId: string, totalPoints: number): Promise<Achievement[]>;
}
```

### 4. Level System

```typescript
interface LevelThreshold {
  level: 'Bronze' | 'Silver' | 'Gold';
  minPoints: number;
  maxPoints: number;
  bonusPoints: number;
}

interface UserLevel {
  userId: string;
  currentLevel: 'Bronze' | 'Silver' | 'Gold';
  totalPoints: number;
  lastLevelUpAt?: string;
}

interface LevelSystem {
  calculateLevel(totalPoints: number): 'Bronze' | 'Silver' | 'Gold';
  getLevelThresholds(): LevelThreshold[];
  getUserLevel(userId: string): Promise<UserLevel>;
  checkLevelUp(userId: string, newTotalPoints: number): Promise<{ leveledUp: boolean; newLevel: string; bonusPoints: number }>;
}
```

### 5. Points API

```typescript
interface PointsAPI {
  // Core operations
  addPoints(userId: string, amount: number, pointsType: PointsType, reason: string): Promise<{ success: boolean; transaction: Transaction; error?: string }>;
  
  subtractPoints(userId: string, amount: number, pointsType: PointsType, reason: string): Promise<{ success: boolean; transaction: Transaction; error?: string }>;
  
  transferPoints(fromUserId: string, toUserId: string, amount: number, pointsType: PointsType, reason: string): Promise<{ success: boolean; transactions: Transaction[]; error?: string }>;
  
  // Batch operations
  batchOperations(operations: Array<{ type: 'add' | 'subtract' | 'transfer'; userId: string; amount: number; pointsType: PointsType; reason: string; toUserId?: string }>): Promise<{ success: boolean; transactions: Transaction[]; errors: string[] }>;
  
  // Query operations
  getPoints(userId: string): Promise<PointsData>;
  
  getBalance(userId: string, pointsType: PointsType): Promise<number>;
}
```

### 6. Sync Engine

```typescript
type SyncState = 'syncing' | 'synced' | 'error' | 'offline';

interface SyncOperation {
  id: string;
  type: 'add' | 'subtract' | 'transfer';
  data: any;
  timestamp: string;
  retryCount: number;
}

interface SyncEngine {
  // Sync operations
  syncToSupabase(userId: string): Promise<{ success: boolean; error?: string }>;
  
  queueOperation(operation: SyncOperation): void;
  
  processQueue(userId: string): Promise<{ processed: number; failed: number }>;
  
  // State management
  getSyncState(userId: string): SyncState;
  
  setSyncState(userId: string, state: SyncState): void;
  
  // Conflict resolution
  resolveConflict(local: PointsData, remote: PointsData): PointsData;
}
```

### 7. Migration System

```typescript
interface MigrationData {
  alphaPoints: number;
  rewardPoints: number;
  platformBalance: number;
  achievements: Array<{ id: string; unlockedAt: string }>;
}

interface MigrationResult {
  success: boolean;
  migratedRecords: number;
  transactionsCreated: number;
  error?: string;
}

interface MigrationSystem {
  readFromLocalStorage(userId: string): Promise<MigrationData | null>;
  
  validateData(data: MigrationData): { valid: boolean; errors: string[] };
  
  migrateToSupabase(userId: string, data: MigrationData): Promise<MigrationResult>;
  
  isMigrated(userId: string): Promise<boolean>;
  
  markAsMigrated(userId: string): Promise<void>;
}
```

### 8. Event System

```typescript
type EventType = 'points-changed' | 'achievement-unlocked' | 'level-up' | 'sync-complete' | 'sync-error' | 'offline' | 'online';

interface PointsChangedEvent {
  type: 'points-changed';
  userId: string;
  transaction: Transaction;
  newBalance: number;
}

interface AchievementUnlockedEvent {
  type: 'achievement-unlocked';
  userId: string;
  achievement: Achievement;
  bonusPoints: number;
}

interface LevelUpEvent {
  type: 'level-up';
  userId: string;
  newLevel: string;
  bonusPoints: number;
}

interface EventSystem {
  on(eventType: EventType, callback: (event: any) => void): () => void;
  
  off(eventType: EventType, callback: (event: any) => void): void;
  
  emit(event: PointsChangedEvent | AchievementUnlockedEvent | LevelUpEvent | any): void;
  
  once(eventType: EventType, callback: (event: any) => void): () => void;
}
```

## Data Models

### Supabase Tables

**points** table:
```sql
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  alpha_points INTEGER DEFAULT 0,
  reward_points INTEGER DEFAULT 0,
  platform_balance INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**transactions** table:
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  operation_type VARCHAR(50) NOT NULL,
  points_type VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  balance_before INTEGER,
  balance_after INTEGER,
  related_user_id UUID,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**achievements** table:
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  points_threshold INTEGER NOT NULL,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**user_achievements** table:
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

### Local Storage Schema

```typescript
// Cache
localStorage['points:cache:{userId}'] = {
  alpha: number;
  rewards: number;
  balance: number;
  lastUpdated: string;
  ttl: number;
}

// Sync Queue
localStorage['points:queue:{userId}'] = [
  {
    id: string;
    type: 'add' | 'subtract' | 'transfer';
    data: any;
    timestamp: string;
    retryCount: number;
  }
]

// Migration Status
localStorage['points:migrated:{userId}'] = boolean;
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Point Type Validation
*For any* point type string, the system should only accept exactly three types: 'alpha', 'rewards', 'balance'. Invalid types should be rejected.
**Validates: Requirements 1.1, 1.5**

### Property 2: Point Type Metadata Completeness
*For any* valid point type, retrieving its metadata should return all required fields: name, description, icon, color.
**Validates: Requirements 1.3, 1.4**

### Property 3: Add Points Increases Balance
*For any* user and valid amount > 0, adding points should increase the balance by exactly that amount.
**Validates: Requirements 5.1, 5.4**

### Property 4: Subtract Points Decreases Balance
*For any* user with sufficient balance, subtracting points should decrease the balance by exactly that amount.
**Validates: Requirements 5.2, 5.5**

### Property 5: Subtract Points Prevents Negative Balance
*For any* user, attempting to subtract more points than available should fail and leave balance unchanged.
**Validates: Requirements 5.5**

### Property 6: Transfer Points Consistency
*For any* transfer operation between two users, the amount subtracted from sender should equal the amount added to receiver.
**Validates: Requirements 5.3, 5.6**

### Property 7: Transaction Record Creation
*For any* points operation, a transaction record should be created with all required fields: operation_type, amount, points_type, timestamp, reason, balance_before, balance_after.
**Validates: Requirements 3.1, 3.2**

### Property 8: Transaction History Immutability
*For any* transaction record, attempting to modify or delete it should fail.
**Validates: Requirements 3.5**

### Property 9: Transaction History Sorting
*For any* transaction history query, results should be sorted by timestamp in descending order.
**Validates: Requirements 3.3**

### Property 10: Transaction Filtering
*For any* transaction history with filters applied, all returned records should match the filter criteria (points_type, operation_type, date_range).
**Validates: Requirements 3.4**

### Property 11: Achievement Unlock on Threshold
*For any* user reaching a points threshold, the corresponding achievement should be automatically unlocked.
**Validates: Requirements 4.1**

### Property 12: Achievement Metadata Completeness
*For any* achievement, all required fields should be present: id, name, description, icon, points_threshold, reward_points.
**Validates: Requirements 4.2**

### Property 13: Achievement Unlock Bonus Points
*For any* achievement unlock, the user should receive the achievement's reward_points bonus.
**Validates: Requirements 4.3**

### Property 14: Achievement Unlock Idempotence
*For any* user and achievement, unlocking the same achievement multiple times should only award bonus points once.
**Validates: Requirements 4.7**

### Property 15: Level Calculation Correctness
*For any* total points value, the calculated level should match the defined thresholds: Bronze (0-499), Silver (500-1999), Gold (2000+).
**Validates: Requirements 4.4**

### Property 16: Level Up Bonus Points
*For any* level increase, the user should receive exactly 100 bonus points.
**Validates: Requirements 4.6**

### Property 17: Level Recalculation on Points Change
*For any* points change that crosses a level threshold, the user's level should be recalculated and updated.
**Validates: Requirements 4.5**

### Property 18: Supabase Sync Round Trip
*For any* points data, syncing to Supabase and fetching back should return equivalent data.
**Validates: Requirements 2.1, 2.3**

### Property 19: Sync Conflict Resolution
*For any* conflict between local and server points data, the server state should be used as the source of truth.
**Validates: Requirements 2.4, 7.4**

### Property 20: Offline Operation Queueing
*For any* points operation attempted while offline, the operation should be queued and executed when connection is restored.
**Validates: Requirements 2.5, 7.2**

### Property 21: Migration Data Integrity
*For any* migration from localStorage to Supabase, all data should be transferred correctly and transaction records created.
**Validates: Requirements 6.1, 6.3, 6.4**

### Property 22: Migration Idempotence
*For any* user, running migration multiple times should not create duplicate records.
**Validates: Requirements 6.6**

### Property 23: Cache TTL Expiration
*For any* cached points data, after 5 minutes without refresh, the cache should be considered expired.
**Validates: Requirements 9.1, 9.2**

### Property 24: Cache Update on Points Change
*For any* points modification, the local cache should be updated immediately.
**Validates: Requirements 9.3**

### Property 25: Event Emission on Points Change
*For any* points operation, a points-changed event should be emitted with complete transaction details.
**Validates: Requirements 10.1**

### Property 26: Event Emission on Achievement Unlock
*For any* achievement unlock, an achievement-unlocked event should be emitted.
**Validates: Requirements 10.2**

### Property 27: Event Emission on Level Up
*For any* level increase, a level-up event should be emitted with new level and bonus points.
**Validates: Requirements 10.3**

### Property 28: Error Code Specificity
*For any* failed operation, the error response should include a specific error code (INVALID_AMOUNT, INSUFFICIENT_BALANCE, USER_NOT_FOUND, etc.).
**Validates: Requirements 5.7, 8.3**

### Property 29: Operation ID for Debugging
*For any* failed operation, the error response should include a unique operation_id for debugging.
**Validates: Requirements 5.7, 8.1**

### Property 30: Batch Operations Atomicity
*For any* batch operation, either all operations succeed or all fail (no partial success).
**Validates: Requirements 5.8**

## Error Handling

### Error Types and Codes

```typescript
enum ErrorCode {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_POINTS_TYPE = 'INVALID_POINTS_TYPE',
  SYNC_FAILED = 'SYNC_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_OPERATION = 'DUPLICATE_OPERATION',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    operationId: string;
    timestamp: string;
    context?: Record<string, any>;
  };
}
```

### Retry Strategy

- **Network errors**: Exponential backoff (1s, 2s, 4s, 8s, 16s, max 5 retries)
- **Validation errors**: No retry (fail immediately)
- **Sync conflicts**: Resolve using server-as-source, no retry needed
- **Circuit breaker**: After 5 consecutive failures, stop retrying for 60 seconds

### Rollback Strategy

- **Partial failures**: Restore previous state from cache
- **Transaction failures**: Reverse all changes made in transaction
- **Sync failures**: Keep local state, queue for retry

## Testing Strategy

### Unit Testing

Unit tests validate specific examples, edge cases, and error conditions:

1. **Point Type System Tests**
   - Valid type creation and metadata retrieval
   - Invalid type rejection
   - Type consistency across operations

2. **Points Operations Tests**
   - Add points with valid amounts
   - Subtract points with sufficient balance
   - Subtract points with insufficient balance (should fail)
   - Transfer points between users
   - Batch operations

3. **Achievement System Tests**
   - Achievement unlock on threshold
   - Duplicate unlock prevention
   - Bonus points award
   - Achievement metadata validation

4. **Level System Tests**
   - Level calculation for each threshold
   - Level up event emission
   - Bonus points award on level up

5. **Transaction History Tests**
   - Transaction record creation
   - History retrieval and sorting
   - Filtering by type, date range, operation
   - Immutability enforcement

6. **Migration Tests**
   - Data reading from localStorage
   - Data validation
   - Supabase record creation
   - Migration idempotence

7. **Sync Tests**
   - Offline operation queueing
   - Sync on connection restore
   - Conflict resolution
   - Cache update

8. **Error Handling Tests**
   - Error code specificity
   - Operation ID generation
   - Retry logic
   - Circuit breaker activation

### Property-Based Testing

Property-based tests validate universal properties across all inputs using randomization:

1. **Property 1-2**: Point type validation and metadata
2. **Property 3-6**: Points operations (add, subtract, transfer)
3. **Property 7-10**: Transaction history
4. **Property 11-17**: Achievements and levels
5. **Property 18-24**: Sync and caching
6. **Property 25-30**: Events and error handling

Each property test will:
- Generate random valid inputs
- Execute the operation
- Verify the property holds
- Run minimum 100 iterations
- Include edge cases in generators

### Test Configuration

```typescript
// Property test example
describe('Property: Add Points Increases Balance', () => {
  it('should increase balance by exactly the added amount', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 1, max: 1000000 }),
        fc.sampled.constant(['alpha', 'rewards', 'balance'] as const),
        async (userId, amount, pointsType) => {
          const before = await getBalance(userId, pointsType);
          await addPoints(userId, amount, pointsType, 'test');
          const after = await getBalance(userId, pointsType);
          expect(after).toBe(before + amount);
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: unified-points-system, Property 3: Add Points Increases Balance
});
```

