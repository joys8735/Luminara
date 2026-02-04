'use client';

import React, { useEffect, useRef } from 'react';

interface TradingViewMiniChartProps {
  symbol: string;           // наприклад, "BTCUSDT"
  height?: number;          // тепер за замовчуванням 240px
  interval?: string;        // '1', '5', '15' тощо
}

export function TradingViewMiniChart({
  symbol,
  height = 140,
  interval = '5',
}: TradingViewMiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const createWidget = () => {
    if (!containerRef.current) return;

    // Очищаємо попередній контент
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      symbol: `BINANCE:${symbol}`,
      width: '100%',
      height,
      locale: 'en',
      dateRange: '5m',
      colorTheme: 'dark',
      trendLineColor: '#3b82f6',
      underLineColor: 'rgba(59, 130, 246, 0.12)',
      isTransparent: true,
      autosize: false,
      largeChartUrl: '',
      chartOnly: true,
      noTimeScale: true,
      hideVolume: true,
      hideMarketStatus: true,
    };

    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);
  };

  useEffect(() => {
    createWidget();

    // Оновлення кожні 30 секунд
    const intervalId = setInterval(createWidget, 300000);

    return () => {
      clearInterval(intervalId);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, height, interval]);

  return (
    <div 
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden "
      style={{ height: `${height}px`, marginTop: '20px' }}
    />
    
  );
}