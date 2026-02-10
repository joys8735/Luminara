# 🚀 Predictions Arena V2 - Quick Reference

## ⚡ 30-Second Setup

```bash
# 1. Add API keys
cp .env.example .env
nano .env  # Add your keys

# 2. Start
npm run dev

# 3. Test
open http://localhost:5173
```

---

## 🔑 API Keys

### The Odds API
- **URL:** https://the-odds-api.com/
- **Free:** 500 req/month
- **Key:** `VITE_ODDS_API_KEY`

### News API
- **URL:** https://newsapi.org/
- **Free:** 100 req/day
- **Key:** `VITE_NEWS_API_KEY`

---

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| Search | ✅ | Find pairs by name/symbol |
| Sort | ✅ | 5 options (Popular, Volatility, Odds, Time, Name) |
| Filter | ✅ | 4 types (All, High Volatility, Low Risk, Trending) |
| Sports | ✅ | Real events from The Odds API |
| News | ✅ | Real articles from News API |
| History | ✅ | 4 tabs (All, Crypto, Sports, News) |
| Auto-refresh | ✅ | Every 5 minutes |

---

## 🧪 Quick Tests

### Test 1: Search
```
1. Type "BTC" → Should show only BTC
2. Clear → Should show all
```

### Test 2: Sort
```
1. Click Filters
2. Click Volatility
3. Pairs reorder by volatility
```

### Test 3: Sports
```
1. Add VITE_ODDS_API_KEY to .env
2. Click Sports tab
3. Should see real events
```

### Test 4: News
```
1. Add VITE_NEWS_API_KEY to .env
2. Click News tab
3. Should see real articles
```

### Test 5: History
```
1. Place bets
2. Wait 5 min
3. Click "Prediction history"
4. Check tabs work
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Sports not loading | Check API key in .env |
| News not loading | Check API key in .env |
| Search not working | Check filteredPairs is used |
| Filters not applying | Check useMemo logic |
| History tabs broken | Check bet ID ranges |

---

## 📁 Key Files

```
src/
├── pages/
│   └── Predictions.tsx ✅ Main file
├── services/
│   ├── SportsAPI.ts ✅ Sports data
│   └── NewsAPI.ts ✅ News data
└── components/
    └── Predictions/
        ├── FiltersBar.tsx ✅ Search/Sort/Filter
        └── HistoryModal.tsx ✅ History with tabs
```

---

## 🔧 Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Check TypeScript
npm run type-check

# Check for errors
npm run lint
```

---

## 📊 Data Flow

```
User Action
    ↓
State Update (searchQuery, sortBy, filter)
    ↓
filteredPairs useMemo
    ↓
UI Re-renders
```

---

## 🎯 Integration Status

✅ FiltersBar integrated
✅ HistoryModal integrated
✅ SportsAPI complete
✅ NewsAPI complete
✅ Filtering logic working
✅ Auto-refresh working
✅ TypeScript errors fixed
✅ Ready to use!

---

## 📚 Full Documentation

- `INTEGRATION_COMPLETE.md` - Complete guide
- `INTEGRATION_SUMMARY.md` - Summary
- `PREDICTIONS_API_SETUP.md` - API setup
- `PREDICTIONS_QUICK_START.md` - Quick start
- `PREDICTIONS_CHECKLIST.md` - Checklist

---

## ✅ You're Ready!

Just add API keys and start testing! 🎉
