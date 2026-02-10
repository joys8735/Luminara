# 🎯 Predictions Arena Documentation

Документація для системи передбачень (Crypto, Sports, News).

## 📚 Файли

### Швидкий старт
- **[QUICK_START.md](./QUICK_START.md)** - 5-хвилинний гайд для початку роботи

### API Integration
- **[API_SETUP.md](./API_SETUP.md)** - Повний гайд по налаштуванню API (The Odds API, News API)
- **[CHECKLIST.md](./CHECKLIST.md)** - Покроковий чеклист інтеграції

### Документація
- **[V2_SUMMARY.md](./V2_SUMMARY.md)** - Повний огляд Predictions Arena V2
- **[CHANGELOG.md](./CHANGELOG.md)** - Історія змін
- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Рекомендації по покращенню

### UI/UX
- **[UI_IMPROVEMENTS.md](./UI_IMPROVEMENTS.md)** - Візуальні покращення модалок

## 🚀 Швидкий старт

```bash
# 1. Додай API ключі
cp .env.example .env
nano .env

# 2. Запусти
npm run dev

# 3. Тестуй
open http://localhost:5173
```

## 📊 Структура компонентів

```
src/
├── pages/
│   └── Predictions.tsx          # Головна сторінка
├── components/Predictions/
│   ├── CryptoModal.tsx          # Модалка для крипто
│   ├── EnhancedSportsModal.tsx  # Покращена модалка для спорту
│   ├── EnhancedNewsModal.tsx    # Покращена модалка для новин
│   ├── FiltersBar.tsx           # Пошук та фільтри
│   └── HistoryModal.tsx         # Історія з вкладками
└── services/
    ├── SportsAPI.ts             # Sports API сервіс
    ├── NewsAPI.ts               # News API сервіс
    └── PredictionsWebSocket.ts  # WebSocket сервіс
```

## 🔑 API Ключі

### The Odds API (Sports)
- **URL:** https://the-odds-api.com/
- **Free:** 500 req/month
- **Env:** `VITE_ODDS_API_KEY`

### News API
- **URL:** https://newsapi.org/
- **Free:** 100 req/day
- **Env:** `VITE_NEWS_API_KEY`

## ✨ Features

- ✅ Crypto predictions (live prices)
- ✅ Sports predictions (real events)
- ✅ News predictions (sentiment analysis)
- ✅ Search & filters
- ✅ History with tabs
- ✅ Auto-refresh every 5 min

## 📖 Детальніше

Дивись [V2_SUMMARY.md](./V2_SUMMARY.md) для повного огляду всіх можливостей.
