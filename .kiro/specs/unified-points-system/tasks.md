# Implementation Plan: Unified Points System

## Overview

This implementation plan breaks down the Unified Points System into discrete, incremental coding tasks. Each task builds on previous steps, with property-based tests integrated throughout to catch errors early. The plan follows a layered approach: core types → storage layer → API → features → integration.

## Tasks

- [x] 1. Set up project structure and core types
  - Create directory structure: `src/points/` with subdirectories for types, hooks, utils, services
  - Define TypeScript types and interfaces for all point types, transactions, achievements, levels
  - Create constants file with point type metadata and level thresholds
  - Set up Supabase table migrations (points, transactions, achievements, user_achievements)
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [ ] 2. Implement Points Type System
  - [x] 2.1 Create PointsTypeSystem class with metadata management
    - Implement getMetadata(), isValidType(), getAllTypes() methods
    - Define metadata for alpha, rewards, balance types
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [ ]* 2.2 Write property test for Points Type System
    - **Property 1: Point Type Validation**
    - **Property 2: Point Type Metadata Completeness**
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5**

- [ ] 3. Implement local storage and caching layer
  - [x] 3.1 Create StorageManager for cache, queue, and backup management
    - Implement cache with 5-minute TTL
    - Implement operation queue for offline support
    - Implement localStorage backup persistence
    - _Requirements: 9.1, 9.3, 9.4_
  
  - [ ]* 3.2 Write property test for caching behavior
    - **Property 23: Cache TTL Expiration**
    - **Property 24: Cache Update on Points Change**
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [ ] 4. Implement Transaction System
  - [x] 4.1 Create TransactionManager for transaction creation and history
    - Implement createTransaction() with all required fields
    - Implement getHistory() with filtering support
    - Implement immutability enforcement
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 4.2 Write property tests for transaction system
    - **Property 7: Transaction Record Creation**
    - **Property 8: Transaction History Immutability**
    - **Property 9: Transaction History Sorting**
    - **Property 10: Transaction Filtering**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [ ] 5. Implement Supabase Sync Engine
  - [x] 5.1 Create SyncEngine for Supabase synchronization
    - Implement syncToSupabase() with conflict resolution
    - Implement operation queue processing
    - Implement sync state management
    - Implement server-as-source conflict resolution
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 7.4_
  
  - [ ]* 5.2 Write property tests for sync engine
    - **Property 18: Supabase Sync Round Trip**
    - **Property 19: Sync Conflict Resolution**
    - **Property 20: Offline Operation Queueing**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

- [ ] 6. Implement Points API - Core Operations
  - [x] 6.1 Create PointsAPI with add, subtract, transfer operations
    - Implement addPoints() with validation
    - Implement subtractPoints() with balance check
    - Implement transferPoints() with dual validation
    - Implement error handling with specific error codes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 6.2 Write property tests for points operations
    - **Property 3: Add Points Increases Balance**
    - **Property 4: Subtract Points Decreases Balance**
    - **Property 5: Subtract Points Prevents Negative Balance**
    - **Property 6: Transfer Points Consistency**
    - **Property 28: Error Code Specificity**
    - **Property 29: Operation ID for Debugging**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

- [ ] 7. Implement Batch Operations and Event System
  - [x] 7.1 Add batch operations support to PointsAPI
    - Implement batchOperations() with atomicity
    - Implement transaction wrapping for batch safety
    - _Requirements: 5.8_
  
  - [x] 7.2 Create EventSystem for real-time updates
    - Implement on(), off(), once(), emit() methods
    - Implement event subscription management
    - Implement memory leak prevention
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [ ]* 7.3 Write property tests for batch and events
    - **Property 25: Event Emission on Points Change**
    - **Property 26: Event Emission on Achievement Unlock**
    - **Property 27: Event Emission on Level Up**
    - **Property 30: Batch Operations Atomicity**
    - **Validates: Requirements 5.8, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

- [ ] 8. Implement Achievement System
  - [x] 8.1 Create AchievementManager for achievement tracking
    - Implement achievement definition and retrieval
    - Implement achievement unlock logic
    - Implement checkAndUnlockAchievements() for threshold checking
    - Implement duplicate unlock prevention
    - _Requirements: 4.1, 4.2, 4.3, 4.7_
  
  - [ ]* 8.2 Write property tests for achievements
    - **Property 11: Achievement Unlock on Threshold**
    - **Property 12: Achievement Metadata Completeness**
    - **Property 13: Achievement Unlock Bonus Points**
    - **Property 14: Achievement Unlock Idempotence**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.7**

- [ ] 9. Implement Level System
  - [x] 9.1 Create LevelManager for level calculation and progression
    - Implement calculateLevel() based on thresholds
    - Implement checkLevelUp() with bonus point award
    - Implement level-up event emission
    - _Requirements: 4.4, 4.5, 4.6_
  
  - [ ]* 9.2 Write property tests for levels
    - **Property 15: Level Calculation Correctness**
    - **Property 16: Level Up Bonus Points**
    - **Property 17: Level Recalculation on Points Change**
    - **Validates: Requirements 4.4, 4.5, 4.6**

- [ ] 10. Implement Migration System
  - [x] 10.1 Create MigrationManager for localStorage to Supabase migration
    - Implement readFromLocalStorage() for Alpha Points, Rewards, Balance
    - Implement validateData() for data integrity
    - Implement migrateToSupabase() with transaction record creation
    - Implement migration status tracking
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ]* 10.2 Write property tests for migration
    - **Property 21: Migration Data Integrity**
    - **Property 22: Migration Idempotence**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

- [ ] 11. Implement Error Handling and Retry Logic
  - [x] 11.1 Create ErrorHandler with retry strategy
    - Implement exponential backoff for network errors
    - Implement circuit breaker pattern
    - Implement error logging with context
    - Implement rollback on partial failures
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 11.2 Write unit tests for error handling
    - Test retry logic with exponential backoff
    - Test circuit breaker activation
    - Test error code specificity
    - Test rollback behavior
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 12. Implement Real-time Sync with Supabase Subscriptions
  - [x] 12.1 Add real-time subscription support to SyncEngine
    - Implement Supabase real-time subscriptions for points changes
    - Implement cross-device sync via real-time events
    - Implement sync state indicator (syncing, synced, error)
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6_
  
  - [ ]* 12.2 Write property tests for real-time sync
    - Test cross-device synchronization
    - Test sync state transitions
    - Test real-time event handling
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6_

- [ ] 13. Create React Hooks for Component Integration
  - [x] 13.1 Create usePoints hook for accessing points data
    - Implement points fetching and caching
    - Implement event subscription
    - Implement cleanup on unmount
    - _Requirements: 10.5, 10.6_
  
  - [x] 13.2 Create useAchievements hook for achievement tracking
    - Implement achievement fetching
    - Implement unlock event handling
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 13.3 Create useLevel hook for level tracking
    - Implement level fetching
    - Implement level-up event handling
    - _Requirements: 4.4, 4.5, 4.6_
  
  - [x] 13.4 Create useTransactionHistory hook for history viewing
    - Implement history fetching with filtering
    - Implement pagination support
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all property-based tests pass (minimum 100 iterations each)
  - Verify no memory leaks in event subscriptions
  - Verify offline queue processing works correctly
  - Ask the user if questions arise

- [ ] 15. Integration Testing
  - [x] 15.1 Create integration tests for complete workflows
    - Test add points → achievement unlock → level up flow
    - Test offline operation → sync → real-time update flow
    - Test migration → sync → cross-device access flow
    - _Requirements: All_
  
  - [ ]* 15.2 Create end-to-end test scenarios
    - Test complete user journey from login to points operations
    - Test error recovery scenarios
    - _Requirements: All_

- [ ] 16. Documentation and Examples
  - [x] 16.1 Create API documentation with examples
    - Document all public methods
    - Provide usage examples for each operation
    - Document error codes and handling
    - _Requirements: 5.1, 5.2, 5.3, 5.8_
  
  - [ ]* 16.2 Create migration guide for existing data
    - Document migration process
    - Provide troubleshooting guide
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass
  - Verify all requirements are covered
  - Verify no console errors or warnings
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All operations are queued for Supabase sync to handle offline scenarios
- Server state is always source of truth in conflict resolution
- Event system prevents memory leaks through proper cleanup
- Migration preserves original timestamps where available

