# Frequently Asked Questions (FAQ) - Luminara

## General Questions

### Q: What is Luminara?
**A:** Luminara is a comprehensive Web3 DeFi platform that combines token sales (IDO), NFT marketplace, staking, mining, and a sophisticated unified points/rewards system. It's designed for cryptocurrency enthusiasts, NFT collectors, and blockchain investors.

### Q: What blockchain networks does Luminara support?
**A:** Currently, Luminara supports:
- **BSC Testnet (Chain ID: 97)** - For development and testing
- **BSC Mainnet (Chain ID: 56)** - For production

We plan to add support for Ethereum, Polygon, and Solana in future versions.

### Q: What wallets are supported?
**A:** Currently supported:
- **MetaMask** - For EVM-compatible networks (BSC)
- **Phantom** - For Solana (coming soon)

We plan to add support for WalletConnect, Ledger, and Trezor.

### Q: Is Luminara open source?
**A:** Yes, Luminara is open source. You can find the repository at https://github.com/your-org/luminara

### Q: How do I report a bug?
**A:** Please report bugs on GitHub Issues with:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Browser and OS information

---

## Setup & Installation

### Q: What are the system requirements?
**A:** 
- Node.js 18 or higher
- npm 9 or higher
- Git
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 2GB RAM minimum
- 500MB disk space

### Q: How do I set up the project locally?
**A:** Follow the Quick Start Guide:
1. Clone repository: `git clone https://github.com/your-org/luminara.git`
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Start frontend: `npm run dev`
5. Start backend: `cd backend && npm start`

See QUICK_START.md for detailed instructions.

### Q: What if I get "Port already in use" error?
**A:** 
```bash
# Find process using the port
lsof -i :5173  # for frontend
lsof -i :4000  # for backend

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3000 npm run dev
```

### Q: How do I configure environment variables?
**A:** 
1. Copy `.env.example` to `.env`
2. Fill in your values:
   - Supabase credentials
   - Google OAuth credentials
   - Blockchain RPC URLs
   - AI API keys
3. Restart the development server

See DEPLOYMENT_SETUP.md for detailed environment configuration.

### Q: Do I need a Supabase account?
**A:** Yes, Supabase is required for:
- Database (PostgreSQL)
- Authentication
- Real-time subscriptions
- Row-level security

Create a free account at https://supabase.com

### Q: Do I need Google OAuth credentials?
**A:** Yes, for the authentication feature. Get credentials from:
1. Visit https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URIs

---

## Development

### Q: How do I add a new page?
**A:**
1. Create component in `src/pages/MyPage.tsx`
2. Add route in `src/App.tsx`:
```typescript
const MyPage = lazy(() => import("./pages/MyPage"));
<Route path="/my-page" element={<MyPage />} />
```
3. Add navigation link in Header or Sidebar

### Q: How do I add a new component?
**A:**
1. Create component in `src/components/MyComponent.tsx`
2. Define TypeScript interface for props
3. Export component
4. Import and use in pages

### Q: How do I use the Points System?
**A:**
```typescript
import { usePoints } from 'src/points/hooks/usePoints';

const { points, addPoints, subtractPoints } = usePoints();

// Add points
await addPoints('alpha', 100, 'Daily reward');

// Subtract points
await subtractPoints('rewards', 50, 'Purchase');
```

### Q: How do I connect to a smart contract?
**A:**
```typescript
import { useWallet } from 'src/context/WalletContext';
import { ethers } from 'ethers';

const { signer } = useWallet();
const contract = new ethers.Contract(address, ABI, signer);
const tx = await contract.method();
```

### Q: How do I handle errors?
**A:**
```typescript
try {
  await someAsyncOperation();
} catch (error) {
  if (error.code === 'SPECIFIC_ERROR') {
    // Handle specific error
  } else {
    // Handle generic error
  }
}
```

### Q: How do I test my code?
**A:**
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/points/__tests__/unit

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch
```

### Q: How do I lint my code?
**A:**
```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint -- --fix
```

### Q: How do I check TypeScript types?
**A:**
```bash
# Check for type errors
npx tsc --noEmit
```

---

## Blockchain & Web3

### Q: How do I switch networks?
**A:**
```typescript
const { switchNetwork } = useWallet();

// Switch to BSC Testnet
await switchNetwork(97);

// Switch to BSC Mainnet
await switchNetwork(56);
```

### Q: How do I get test tokens?
**A:** For BSC Testnet:
1. Visit https://testnet.binance.org/faucet
2. Enter your wallet address
3. Request BNB tokens

### Q: How do I verify a transaction?
**A:** Use BSC Explorer:
- **Testnet**: https://testnet.bscscan.com
- **Mainnet**: https://bscscan.com

### Q: What are gas fees?
**A:** Gas fees are the cost to execute transactions on the blockchain. They depend on:
- Network congestion
- Transaction complexity
- Gas price (Gwei)

### Q: How do I optimize gas usage?
**A:**
- Batch multiple operations
- Use contract functions efficiently
- Avoid unnecessary state changes
- Use layer 2 solutions

### Q: How do I handle wallet disconnection?
**A:**
```typescript
const { disconnectWallet } = useWallet();

const handleDisconnect = () => {
  disconnectWallet();
  // Clear user data
  // Redirect to home
};
```

---

## Database & Backend

### Q: How do I run database migrations?
**A:**
1. Go to Supabase SQL Editor
2. Copy content from `src/points/migrations/supabase-schema.sql`
3. Paste and run in SQL editor
4. Verify tables are created

### Q: How do I configure Row-Level Security (RLS)?
**A:**
1. Go to Supabase dashboard
2. Select table
3. Click "RLS" button
4. Create policies for access control

Example:
```sql
CREATE POLICY "Users can view own data"
ON points FOR SELECT
USING (auth.uid() = user_id);
```

### Q: How do I query the database from frontend?
**A:**
```typescript
import { supabase } from 'src/lib/supabase';

// Select
const { data, error } = await supabase
  .from('points')
  .select('*')
  .eq('user_id', userId);

// Insert
const { data, error } = await supabase
  .from('points')
  .insert([{ user_id: userId, alpha_points: 100 }]);

// Update
const { data, error } = await supabase
  .from('points')
  .update({ alpha_points: 150 })
  .eq('user_id', userId);
```

### Q: How do I set up real-time subscriptions?
**A:**
```typescript
const subscription = supabase
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'points' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Q: How do I handle offline operations?
**A:** The Points System automatically:
- Queues operations when offline
- Syncs when connection restored
- Handles conflicts with server-as-source

---

## Deployment

### Q: How do I deploy to production?
**A:** See DEPLOYMENT_SETUP.md for detailed instructions:
1. Frontend: Deploy to Vercel
2. Backend: Deploy to Railway/Heroku
3. Database: Use Supabase managed service

### Q: How do I set up a custom domain?
**A:**
1. **Vercel**: Settings → Domains → Add domain
2. **Railway**: Settings → Domains → Add domain
3. Update DNS records with provider
4. Verify domain

### Q: How do I configure SSL/HTTPS?
**A:**
- Vercel: Automatic SSL
- Railway: Automatic SSL
- Custom domain: Use Let's Encrypt

### Q: How do I set up monitoring?
**A:**
- **Frontend**: Sentry for error tracking
- **Backend**: Datadog or New Relic
- **Database**: Supabase monitoring
- **Performance**: Google Analytics

### Q: How do I create backups?
**A:**
- **Database**: Supabase automatic daily backups
- **Code**: GitHub repository
- **Manual**: Export data from Supabase dashboard

### Q: How do I scale the application?
**A:**
- **Horizontal**: Add more backend instances
- **Vertical**: Increase server resources
- **Database**: Upgrade Supabase tier
- **CDN**: Use Vercel CDN for frontend

---

## Troubleshooting

### Q: Frontend won't load
**A:**
1. Check if server is running: `npm run dev`
2. Check browser console for errors
3. Clear browser cache
4. Check network tab for failed requests
5. Verify environment variables

### Q: Backend API not responding
**A:**
1. Check if backend is running: `cd backend && npm start`
2. Check if port 4000 is available
3. Check backend logs for errors
4. Verify environment variables
5. Check network connectivity

### Q: Wallet connection fails
**A:**
1. Ensure MetaMask/Phantom is installed
2. Check if on correct network (BSC Testnet)
3. Check browser console for errors
4. Try refreshing page
5. Try different wallet

### Q: Points not syncing
**A:**
1. Check Supabase connection
2. Verify user is authenticated
3. Check browser console for errors
4. Clear localStorage: `localStorage.clear()`
5. Refresh page

### Q: Database connection error
**A:**
1. Verify Supabase URL and key in `.env`
2. Check network connectivity
3. Verify RLS policies
4. Check user permissions
5. Verify database is running

### Q: Build fails
**A:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install

# Try building again
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### Q: Tests failing
**A:**
1. Check test output for specific errors
2. Verify test environment variables
3. Check database is running
4. Clear test cache: `npm run test -- --clearCache`
5. Run tests in verbose mode: `npm run test -- --verbose`

---

## Performance

### Q: How do I improve frontend performance?
**A:**
- Use React.lazy() for code splitting
- Optimize images
- Enable caching
- Minimize bundle size
- Use production build

### Q: How do I improve backend performance?
**A:**
- Add database indexes
- Optimize queries
- Use caching
- Implement pagination
- Use connection pooling

### Q: How do I monitor performance?
**A:**
- **Frontend**: Google Lighthouse, Web Vitals
- **Backend**: Response time, CPU usage
- **Database**: Query performance, connection count

---

## Security

### Q: How do I protect sensitive data?
**A:**
- Use environment variables for secrets
- Enable HTTPS
- Use Row-Level Security (RLS)
- Validate all inputs
- Sanitize outputs

### Q: How do I prevent XSS attacks?
**A:**
- React automatically escapes content
- Use DOMPurify for user-generated HTML
- Avoid dangerouslySetInnerHTML

### Q: How do I prevent SQL injection?
**A:**
- Use parameterized queries
- Use Supabase client (handles escaping)
- Never concatenate SQL strings

### Q: How do I secure API endpoints?
**A:**
- Require authentication
- Validate input
- Rate limiting
- CORS configuration
- HTTPS only

---

## Support & Resources

### Q: Where can I get help?
**A:**
- 📖 **Documentation**: PROJECT_DOCUMENTATION.md
- 🏗️ **Architecture**: ARCHITECTURE.md
- 🔌 **API Reference**: API_COMPONENTS_GUIDE.md
- 🚀 **Deployment**: DEPLOYMENT_SETUP.md
- 🤖 **Agents**: .kiro/agents.md
- 💬 **Discord**: [Join Community](https://discord.gg/luminara)
- 📧 **Email**: support@luminara.dev

### Q: How do I contribute?
**A:**
1. Fork repository
2. Create feature branch
3. Make changes
4. Write tests
5. Submit pull request
6. Wait for review

### Q: What's the roadmap?
**A:** See GitHub Projects for upcoming features:
- Multi-chain support
- Advanced analytics
- Mobile app
- DAO governance
- Advanced trading features

### Q: How do I report security issues?
**A:** Please email security@luminara.dev with:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

---

## Glossary

| Term | Definition |
|------|-----------|
| **Alpha Points** | Platform currency earned from daily rewards |
| **Rewards Points** | Points earned from achievements and activities |
| **Platform Balance** | User's account balance on the platform |
| **RLS** | Row-Level Security - database access control |
| **IDO** | Initial DEX Offering - token sale |
| **NFT** | Non-Fungible Token - unique digital asset |
| **DeFi** | Decentralized Finance - financial services on blockchain |
| **Staking** | Locking tokens to earn rewards |
| **Mining** | Earning rewards by validating transactions |
| **Gas** | Fee to execute transactions on blockchain |
| **Gwei** | Unit of Ethereum/BSC (1 Gwei = 0.000000001 BNB) |
| **Mainnet** | Production blockchain network |
| **Testnet** | Development blockchain network |

---

**Last Updated**: February 4, 2026

**Still have questions?** Contact us at support@luminara.dev or join our Discord community!
