// hooks/useProfile.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  avatar_frame: string;
  bio: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  created_at: string;
  last_updated: string;
  last_username_change: string;
  can_change_username: boolean;
  username_changes_count: number;
}

interface AvatarOption {
  id: number;
  avatar_id: string;
  name: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image_url: string;
}

interface FrameOption {
  id: string;
  frame_id: string;
  name: string;
  // color: string;
  image_url?: string;
  unlocked: boolean;
  unlock_requirement?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const USERNAME_CHANGE_COOLDOWN = 30 * 24 * 60 * 60 * 1000;

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [frames, setFrames] = useState<FrameOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);

  const isMounted = useRef(true);
  const lastProfileLoadTime = useRef<number>(0);
  const profileLoadInProgress = useRef<boolean>(false);
  const previousUserId = useRef<string | null>(null);

  // Завантаження асетів (окремо)
  useEffect(() => {
    const loadAssetsAsync = async () => {
      try {
        
        const [avatarsResponse, framesResponse] = await Promise.all([
          supabase.from('avatars').select('*'),
          supabase.from('avatar_frames').select('*'),
        ]);

        if (avatarsResponse.data) {
          
          setAvatars(avatarsResponse.data);
        }

        if (framesResponse.data) {
          
          setFrames(framesResponse.data);
        }
      } catch (error) {
        console.error('❌ Failed to load assets:', error);
      } finally {
        setAssetsLoading(false);
      }
    };

    loadAssetsAsync();
  }, []);

  // Завантаження профілю
  const loadProfile = useCallback(async (supabaseUser: any) => {
    if (!isMounted.current || !supabaseUser || profileLoadInProgress.current) {
      
      return;
    }

    const now = Date.now();
    if (now - lastProfileLoadTime.current < 500) {
      
      return;
    }

    profileLoadInProgress.current = true;
    lastProfileLoadTime.current = now;
    

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 сек таймаут

      const userId = supabaseUser.id;

      const { data: existingProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ Profile query error:', error);
        return;
      }

      if (existingProfile === null) {
        
        setIsFirstLogin(true);

        const newProfile = {
          user_id: userId,
          username:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email?.split('@')[0] ||
            'CryptoTrader',
          avatar: 'avatar1',
          avatar_frame: 'none',
          bio: 'Just started my trading journey! 🚀',
          level: 1,
          xp: 0,
          xp_to_next_level: 1000,
          can_change_username: true,
          username_changes_count: 0,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          if (createError.code === '23505') {
            console.warn('⚠️ Duplicate profile detected, reloading...');
            return loadProfile(supabaseUser); // Рекурсія для фіксу race condition
          }
          console.error('❌ Failed to create profile:', createError);
          return;
        } else {
          
          setProfile(createdProfile);
        }
      } else if (existingProfile) {
        
        setIsFirstLogin(false);

        const nowTime = Date.now();
        const lastChange = new Date(existingProfile.last_username_change).getTime();
        const canChange =
          existingProfile.username_changes_count === 0 ||
          nowTime - lastChange >= USERNAME_CHANGE_COOLDOWN;

        const updatedProfile = {
          ...existingProfile,
          can_change_username: canChange,
        };

        

        setProfile(updatedProfile);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.error('⏱️ Supabase query aborted (timeout)');
      } else {
        console.error('❌ Profile load failed:', err);
      }
    } finally {
      
      if (isMounted.current) {
        profileLoadInProgress.current = false;
        setIsLoading(false);
      }
    }
  }, []);

  // Головний ефект: тільки listener на auth
  useEffect(() => {
    isMounted.current = true;
    let isInitialized = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted.current) return;

        if (session?.user) {
          if (previousUserId.current === session.user.id) {
            return;
          }
          previousUserId.current = session.user.id;
          setUser(session.user);

          // Call loadProfile directly without awaiting to prevent blocking
          if (!isInitialized) {
            isInitialized = true;
            loadProfile(session.user).catch(err => {
              console.error('Background profile load failed:', err);
            });
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsFirstLogin(false);
          previousUserId.current = null;
          isInitialized = false;
        }

        setAuthLoading(false);
      }
    );

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Google логін
  const loginWithGoogle = async () => {
    

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('❌ Google login error:', error);
      throw error;
    }

    
  };

  // Логаут
  const logout = async () => {
    

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Logout error:', error);
    } else {
      
      setProfile(null);
      setUser(null);
      setIsFirstLogin(false);
    }
  };

  // Google User
  const getGoogleUser = useCallback(() => {
    if (!user) return null;

    return {
      id: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0],
      email: user.email,
      avatar: user.user_metadata?.avatar_url,
    };
  }, [user]);

  // Оновлення профілю
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!profile) {
      console.warn('⚠️ Cannot update profile: no profile loaded');
      return;
    }

    try {
      

      const updatedProfile = {
        ...profile,
        ...updates,
        last_updated: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updatedProfile)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update profile:', error);
        return;
      }

      
      setProfile(data);
      return data;
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
    }
  }, [profile]);

  // Оновлення аватара
  const updateAvatar = useCallback(async (avatarId: string) => {
    if (!profile) return;

    const avatar = avatars.find(a => a.avatar_id === avatarId);
    if (!avatar || !avatar.unlocked) {
      throw new Error('Invalid or locked avatar');
    }

    try {
      // Оновлюємо локально одразу
      const updatedProfile = {
        ...profile,
        avatar: avatarId,
        last_updated: new Date().toISOString(),
      };
      setProfile(updatedProfile);

      // Чекаємо оновлення в базі
      const { error } = await supabase
        .from('user_profiles')
        .update({
          avatar: avatarId,
          last_updated: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        console.error('❌ Failed to save avatar to DB:', error);
        setProfile(profile); // rollback
        throw error;
      }

      return updatedProfile;
    } catch (error) {
      console.error('❌ Failed to update avatar:', error);
      throw error;
    }
  }, [profile]);

  // Оновлення рамки
  const updateAvatarFrame = useCallback(async (frameId: string) => {
  if (!profile) {
    console.warn('No profile loaded for frame update');
    return;
  }

  

  const frame = frames.find(f => f.frame_id === frameId);
  if (!frame) {
    console.error('❌ Frame not found:', frameId);
    return;
  }

  if (!frame.unlocked) {
    console.error('❌ Frame locked:', frameId);
    return;
  }

  try {
    await updateProfile({ avatar_frame: frameId });
    
  } catch (err) {
    console.error('❌ Помилка збереження фрейму:', err);
  }
}, [profile, frames, updateProfile]);

  // Оновлення імені
  const updateUsername = useCallback(async (newUsername: string): Promise<{ success: boolean; message: string }> => {
    if (!profile) return { success: false, message: 'Profile not loaded' };

    if (!newUsername.trim()) return { success: false, message: 'Username cannot be empty' };
    if (newUsername.length > 16) return { success: false, message: 'Username must be max 16 characters' };
    if (newUsername.trim() === profile.username) return { success: true, message: 'Username is the same' };

    if (profile.username_changes_count > 0 && !profile.can_change_username) {
      const lastChange = new Date(profile.last_username_change).getTime();
      const now = Date.now();
      const timeSinceLastChange = now - lastChange;

      if (timeSinceLastChange < USERNAME_CHANGE_COOLDOWN) {
        const daysLeft = Math.ceil((USERNAME_CHANGE_COOLDOWN - timeSinceLastChange) / (24 * 60 * 60 * 1000));
        return { success: false, message: `You can change your username in ${daysLeft} days` };
      }
    }

    const result = await updateProfile({
      username: newUsername.trim(),
      last_username_change: new Date().toISOString(),
      username_changes_count: profile.username_changes_count + 1,
      can_change_username: false,
    });

    if (result) return { success: true, message: 'Username updated successfully!' };
    return { success: false, message: 'Failed to update username' };
  }, [profile, updateProfile]);

  // Оновлення біо
  const updateBio = useCallback((newBio: string) => {
    if (newBio.length > 120) return;
    updateProfile({ bio: newBio });
  }, [updateProfile]);

  // Додавання XP
  const addXP = useCallback(async (amount: number) => {
    if (!profile) return;

    let newXP = profile.xp + amount;
    let newLevel = profile.level;
    let xpToNextLevel = profile.xp_to_next_level;

    while (newXP >= xpToNextLevel) {
      newXP -= xpToNextLevel;
      newLevel++;
      xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
    }

    await updateProfile({
      xp: newXP,
      level: newLevel,
      xp_to_next_level: xpToNextLevel,
    });
  }, [profile, updateProfile]);

  // Завершення онбордингу
  const completeOnboarding = useCallback(async () => {
    setIsFirstLogin(false);
    await addXP(500);
  }, [addXP]);

  // Поточний аватар
  const getCurrentAvatar = useCallback(() => {
    if (!profile || avatars.length === 0) {
      
      return null;
    }

    

    const foundAvatar = avatars.find((a) => a.avatar_id === profile.avatar);
    if (foundAvatar) {
      
      return {
        ...foundAvatar,
        imageUrl: `${foundAvatar.image_url}?t=${Date.now()}`,
      };
    }

    
    const fallback = avatars.find((a) => a.avatar_id === 'avatar1') || avatars[0];

    if (fallback) {
      
      return {
        ...fallback,
        imageUrl: `${fallback.image_url}?t=${Date.now()}`,
      };
    }

    return null;
  }, [profile, avatars]);

  // Поточна рамка
  const getCurrentFrame = useCallback(() => {
    if (!profile || frames.length === 0) {
      
      return null;
    }

    const frame = frames.find((f) => f.frame_id === profile.avatar_frame);
    

    return frame;
  }, [profile, frames]);

  // Прогрес рівня
  const getLevelProgress = useCallback(() => {
    if (!profile) return 0;
    return (profile.xp / profile.xp_to_next_level) * 100;
  }, [profile]);

  // Кулдаун зміни імені
  const getUsernameChangeCooldown = useCallback(() => {
    if (!profile || profile.can_change_username) return 0;

    const lastChange = new Date(profile.last_username_change).getTime();
    const now = Date.now();
    const timeSinceLastChange = now - lastChange;
    const timeLeft = USERNAME_CHANGE_COOLDOWN - timeSinceLastChange;

    if (timeLeft <= 0) return 0;

    const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  }, [profile]);

  // Процент кулдауну
  const getUsernameChangePercentage = useCallback(() => {
    if (!profile || profile.can_change_username) return 100;

    const lastChange = new Date(profile.last_username_change).getTime();
    const now = Date.now();
    const timeSinceLastChange = now - lastChange;

    const percentage = Math.min(100, (timeSinceLastChange / USERNAME_CHANGE_COOLDOWN) * 100);
    return Math.round(percentage);
  }, [profile]);

  // Функція для ручного оновлення профілю
  const refreshProfile = useCallback(async () => {
    if (user && isMounted.current) {
      profileLoadInProgress.current = false;
      lastProfileLoadTime.current = 0; // Reset time to allow immediate reload
      // Call loadProfile asynchronously to prevent blocking
      setTimeout(() => {
        if (isMounted.current) {
          loadProfile(user);
        }
      }, 0);
    }
  }, [user, loadProfile]);

  // Realtime subscription для миттєвих оновлень
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`profile:${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          if (isMounted.current && payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [profile?.id]);

  // Комбінований loading
  const combinedLoading = isLoading || authLoading || assetsLoading;

  return {
    profile,
    user,
    isFirstLogin,
    isLoading: combinedLoading,
    avatars: avatars.filter((a) => a.unlocked),
    allAvatars: avatars,
    frames: frames.filter((f) => f.unlocked),
    allFrames: frames,

    loginWithGoogle,
    logout,
    getGoogleUser,

    updateUsername,
    updateAvatar,
    updateAvatarFrame,
    updateBio,
    addXP,
    completeOnboarding,
    refreshProfile,

    getCurrentAvatar,
    getCurrentFrame,
    getLevelProgress,
    getUsernameChangeCooldown,
    getUsernameChangePercentage,

    _debug: {
      authLoading,
      assetsLoading,
      profileLoading: isLoading,
      hasProfile: !!profile,
      hasUser: !!user,
      avatarsCount: avatars.length,
      framesCount: frames.length,
    },
  };
}
