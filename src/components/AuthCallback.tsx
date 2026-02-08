// components/AuthCallback.tsx
'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Даємо Supabase час на обробку URL параметрів
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/');
          return;
        }

        if (session) {
          console.log('User authenticated:', session.user);
          // Оновлюємо localStorage
          localStorage.setItem('google_user', JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar: session.user.user_metadata?.avatar_url,
          }));
        }

        // Перенаправляємо на головну
        navigate('/');
      } catch (error) {
        console.error('Auth callback failed:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-sm">Completing authentication...</p>
      </div>
    </div>
  );
}
