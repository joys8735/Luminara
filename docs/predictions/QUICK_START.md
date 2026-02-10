# Predictions Arena V2 - Quick Start Guide

## 🚀 5-хвилинний старт

### Крок 1: API Ключі (2 хв)

```bash
# 1. Скопіюй .env.example
cp .env.example .env

# 2. Відкрий .env
nano .env

# 3. Додай ключі (отримай на сайтах):
# - https://the-odds-api.com/ (Sports)
# - https://newsapi.org/ (News)
```

### Крок 2: Інтеграція (3 хв)

Відкрий `src/pages/Predictions.tsx` та додай:

```typescript
// 1. Імпорти (на початку файлу)
import { sportsAPI } from '@/services/SportsAPI';
import { newsAPI } from '@/services/NewsAPI';
import { FiltersBar, SortOption, FilterOption } from '@/components/Predictions/FiltersBar';
import { HistoryModal } from '@/components/Predictions/HistoryModal';

// 2. State (після існуючих useState)
const [searchQuery, setSearchQuery] = useState('');
const [sortBy, setSortBy] = useState<SortOption>('popular');
const [filter, setFilter] = useState<FilterOption>('all');

// 3. Завантаження даних (новий useEffect)
useEffect(() => {
  async function loadData() {
    if (category === 'sports') {
      const events = await sportsAPI.getEvents('soccer_epl');
      setSportsAsPairs(sportsAPI.convertToUIFormat(events));
    } else if (category === 'news') {
      const news = await newsAPI.getCryptoMarketNews();
      setNewsAsPairs(news);
    }
  }
  loadData();
}, [category]);

// 4. Фільтрація (новий useMemo)
const filteredPairs = useMemo(() => {
  let result = displayPairs;
  
  if (searchQuery) {
    result = result.filter(p =>
      p.pair.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  if (sortBy === 'volatility') {
    result = result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }
  
  return result;
}, [displayPairs, searchQuery, sortBy]);

// 5. JSX - додай перед списком пар
<FiltersBar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  sortBy={sortBy}
  onSortChange={setSortBy}
  filter={filter}
  onFilterChange={setFilter}
  category={category}
/>

// 6. JSX - замість displayPairs.map використовуй
{filteredPairs.map((pair) => (
  // ... existing code
))}

// 7. JSX - замість старої History Modal
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

### Крок 3: Тест (1 хв)

```bash
# Запусти dev сервер
npm run dev

# Відкрий http://localhost:5173
# Перевір:
# ✓ Sports події завантажились
# ✓ News завантажились
# ✓ Пошук працює
# ✓ Сортування працює
# ✓ History з вкладками працює
```

---

## 🎯 Готово!

Тепер у тебе є:
- ✅ Реальні спортивні події
- ✅ Реальні новини
- ✅ Фільтри та пошук
- ✅ Сортування
- ✅ Історія з вкладками

---

## 📚 Детальна документація

- **API Setup:** [PREDICTIONS_API_SETUP.md](./PREDICTIONS_API_SETUP.md)
- **Full Summary:** [PREDICTIONS_V2_SUMMARY.md](./PREDICTIONS_V2_SUMMARY.md)
- **Checklist:** [PREDICTIONS_CHECKLIST.md](./PREDICTIONS_CHECKLIST.md)

---

## 🆘 Проблеми?

1. Перевір `.env` - чи додані ключі
2. Перевір console - чи є помилки
3. Перевір API limits - чи не перевищено
4. Читай детальну документацію вище

Успіхів! 🚀
