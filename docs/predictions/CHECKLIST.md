# Predictions Arena V2 - Implementation Checklist

## ✅ Що вже зроблено

- [x] Виправлено TradingView iframe помилку
- [x] Виправлено "No live price" для Sports & News
- [x] Створено окремі модалки (Crypto, Sports, News)
- [x] Створено SportsAPI сервіс
- [x] Створено NewsAPI сервіс
- [x] Створено WebSocket сервіс
- [x] Створено FiltersBar компонент
- [x] Створено HistoryModal з вкладками
- [x] Створено документацію (API Setup, Summary, Changelog)
- [x] Створено .env.example

---

## 📋 Що потрібно зробити

### 1. Налаштування API (15 хв)

- [ ] Зареєструватись на [The Odds API](https://the-odds-api.com/)
- [ ] Зареєструватись на [News API](https://newsapi.org/)
- [ ] Скопіювати `.env.example` в `.env`
- [ ] Додати API ключі в `.env`
- [ ] Перезапустити dev сервер

### 2. Інтеграція в Predictions.tsx (30 хв)

#### Імпорти
```typescript
// Додати в початок файлу
import { sportsAPI } from '@/services/SportsAPI';
import { newsAPI } from '@/services/NewsAPI';
import { usePredictionsWebSocket } from '@/services/PredictionsWebSocket';
import { FiltersBar, SortOption, FilterOption } from '@/components/Predictions/FiltersBar';
import { HistoryModal } from '@/components/Predictions/HistoryModal';
```

#### State
```typescript
// Додати після існуючих useState
const [searchQuery, setSearchQuery] = useState('');
const [sortBy, setSortBy] = useState<SortOption>('popular');
const [filter, setFilter] = useState<FilterOption>('all');
const [loadingSports, setLoadingSports] = useState(false);
const [loadingNews, setLoadingNews] = useState(false);
```

#### Завантаження даних
```typescript
// Додати useEffect для завантаження реальних даних
useEffect(() => {
  async function loadSportsData() {
    if (category !== 'sports') return;
    
    setLoadingSports(true);
    try {
      const events = await sportsAPI.getEvents('soccer_epl');
      const formatted = sportsAPI.convertToUIFormat(events);
      setSportsAsPairs(formatted);
    } catch (error) {
      console.error('Error loading sports:', error);
      toast.error('Failed to load sports data');
    } finally {
      setLoadingSports(false);
    }
  }

  async function loadNewsData() {
    if (category !== 'news') return;
    
    setLoadingNews(true);
    try {
      const news = await newsAPI.getCryptoMarketNews();
      setNewsAsPairs(news);
    } catch (error) {
      console.error('Error loading news:', error);
      toast.error('Failed to load news data');
    } finally {
      setLoadingNews(false);
    }
  }

  loadSportsData();
  loadNewsData();

  // Оновлювати кожні 5 хвилин
  const interval = setInterval(() => {
    loadSportsData();
    loadNewsData();
  }, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, [category]);
```

#### WebSocket
```typescript
// Додати WebSocket для live updates
usePredictionsWebSocket((update) => {
  if (update.type === 'crypto' && category === 'crypto') {
    setPairs(prev => prev.map(p => 
      p.id === update.id ? { ...p, ...update.data } : p
    ));
  } else if (update.type === 'sports' && category === 'sports') {
    setSportsAsPairs(prev => prev.map(p => 
      p.id === update.id ? { ...p, ...update.data } : p
    ));
  } else if (update.type === 'news' && category === 'news') {
    setNewsAsPairs(prev => prev.map(p => 
      p.id === update.id ? { ...p, ...update.data } : p
    ));
  }
}, 'predictions-page');
```

#### Фільтрація
```typescript
// Додати useMemo для фільтрації
const filteredPairs = useMemo(() => {
  let result = displayPairs;

  // Пошук
  if (searchQuery) {
    result = result.filter(p =>
      p.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Фільтр
  if (filter === 'high-volatility') {
    result = result.filter(p => Math.abs(p.change) > 3);
  } else if (filter === 'low-risk') {
    result = result.filter(p => Math.abs(p.change) < 2);
  } else if (filter === 'trending') {
    result = result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
  }

  // Сортування
  if (sortBy === 'volatility') {
    result = result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  } else if (sortBy === 'odds') {
    result = result.sort((a, b) => b.mult - a.mult);
  } else if (sortBy === 'name') {
    result = result.sort((a, b) => a.pair.localeCompare(b.pair));
  } else if (sortBy === 'time') {
    result = result.sort((a, b) => {
      const timeA = (a as any).commenceTime || 0;
      const timeB = (b as any).commenceTime || 0;
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    });
  }

  return result;
}, [displayPairs, searchQuery, filter, sortBy]);
```

#### JSX
```typescript
// Замінити displayPairs на filteredPairs в map
{filteredPairs.map((pair) => (
  // ... existing code
))}

// Додати FiltersBar перед списком пар
<FiltersBar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  sortBy={sortBy}
  onSortChange={setSortBy}
  filter={filter}
  onFilterChange={setFilter}
  category={category}
/>

// Замінити стару History Modal
<HistoryModal
  isOpen={historyOpen}
  onClose={() => setHistoryOpen(false)}
  historyBets={historyBets}
  formatDateTime={formatDateTime}
  pairs={pairs}
  sportsAsPairs={sportsAsPairs}
  newsAsPairs={newsAsPairs}
/>
```

### 3. Тестування (15 хв)

- [ ] Перевірити що Sports дані завантажуються
- [ ] Перевірити що News дані завантажуються
- [ ] Перевірити пошук
- [ ] Перевірити сортування
- [ ] Перевірити фільтри
- [ ] Перевірити History Modal з вкладками
- [ ] Перевірити що ставки працюють для всіх категорій

### 4. Оптимізація (опціонально, 30 хв)

- [ ] Додати кешування для API
- [ ] Додати rate limiting
- [ ] Додати retry logic
- [ ] Додати loading states
- [ ] Додати error boundaries

### 5. WebSocket сервер (опціонально, 1 год)

- [ ] Створити `server.js`
- [ ] Додати WebSocket логіку
- [ ] Запустити сервер
- [ ] Протестувати live updates

---

## 🧪 Тестові сценарії

### Сценарій 1: Sports Predictions
1. Відкрити Predictions Arena
2. Вибрати вкладку "Sports"
3. Перевірити що події завантажились
4. Відкрити модалку події
5. Зробити ставку WIN
6. Перевірити що ставка з'явилась в Active
7. Дочекатись завершення (5 хв)
8. Перевірити результат

### Сценарій 2: News Predictions
1. Вибрати вкладку "News"
2. Перевірити що новини завантажились
3. Відкрити модалку новини
4. Зробити ставку BULLISH
5. Перевірити Active predictions
6. Дочекатись результату
7. Перевірити History

### Сценарій 3: Фільтри
1. Ввести пошуковий запит
2. Перевірити фільтрацію
3. Змінити сортування на "Volatility"
4. Перевірити порядок
5. Застосувати фільтр "High Volatility"
6. Перевірити результат
7. Очистити фільтри

### Сценарій 4: History
1. Відкрити History Modal
2. Перевірити вкладку "All"
3. Переключитись на "Crypto"
4. Переключитись на "Sports"
5. Переключитись на "News"
6. Перевірити статистику по кожній категорії

---

## 📊 Метрики успіху

Після впровадження перевір:
- [ ] Sports події оновлюються кожні 5 хв
- [ ] News оновлюються кожні 5 хв
- [ ] Пошук працює миттєво
- [ ] Сортування працює коректно
- [ ] Фільтри працюють коректно
- [ ] History показує правильну статистику
- [ ] Ставки працюють для всіх категорій
- [ ] Немає помилок в console
- [ ] API calls в межах лімітів

---

## 🚨 Troubleshooting

### Проблема: Sports не завантажуються
**Рішення:**
1. Перевір API key в .env
2. Перевір console для помилок
3. Перевір чи не перевищено ліміт (500 req/month)
4. Спробуй інший sport key (наприклад, 'basketball_nba')

### Проблема: News не завантажуються
**Рішення:**
1. Перевір API key в .env
2. Перевір console для помилок
3. Перевір чи не перевищено ліміт (100 req/day)
4. Використай CoinGecko як fallback (не потрібен ключ)

### Проблема: WebSocket не підключається
**Рішення:**
1. Перевір чи запущений WebSocket сервер
2. Перевір URL в .env
3. Перевір console для помилок
4. Спробуй без WebSocket (опціонально)

### Проблема: Фільтри не працюють
**Рішення:**
1. Перевір чи правильно імпортовано FiltersBar
2. Перевір чи передаються всі props
3. Перевір чи використовується filteredPairs замість displayPairs
4. Перевір console для помилок

---

## ✅ Фінальний чеклист

Перед деплоєм перевір:
- [ ] Всі API ключі додані
- [ ] Всі компоненти імпортовані
- [ ] Всі функції працюють
- [ ] Немає помилок в console
- [ ] Немає TypeScript помилок
- [ ] Код відформатований
- [ ] Документація оновлена
- [ ] Тести пройдені
- [ ] Performance оптимізовано
- [ ] Ready for production! 🚀

---

## 📞 Підтримка

Якщо щось не працює:
1. Перевір цей checklist
2. Перевір PREDICTIONS_API_SETUP.md
3. Перевір PREDICTIONS_V2_SUMMARY.md
4. Перевір console для помилок
5. Перевір .env конфігурацію

Успіхів! 🎉
