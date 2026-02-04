import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
server: {
    host: true,        // 👈 слухати 0.0.0.0
    port: 5173,
    strictPort: true,
    allowedHosts: [
    '.ngrok-free.dev',
  ],
  },
  // Базовий шлях для білду (якщо розгортаєш на піддиректорію)
  base: '/',

  // Розв'язування шляхів (зручно для імпортів типу @/components)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // address: '/src/types/address.ts',
    },
    
    
  },

  // Оптимізація для wallet-adapter (часто потрібна)
  optimizeDeps: {
    include: [
      '@solana/web3.js',
      '@solana/spl-token',
      '@coral-xyz/anchor',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
    ],
  },

  // Якщо потрібен проксі до локального бекенду (наприклад для API)
  // server: {
  //   proxy: {
  //     '/api': 'http://localhost:3001',
  //   },
  // },
})