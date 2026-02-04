#!/usr/bin/env bash
# split-predictions.sh
# Автоматичне розділення великого React компонента на модулі

set -euo pipefail

echo "🚀 Починаю розділення Predictions компонента..."

# Перевіряємо, чи існує файл
SRC=Predictions.tsx
if [[ ! -f "$SRC" ]]; then
    echo "❌ Помилка: Файл $SRC не знайдено!"
    echo "📝 Створіть спочатку файл Predictions.tsx з вашим кодом"
    exit 1
fi

# Створюємо папки
DIR="_predictions_split"
COMP="$DIR/components"
mkdir -p "$DIR" "$COMP"

echo "📁 Створюю папку: $DIR"

# 1. Виділяємо типи (interfaces, types, enums)
echo "📦 Виділяю типи..."
sed -n '/^interface\|^type\|^enum/,/^}/p' "$SRC" > "$DIR/types.ts"
echo "export * from './types';" >> "$DIR/types.ts"

# 2. Виділяємо константи (великі букви)
echo "📦 Виділяю константи..."
awk '/^const [A-Z_][A-Z0-9_]* =/' "$SRC" > "$DIR/constants.ts"
echo "export * from './constants';" >> "$DIR/constants.ts"

# 3. Виділяємо утиліти (функції, які не є хуками)
echo "📦 Виділяю утиліти..."
awk '
/^function [a-zA-Z]/ && !/^function use/ {print}
/^const [a-z][a-zA-Z0-9]* = \(/ {print}
/^const [a-z][a-zA-Z0-9]* = \(.*\) =>/ {print}
' "$SRC" > "$DIR/utils.ts"
echo "export * from './utils';" >> "$DIR/utils.ts"

# 4. Виділяємо хуки (починаються на use)
echo "📦 Виділяю хуки..."
awk '/^function use|^const use[A-Z]/ {print}' "$SRC" > "$DIR/hooks.ts"
echo "export * from './hooks';" >> "$DIR/hooks.ts"

# 5. Виділяємо компоненти (вручну - буде створено шаблони)
echo "📦 Готую шаблони для компонентів..."

# Створюємо основний файл з імпортами
cat > "$DIR/PredictionsMain.tsx" << 'EOF'
import React from 'react';

// Імпортуємо з розділених файлів
import { Bet, Pair } from './types';
import { REFETCH_INTERVAL } from './constants';
import { formatPriceSmart, calculateWin } from './utils';
import { useBetStatus } from './hooks';

// Тут буде основний код компонента Predictions
// Перемістіть сюди JSX частину з вашого файлу

export const Predictions: React.FC = () => {
  // Ваш код тут
  return (
    <div>
      <h1>Predictions Component</h1>
      {/* Перемістіть сюди ваш JSX */}
    </div>
  );
};

export default Predictions;
EOF

echo "✅ Готово! Результат:"
echo "📁 $DIR/types.ts        - інтерфейси та типи"
echo "📁 $DIR/constants.ts    - константи"
echo "📁 $DIR/utils.ts        - функції-утиліти"
echo "📁 $DIR/hooks.ts        - кастомні хуки"
echo "📁 $DIR/PredictionsMain.tsx - основний компонент"
echo "📁 $COMP/               - окремі компоненти"
echo ""
echo "📝 Наступні кроки:"
echo "1. Перегляньте створені файли"
echo "2. Перемістіть код компонентів в папку $COMP/"
echo "3. Оновіть імпорти в PredictionsMain.tsx"
echo "4. Видаліть дублікати коду з оригінального Predictions.tsx"
