// src/layouts/LandingLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ExternalLink, Sparkles, User, Settings, Bell } from 'lucide-react';
import ScrollToTop from '../components/ScrollToTop';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // твоя логіка конекту гаманця (наприклад, виклик модалки або wallet.connect())
    setTimeout(() => setIsConnecting(false), 2000); // імітація, заміни на реальний await
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f1d] to-black text-white">
      {/* Компактний хедер */}
     <header className="sticky top-0 z-50 w-full  backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Лого та назва */}
          <div className="flex items-center gap-3">
           
            <div>
              <img src="public/logo.png" className="w-40" alt="" />
              
            </div>
          </div>

          {/* Навігація */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Markets</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Trading</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Portfolio</a>
          </nav>

          {/* Користувацькі елементи */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-300" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Connect</span>
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Контент з відступом під хедер */}
      <main className="w-full pt-16 md:pt-0">
        {children}
      </main>

      <ScrollToTop />
    </div>
  );
}   