# Predictions Arena - API Integration Guide

## 📋 Огляд

Цей гайд допоможе налаштувати реальні API для Sports та News predictions.

---

## 🔑 Необхідні API ключі

### 1. The Odds API (Sports)

**Реєстрація:** https://the-odds-api.com/

**Free Tier:**
- 500 requests/month
- Доступ до 20+ спортів
- Live odds updates

**Як отримати ключ:**
1. Зареєструйся на сайті
2. Підтверди email
3. Скопіюй API key з dashboard
4. Додай в `.env`: `VITE_ODDS_API_KEY=your_key`

**Доступні спорти:**
- Soccer (Premier League, Champions League, La Liga, etc.)
- Basketball (NBA, EuroLeague)
- American Football (NFL)
- Tennis (ATP, WTA)
- Baseball (MLB)
- Hockey (NHL)
- Cricket, Rugby, MMA, Boxing

### 2. News API (News & Market Sentiment)

**Реєстрація:** https://newsapi.org/

**Free Tier:**
- 100 requests/day
- Доступ до 80,000+ джерел
- Історія до 1 місяця

**Як отримати ключ:**
1. Зареєструйся на сайті
2. Підтверди email
3. Скопіюй API key
4. Додай в `.env`: `VITE_NEWS_API_KEY=your_key`

**Альтернативи (безкоштовні):**
- **CoinGecko API** - для крипто новин (не потрібен ключ)
- **Alpha Vantage** - фінансові новини (500 req/day)
- **Finnhub** - фінансові новини (60 req/min)

---

## 🚀 Швидкий старт

### 1. Встановлення

```bash
# Скопіюй .env.example в .env
cp .env.example .env

# Додай свої API ключі в .env
nano .env
```

### 2. Використання в коді

```typescript
// Імпорт сервісів
import { sportsAPI } from '@/services/SportsAPI';
import { newsAPI } from '@/services/NewsAPI';

// Отримати спортивні події
const events = await sportsAPI.getEvents('soccer_epl');

// Отримати новини
const news = await newsAPI.getCryptoMarketNews();
```

### 3. Інтеграція в Predictions.tsx

```typescript
// В useEffect
useEffect(() => {
  async function loadSportsData() {
    const events = await sportsAPI.getEvents('soccer_epl');
    const formatted = sportsAPI.convertToUIFormat(events);
    setSportsAsPairs(formatted);
  }

  async function loadNewsData() {
    const news = await newsAPI.getCryptoMarketNews();
    setNewsAsPairs(news);
  }

  loadSportsData();
  loadNewsData();

  // Оновлювати кожні 5 хвилин
  const interval = setInterval(() => {
    loadSportsData();
    loadNewsData();
  }, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

---

## 📊 API Endpoints

### The Odds API

#### Отримати список спортів
```
GET https://api.the-odds-api.com/v4/sports
?apiKey=YOUR_KEY
```

#### Отримати події
```
GET https://api.the-odds-api.com/v4/sports/{sport}/odds
?apiKey=YOUR_KEY
&regions=eu
&markets=h2h
&oddsFormat=decimal
```

**Популярні sport keys:**
- `soccer_epl` - Premier League
- `soccer_uefa_champs_league` - Champions League
- `basketball_nba` - NBA
- `americanfootball_nfl` - NFL
- `tennis_atp_french_open` - French Open

#### Отримати коефіцієнти для події
```
GET https://api.the-odds-api.com/v4/sports/{sport}/events/{eventId}/odds
?apiKey=YOUR_KEY
&regions=eu
&markets=h2h
```

### News API

#### Топ новини
```
GET https://newsapi.org/v2/top-headlines
?category=business
&country=us
&apiKey=YOUR_KEY
```

#### Пошук новин
```
GET https://newsapi.org/v2/everything
?q=bitcoin
&sortBy=publishedAt
&apiKey=YOUR_KEY
```

**Популярні запити:**
- `bitcoin` - Bitcoin новини
- `ethereum` - Ethereum новини
- `cryptocurrency` - Загальні крипто новини
- `federal reserve` - Новини ФРС
- `stock market` - Фондовий ринок

### CoinGecko API (безкоштовно, без ключа)

#### Trending криптовалюти
```
GET https://api.coingecko.com/api/v3/search/trending
```

#### Глобальні дані
```
GET https://api.coingecko.com/api/v3/global
```

---

## 🔄 WebSocket для Live Updates

### Опціонально: Власний WebSocket сервер

Якщо хочеш real-time оновлення, можеш створити простий WebSocket сервер:

```javascript
// server.js (Node.js)
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Відправляти оновлення кожні 10 секунд
  const interval = setInterval(() => {
    ws.send(JSON.stringify({
      type: 'crypto',
      id: 1,
      data: { price: Math.random() * 50000 },
      timestamp: Date.now(),
    }));
  }, 10000);

  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});
```

Запуск:
```bash
node server.js
```

---

## 💡 Best Practices

### 1. Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = [];
  private limit: number;
  private window: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.window = windowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);
    
    if (this.requests.length >= this.limit) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

// Використання
const limiter = new RateLimiter(100, 24 * 60 * 60 * 1000); // 100 req/day

async function fetchNews() {
  if (await limiter.checkLimit()) {
    return await newsAPI.getTopHeadlines();
  } else {
    console.warn('Rate limit exceeded');
    return [];
  }
}
```

### 2. Кешування

```typescript
class APICache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number;

  constructor(ttlMs: number) {
    this.ttl = ttlMs;
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// Використання
const cache = new APICache(5 * 60 * 1000); // 5 хвилин

async function getCachedEvents() {
  const cached = cache.get('sports_events');
  if (cached) return cached;
  
  const events = await sportsAPI.getEvents();
  cache.set('sports_events', events);
  return events;
}
```

### 3. Error Handling

```typescript
async function fetchWithRetry(
  fetchFn: () => Promise<any>,
  retries: number = 3,
  delay: number = 1000
): Promise<any> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries === 0) throw error;
    
    console.log(`Retrying... ${retries} attempts left`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fetchFn, retries - 1, delay * 2);
  }
}

// Використання
const events = await fetchWithRetry(() => sportsAPI.getEvents());
```

---

## 🧪 Тестування

### Тест Sports API

```typescript
// test-sports-api.ts
import { sportsAPI } from './services/SportsAPI';

async function testSportsAPI() {
  console.log('Testing Sports API...');
  
  // 1. Отримати список спортів
  const sports = await sportsAPI.getSports();
  console.log('Available sports:', sports.length);
  
  // 2. Отримати події
  const events = await sportsAPI.getEvents('soccer_epl');
  console.log('Events:', events.length);
  
  // 3. Конвертувати в UI формат
  const formatted = sportsAPI.convertToUIFormat(events);
  console.log('Formatted:', formatted);
}

testSportsAPI();
```

### Тест News API

```typescript
// test-news-api.ts
import { newsAPI } from './services/NewsAPI';

async function testNewsAPI() {
  console.log('Testing News API...');
  
  // 1. Отримати топ новини
  const headlines = await newsAPI.getTopHeadlines();
  console.log('Headlines:', headlines.length);
  
  // 2. Пошук крипто новин
  const cryptoNews = await newsAPI.searchNews('bitcoin');
  console.log('Crypto news:', cryptoNews.length);
  
  // 3. Конвертувати в UI формат
  const formatted = await newsAPI.convertToUIFormat(headlines);
  console.log('Formatted:', formatted);
}

testNewsAPI();
```

---

## 📈 Моніторинг використання

### Dashboard для відстеження API calls

```typescript
class APIMonitor {
  private calls: Map<string, number> = new Map();

  track(apiName: string) {
    const count = this.calls.get(apiName) || 0;
    this.calls.set(apiName, count + 1);
  }

  getStats() {
    return Object.fromEntries(this.calls);
  }

  reset() {
    this.calls.clear();
  }
}

export const apiMonitor = new APIMonitor();

// Використання
apiMonitor.track('sports_api');
console.log(apiMonitor.getStats()); // { sports_api: 15 }
```

---

## 🔒 Безпека

### Не зберігай API ключі в коді!

❌ **Погано:**
```typescript
const API_KEY = 'abc123xyz';
```

✅ **Добре:**
```typescript
const API_KEY = import.meta.env.VITE_ODDS_API_KEY;
```

### Використовуй backend proxy (рекомендовано для production)

```typescript
// Замість прямих запитів до API
const response = await fetch('https://api.the-odds-api.com/...');

// Використовуй свій backend
const response = await fetch('/api/sports/events');
```

---

## 📚 Додаткові ресурси

- [The Odds API Docs](https://the-odds-api.com/liveapi/guides/v4/)
- [News API Docs](https://newsapi.org/docs)
- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [WebSocket MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

## 🆘 Troubleshooting

### Помилка: "API key invalid"
- Перевір чи правильно скопійований ключ
- Перевір чи активований акаунт
- Перевір чи не закінчився free tier

### Помилка: "Rate limit exceeded"
- Зменш частоту запитів
- Використовуй кешування
- Розглянь платний план

### Помилка: "CORS"
- Використовуй backend proxy
- Або додай CORS headers на сервері

---

## ✅ Checklist

- [ ] Зареєструвався на The Odds API
- [ ] Зареєструвався на News API
- [ ] Додав ключі в .env
- [ ] Протестував Sports API
- [ ] Протестував News API
- [ ] Додав rate limiting
- [ ] Додав кешування
- [ ] Додав error handling
- [ ] Налаштував WebSocket (опціонально)
- [ ] Створив backend proxy (для production)

Готово! Тепер у тебе є реальні дані для predictions! 🚀
