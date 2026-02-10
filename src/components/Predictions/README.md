# Predictions Modals

Окремі модальні вікна для різних типів предикшнів у Predictions Arena.

## Структура

### CryptoModal.tsx
Модалка для криптовалютних предикшнів:
- Живий графік TradingView
- Технічні індикатори (волатильність, funding rate, buy/sell volume)
- Профіль ризику
- Вибір валюти (USDT/SOL)
- Кнопки UP/DOWN для напрямку

### SportsModal.tsx
Модалка для спортивних предикшнів:
- Інформація про подію
- Поточні коефіцієнти (odds)
- Ринковий сентимент (розподіл ставок)
- Кнопки WIN/LOSE для результату

### NewsModal.tsx
Модалка для новинних/ринкових предикшнів:
- Інформація про новинну подію
- Sentiment score
- Рівень впливу (impact level)
- Розбивка сентименту (позитивний/негативний)
- Кнопки BULLISH/BEARISH для напрямку

## Використання

```tsx
import { CryptoModal } from '../components/Predictions/CryptoModal';
import { SportsModal } from '../components/Predictions/SportsModal';
import { NewsModal } from '../components/Predictions/NewsModal';

// У компоненті Predictions
<AnimatePresence>
  {modalOpen && selectedPair && category === 'crypto' && (
    <CryptoModal
      pair={selectedPair}
      amount={amount}
      setAmount={setAmount}
      currency={currency}
      setCurrency={setCurrency}
      onClose={closeModal}
      onPlaceBet={placeBet}
      connected={connected}
      formatPriceSmart={formatPriceSmart}
      possibleWin={possibleWin}
      getRiskInfo={getRiskInfo}
      miniStats={miniStats}
      extraStats={extraStats}
    />
  )}
  
  {/* Аналогічно для sports та news */}
</AnimatePresence>
```

## Особливості

- Кожна модалка має унікальний дизайн та функціонал
- Анімації через Framer Motion
- Адаптивний дизайн (mobile-first)
- Валідація введених даних
- Різні кольорові схеми для кожного типу

## Виправлення

### TradingView iframe помилка
Виправлено помилку "Cannot listen to the event from the provided iframe" шляхом:
- Правильної структури контейнера віджета
- Коректного cleanup при unmount
- Використання окремого ref для скрипта
