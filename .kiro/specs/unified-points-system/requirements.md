# Requirements Document: Unified Points System

## Introduction

The Unified Points System consolidates multiple point types (Alpha Points, Rewards, Platform Balance) into a single, coherent system with Supabase synchronization, transaction history, achievements, and levels. This system enables cross-device synchronization, comprehensive audit trails, and gamification features for the crypto platform.

## Glossary

- **Points**: Virtual currency representing user engagement and activity
- **Alpha_Points**: Staking-related points earned through lock-up periods and stake amounts
- **Reward_Points**: Points earned through daily activities, challenges, and platform engagement
- **Platform_Balance**: User's account balance for platform transactions
- **Points_Type**: Enumeration of point categories (alpha, rewards, balance)
- **Transaction**: A single points operation (add, subtract, transfer)
- **Transaction_History**: Immutable log of all points operations
- **Achievement**: Milestone unlocked by reaching specific point thresholds or conditions
- **User_Level**: Tier system based on total accumulated points
- **Sync_State**: Status of data synchronization between local storage and Supabase
- **Migration**: Process of transferring existing localStorage data to Supabase

## Requirements

### Requirement 1: Unified Points Type System

**User Story:** As a developer, I want a unified type system for all points types, so that I can manage different point categories consistently across the platform.

#### Acceptance Criteria

1. THE Points_Type_System SHALL define exactly three point types: alpha, rewards, balance
2. WHEN a point type is referenced, THE System SHALL use consistent naming conventions across all components
3. THE Points_Type_System SHALL include metadata for each type (name, description, icon, color)
4. WHEN retrieving points, THE System SHALL return the correct type with all associated metadata
5. THE Points_Type_System SHALL prevent creation of undefined point types

### Requirement 2: Supabase Integration for Points Storage

**User Story:** As a platform administrator, I want points data synchronized to Supabase, so that users can access their points across multiple devices.

#### Acceptance Criteria

1. WHEN a user logs in, THE System SHALL sync local points to Supabase if user_id exists
2. WHEN points are modified locally, THE System SHALL queue the operation for Supabase synchronization
3. WHEN Supabase sync completes successfully, THE System SHALL update local cache with server state
4. IF a sync conflict occurs, THE System SHALL resolve it using server-as-source strategy
5. WHEN network is unavailable, THE System SHALL queue operations and retry when connection restored
6. THE System SHALL maintain a points table in Supabase with columns: user_id, alpha_points, reward_points, platform_balance, last_updated

### Requirement 3: Transaction History and Audit Trail

**User Story:** As a user, I want to see a complete history of all my points operations, so that I can track how my points changed over time.

#### Acceptance Criteria

1. WHEN a points operation occurs, THE System SHALL create an immutable transaction record
2. THE Transaction_History SHALL include: operation_type, amount, points_type, timestamp, reason, balance_before, balance_after
3. WHEN retrieving transaction history, THE System SHALL return records sorted by timestamp descending
4. WHEN filtering transactions, THE System SHALL support filtering by points_type, date_range, and operation_type
5. THE System SHALL prevent modification or deletion of historical transaction records
6. WHEN a transaction is created, THE System SHALL persist it to Supabase immediately
7. THE System SHALL maintain transaction history for minimum 2 years

### Requirement 4: Achievements and Levels System

**User Story:** As a user, I want to unlock achievements and progress through levels, so that I can see my engagement and accomplishments.

#### Acceptance Criteria

1. WHEN total points reach a threshold, THE System SHALL automatically unlock the corresponding achievement
2. THE Achievement_System SHALL define achievements with: id, name, description, icon, points_threshold, reward_points
3. WHEN an achievement is unlocked, THE System SHALL award bonus points and persist the unlock event
4. THE User_Level_System SHALL calculate level based on total points: Bronze (0-499), Silver (500-1999), Gold (2000+)
5. WHEN user points change, THE System SHALL recalculate level and trigger level-up event if applicable
6. WHEN level increases, THE System SHALL award level-up bonus points (100 points per level)
7. THE System SHALL prevent duplicate achievement unlocks for the same user

### Requirement 5: Points Management API

**User Story:** As a developer, I want a comprehensive API for managing points, so that I can add, subtract, and transfer points programmatically.

#### Acceptance Criteria

1. THE Points_API SHALL provide addPoints(userId, amount, pointsType, reason) function
2. THE Points_API SHALL provide subtractPoints(userId, amount, pointsType, reason) function
3. THE Points_API SHALL provide transferPoints(fromUserId, toUserId, amount, pointsType, reason) function
4. WHEN adding points, THE System SHALL validate amount > 0 and pointsType is valid
5. WHEN subtracting points, THE System SHALL prevent balance from going negative
6. WHEN transferring points, THE System SHALL validate both users exist and have sufficient balance
7. WHEN any operation fails, THE System SHALL return descriptive error with operation_id for debugging
8. THE Points_API SHALL support batch operations for multiple point changes
9. WHEN an operation completes, THE System SHALL emit event with transaction details

### Requirement 6: Data Migration from localStorage

**User Story:** As a platform administrator, I want to migrate existing points data from localStorage to Supabase, so that historical data is preserved and accessible.

#### Acceptance Criteria

1. WHEN migration starts, THE System SHALL read all points data from localStorage (Alpha_Points, Rewards, Platform_Balance)
2. THE Migration_System SHALL validate data integrity before transfer
3. WHEN data is valid, THE System SHALL create corresponding records in Supabase
4. WHEN migration completes, THE System SHALL create initial transaction records for migrated data
5. IF migration fails, THE System SHALL log detailed error and allow retry
6. WHEN migration succeeds, THE System SHALL mark data as migrated and prevent duplicate migrations
7. THE System SHALL preserve original timestamps or use migration timestamp if unavailable

### Requirement 7: Cross-Device Synchronization

**User Story:** As a user, I want my points to stay synchronized across all my devices, so that I see consistent data everywhere.

#### Acceptance Criteria

1. WHEN user logs in on a new device, THE System SHALL fetch latest points from Supabase
2. WHEN points are modified on one device, THE System SHALL sync to Supabase within 5 seconds
3. WHEN another device detects points change via real-time subscription, THE System SHALL update local state
4. IF local and server states diverge, THE System SHALL resolve using server-as-source strategy
5. WHEN sync completes, THE System SHALL emit sync-complete event to all listeners
6. THE System SHALL maintain sync_state indicator (syncing, synced, error)

### Requirement 8: Error Handling and Recovery

**User Story:** As a developer, I want robust error handling for points operations, so that failures don't corrupt data or lose transactions.

#### Acceptance Criteria

1. WHEN a Supabase operation fails, THE System SHALL log error with context and operation_id
2. WHEN network error occurs, THE System SHALL queue operation and retry with exponential backoff
3. WHEN validation fails, THE System SHALL return specific error code (INVALID_AMOUNT, INSUFFICIENT_BALANCE, etc.)
4. WHEN transaction fails after partial completion, THE System SHALL rollback and restore previous state
5. WHEN sync fails repeatedly, THE System SHALL alert user and provide manual sync option
6. THE System SHALL implement circuit breaker pattern for Supabase operations

### Requirement 9: Points Persistence and Caching

**User Story:** As a developer, I want efficient caching and persistence of points data, so that the system performs well and handles offline scenarios.

#### Acceptance Criteria

1. WHEN user data is loaded, THE System SHALL cache points in memory with TTL of 5 minutes
2. WHEN cache expires, THE System SHALL refresh from Supabase if online, or use stale cache if offline
3. WHEN points are modified, THE System SHALL update cache immediately and queue Supabase sync
4. THE System SHALL persist cache to localStorage as backup
5. WHEN app restarts, THE System SHALL restore cache from localStorage and validate with Supabase
6. WHEN cache and server diverge, THE System SHALL use server state as source of truth

### Requirement 10: Real-time Updates and Events

**User Story:** As a developer, I want real-time notifications of points changes, so that UI can update immediately when points are modified.

#### Acceptance Criteria

1. WHEN points are modified, THE System SHALL emit points-changed event with transaction details
2. WHEN achievement is unlocked, THE System SHALL emit achievement-unlocked event
3. WHEN level increases, THE System SHALL emit level-up event with new level and bonus points
4. WHEN Supabase sync completes, THE System SHALL emit sync-complete event
5. THE System SHALL support subscribing to specific event types
6. WHEN component unmounts, THE System SHALL unsubscribe from events to prevent memory leaks

