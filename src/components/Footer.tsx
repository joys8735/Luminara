import React from 'react';
import { Twitter, Send } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-white dark:bg-[#0f172a] border-t border-gray-200 dark:border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2023 SolanaVerse IDO Launchpool. All rights reserved.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <a href="https://twitter.com/solanaverse" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 hover:scale-110" aria-label="Follow us on Twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://t.me/solanaverse" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 hover:scale-110" aria-label="Join us on Telegram">
              <Send className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;