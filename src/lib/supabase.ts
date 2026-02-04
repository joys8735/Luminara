// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnxyofqchoejrdrxdmwd.supabase.co';
const supabaseAnonKey = 'sb_publishable_Qn7Wj9e1lhHbYcHLsML_vw_4ZRYWXb-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }
});

// Функція для отримання або створення profile_id
// lib/supabase.ts - ОНОВІТЬ цю функцію
export const ensureUserProfile = async (user: any) => {
  try {
    if (!user) return null;
    
    // Використовуємо user.id замість user.email
    const userId = user.id;
    
    // Шукаємо профіль по user_id (це має бути user.id, не email)
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, user_id, username')
      .eq('user_id', userId) // ← Використовуємо ID користувача
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return null;
    }
    
    if (existingProfile) {
      // Зберігаємо profile_id в localStorage
      localStorage.setItem('profile_id', existingProfile.id);
      console.log('Found existing profile:', existingProfile.id);
      return existingProfile;
    } else {
      // Створюємо новий профіль
      const username = user.user_metadata?.full_name?.replace(/\s+/g, '_') || 
                      `user_${user.email?.split('@')[0] || Date.now()}`;
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId, // ← Використовуємо ID користувача
          username: username.substring(0, 20),
          avatar: 'avatar1',
          avatar_frame: 'none',
          bio: 'Crypto enthusiast! 🚀',
          level: 1,
          xp: 0,
          xp_to_next_level: 1000,
          can_change_username: true,
          username_changes_count: 0,
          created_at: new Date().toISOString()
        })
        .select('id, user_id, username')
        .single();
      
      if (createError) {
        console.error('Error creating profile:', createError);
        
        // Якщо помилка RLS, спробуємо безпечний спосіб
        if (createError.code === '42501') {
          console.error('RLS policy error. Check your RLS policies in Supabase.');
          
          // Можна спробувати через Edge Function або вимкнути RLS
          return null;
        }
        
        return null;
      }
      
      // Зберігаємо profile_id в localStorage
      localStorage.setItem('profile_id', newProfile.id);
      console.log('Created new profile:', newProfile.id);
      return newProfile;
    }
  } catch (error) {
    console.error('Failed to ensure user profile:', error);
    return null;
  }
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  
  // При отриманні користувача також створюємо/отримуємо профіль
  if (user) {
    await ensureUserProfile(user);
  }
  
  return user;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  // Очищаємо profile_id при виході
  localStorage.removeItem('profile_id');
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Додаткова функція для отримання profile_id
export const getProfileId = () => {
  return localStorage.getItem('profile_id');
};

// Функція для зв'язку гаманця з профілем
export const connectWalletToProfile = async (walletAddress: string) => {
  try {
    const profileId = getProfileId();
    if (!profileId) {
      throw new Error('No profile found. Please log in first.');
    }
    
    // Перевіряємо чи є зв'язок
    const { data: existingWallet, error: fetchError } = await supabase
      .from('user_wallets')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking wallet connection:', fetchError);
    }
    
    if (!existingWallet) {
      // Створюємо зв'язок
      const { error: insertError } = await supabase
        .from('user_wallets')
        .insert({
          profile_id: profileId,
          wallet_address: walletAddress.toLowerCase(),
          wallet_type: 'metamask',
          is_primary: true
        });
      
      if (insertError) {
        console.error('Error creating wallet connection:', insertError);
        throw insertError;
      }
      
      return { success: true, message: 'Wallet connected successfully' };
    }
    
    return { success: true, message: 'Wallet already connected' };
  } catch (error: any) {
    console.error('Failed to connect wallet:', error);
    return { success: false, error: error.message };
  }
};