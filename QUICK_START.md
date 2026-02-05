# Quick Start Guide - Luminara

**Get up and running in 5 minutes!**

---

## 1. Clone & Install (2 min)

```bash
# Clone repository
git clone https://github.com/your-org/luminara.git
cd luminara

# Install dependencies
npm install
cd backend && npm install && cd ..
```

---

## 2. Configure Environment (1 min)

**Create `.env` file**:
```bash
cp .env.example .env
```

**Edit `.env`** with your values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
VITE_GOOGLE_CLIENT_ID=your-id
VITE_BACKEND_URL=http://localhost:4000
VITE_CHAIN_ID=97
```

**Create `backend/.env`**:
```bash
cp backend/.env.example backend/.env
```

**Edit `backend/.env`**:
```env
PORT=4000
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=dev-secret
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
```

---

## 3. Start Servers (1 min)

**Terminal 1 - Frontend**:
```bash
npm run dev
# Opens http://localhost:5173
```

**Terminal 2 - Backend**:
```bash
cd backend
npm start
# Runs on http://localhost:4000
```

---

## 4. Verify Setup (1 min)

✅ Frontend loads at http://localhost:5173  
✅ Backend responds at http://localhost:4000/api/health  
✅ Can connect wallet  
✅ Can see dashboard  

---

## Key Commands

```bash
# Development
npm run dev              # Start frontend
npm run build           # Build for production
npm run lint            # Check code quality
npm run test            # Run tests

# Backend
cd backend && npm start # Start backend
cd backend && npm test  # Run backend tests

# Database
# Run migrations in Supabase dashboard
# Copy content from src/points/migrations/supabase-schema.sql
```

---

## Project Structure

```
luminara/
├── src/                 # Frontend source
│   ├── pages/          # 24 page components
│   ├── components/     # 40+ reusable components
│   ├── context/        # 5 state providers
│   ├── hooks/          # Custom React hooks
│   ├── points/         # Unified points system
│   └── assets/         # Images, fonts, styles
├── backend/            # Node.js backend
│   ├── index.js       # Main server
│   ├── deepseekApi.js # AI integration
│   └── aiContex.js    # AI context
├── public/            # Static files
└── .env               # Configuration
```

---

## Core Features

### 1. Wallet Connection
```typescript
import { useWallet } from 'src/context/WalletContext';

function MyComponent() {
  const { connected, connectWallet } = useWallet();
  
  return (
    <button onClick={() => connectWallet('metamask')}>
      {connected ? 'Connected' : 'Connect Wallet'}
    </button>
  );
}
```

### 2. Points System
```typescript
import { usePoints } from 'src/points/hooks/usePoints';

function RewardComponent() {
  const { points, addPoints } = usePoints();
  
  return (
    <div>
      <p>Alpha Points: {points.alpha}</p>
      <button onClick={() => addPoints('alpha', 50, 'Daily reward')}>
        Claim Reward
      </button>
    </div>
  );
}
```

### 3. Authentication
```typescript
import { useAuth } from 'src/context/AuthContext';

function LoginButton() {
  const { isAuthenticated, login, logout } = useAuth();
  
  return (
    <button onClick={isAuthenticated ? logout : login}>
      {isAuthenticated ? 'Logout' : 'Login'}
    </button>
  );
}
```

---

## Common Tasks

### Add a New Page

1. **Create component** in `src/pages/MyPage.tsx`:
```typescript
export default function MyPage() {
  return <div>My Page</div>;
}
```

2. **Add route** in `src/App.tsx`:
```typescript
const MyPage = lazy(() => import("./pages/MyPage"));

// In Routes:
<Route path="/my-page" element={<MyPage />} />
```

### Add a New Component

1. **Create component** in `src/components/MyComponent.tsx`:
```typescript
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export default function MyComponent({ title, onClick }: MyComponentProps) {
  return <button onClick={onClick}>{title}</button>;
}
```

2. **Use in page**:
```typescript
import MyComponent from 'src/components/MyComponent';

export default function MyPage() {
  return <MyComponent title="Click me" onClick={() => alert('Clicked!')} />;
}
```

### Add Points Operation

```typescript
import { PointsAPI } from 'src/points/services/PointsAPI';

// Add points
await PointsAPI.addPoints(userId, 'alpha', 100, 'Daily reward');

// Subtract points
await PointsAPI.subtractPoints(userId, 'rewards', 50, 'Purchase');

// Transfer points
await PointsAPI.transferPoints(userId, 'balance', 25, toUserId);
```

### Connect to Blockchain

```typescript
import { useWallet } from 'src/context/WalletContext';
import { ethers } from 'ethers';

function ContractInteraction() {
  const { signer } = useWallet();
  
  const callContract = async () => {
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    
    const tx = await contract.someMethod();
    await tx.wait();
  };
  
  return <button onClick={callContract}>Call Contract</button>;
}
```

---

## Useful Links

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **Supabase**: https://supabase.com
- **Ethers.js Docs**: https://docs.ethers.org
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com

---

## Troubleshooting

### Port already in use
```bash
# Kill process using port
lsof -i :5173
kill -9 <PID>
```

### Dependencies not installed
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### Build fails
```bash
npm run lint -- --fix
npm run build
```

### Database connection error
- Verify Supabase URL and key in `.env`
- Check network connectivity
- Verify RLS policies in Supabase

---

## Next Steps

1. ✅ **Explore Pages**: Visit different pages to understand features
2. ✅ **Connect Wallet**: Test wallet connection
3. ✅ **Claim Rewards**: Test points system
4. ✅ **Read Documentation**: See PROJECT_DOCUMENTATION.md
5. ✅ **Deploy**: See DEPLOYMENT_SETUP.md

---

## Need Help?

- 📖 **Documentation**: PROJECT_DOCUMENTATION.md
- 🏗️ **Architecture**: ARCHITECTURE.md
- 🔌 **API Reference**: API_COMPONENTS_GUIDE.md
- 🚀 **Deployment**: DEPLOYMENT_SETUP.md
- 🤖 **Agents**: .kiro/agents.md

---

**Happy coding! 🚀**
