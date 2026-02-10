# Developer Guide - Luminara

## Table of Contents
1. [Development Workflow](#development-workflow)
2. [Code Standards](#code-standards)
3. [Git Workflow](#git-workflow)
4. [Testing Strategy](#testing-strategy)
5. [Debugging Guide](#debugging-guide)
6. [Performance Optimization](#performance-optimization)
7. [Security Best Practices](#security-best-practices)

---

## Development Workflow

### Daily Development Cycle

```
1. Start Day
   ├── Pull latest changes: git pull origin main
   ├── Install dependencies: npm install
   └── Start dev servers: npm run dev

2. Development
   ├── Create feature branch
   ├── Make changes
   ├── Test locally
   ├── Commit changes
   └── Push to remote

3. Code Review
   ├── Create pull request
   ├── Address feedback
   ├── Merge to main
   └── Deploy

4. End Day
   ├── Push all changes
   ├── Update documentation
   └── Log any issues
```

### Setting Up Development Environment

```bash
# 1. Clone repository
git clone https://github.com/your-org/luminara.git
cd luminara

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Create .env files
cp .env.example .env
cp backend/.env.example backend/.env

# 4. Configure environment variables
# Edit .env and backend/.env with your values

# 5. Start development servers
# Terminal 1
npm run dev

# Terminal 2
cd backend && npm start

# 6. Verify setup
# Frontend: http://localhost:5173
# Backend: http://localhost:4000/api/health
```

---

## Code Standards

### TypeScript Guidelines

**Use strict mode**:
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**Type everything**:
```typescript
// ✅ Good
interface UserProps {
  id: string;
  name: string;
  email: string;
}

function User({ id, name, email }: UserProps) {
  return <div>{name}</div>;
}

// ❌ Bad
function User(props: any) {
  return <div>{props.name}</div>;
}
```

**Use enums for constants**:
```typescript
// ✅ Good
enum PointsType {
  Alpha = 'alpha',
  Rewards = 'rewards',
  Balance = 'balance'
}

// ❌ Bad
const POINTS_TYPES = ['alpha', 'rewards', 'balance'];
```

### React Component Guidelines

**Functional components with hooks**:
```typescript
// ✅ Good
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export default function MyComponent({ title, onClick }: MyComponentProps) {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => {
      setCount(count + 1);
      onClick();
    }}>
      {title} ({count})
    </button>
  );
}

// ❌ Bad
class MyComponent extends React.Component {
  // Old class component
}
```

**Memoize expensive components**:
```typescript
// ✅ Good
const MyComponent = React.memo(function MyComponent({ data }) {
  return <div>{data}</div>;
});

// ❌ Bad
function MyComponent({ data }) {
  return <div>{data}</div>;
}
```

**Use custom hooks for logic**:
```typescript
// ✅ Good
function useUserData(userId: string) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading };
}

// ❌ Bad
function UserComponent({ userId }) {
  const [user, setUser] = useState(null);
  // Logic mixed with component
}
```

### Naming Conventions

**Files**:
```
Components:     MyComponent.tsx
Pages:          MyPage.tsx
Hooks:          useMyHook.ts
Services:       MyService.ts
Types:          types.ts
Constants:      constants.ts
```

**Variables & Functions**:
```typescript
// ✅ Good
const userName = 'John';
const isActive = true;
const getUserData = () => {};
const MAX_RETRIES = 3;

// ❌ Bad
const user_name = 'John';
const active = true;
const get_user_data = () => {};
const maxRetries = 3;
```

**React Components**:
```typescript
// ✅ Good
function UserProfile() {}
function UserProfileCard() {}
function useUserProfile() {}

// ❌ Bad
function userProfile() {}
function user_profile() {}
function getUserProfile() {}
```

### Code Organization

**Component structure**:
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useWallet } from 'src/context/WalletContext';
import Button from 'src/components/Button';

// 2. Types
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

// 3. Component
export default function MyComponent({ title, onClick }: MyComponentProps) {
  // 3a. Hooks
  const [count, setCount] = useState(0);
  const { connected } = useWallet();
  
  // 3b. Effects
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, []);
  
  // 3c. Handlers
  const handleClick = () => {
    setCount(count + 1);
    onClick();
  };
  
  // 3d. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click me</Button>
    </div>
  );
}
```

### Comments & Documentation

**JSDoc for functions**:
```typescript
/**
 * Adds points to user account
 * @param userId - The user ID
 * @param type - Type of points (alpha, rewards, balance)
 * @param amount - Amount to add
 * @param reason - Reason for adding points
 * @returns Promise that resolves when points are added
 * @throws Error if user not found or invalid type
 */
async function addPoints(
  userId: string,
  type: PointsType,
  amount: number,
  reason: string
): Promise<void> {
  // Implementation
}
```

**Inline comments for complex logic**:
```typescript
// ✅ Good
// Calculate level based on points using exponential formula
const level = Math.floor(Math.log(points / 100 + 1) / Math.log(2));

// ❌ Bad
// Calculate level
const level = Math.floor(Math.log(points / 100 + 1) / Math.log(2));
```

---

## Git Workflow

### Branch Naming

```
feature/feature-name          # New feature
fix/bug-description           # Bug fix
docs/documentation-update     # Documentation
refactor/refactoring-name     # Code refactoring
test/test-description         # Tests
chore/maintenance-task        # Maintenance
```

### Commit Messages

**Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples**:
```
feat(points): add achievement unlock system

- Implement achievement checking
- Add achievement unlock notifications
- Create achievement database schema

Closes #123
```

```
fix(wallet): handle network switch errors

- Add error handling for network switch
- Show user-friendly error messages
- Retry on temporary failures

Fixes #456
```

### Pull Request Process

1. **Create branch**:
```bash
git checkout -b feature/my-feature
```

2. **Make changes**:
```bash
git add .
git commit -m "feat(scope): description"
```

3. **Push to remote**:
```bash
git push origin feature/my-feature
```

4. **Create pull request**:
   - Go to GitHub
   - Click "New Pull Request"
   - Fill in description
   - Request reviewers

5. **Address feedback**:
```bash
git add .
git commit -m "fix: address review feedback"
git push origin feature/my-feature
```

6. **Merge**:
   - Squash commits if needed
   - Merge to main
   - Delete branch

---

## Testing Strategy

### Unit Tests

**Location**: `src/points/__tests__/unit/`

**Example**:
```typescript
import { PointsAPI } from 'src/points/services/PointsAPI';

describe('PointsAPI', () => {
  describe('addPoints', () => {
    it('should add points to user', async () => {
      const userId = 'test-user';
      const result = await PointsAPI.addPoints(userId, 'alpha', 100, 'Test');
      
      expect(result).toBeDefined();
      expect(result.balanceAfter).toBe(100);
    });
    
    it('should throw error for invalid type', async () => {
      await expect(
        PointsAPI.addPoints('user', 'invalid' as any, 100, 'Test')
      ).rejects.toThrow('INVALID_POINTS_TYPE');
    });
  });
});
```

### Integration Tests

**Location**: `src/points/__tests__/integration/`

**Example**:
```typescript
describe('Points System Integration', () => {
  it('should complete full workflow', async () => {
    // 1. Add points
    await PointsAPI.addPoints(userId, 'alpha', 100, 'Reward');
    
    // 2. Check achievement
    await AchievementManager.checkAchievements(userId);
    
    // 3. Verify transaction
    const transactions = await TransactionManager.getTransactionHistory(userId);
    expect(transactions).toHaveLength(1);
  });
});
```

### Property-Based Tests

**Location**: `src/points/__tests__/properties/`

**Example**:
```typescript
import fc from 'fast-check';

describe('PointsTypeSystem Properties', () => {
  it('should always return valid metadata', () => {
    fc.assert(
      fc.property(fc.constantFrom('alpha', 'rewards', 'balance'), (type) => {
        const metadata = PointsTypeSystem.getMetadata(type);
        expect(metadata).toBeDefined();
        expect(metadata.type).toBe(type);
      })
    );
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/points/__tests__/unit/PointsAPI.test.ts

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch

# Run specific test suite
npm run test -- --testNamePattern="PointsAPI"
```

### Test Coverage Goals

- **Overall**: 80%+
- **Critical paths**: 95%+
- **Utils**: 90%+
- **Services**: 85%+

---

## Debugging Guide

### Browser DevTools

**Console**:
```javascript
// Log component state
console.log('State:', state);

// Log API responses
console.log('Response:', response);

// Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

**Network Tab**:
- Check API requests
- Verify response status
- Check response payload
- Monitor request timing

**React DevTools**:
- Inspect component tree
- Check props and state
- Profile performance
- Track re-renders

### Backend Debugging

**Console logging**:
```javascript
console.log('Request:', req.body);
console.error('Error:', error);
```

**Debugging with Node**:
```bash
# Start with debugger
node --inspect backend/index.js

# Open chrome://inspect in Chrome
```

### Database Debugging

**Supabase Dashboard**:
- View table data
- Check RLS policies
- Monitor real-time subscriptions
- View logs

**SQL Queries**:
```sql
-- Check data
SELECT * FROM points WHERE user_id = 'user-id';

-- Check transactions
SELECT * FROM transactions WHERE user_id = 'user-id' ORDER BY timestamp DESC;

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'points';
```

### Common Issues & Solutions

**Issue**: Component not re-rendering
```typescript
// ✅ Solution: Use state setter
setData({ ...data, field: newValue });

// ❌ Wrong: Direct mutation
data.field = newValue;
```

**Issue**: Infinite loop in useEffect
```typescript
// ✅ Solution: Add dependency array
useEffect(() => {
  fetchData();
}, [userId]); // Only run when userId changes

// ❌ Wrong: No dependency array
useEffect(() => {
  fetchData();
});
```

**Issue**: Memory leak in useEffect
```typescript
// ✅ Solution: Cleanup subscription
useEffect(() => {
  const unsubscribe = subscribe();
  return () => unsubscribe();
}, []);

// ❌ Wrong: No cleanup
useEffect(() => {
  subscribe();
}, []);
```

---

## Performance Optimization

### Frontend Optimization

**Code Splitting**:
```typescript
// ✅ Good: Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const TokenSale = lazy(() => import('./pages/TokenSale'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <Home />
</Suspense>
```

**Memoization**:
```typescript
// ✅ Good: Memoize expensive components
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{data}</div>;
});

// ✅ Good: Memoize callbacks
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);

// ✅ Good: Memoize values
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

**Image Optimization**:
```typescript
// ✅ Good: Use responsive images
<img 
  src="image.jpg" 
  srcSet="image-small.jpg 480w, image-large.jpg 1200w"
  sizes="(max-width: 600px) 480px, 1200px"
  alt="Description"
/>

// ✅ Good: Use WebP with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" />
</picture>
```

### Backend Optimization

**Database Indexing**:
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_points_user_id ON points(user_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
```

**Query Optimization**:
```typescript
// ✅ Good: Select only needed columns
const { data } = await supabase
  .from('points')
  .select('id, alpha_points, reward_points')
  .eq('user_id', userId);

// ❌ Bad: Select all columns
const { data } = await supabase
  .from('points')
  .select('*')
  .eq('user_id', userId);
```

**Caching**:
```typescript
// ✅ Good: Cache frequently accessed data
const cache = new Map();

function getCachedData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = fetchData(key);
  cache.set(key, data);
  return data;
}
```

### Monitoring Performance

**Lighthouse**:
```bash
# Run Lighthouse audit
npm run build
npm run preview
# Open DevTools → Lighthouse
```

**Web Vitals**:
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## Security Best Practices

### Input Validation

```typescript
// ✅ Good: Validate all inputs
function addPoints(userId: string, amount: number) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId');
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('Invalid amount');
  }
  // Process
}

// ❌ Bad: No validation
function addPoints(userId, amount) {
  // Process without checking
}
```

### Output Sanitization

```typescript
// ✅ Good: Escape user input
function UserProfile({ name }) {
  return <div>{name}</div>; // React escapes by default
}

// ❌ Bad: Don't use dangerouslySetInnerHTML
function UserProfile({ name }) {
  return <div dangerouslySetInnerHTML={{ __html: name }} />;
}
```

### Authentication & Authorization

```typescript
// ✅ Good: Check authentication
async function getPoints(userId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  if (user.id !== userId) {
    throw new Error('Not authorized');
  }
  // Return points
}

// ❌ Bad: No checks
async function getPoints(userId: string) {
  return await supabase.from('points').select('*').eq('user_id', userId);
}
```

### Secrets Management

```typescript
// ✅ Good: Use environment variables
const apiKey = process.env.OPENAI_API_KEY;

// ❌ Bad: Hardcode secrets
const apiKey = 'sk-1234567890';
```

### HTTPS & Secure Cookies

```typescript
// ✅ Good: Secure cookie configuration
app.use(session({
  cookie: {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: 'strict'
  }
}));

// ❌ Bad: Insecure cookies
app.use(session({
  cookie: {
    httpOnly: false,
    secure: false
  }
}));
```

---

## Tools & Resources

### Development Tools

- **VS Code**: Code editor
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Jest**: Testing framework
- **React DevTools**: React debugging
- **Redux DevTools**: State debugging

### Useful Extensions

- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Thunder Client** (API testing)
- **Supabase**
- **GitLens**

### Documentation

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Ethers.js Documentation](https://docs.ethers.org)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com)

---

## Continuous Integration

### GitHub Actions

**Workflow file**: `.github/workflows/ci.yml`

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

**Last Updated**: February 4, 2026
