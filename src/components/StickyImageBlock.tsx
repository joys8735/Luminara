import { useState, useEffect } from 'react';
import { X } from 'lucide-react'; // або будь-яка інша іконка хрестика

export default function FloatingPromo() {
  const STORAGE_KEY = 'floating-promo-hidden-until';
  const [isVisible, setIsVisible] = useState(false);

  // Перевіряємо, чи можна показувати блок
  useEffect(() => {
    const hiddenUntil = localStorage.getItem(STORAGE_KEY);
    
    if (!hiddenUntil) {
      setIsVisible(true);
      return;
    }

    const timestamp = Number(hiddenUntil);
    if (Date.now() > timestamp) {
      // минув 24 години → показуємо знову
      setIsVisible(true);
      localStorage.removeItem(STORAGE_KEY);
    }
    // якщо ще не минув час — залишається false → не показуємо
  }, []);

  const handleClose = () => {
    // ховаємо на 24 години = 86400000 мс
    const hideUntil = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, String(hideUntil));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 right-10 w-36 z-50">
      <div className="relative rounded-xl shadow-lg overflow-hidden bg-white">
        <button
          onClick={handleClose}
          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 
                     flex items-center justify-center rounded-full 
                     bg-black/40 hover:bg-black/70 text-white 
                     transition-colors"
          aria-label="Закрити"
        >
          <X size={14} />
        </button>

        <img
          src="/new.jpg"           // або повний шлях: "/images/new.jpg"
          alt="Промо"
          className="w-full h-auto block"
          draggable={false}
        />
      </div>
    </div>
  );
}