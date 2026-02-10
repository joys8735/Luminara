# Luminara - Web3 DeFi Platform
## Complete Project Documentation

**Version**: 1.0.0  
**Last Updated**: February 4, 2026  
**Status**: Active Development

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Core Features](#core-features)
6. [Setup & Installation](#setup--installation)
7. [Development Guide](#development-guide)
8. [API Documentation](#api-documentation)
9. [Database Schema](#database-schema)
10. [Smart Contracts](#smart-contracts)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Luminara** is a comprehensive Web3 DeFi platform designed for cryptocurrency enthusiasts, NFT collectors, and blockchain investors. It combines token sales (IDO), NFT marketplace, staking, mining, and a sophisticated unified points/rewards system.

### Key Objectives
- Provide a seamless Web3 experience for users
- Enable token sales with tiered pricing and referral bonuses
- Create an NFT ecosystem with marketplace and collection management
- Offer DeFi services (staking, mining, pools, yield farming)
- Implement a sophisticated rewards and achievements system
- Support multiple blockchain networks and wallets

### Target Users
- Cryptocurrency investors
- NFT collectors
- DeFi enthusiasts
- Blockchain developers
- Token project teams

---

## Technology Stack

### Frontend
```
React 18.3.1 + TypeScript
├── Build: Vite 7.2.7
├── Styling: Tailwind CSS 3.4.17 + PostCSS
├── Routing: React Router DOM 6.26.2
├── State: Context API + React Hooks
├── UI: Lucide React, Framer Motion
├── Charts: Recharts, Chart.js, Lightweight Charts
├── Notifications: Sonner 2.0.1
└── QR Code: React QR Code 2.0.18
```

### Blockchain & Web3
```
Ethers.js v6.16.0
├── MetaMask Integration
├── Phantom Wallet Support
├── BSC Testnet (97) / Mainnet (56)
├── Smart Contract Interaction
└── Chainlink Price Feeds
```

### Backend
```
Node.js + Express 5.2.1
├── Authentication: Passport.js + Google OAuth 2.0
├── Session: Express Session
├── AI: OpenAI, Google Gemini, DeepSeek
└── CORS: Enabled
```

### Database & Services
```
Supabase (PostgreSQL)
├── Real-time Subscriptions
├── Authentication
├── Row-Level Security (RLS)
└── Migrations
```

### Development Tools
```
ESLint + TypeScript
├── Linting
├── Type Checking
└── Code Quality
```

---

## Project Structure

```
luminara/
├── backend/                    # Node.js backend
│   ├── index.js               # Main server + OAuth
│   ├── deepseekApi.js         # AI integration
│   ├── aiContex.js            # AI context builder
│   └── .env                   # Backend config
│
├── src/                       # Frontend source
│   ├── pages/                 # Page components (24 pages)
│   │   ├── Landing.tsx
│   │   ├── Home.tsx
│   │   ├── TokenSale.tsx
│   │   ├── NFTMarketplace.tsx
│   │   ├── Staking.tsx
│   │   ├── Predictions.tsx
│   │   └── ... (20 more pages)
│   │
│   ├── components/            # Reusable components (40+)
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── WalletConnect.tsx
│   │   ├── UserProfile.tsx
│   │   ├── InvestmentModal.tsx
│   │   └── ... (35+ more)
│   │
│   ├── context/               # Global state (5 providers)
│   │   ├── WalletContext.tsx
│   │   ├── AuthContext.tsx
│   │   ├── ProjectContext.tsx
│   │   ├── PremiumContext.tsx
│   │   └── PlatformBalanceContext.tsx
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── usePoints.ts
│   │   ├── useProfile.ts
│   │   ├── usePredictions.ts
│   │   └── ... (4 more)
│   │
│   ├── points/                # Unified Points System
│   │   ├── services/          # 10 core services
│   │   │   ├── PointsAPI.ts
│   │   │   ├── SyncEngine.ts
│   │   │   ├── TransactionManager.ts
│   │   │   ├── AchievementManager.ts
│   │   │   ├── LevelManager.ts
│   │   │   ├── StorageManager.ts
│   │   │   ├── EventSystem.ts
│   │   │   ├── MigrationManager.ts
│   │   │   ├── ErrorHandler.ts
│   │   │   └── PointsTypeSystem.ts
│   │   ├── hooks/             # Points hooks
│   │   ├── types/             # Type definitions
│   │   ├── constants/         # Constants
│   │   ├── utils/             # Utilities
│   │   ├── migrations/        # SQL migrations
│   │   └── __tests__/         # Tests
│   │
│   ├── abi/                   # Smart contract ABIs
│   │   ├── PremiumSubscription.json
│   │   └── constants.ts
│   │
│   ├── api/                   # API utilities
│   │   └── auth.ts
│   │
│   ├── lib/                   # Libraries
│   │   └── supabase.ts
│   │
│   ├── assets/                # Static assets
│   │   ├── css/
│   │   ├── js/
│   │   ├── fonts/
│   │   ├── img/
│   │   └── scss/
│   │
│   ├── types/                 # Global types
│   │   └── global.d.ts
│   │
│   ├── App.tsx                # Main app component
│   ├── index.tsx              # Entry point
│   └── index.css              # Global styles
│
├── public/                    # Public assets
│   ├── images/
│   ├── premium/
│   ├── rarity-nft/
│   └── ... (logos, videos)
│
├── icons/                     # Icon assets
│   ├── btc.png
│   ├── eth.png
│   ├── sol.png
│   └── ... (30+ crypto icons)
│
├── .kiro/                     # Kiro configuration
│   ├── agents.md              # Agent documentation
│   ├── specs/                 # Feature specifications
│   └── steering/              # Development guidelines
│
├── .env                       # Frontend config
├── .env.example               # Config template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── tailwind.config.js         # Tailwind config
├── postcss.config.js          # PostCSS config
├── .eslintrc.cjs              # ESLint config
└── README.md                  # Project README
```

---

## Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer                      │
│  (Pages, Components, UI)                        │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│    State Management Layer                       │
│  (Context Providers, React Hooks)               │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│    Business Logic Layer                         │
│  (Services: Points, Sync, Transactions, etc.)   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│    Data Access Layer                            │
│  (Supabase, localStorage, Cache)                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│    External Services                            │
│  (Blockchain, AI APIs, OAuth)                   │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
User Interaction (UI)
    ↓
React Component
    ↓
Context Provider / Hook
    ↓
Service Layer (PointsAPI, SyncEngine, etc.)
    ↓
Storage Layer (Cache, Queue, localStorage)
    ↓
Supabase / Blockchain
    ↓
Response → Cache Update → Event Emission
    ↓
Component Re-render
```

### Design Patterns

1. **Context API Pattern** - Global state management
2. **Service-Oriented Architecture** - Modular services
3. **Event-Driven Architecture** - Real-time updates
4. **Offline-First Pattern** - Operation queueing
5. **Server-as-Source Pattern** - Supabase as source of truth
6. **Circuit Breaker Pattern** - Error handling
7. **Factory Pattern** - Service instantiation
8. **Observer Pattern** - Event subscriptions

---

## Core Features

### 1. Unified Points System
**Location**: `src/points/`

**Components**:
- **Three Point Types**: Alpha, Rewards, Balance
- **Transaction History**: Immutable audit trail
- **Achievements**: Automatic unlock on threshold
- **Levels**: Bronze (0-499), Silver (500-1999), Gold (2000+)
- **Supabase Sync**: Real-time synchronization
- **Offline Support**: Operation queueing

**Key Services**:
- `PointsAPI.ts` - Add, subtract, transfer operations
- `SyncEngine.ts` - Supabase synchronization
- `TransactionManager.ts` - Transaction history
- `AchievementManager.ts` - Achievement tracking
- `LevelManager.ts` - Level progression

---

### 2. Wallet Integration
**Location**: `src/context/WalletContext.tsx`

**Features**:
- MetaMask support (EVM)
- Phantom support (Solana)
- Network switching (BSC Testnet/Mainnet)
- Balance tracking
- Cashback management
- Provider management

**Supported Networks**:
- BSC Testnet (Chain ID: 97)
- BSC Mainnet (Chain ID: 56)

---

### 3. Token Sale (IDO)
**Location**: `src/pages/TokenSale.tsx`

**Features**:
- Tiered pricing
- Whitelist support
- Referral bonuses
- Investment confirmation
- Token distribution
- Vesting schedules

---

### 4. NFT Ecosystem
**Location**: `src/pages/NFT*.tsx`

**Components**:
- **NFT Drop**: Distribution mechanism
- **NFT Marketplace**: Trading platform
- **NFT Sale**: Direct sales
- **NFT Futures**: Derivative trading
- **Collection Management**: User collections

**Rarity Tiers**:
- Common
- Rare
- Epic
- Legendary

---

### 5. DeFi Services
**Location**: `src/pages/`

**Services**:
- **Staking**: Token staking with APY
- **Mining**: Mining operations
- **Pools**: Liquidity pools
- **Yield Farming**: Yield optimization
- **Airdrop**: Token distribution

---

### 6. Premium Subscription
**Location**: `src/context/PremiumContext.tsx`

**Features**:
- Monthly/yearly plans
- Exclusive benefits
- Feature access control
- Billing management
- Subscription renewal

---

### 7. Authentication
**Location**: `src/context/AuthContext.tsx`

**Methods**:
- Google OAuth 2.0
- Wallet authentication
- Session management
- User profiles

---

### 8. AI Assistant
**Location**: `backend/deepseekApi.js`

**Providers**:
1. OpenAI (GPT-3.5-turbo)
2. Google Gemini
3. DeepSeek
4. Local AI Brain (fallback)

**Features**:
- Multi-provider support
- Fallback mechanism
- Platform knowledge base
- Rate limiting
- Response caching

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Supabase account
- Google OAuth credentials
- Blockchain RPC endpoints

### Frontend Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/luminara.git
cd luminara

# 2. Install dependencies
npm install
# or
yarn install

# 3. Create .env file
cp .env.example .env

# 4. Configure environment variables
# Edit .env with your values:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_GOOGLE_CLIENT_ID
# - VITE_BACKEND_URL

# 5. Start development server
npm run dev
# or
yarn dev

# Server runs on http://localhost:5173
```

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Configure environment variables
# - PORT
# - FRONTEND_URL
# - SESSION_SECRET
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - OPENAI_API_KEY
# - GEMINI_API_KEY
# - DEEPSEEK_API_KEY

# 5. Start backend server
npm start

# Server runs on http://localhost:4000
```

### Database Setup

```bash
# 1. Create Supabase project
# Visit https://supabase.com

# 2. Run migrations
# Copy content from src/points/migrations/supabase-schema.sql
# Execute in Supabase SQL editor

# 3. Configure RLS policies
# See database schema section below
```

### Environment Variables

**Frontend (.env)**:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_BACKEND_URL=http://localhost:4000
VITE_CHAIN_ID=97
```

**Backend (.env)**:
```
PORT=4000
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
DEEPSEEK_API_KEY=your-deepseek-key
```

---

## Development Guide

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test suite
npm run test -- src/points/__tests__/unit

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type check
npx tsc --noEmit
```

### Building

```bash
# Development build
npm run build

# Preview production build
npm run preview

# Production build
npm run build -- --mode production
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: description"

# Push to remote
git push origin feature/feature-name

# Create pull request
# Review and merge
```

### Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Imports**: Organized by type (React, libraries, local)
- **Comments**: JSDoc for functions, inline for complex logic
- **Formatting**: Prettier (configured in project)

---

## API Documentation

### Backend Endpoints

#### Authentication
```
POST /auth/google
- Initiates Google OAuth flow

GET /auth/google/callback
- OAuth callback handler

GET /auth/user
- Get current user info

POST /auth/logout
- Logout user
```

#### AI Assistant
```
POST /api/ai/chat
- Send message to AI
- Body: { message: string, context?: object }
- Response: { response: string, provider: string }

GET /api/health
- Health check

GET /api/providers
- List available AI providers
```

### Frontend Hooks

#### useWallet
```typescript
const {
  connected,
  publicKey,
  walletAddress,
  balance,
  chainId,
  isCorrectNetwork,
  walletType,
  connectWallet,
  switchNetwork,
  disconnectWallet
} = useWallet();
```

#### usePoints
```typescript
const {
  points,
  loading,
  error,
  addPoints,
  subtractPoints,
  transferPoints,
  getTransactionHistory
} = usePoints();
```

#### useAuth
```typescript
const {
  user,
  loading,
  error,
  login,
  logout,
  isAuthenticated
} = useAuth();
```

---

## Database Schema

### Points Table
```sql
CREATE TABLE points (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  alpha_points INTEGER DEFAULT 0,
  reward_points INTEGER DEFAULT 0,
  platform_balance INTEGER DEFAULT 0,
  last_updated TIMESTAMP,
  created_at TIMESTAMP,
  UNIQUE(user_id)
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  operation_type VARCHAR(50),
  points_type VARCHAR(20),
  amount INTEGER NOT NULL,
  reason TEXT,
  balance_before INTEGER,
  balance_after INTEGER,
  related_user_id UUID,
  timestamp TIMESTAMP,
  created_at TIMESTAMP
);
```

### Achievements Table
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  points_threshold INTEGER,
  reward_points INTEGER,
  created_at TIMESTAMP
);
```

### User Achievements Table
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Indexes
```sql
CREATE INDEX idx_points_user_id ON points(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
```

---

## Smart Contracts

### TokenSaleOptimized
**Purpose**: Token sale with tiered pricing

**Functions**:
- `buyTokens()` - Purchase tokens
- `setTier()` - Configure tier
- `withdraw()` - Withdraw funds
- `emergencyWithdraw()` - Emergency withdrawal

### PremiumSubscription
**Purpose**: Premium subscription management

**Functions**:
- `subscribe()` - Subscribe to premium
- `cancelSubscription()` - Cancel subscription
- `renewSubscription()` - Renew subscription
- `checkSubscriptionStatus()` - Check status

### NFT Contracts
**Purpose**: NFT minting and trading

**Functions**:
- `mint()` - Mint new NFT
- `transfer()` - Transfer NFT
- `burn()` - Burn NFT
- `setMetadata()` - Update metadata

---

## Deployment Guide

### Frontend Deployment (Vercel)

```bash
# 1. Connect GitHub repository
# Visit https://vercel.com

# 2. Configure environment variables
# Add all VITE_* variables

# 3. Deploy
# Automatic on push to main

# 4. Verify deployment
# Check https://your-project.vercel.app
```

### Backend Deployment (Heroku/Railway)

```bash
# 1. Create account on Heroku/Railway

# 2. Connect repository
# heroku create your-app-name

# 3. Set environment variables
# heroku config:set KEY=value

# 4. Deploy
# git push heroku main

# 5. Verify
# heroku logs --tail
```

### Database Deployment

```bash
# 1. Supabase is managed service
# No additional deployment needed

# 2. Run migrations in production
# Execute SQL in Supabase dashboard

# 3. Configure RLS policies
# Set up row-level security
```

---

## Troubleshooting

### Common Issues

**Issue**: Wallet connection fails
```
Solution:
1. Check MetaMask/Phantom is installed
2. Verify network is BSC Testnet (97)
3. Check browser console for errors
4. Try refreshing page
```

**Issue**: Points not syncing
```
Solution:
1. Check Supabase connection
2. Verify user is authenticated
3. Check browser console for errors
4. Clear localStorage and retry
```

**Issue**: AI assistant not responding
```
Solution:
1. Check backend is running
2. Verify API keys are configured
3. Check network connectivity
4. Try alternative AI provider
```

**Issue**: Build fails
```
Solution:
1. Clear node_modules: rm -rf node_modules
2. Reinstall: npm install
3. Clear cache: npm cache clean --force
4. Try again: npm run build
```

**Issue**: Database connection error
```
Solution:
1. Verify Supabase URL and key
2. Check network connectivity
3. Verify RLS policies
4. Check user permissions
```

---

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization
- CSS minification
- JavaScript bundling
- Caching strategies

### Backend
- Database indexing
- Query optimization
- Response caching
- Batch operations
- Connection pooling

### Blockchain
- Contract optimization
- Gas optimization
- Batch transactions
- Caching contract calls

---

## Security Best Practices

1. **Input Validation**: Validate all user inputs
2. **Authentication**: Use OAuth 2.0 and wallet auth
3. **Authorization**: Implement RLS policies
4. **Encryption**: Use HTTPS/TLS
5. **Secrets**: Store in environment variables
6. **Error Handling**: Don't expose sensitive info
7. **Rate Limiting**: Prevent abuse
8. **Audit Logging**: Track all operations

---

## Monitoring & Logging

### Frontend Logging
- Console logs for development
- Error tracking (Sentry)
- Performance monitoring
- User analytics

### Backend Logging
- Request/response logging
- Error logging
- Performance metrics
- Database query logging

### Blockchain Monitoring
- Transaction tracking
- Gas usage monitoring
- Contract events
- Network status

---

## Contributing

### Code Review Process
1. Create feature branch
2. Make changes
3. Write tests
4. Submit pull request
5. Code review
6. Merge to main

### Commit Message Format
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
refactor: Refactor code
test: Add tests
chore: Maintenance
```

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Ethers.js Documentation](https://docs.ethers.org)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

---

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@luminara.dev
- **Discord**: [Join Community](https://discord.gg/luminara)

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Last Updated**: February 4, 2026  
**Maintained By**: Development Team  
**Status**: Active Development
