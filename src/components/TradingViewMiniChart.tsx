'use client';

import React, { useEffect, useRef } from 'react';

interface TradingViewMiniChartProps {
  symbol: string;
  height?: number;
  interval?: string;
}

export function TradingViewMiniChart({
  symbol,
  height = 140,
  interval = '5',
}: TradingViewMiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Очищаємо попередній контент
    containerRef.current.innerHTML = '';

    // Створюємо контейнер для віджета
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      symbol: `BINANCE:${symbol}`,
      width: '100%',
      height,
      locale: 'en',
      dateRange: '1D',
      colorTheme: 'dark',
      trendLineColor: '#3b82f6',
      underLineColor: 'rgba(59, 130, 246, 0.12)',
      isTransparent: true,
      autosize: false,
      largeChartUrl: '',
      chartOnly: true,
      noTimeScale: false,
      hideVolume: true,
      hideMarketStatus: true,
    };

    script.innerHTML = JSON.stringify(config);
    
    // Додаємо скрипт до контейнера віджета
    widgetContainer.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      scriptRef.current = null;
    };
  }, [symbol, height, interval]);

  return (
    <div 
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ height: `${height}px`, marginTop: '20px' }}
    />
  );
}