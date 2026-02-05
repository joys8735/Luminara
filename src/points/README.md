# Unified Points System

A comprehensive points management system that consolidates multiple point types (Alpha Points, Rewards, Platform Balance) into a single, coherent system with Supabase synchronization, transaction history, achievements, and levels.

## Directory Structure

```
src/points/
├── types/              # TypeScript type definitions
├── constants/          # System constants and metadata
├── utils/              # Utility functions
├── migrations/         # Supabase schema migrations
├── services/           # Core service implementations
│   ├── PointsTypeSystem.ts
│   ├── StorageManager.ts
│   ├── TransactionManager.ts
│   ├── SyncEngine.ts
│   ├── PointsAPI.ts
│   ├── AchievementManager.ts
│   ├── LevelManager.ts
│   ├── MigrationManager.ts
│   ├── ErrorHandler.ts
│   └── EventSystem.ts
├── hooks/              # React hooks for component integration
│   ├── usePoints.ts
│   ├── useAchievements.ts
│   ├── useLevel.ts
│   └── useTransactionHistory.ts
├── __tests__/          # Test files
│   ├── unit/
│   ├── integration/
│   └── properties/
└── README.md           # This file
```

## Features

### 1. Unified Points Type System
- Three point types: Alpha, Rewards, Balance
- Consistent metadata and naming conventions
- Type validation and metadata retrieval

### 2. Supabase Integration
- Real-time synchronization across devices
- Server-as-source conflict resolution
- Offline operation queueing
- Automatic retry with exponential backoff

### 3. Transaction History
- Immutable audit trail of all operations
- Comprehensive filtering and sorting
- Transaction record creation for all operations
- 2-year retention policy

### 4. Achievements & Levels
- Automatic achievement unlock on threshold
- Level progression: Bronze (0-499), Silver (500-1999), Gold (2000+)
- Level-up bonus points (100 per level)
- Duplicate unlock prevention

### 5. Points API
- Add, subtract, transfer operations
- Batch operations support
- Comprehensive validation
- Specific error codes for debugging

### 6. Data Migration
- Seamless migration from localStorage to Supabase
- Data integrity validation
- Transaction record creation for migrated data
- Migration idempotence

### 7. Offline Support
- Operation queueing when offline
- Automatic sync when connection restored
- Cache with 5-minute TTL
- localStorage backup

### 8. Real-time Events
- Points changed events
- Achievement unlocked events
- Level up events
- Sync state events

## Getting Started

### Installation

1. Ensure Supabase is configured in your project
2. Run the schema migrations in `migrations/supabase-schema.sql`
3. Import the points system in your components

### Basic Usage

```typescript
import { usePoints } from './hooks/usePoints';

function MyComponent() {
  const { points, addPoints, loading } = usePoints();

  const handleAddPoints = async () => {
    await addPoints(100, 'rewards', 'Daily login bonus');
  };

  return (
    <div>
      <p>Rewards: {points?.rewards}</p>
      <button onClick={handleAddPoints}>Add Points</button>
    </div>
  );
}
```

## API Reference

### PointsAPI

#### addPoints(userId, amount, pointsType, reason)
Add points to a user's account.

```typescript
const result = await pointsAPI.addPoints(
  'user-123',
  100,
  'rewards',
  'Daily login bonus'
);
```

#### subtractPoints(userId, amount, pointsType, reason)
Subtract points from a user's account.

```typescript
const result = await pointsAPI.subtractPoints(
  'user-123',
  50,
  'balance',
  'Purchase item'
);
```

#### transferPoints(fromUserId, toUserId, amount, pointsType, reason)
Transfer points between users.

```typescript
const result = await pointsAPI.transferPoints(
  'user-123',
  'user-456',
  100,
  'rewards',
  'Gift transfer'
);
```

#### batchOperations(operations)
Execute multiple operations atomically.

```typescript
const result = await pointsAPI.batchOperations([
  { type: 'add', userId: 'user-123', amount: 100, pointsType: 'rewards', reason: 'Bonus' },
  { type: 'subtract', userId: 'user-456', amount: 50, pointsType: 'balance', reason: 'Fee' },
]);
```

### React Hooks

#### usePoints()
Access and manage user points.

```typescript
const { points, addPoints, subtractPoints, transferPoints, loading, error } = usePoints();
```

#### useAchievements()
Track user achievements.

```typescript
const { achievements, userAchievements, loading } = useAchievements();
```

#### useLevel()
Track user level and progression.

```typescript
const { level, totalPoints, nextLevelPoints, loading } = useLevel();
```

#### useTransactionHistory()
View transaction history with filtering.

```typescript
const { transactions, filter, setFilter, loading } = useTransactionHistory();
```

## Error Handling

The system provides specific error codes for debugging:

- `INVALID_AMOUNT`: Amount validation failed
- `INSUFFICIENT_BALANCE`: Not enough points to perform operation
- `USER_NOT_FOUND`: User does not exist
- `INVALID_POINTS_TYPE`: Invalid points type specified
- `SYNC_FAILED`: Supabase synchronization failed
- `NETWORK_ERROR`: Network connectivity issue
- `VALIDATION_ERROR`: General validation error
- `DUPLICATE_OPERATION`: Duplicate operation detected
- `UNAUTHORIZED`: Access denied
- `INTERNAL_ERROR`: Server error

## Testing

### Unit Tests
```bash
npm test -- src/points/__tests__/unit
```

### Property-Based Tests
```bash
npm test -- src/points/__tests__/properties
```

### Integration Tests
```bash
npm test -- src/points/__tests__/integration
```

## Configuration

### Cache TTL
Default: 5 minutes (300,000 ms)
Configure in `constants/index.ts`

### Retry Strategy
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Max retries: 5
- Circuit breaker threshold: 5 failures
- Circuit breaker timeout: 60 seconds

## Performance Considerations

1. **Caching**: Points data is cached in memory with 5-minute TTL
2. **Batch Operations**: Use batch operations for multiple changes
3. **Offline Support**: Operations are queued and synced when online
4. **Indexes**: Database indexes on frequently queried columns
5. **RLS Policies**: Row-level security for data isolation

## Security

- Row-level security (RLS) policies on all tables
- User can only access their own data
- Service role for administrative operations
- Validation on all inputs
- Immutable transaction history

## Troubleshooting

### Points not syncing
1. Check network connectivity
2. Verify Supabase configuration
3. Check browser console for errors
4. Review sync state in browser DevTools

### Cache issues
1. Clear localStorage: `localStorage.clear()`
2. Refresh the page
3. Check cache TTL configuration

### Migration issues
1. Verify localStorage data exists
2. Check data validation errors
3. Review migration logs in console
4. Retry migration manually

## Contributing

When adding new features:
1. Update type definitions in `types/index.ts`
2. Add constants in `constants/index.ts`
3. Implement service in `services/`
4. Add unit tests in `__tests__/unit/`
5. Add property-based tests in `__tests__/properties/`
6. Update this README

## License

Part of the unified platform system.
