# Luminara Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Interface Layer                         │
│  (React Components, Pages, Modals, Forms)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  State Management Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ WalletContext│  │ AuthContext  │  │ ProjectCtx   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ PremiumCtx   │  │ PlatformCtx  │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Unified Points System (10 Services)             │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ PointsAPI  │  │ SyncEngine │  │ TransMgr   │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ AchieveMgr │  │ LevelMgr   │  │ StorageMgr │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ EventSys   │  │ MigrationMgr│ │ ErrorMgr   │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Domain Services                                 │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ Wallet Svc │  │ Auth Svc   │  │ NFT Svc    │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ Token Svc  │  │ DeFi Svc   │  │ Premium Svc│         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Data Access Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Supabase     │  │ localStorage │  │ Memory Cache │           │
│  │ (PostgreSQL) │  │ (Persistence)│  │ (Performance)│           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                External Services Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Blockchain   │  │ AI APIs      │  │ OAuth 2.0    │           │
│  │ (Ethers.js)  │  │ (OpenAI,etc) │  │ (Google)     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Page Components (24 Total)

```
Pages/
├── Landing.tsx              # Marketing landing page
├── Home.tsx                 # Dashboard overview
├── TokenSale.tsx            # Token purchase interface
├── Pools.tsx                # Liquidity pool management
├── Mining.tsx               # Mining operations
├── NFTDrop.tsx              # NFT distribution
├── NFTMarketplace.tsx       # NFT trading
├── NFTSale.tsx              # Direct NFT sales
├── NFTFutures.tsx           # NFT derivatives
├── Staking.tsx              # Token staking
├── Airdrop.tsx              # Airdrop claims
├── Predictions.tsx          # Price prediction games
├── Portfolio.tsx            # Investment tracking
├── Wallet.tsx               # Wallet management
├── WalletDashboard.tsx      # Wallet overview
├── Exchange.tsx             # Token exchange
├── Subscription.tsx         # Premium subscription
├── Web3Identity.tsx         # User profile
├── Whitelist.tsx            # Whitelist management
├── ApplyForIDO.tsx          # IDO applications
├── DailyRewards.tsx         # Daily reward claims
├── Notifications.tsx        # User notifications
├── Support.tsx              # Help and support
├── Rules.tsx                # Platform rules
└── About.tsx                # About page
```

### Component Hierarchy

```
App
├── BrowserRouter
│   ├── WalletProvider
│   │   ├── ProjectProvider
│   │   │   ├── PlatformBalanceProvider
│   │   │   │   ├── PremiumProvider
│   │   │   │   │   ├── Routes
│   │   │   │   │   │   ├── LandingLayout
│   │   │   │   │   │   │   └── Landing
│   │   │   │   │   │   ├── MainLayout
│   │   │   │   │   │   │   ├── Header
│   │   │   │   │   │   │   ├── Sidebar
│   │   │   │   │   │   │   ├── Page Content
│   │   │   │   │   │   │   └── Footer
│   │   │   │   │   │   └── ... (other routes)
│   │   │   │   │   └── Toaster (Notifications)
```

---

## State Management Architecture

### Context Providers

#### 1. WalletContext
```typescript
interface WalletContextType {
  // Connection State
  connected: boolean;
  walletType: 'phantom' | 'metamask' | null;
  
  // Wallet Info
  publicKey: string | null;
  walletAddress: string | null;
  balance: number;
  
  // Network Info
  chainId: number | null;
  isCorrectNetwork: boolean;
  
  // Provider
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  
  // Methods
  connectWallet(type): Promise<void>;
  switchNetwork(chainId): Promise<void>;
  disconnectWallet(): void;
  
  // Rewards
  cashbackBalance: number;
  addCashback(amount): void;
  withdrawCashback(): void;
}
```

#### 2. AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  login(): Promise<void>;
  logout(): Promise<void>;
  refreshUser(): Promise<void>;
}
```

#### 3. ProjectContext
```typescript
interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  
  selectProject(id): void;
  updateProject(project): Promise<void>;
  getProjectDetails(id): Promise<Project>;
}
```

#### 4. PremiumContext
```typescript
interface PremiumContextType {
  isPremium: boolean;
  subscription: Subscription | null;
  features: PremiumFeature[];
  loading: boolean;
  
  subscribe(plan): Promise<void>;
  cancelSubscription(): Promise<void>;
  checkFeatureAccess(feature): boolean;
}
```

#### 5. PlatformBalanceContext
```typescript
interface PlatformBalanceContextType {
  balance: number;
  loading: boolean;
  error: string | null;
  
  updateBalance(): Promise<void>;
  addBalance(amount): Promise<void>;
  withdrawBalance(amount): Promise<void>;
}
```

---

## Unified Points System Architecture

### Service Layer (10 Services)

```
PointsSystem/
├── PointsTypeSystem.ts
│   ├── getPointsMetadata()
│   ├── validatePointsType()
│   └── getAllPointsTypes()
│
├── StorageManager.ts
│   ├── Memory Cache (5-min TTL)
│   ├── Operation Queue (offline)
│   └── localStorage (persistence)
│
├── TransactionManager.ts
│   ├── createTransaction()
│   ├── getTransactionHistory()
│   ├── filterTransactions()
│   └── 2-year retention policy
│
├── SyncEngine.ts
│   ├── syncToSupabase()
│   ├── resolveConflicts()
│   ├── exponential backoff
│   └── offline queueing
│
├── PointsAPI.ts
│   ├── addPoints()
│   ├── subtractPoints()
│   ├── transferPoints()
│   └── batchOperations()
│
├── AchievementManager.ts
│   ├── checkAchievements()
│   ├── unlockAchievement()
│   ├── getAchievements()
│   └── duplicate prevention
│
├── LevelManager.ts
│   ├── calculateLevel()
│   ├── checkLevelUp()
│   ├── awardLevelBonus()
│   └── 3 tiers (Bronze, Silver, Gold)
│
├── EventSystem.ts
│   ├── subscribe()
│   ├── emit()
│   ├── unsubscribe()
│   └── memory leak prevention
│
├── MigrationManager.ts
│   ├── migrateFromLocalStorage()
│   ├── validateData()
│   ├── createTransactionRecords()
│   └── idempotence
│
└── ErrorHandler.ts
    ├── handleError()
    ├── getErrorCode()
    ├── retryLogic()
    └── errorTracking
```

### Data Flow in Points System

```
User Action (e.g., claim daily reward)
    ↓
PointsAPI.addPoints()
    ↓
StorageManager.queue operation (if offline)
    ↓
TransactionManager.createTransaction()
    ↓
SyncEngine.syncToSupabase()
    ↓
AchievementManager.checkAchievements()
    ↓
LevelManager.checkLevelUp()
    ↓
EventSystem.emit('pointsChanged')
    ↓
React Components re-render
```

### Database Schema

```
┌─────────────────────────────────────────┐
│ points                                  │
├─────────────────────────────────────────┤
│ id (UUID)                               │
│ user_id (UUID) → auth.users             │
│ alpha_points (INTEGER)                  │
│ reward_points (INTEGER)                 │
│ platform_balance (INTEGER)              │
│ last_updated (TIMESTAMP)                │
│ created_at (TIMESTAMP)                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ transactions                            │
├─────────────────────────────────────────┤
│ id (UUID)                               │
│ user_id (UUID) → auth.users             │
│ operation_type (VARCHAR)                │
│ points_type (VARCHAR)                   │
│ amount (INTEGER)                        │
│ reason (TEXT)                           │
│ balance_before (INTEGER)                │
│ balance_after (INTEGER)                 │
│ related_user_id (UUID)                  │
│ timestamp (TIMESTAMP)                   │
│ created_at (TIMESTAMP)                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ achievements                            │
├─────────────────────────────────────────┤
│ id (UUID)                               │
│ name (VARCHAR)                          │
│ description (TEXT)                      │
│ icon (VARCHAR)                          │
│ points_threshold (INTEGER)              │
│ reward_points (INTEGER)                 │
│ created_at (TIMESTAMP)                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ user_achievements                       │
├─────────────────────────────────────────┤
│ id (UUID)                               │
│ user_id (UUID) → auth.users             │
│ achievement_id (UUID) → achievements    │
│ unlocked_at (TIMESTAMP)                 │
│ created_at (TIMESTAMP)                  │
└─────────────────────────────────────────┘
```

---

## Blockchain Integration Architecture

### Wallet Connection Flow

```
User clicks "Connect Wallet"
    ↓
WalletConnect component
    ↓
Select wallet type (MetaMask/Phantom)
    ↓
WalletContext.connectWallet()
    ↓
Request wallet connection
    ↓
User approves in wallet
    ↓
Get provider & signer
    ↓
Fetch balance & chain ID
    ↓
Verify correct network
    ↓
Store in context & localStorage
    ↓
Update UI
```

### Smart Contract Interaction Flow

```
User initiates action (e.g., buy tokens)
    ↓
Component calls service method
    ↓
Service prepares transaction
    ↓
Get signer from WalletContext
    ↓
Create contract instance
    ↓
Call contract method
    ↓
User signs in wallet
    ↓
Transaction submitted
    ↓
Wait for confirmation
    ↓
Update UI with result
    ↓
Record transaction
```

### Supported Networks

```
BSC Testnet (97)
├── RPC: https://data-seed-prebsc-1-1.binance.org:8545
├── Explorer: https://testnet.bscscan.com
└── Used for: Development & Testing

BSC Mainnet (56)
├── RPC: https://bsc-dataseed.binance.org
├── Explorer: https://bscscan.com
└── Used for: Production
```

---

## Authentication Architecture

### OAuth 2.0 Flow

```
User clicks "Login with Google"
    ↓
Frontend redirects to backend
    ↓
Backend initiates Google OAuth
    ↓
User logs in with Google
    ↓
Google redirects to callback
    ↓
Backend exchanges code for token
    ↓
Backend creates session
    ↓
Frontend redirected to app
    ↓
User authenticated
```

### Session Management

```
Login
    ↓
Create session (express-session)
    ↓
Store in memory/Redis
    ↓
Set secure cookie
    ↓
User authenticated for duration
    ↓
Logout
    ↓
Destroy session
    ↓
Clear cookie
```

---

## API Architecture

### Backend Routes

```
/auth
├── GET /auth/google              → Initiate OAuth
├── GET /auth/google/callback     → OAuth callback
├── GET /auth/user                → Get current user
└── POST /auth/logout             → Logout

/api/ai
├── POST /api/ai/chat             → Send message
├── GET /api/health               → Health check
└── GET /api/providers            → List providers

/api/points (Frontend only)
├── GET /api/points               → Get points
├── POST /api/points/add          → Add points
├── POST /api/points/transfer     → Transfer points
└── GET /api/transactions         → Get history
```

---

## Error Handling Architecture

### Error Hierarchy

```
Error
├── ValidationError
│   ├── InvalidPointsType
│   ├── InvalidAmount
│   └── InvalidUser
├── SyncError
│   ├── OfflineError
│   ├── ConflictError
│   └── RetryError
├── BlockchainError
│   ├── TransactionFailed
│   ├── InsufficientBalance
│   └── NetworkError
└── AuthError
    ├── NotAuthenticated
    ├── NotAuthorized
    └── SessionExpired
```

### Error Recovery

```
Error Occurs
    ↓
ErrorHandler.handleError()
    ↓
Determine error type
    ↓
Log error
    ↓
Decide recovery strategy
    ├── Retry (with backoff)
    ├── Fallback
    ├── Queue (offline)
    └── Notify user
    ↓
Execute recovery
    ↓
Resume operation or notify user
```

---

## Performance Architecture

### Caching Strategy

```
Request
    ↓
Check memory cache (5-min TTL)
    ├── Hit → Return cached data
    └── Miss → Continue
    ↓
Check localStorage
    ├── Hit → Return & update memory
    └── Miss → Continue
    ↓
Fetch from Supabase
    ↓
Update memory cache
    ↓
Update localStorage
    ↓
Return data
```

### Code Splitting

```
App.tsx
├── Landing (lazy)
├── Home (lazy)
├── TokenSale (lazy)
├── NFTMarketplace (lazy)
├── Staking (lazy)
├── Predictions (lazy)
└── ... (all pages lazy loaded)
```

### Optimization Techniques

1. **Lazy Loading**: React.lazy() for pages
2. **Code Splitting**: Webpack chunks
3. **Image Optimization**: Responsive images
4. **CSS Minification**: Tailwind purging
5. **Database Indexing**: Indexed queries
6. **Batch Operations**: Reduce API calls
7. **Caching**: Multi-level caching
8. **Compression**: Gzip compression

---

## Security Architecture

### Authentication & Authorization

```
Request
    ↓
Check authentication
    ├── Valid session → Continue
    └── Invalid → Redirect to login
    ↓
Check authorization
    ├── Has permission → Continue
    └── No permission → Deny
    ↓
Execute operation
    ↓
Log operation
```

### Data Protection

```
Sensitive Data
    ├── In Transit: HTTPS/TLS
    ├── At Rest: Encrypted in DB
    ├── In Memory: Cleared after use
    └── In Logs: Sanitized
```

### Row-Level Security (RLS)

```
Supabase RLS Policies
├── Users can only see their own data
├── Admins can see all data
├── Service role for backend operations
└── Public data accessible to all
```

---

## Deployment Architecture

### Frontend Deployment

```
GitHub Repository
    ↓
Push to main branch
    ↓
Vercel detects change
    ↓
Build: npm run build
    ↓
Test: npm run lint
    ↓
Deploy to CDN
    ↓
Live at https://luminara.vercel.app
```

### Backend Deployment

```
GitHub Repository
    ↓
Push to main branch
    ↓
Railway/Heroku detects change
    ↓
Build: npm install
    ↓
Start: npm start
    ↓
Deploy to server
    ↓
Live at https://api.luminara.dev
```

### Database Deployment

```
Supabase Project
    ├── Managed PostgreSQL
    ├── Automatic backups
    ├── Real-time subscriptions
    └── Built-in authentication
```

---

## Monitoring & Observability

### Metrics

```
Frontend
├── Page load time
├── Component render time
├── API response time
├── Error rate
└── User interactions

Backend
├── Request latency
├── Error rate
├── Database query time
├── API availability
└── Resource usage

Blockchain
├── Transaction success rate
├── Gas usage
├── Network latency
└── Contract calls
```

### Logging

```
Frontend
├── Console logs (dev)
├── Error tracking (Sentry)
├── Analytics (Google Analytics)
└── Performance (Web Vitals)

Backend
├── Request logs
├── Error logs
├── Database logs
└── Audit logs
```

---

## Scalability Architecture

### Horizontal Scaling

```
Load Balancer
    ├── Backend Instance 1
    ├── Backend Instance 2
    ├── Backend Instance 3
    └── Backend Instance N
    ↓
Shared Database (Supabase)
```

### Vertical Scaling

```
Increase Resources
├── CPU
├── Memory
├── Database connections
└── API rate limits
```

### Database Scaling

```
Supabase
├── Connection pooling
├── Read replicas
├── Partitioning
└── Caching layer
```

---

## Technology Integration Map

```
Frontend (React)
    ├── State (Context API)
    ├── UI (Tailwind CSS)
    ├── Animations (Framer Motion)
    ├── Charts (Recharts)
    └── Notifications (Sonner)
    ↓
Backend (Express)
    ├── Authentication (Passport)
    ├── AI (OpenAI/Gemini)
    └── CORS
    ↓
Database (Supabase)
    ├── PostgreSQL
    ├── Real-time
    └── Auth
    ↓
Blockchain (Ethers.js)
    ├── MetaMask
    ├── Phantom
    └── Smart Contracts
    ↓
External APIs
    ├── Google OAuth
    ├── AI Providers
    └── Price Feeds
```

---

## Conclusion

This architecture provides:
- **Scalability**: Horizontal and vertical scaling
- **Reliability**: Error handling and recovery
- **Security**: Authentication and authorization
- **Performance**: Caching and optimization
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Modular design for new features

---

**Last Updated**: February 4, 2026
