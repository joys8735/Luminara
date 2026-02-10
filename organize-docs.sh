#!/bin/bash

# Скрипт для організації документації

echo "🗂️  Організація документації..."

# Створення структури папок
mkdir -p docs/predictions
mkdir -p docs/project  
mkdir -p docs/guides
mkdir -p docs/api
mkdir -p docs/integration

# Predictions файли
echo "📁 Переношу Predictions документацію..."
cp PREDICTIONS_API_SETUP.md docs/predictions/API_SETUP.md 2>/dev/null || true
cp PREDICTIONS_CHANGELOG.md docs/predictions/CHANGELOG.md 2>/dev/null || true
cp PREDICTIONS_CHECKLIST.md docs/predictions/CHECKLIST.md 2>/dev/null || true
cp PREDICTIONS_IMPROVEMENTS.md docs/predictions/IMPROVEMENTS.md 2>/dev/null || true
cp PREDICTIONS_QUICK_START.md docs/predictions/QUICK_START.md 2>/dev/null || true
cp PREDICTIONS_V2_SUMMARY.md docs/predictions/V2_SUMMARY.md 2>/dev/null || true
cp UI_IMPROVEMENTS_VISUAL.md docs/predictions/UI_IMPROVEMENTS.md 2>/dev/null || true

# Project файли
echo "📁 Переношу Project документацію..."
cp ARCHITECTURE.md docs/project/ARCHITECTURE.md 2>/dev/null || true
cp DEVELOPER_GUIDE.md docs/project/DEVELOPER_GUIDE.md 2>/dev/null || true
cp DEPLOYMENT_SETUP.md docs/project/DEPLOYMENT.md 2>/dev/null || true
cp FAQ.md docs/project/FAQ.md 2>/dev/null || true
cp PROJECT_DOCUMENTATION.md docs/project/OVERVIEW.md 2>/dev/null || true
cp DOCUMENTATION_INDEX.md docs/project/INDEX.md 2>/dev/null || true
cp DOCUMENTATION_README.md docs/project/README_OLD.md 2>/dev/null || true
cp DOCUMENTATION_SUMMARY.md docs/project/SUMMARY.md 2>/dev/null || true

# Guides файли
echo "📁 Переношу Guides..."
cp QUICK_START.md docs/guides/QUICK_START.md 2>/dev/null || true
cp API_COMPONENTS_GUIDE.md docs/guides/API_COMPONENTS.md 2>/dev/null || true

# Integration файли
echo "📁 Переношу Integration документацію..."
cp INTEGRATION_COMPLETE.md docs/integration/COMPLETE.md 2>/dev/null || true
cp INTEGRATION_SUMMARY.md docs/integration/SUMMARY.md 2>/dev/null || true
cp QUICK_REFERENCE.md docs/integration/QUICK_REFERENCE.md 2>/dev/null || true

echo "✅ Документація організована!"
echo ""
echo "📂 Структура:"
echo "  docs/"
echo "    ├── predictions/     - Predictions Arena документація"
echo "    ├── project/         - Загальна документація проекту"
echo "    ├── guides/          - Гайди та туторіали"
echo "    ├── api/             - API документація"
echo "    └── integration/     - Integration гайди"
echo ""
echo "💡 Тепер можеш видалити старі .md файли з кореня:"
echo "   rm PREDICTIONS_*.md INTEGRATION_*.md DOCUMENTATION_*.md"
