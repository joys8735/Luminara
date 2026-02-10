# API & Components Guide - Luminara

## Table of Contents
1. [Backend API Reference](#backend-api-reference)
2. [Frontend Hooks Reference](#frontend-hooks-reference)
3. [Component Library](#component-library)
4. [Context Providers](#context-providers)
5. [Service Layer](#service-layer)

---

## Backend API Reference

### Base URL
```
Development: http://localhost:4000
Production: https://api.luminara.dev
```

### Authentication Endpoints

#### 1. Initiate Google OAuth
```
GET /auth/google

Description: Redirects user to Google OAuth login
Response: Redirects to Google login page
```

#### 2. OAuth Callback
```
GET /auth/google/callback

Description: Handles OAuth callback from Google
Query Parameters:
  - code: Authorization code from Google
  - state: State parameter for security

Response:
  - Success: Redirects to frontend with session
  - Error: Redirects to login page with error
```

#### 3. Get Current User
```
GET /auth/user

Description: Get authenticated user information
Headers:
  - Cookie: auth_session (required)

Response (200):
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "avatar": "https://...",
  "createdAt": "2026-02-04T00:00:00Z"
}

Response (401):
{
  "error": "Not authenticated"
}
```

#### 4. Logout
```
POST /auth/logout

Description: Logout user and destroy session
Headers:
  - Cookie: auth_session (required)

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### AI Assistant Endpoints

#### 1. Send Message to AI
```
POST /api/ai/chat

Description: Send message to AI assistant
Headers:
  - Content-Type: application/json

Request Body:
{
  "message": "What is Alpha Points?",
  "context": {
    "userId": "user-id",
    "walletAddress": "0x...",
    "currentPage": "home"
  }
}

Response (200):
{
  "response": "Alpha Points are...",
  "provider": "local-ai",
  "timestamp": "2026-02-04T00:00:00Z"
}

Response (400):
{
  "error": "Invalid message"
}

Response (503):
{
  "error": "All AI providers unavailable"
}
```

#### 2. Health Check
```
GET /api/health

Description: Check backend health status
Response (200):
{
  "status": "ok",
  "timestamp": "2026-02-04T00:00:00Z",
  "uptime": 3600
}
```

#### 3. List Available Providers
```
GET /api/providers

Description: Get list of available AI providers
Response (200):
{
  "providers": [
    {
      "name": "Local AI Brain",
      "enabled": true,
      "priority": 0
    },
    {
      "name": "OpenAI",
      "enabled": false,
      "priority": 1
    },
    {
      "name": "Google Gemini",
      "enabled": false,
      "priority": 2
    },
    {
      "name": "DeepSeek",
      "enabled": false,
      "priority": 3
    }
  ]
}
```

---

## Frontend Hooks Reference

### useWallet Hook

**Location**: `src/context/WalletContext.tsx`

```typescript
const {
  // Connection State
  connected: boolean;
  walletType: 'phantom' | 'metamask' | null;
  
  // Wallet Information
  publicKey: string | null;
  walletAddress: string | null;
  balance: number;
  
  // Network Information
  chainId: number | null;
  isCorrectNetwork: boolean;
  
  // Providers
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  
  // Methods
  connectWallet: (type: 'phantom' | 'metamask') => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  disconnectWallet: () => void;
  
  // Rewards
  cashbackBalance: number;
  addCashback: (amount: number) => void;
  withdrawCashback: () => void;
} = useWallet();
```

**Example Usage**:
```typescript
function MyComponent() {
  const { connected, walletAddress, connectWallet } = useWallet();
  
  return (
    <div>
      {connected ? (
        <p>Connected: {walletAddress}</p>
      ) : (
        <button onClick={() => connectWallet('metamask')}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}
```

### useAuth Hook

**Location**: `src/context/AuthContext.tsx`

```typescript
const {
  // State
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Methods
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
} = useAuth();
```

**Example Usage**:
```typescript
function LoginButton() {
  const { isAuthenticated, login, logout } = useAuth();
  
  return (
    <button onClick={isAuthenticated ? logout : login}>
      {isAuthenticated ? 'Logout' : 'Login'}
    </button>
  );
}
```

### usePoints Hook

**Location**: `src/points/hooks/usePoints.ts`

```typescript
const {
  // State
  points: PointsData;
  loading: boolean;
  error: string | null;
  
  // Methods
  addPoints: (type: PointsType, amount: number, reason: string) => Promise<void>;
  subtractPoints: (type: PointsType, amount: number, reason: string) => Promise<void>;
  transferPoints: (type: PointsType, amount: number, toUserId: string) => Promise<void>;
  getTransactionHistory: (filter?: TransactionFilter) => Promise<Transaction[]>;
  
  // Refresh
  refresh: () => Promise<void>;
} = usePoints();
```

**Example Usage**:
```typescript
function PointsDisplay() {
  const { points, addPoints, loading } = usePoints();
  
  const handleClaimReward = async () => {
    await addPoints('alpha', 50, 'Daily reward');
  };
  
  return (
    <div>
      <p>Alpha Points: {points.alpha}</p>
      <button onClick={handleClaimReward} disabled={loading}>
        Claim Reward
      </button>
    </div>
  );
}
```

### useAchievements Hook

**Location**: `src/points/hooks/useAchievements.ts`

```typescript
const {
  // State
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  loading: boolean;
  error: string | null;
  
  // Methods
  getAchievements: () => Promise<Achievement[]>;
  getUserAchievements: () => Promise<UserAchievement[]>;
  checkAchievements: () => Promise<void>;
} = useAchievements();
```

### useLevel Hook

**Location**: `src/points/hooks/useLevel.ts`

```typescript
const {
  // State
  level: UserLevel;
  nextLevelThreshold: number;
  currentPoints: number;
  loading: boolean;
  
  // Methods
  calculateLevel: (points: number) => UserLevel;
  getProgressToNextLevel: () => number;
} = useLevel();
```

### useTransactionHistory Hook

**Location**: `src/points/hooks/useTransactionHistory.ts`

```typescript
const {
  // State
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  
  // Methods
  getHistory: (filter?: TransactionFilter) => Promise<Transaction[]>;
  filterByType: (type: PointsType) => Transaction[];
  filterByOperation: (operation: OperationType) => Transaction[];
  exportToCSV: () => void;
} = useTransactionHistory();
```

### useProject Hook

**Location**: `src/context/ProjectContext.tsx`

```typescript
const {
  // State
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  
  // Methods
  selectProject: (id: string) => void;
  updateProject: (project: Project) => Promise<void>;
  getProjectDetails: (id: string) => Promise<Project>;
} = useProject();
```

### usePremium Hook

**Location**: `src/context/PremiumContext.tsx`

```typescript
const {
  // State
  isPremium: boolean;
  subscription: Subscription | null;
  features: PremiumFeature[];
  loading: boolean;
  
  // Methods
  subscribe: (plan: 'monthly' | 'yearly') => Promise<void>;
  cancelSubscription: () => Promise<void>;
  checkFeatureAccess: (feature: string) => boolean;
} = usePremium();
```

### usePlatformBalance Hook

**Location**: `src/context/PlatformBalanceContext.tsx`

```typescript
const {
  // State
  balance: number;
  loading: boolean;
  error: string | null;
  
  // Methods
  updateBalance: () => Promise<void>;
  addBalance: (amount: number) => Promise<void>;
  withdrawBalance: (amount: number) => Promise<void>;
} = usePlatformBalance();
```

---

## Component Library

### Layout Components

#### Header
```typescript
<Header />
```
**Props**: None  
**Features**: Navigation, user menu, notifications

#### Sidebar
```typescript
<Sidebar isOpen={boolean} onClose={() => void} />
```
**Props**:
- `isOpen`: boolean - Sidebar visibility
- `onClose`: () => void - Close handler

**Features**: Navigation menu, user profile

#### Footer
```typescript
<Footer />
```
**Props**: None  
**Features**: Links, copyright, social media

### Wallet Components

#### WalletConnect
```typescript
<WalletConnect />
```
**Props**: None  
**Features**: Wallet connection UI, network switching

#### WalletConnectModal
```typescript
<WalletConnectModal isOpen={boolean} onClose={() => void} />
```
**Props**:
- `isOpen`: boolean - Modal visibility
- `onClose`: () => void - Close handler

#### WalletsModal
```typescript
<WalletsModal isOpen={boolean} onClose={() => void} />
```
**Props**:
- `isOpen`: boolean - Modal visibility
- `onClose`: () => void - Close handler

### Authentication Components

#### AuthModal
```typescript
<AuthModal isOpen={boolean} onClose={() => void} />
```
**Props**:
- `isOpen`: boolean - Modal visibility
- `onClose`: () => void - Close handler

**Features**: Google OAuth login, wallet connection

#### AuthCallback
```typescript
<AuthCallback />
```
**Props**: None  
**Features**: Handles OAuth callback

### Investment Components

#### InvestmentModal
```typescript
<InvestmentModal 
  isOpen={boolean}
  project={Project}
  onClose={() => void}
  onConfirm={(amount: number) => void}
/>
```
**Props**:
- `isOpen`: boolean - Modal visibility
- `project`: Project - Project details
- `onClose`: () => void - Close handler
- `onConfirm`: (amount) => void - Confirm handler

#### InvestmentConfirmationModal
```typescript
<InvestmentConfirmationModal
  isOpen={boolean}
  investment={Investment}
  onClose={() => void}
  onConfirm={() => void}
/>
```

#### ActiveInvestmentsModal
```typescript
<ActiveInvestmentsModal
  isOpen={boolean}
  onClose={() => void}
/>
```

### Card Components

#### CryptoCard
```typescript
<CryptoCard
  symbol={string}
  name={string}
  price={number}
  change={number}
  icon={string}
/>
```
**Props**:
- `symbol`: string - Crypto symbol (BTC, ETH, etc.)
- `name`: string - Crypto name
- `price`: number - Current price
- `change`: number - 24h change percentage
- `icon`: string - Icon URL

#### ProjectCard
```typescript
<ProjectCard
  project={Project}
  onInvest={() => void}
/>
```
**Props**:
- `project`: Project - Project data
- `onInvest`: () => void - Investment handler

#### DailyRewardCard
```typescript
<DailyRewardCard
  day={number}
  reward={number}
  claimed={boolean}
  onClaim={() => void}
/>
```

### Modal Components

#### BalanceModal
```typescript
<BalanceModal
  isOpen={boolean}
  onClose={() => void}
/>
```

#### OnboardingModal
```typescript
<OnboardingModal
  isOpen={boolean}
  onClose={() => void}
/>
```

### Display Components

#### UserProfile
```typescript
<UserProfile user={User} />
```
**Props**:
- `user`: User - User data

#### TierSystem
```typescript
<TierSystem currentTier={string} />
```
**Props**:
- `currentTier`: string - Current tier name

#### TrustScore
```typescript
<TrustScore score={number} />
```
**Props**:
- `score`: number - Trust score (0-100)

#### MarketOverview
```typescript
<MarketOverview />
```
**Props**: None  
**Features**: Market data visualization

#### MarketTrend
```typescript
<MarketTrend symbol={string} />
```
**Props**:
- `symbol`: string - Crypto symbol

#### TradingViewMiniChart
```typescript
<TradingViewMiniChart symbol={string} />
```
**Props**:
- `symbol`: string - Crypto symbol

### Utility Components

#### ScrollToTop
```typescript
<ScrollToTop />
```
**Props**: None  
**Features**: Scroll to top button

#### Skeleton
```typescript
<Skeleton width={string} height={string} />
```
**Props**:
- `width`: string - Width (CSS)
- `height`: string - Height (CSS)

#### SkeletonPage
```typescript
<SkeletonPage />
```
**Props**: None  
**Features**: Full page skeleton loader

#### ThemeToggle
```typescript
<ThemeToggle />
```
**Props**: None  
**Features**: Dark/light theme toggle

---

## Context Providers

### WalletProvider
```typescript
<WalletProvider>
  {children}
</WalletProvider>
```
**Provides**: `useWallet()` hook

### AuthProvider
```typescript
<AuthProvider>
  {children}
</AuthProvider>
```
**Provides**: `useAuth()` hook

### ProjectProvider
```typescript
<ProjectProvider>
  {children}
</ProjectProvider>
```
**Provides**: `useProject()` hook

### PremiumProvider
```typescript
<PremiumProvider>
  {children}
</PremiumProvider>
```
**Provides**: `usePremium()` hook

### PlatformBalanceProvider
```typescript
<PlatformBalanceProvider>
  {children}
</PlatformBalanceProvider>
```
**Provides**: `usePlatformBalance()` hook

---

## Service Layer

### PointsAPI Service

```typescript
import { PointsAPI } from 'src/points/services/PointsAPI';

// Add points
await PointsAPI.addPoints(userId, 'alpha', 100, 'Daily reward');

// Subtract points
await PointsAPI.subtractPoints(userId, 'rewards', 50, 'Purchase');

// Transfer points
await PointsAPI.transferPoints(userId, 'balance', 25, toUserId);

// Get points
const points = await PointsAPI.getPoints(userId);

// Batch operations
await PointsAPI.batchOperations([
  { operation: 'add', type: 'alpha', amount: 100 },
  { operation: 'subtract', type: 'rewards', amount: 50 }
]);
```

### SyncEngine Service

```typescript
import { SyncEngine } from 'src/points/services/SyncEngine';

// Sync to Supabase
await SyncEngine.syncToSupabase(userId);

// Get sync status
const status = SyncEngine.getSyncStatus();

// Subscribe to sync events
SyncEngine.onSyncStateChange((state) => {
  console.log('Sync state:', state);
});
```

### TransactionManager Service

```typescript
import { TransactionManager } from 'src/points/services/TransactionManager';

// Get transaction history
const transactions = await TransactionManager.getTransactionHistory(userId, {
  pointsType: 'alpha',
  startDate: '2026-01-01',
  limit: 50
});

// Create transaction
await TransactionManager.createTransaction({
  userId,
  operationType: 'add',
  pointsType: 'alpha',
  amount: 100,
  reason: 'Daily reward'
});
```

### AchievementManager Service

```typescript
import { AchievementManager } from 'src/points/services/AchievementManager';

// Check achievements
await AchievementManager.checkAchievements(userId);

// Get achievements
const achievements = await AchievementManager.getAchievements();

// Get user achievements
const userAchievements = await AchievementManager.getUserAchievements(userId);
```

### LevelManager Service

```typescript
import { LevelManager } from 'src/points/services/LevelManager';

// Calculate level
const level = LevelManager.calculateLevel(points);

// Check level up
const leveledUp = await LevelManager.checkLevelUp(userId);

// Get level info
const info = LevelManager.getLevelInfo(level);
```

### StorageManager Service

```typescript
import { StorageManager } from 'src/points/services/StorageManager';

// Get from cache
const cached = StorageManager.getFromCache(key);

// Set cache
StorageManager.setCache(key, value, ttl);

// Queue operation
StorageManager.queueOperation(operation);

// Get queued operations
const queued = StorageManager.getQueuedOperations();
```

### EventSystem Service

```typescript
import { EventSystem } from 'src/points/services/EventSystem';

// Subscribe to events
const unsubscribe = EventSystem.subscribe('pointsChanged', (data) => {
  console.log('Points changed:', data);
});

// Emit event
EventSystem.emit('pointsChanged', { userId, newPoints });

// Unsubscribe
unsubscribe();
```

---

## Error Handling

### Error Codes

```typescript
// Validation Errors (400)
'INVALID_POINTS_TYPE'
'INVALID_AMOUNT'
'INVALID_USER'
'INSUFFICIENT_BALANCE'

// Authentication Errors (401)
'NOT_AUTHENTICATED'
'SESSION_EXPIRED'
'INVALID_TOKEN'

// Authorization Errors (403)
'NOT_AUTHORIZED'
'INSUFFICIENT_PERMISSIONS'

// Not Found Errors (404)
'USER_NOT_FOUND'
'ACHIEVEMENT_NOT_FOUND'
'TRANSACTION_NOT_FOUND'

// Sync Errors (409)
'CONFLICT_DETECTED'
'SYNC_FAILED'
'OFFLINE_MODE'

// Server Errors (500)
'DATABASE_ERROR'
'INTERNAL_ERROR'
'SERVICE_UNAVAILABLE'
```

### Error Handling Example

```typescript
try {
  await PointsAPI.addPoints(userId, 'alpha', 100, 'Reward');
} catch (error) {
  if (error.code === 'INSUFFICIENT_BALANCE') {
    console.error('Not enough points');
  } else if (error.code === 'OFFLINE_MODE') {
    console.log('Operation queued for sync');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Best Practices

### 1. Hook Usage
```typescript
// ✅ Good
function MyComponent() {
  const { points, addPoints } = usePoints();
  
  return <div>{points.alpha}</div>;
}

// ❌ Bad
function MyComponent() {
  const wallet = useWallet();
  const auth = useAuth();
  const points = usePoints();
  const achievements = useAchievements();
  // Too many hooks
}
```

### 2. Error Handling
```typescript
// ✅ Good
try {
  await addPoints('alpha', 100, 'Reward');
} catch (error) {
  if (error.code === 'OFFLINE_MODE') {
    showNotification('Operation queued');
  } else {
    showError(error.message);
  }
}

// ❌ Bad
await addPoints('alpha', 100, 'Reward');
```

### 3. Component Props
```typescript
// ✅ Good
interface ProjectCardProps {
  project: Project;
  onInvest: (amount: number) => void;
}

// ❌ Bad
interface ProjectCardProps {
  project: any;
  onInvest: any;
}
```

---

**Last Updated**: February 4, 2026
