# Predictions Services

API сервіси для Predictions Arena.

## 📁 Файли

### SportsAPI.ts
Інтеграція з The Odds API для спортивних подій.

**Використання:**
```typescript
import { sportsAPI } from '@/services/SportsAPI';

// Отримати події
const events = await sportsAPI.getEvents('soccer_epl');

// Конвертувати для UI
const formatted = sportsAPI.convertToUIFormat(events);
```

### NewsAPI.ts
Інтеграція з News API для новин та sentiment analysis.

**Використання:**
```typescript
import { newsAPI } from '@/services/NewsAPI';

// Отримати крипто новини
const news = await newsAPI.getCryptoMarketNews();

// Пошук новин
const results = await newsAPI.searchNews('bitcoin');
```

### PredictionsWebSocket.ts
WebSocket сервіс для real-time оновлень.

**Використання:**
```typescript
import { usePredictionsWebSocket } from '@/services/PredictionsWebSocket';

// В React компоненті
usePredictionsWebSocket((update) => {
  console.log('Update:', update);
}, 'my-component');
```

## 🔑 API Keys

Додай в `.env`:
```
VITE_ODDS_API_KEY=your_key
VITE_NEWS_API_KEY=your_key
VITE_WS_URL=ws://localhost:8080
```

## 📚 Документація

Детальна документація: [PREDICTIONS_API_SETUP.md](../../PREDICTIONS_API_SETUP.md)
