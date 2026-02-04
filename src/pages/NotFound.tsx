// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white px-6">
      <h1 className="text-8xl md:text-9xl font-extrabold mb-4 tracking-tight">404</h1>
      <h2 className="text-3xl md:text-4xl mb-6">Сторінку не знайдено</h2>
      
      <p className="text-xl text-gray-400 mb-10 text-center max-w-lg">
        Схоже, ти ввів неправильну адресу або сторінка була видалена/перейменована.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/home"
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition text-lg"
        >
          Повернутися на головну
        </Link>

        <Link
          to="/support"
          className="px-8 py-4 border border-gray-600 hover:bg-gray-800 rounded-xl transition text-lg"
        >
          Зв'язатися з підтримкою
        </Link>
      </div>

      {/* Опціонально: миле зображення або іконка */}
      <div className="mt-12 opacity-60">
        <img
          src="/assets/404-illustration.svg"  // поклади туди svg або png
          alt="404 illustration"
          className="w-64 md:w-80 h-auto"
        />
      </div>
    </div>
  );
}