// hooks/useProfile.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface Profile {
  id: string;
  username: string;
  avatar: string;
  avatarFrame: string;
  bio: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  createdDate: string;
  lastUpdated: string;
  lastUsernameChange: string;
  canChangeUsername: boolean;
  usernameChangesCount: number;
}

interface AvatarOption {
  [x: string]: any;
  id: string;
  name: string;
  unlocked: boolean;
  unlockRequirement?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
  originalUrl: string; // Додаємо оригінальний URL
}

interface FrameOption {
  id: string;
  name: string;
  color: string;
  unlocked: boolean;
  unlockRequirement?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const DEFAULT_AVATARS: AvatarOption[] = [
  { 
    id: 'avatar1', 
    name: 'Classic Trader', 
    unlocked: true, 
    rarity: 'common',
    imageUrl: 'https://static.beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75&crop=0,0,100,100',
    originalUrl: 'https://static.beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75&crop=0,0,100,100'
  },
  { 
    id: 'avatar2', 
    name: 'Blue Filter', 
    unlocked: true, 
    rarity: 'common',
    imageUrl: 'https://pics.craiyon.com/2023-08-02/eae102a637ec410e9fa38d20b66e8ff8.webp',
    originalUrl: 'https://pics.craiyon.com/2023-08-02/eae102a637ec410e9fa38d20b66e8ff8.webp'
  },
  { 
    id: 'avatar3', 
    name: 'Zoom In', 
    unlocked: true, 
    rarity: 'common',
    imageUrl: 'https://nftevening.com/wp-content/uploads/2022/05/Lil-Baby-DeadFellaz-3439.png',
    originalUrl: 'https://nftevening.com/wp-content/uploads/2022/05/Lil-Baby-DeadFellaz-3439.png'
  },
  { 
    id: 'avatar4', 
    name: 'Grayscale', 
    unlocked: true, 
    unlockRequirement: '100 AP',
    rarity: 'rare',
    imageUrl: 'https://i.pinimg.com/736x/67/bc/91/67bc916bd54bebec3544c6e0e7cfe0ad.jpg',
    originalUrl: 'https://i.pinimg.com/736x/67/bc/91/67bc916bd54bebec3544c6e0e7cfe0ad.jpg'
  },
  { 
    id: 'avatar5', 
    name: 'Vintage', 
    unlocked: true, 
    unlockRequirement: '500 AP',
    rarity: 'rare',
    imageUrl: 'https://airnfts.s3.amazonaws.com/profile-images/20211123/0x0184461978d64EdDc068e83e0bA67Ce1c84E0410_1637629464443.gif',
    originalUrl: 'https://airnfts.s3.amazonaws.com/profile-images/20211123/0x0184461978d64EdDc068e83e0bA67Ce1c84E0410_1637629464443.gif'
  },
  { 
    id: 'avatar6', 
    name: 'Golden', 
    unlocked: false, 
    unlockRequirement: '1000 AP',
    rarity: 'epic',
    imageUrl: 'https://roob.in/img-host/blog/NFT/nft-kartinka-zakazat1.png',
    originalUrl: 'https://roob.in/img-host/blog/NFT/nft-kartinka-zakazat1.png'
  },
  { 
    id: 'avatar7', 
    name: 'Cyberpunk', 
    unlocked: false, 
    unlockRequirement: '2500 AP',
    rarity: 'epic',
    imageUrl: 'https://media.nft.crypto.com/89300cf2-7241-4ce8-b4ba-d285cb7bbbf4/original.gif',
    originalUrl: 'https://media.nft.crypto.com/89300cf2-7241-4ce8-b4ba-d285cb7bbbf4/original.gif'
  },
  { 
    id: 'avatar8', 
    name: 'Neon', 
    unlocked: false, 
    unlockRequirement: '5000 AP',
    rarity: 'legendary',
    imageUrl: 'https://cdna.artstation.com/p/assets/images/images/058/385/344/original/essor-gif-maker-1.gif?1674045136',
    originalUrl: 'https://cdna.artstation.com/p/assets/images/images/058/385/344/original/essor-gif-maker-1.gif?1674045136'
  },
];

const DEFAULT_FRAMES: FrameOption[] = [
  { id: 'none', name: 'No Frame', color: 'transparent', unlocked: true, rarity: 'common' },
  { id: 'bronze', name: 'Bronze', color: '#CD7F32', unlocked: false, unlockRequirement: '500 AP', rarity: 'common' },
  { id: 'silver', name: 'Silver', color: '#C0C0C0', unlocked: false, unlockRequirement: '2500 AP', rarity: 'rare' },
  { id: 'gold', name: 'Gold', color: '#FFD700', unlocked: false, unlockRequirement: '10000 AP', rarity: 'epic' },
  { id: 'platinum', name: 'Platinum', color: '#E5E4E2', unlocked: false, unlockRequirement: '25000 AP', rarity: 'epic' },
  { id: 'diamond', name: 'Diamond', color: '#B9F2FF', unlocked: false, unlockRequirement: '50000 AP', rarity: 'legendary' },
  { id: 'rainbow', name: 'Rainbow', color: 'linear-gradient(45deg, #ff0000, #ff9900, #ffff00, #00ff00, #00ffff, #0000ff, #9900ff)', unlocked: false, unlockRequirement: 'Win 7 days streak', rarity: 'legendary' },
  { id: 'nebula', name: 'Nebula', color: 'linear-gradient(45deg, #8a2be2, #00bfff, #00fa9a)', unlocked: false, unlockRequirement: 'Top 1 weekly', rarity: 'legendary' },
];

const STORAGE_KEY = 'user_profile_v3';
const HAS_COMPLETED_ONBOARDING = 'has_completed_onboarding';
const USERNAME_CHANGE_COOLDOWN = 30 * 24 * 60 * 60 * 1000;

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [avatars, setAvatars] = useState<AvatarOption[]>(DEFAULT_AVATARS);
  const [frames, setFrames] = useState<FrameOption[]>(DEFAULT_FRAMES);
  const [isLoading, setIsLoading] = useState(true);
  const [usernameChangeError, setUsernameChangeError] = useState<string | null>(null);
  
  const updateTriggerRef = useRef(0);
  const lastAvatarUpdateRef = useRef<string>('');

  const updateUnlockedItems = useCallback((alphaPoints = 0) => {
    setAvatars(prev => prev.map(avatar => {
      if (avatar.unlocked) return avatar;
      
      if (avatar.unlockRequirement && avatar.unlockRequirement.includes('AP')) {
        const apRequired = parseInt(avatar.unlockRequirement.replace(' AP', ''));
        if (!isNaN(apRequired) && alphaPoints >= apRequired) {
          return { ...avatar, unlocked: true };
        }
      }
      
      return avatar;
    }));

    setFrames(prev => prev.map(frame => {
      if (frame.unlocked) return frame;
      
      if (frame.unlockRequirement && frame.unlockRequirement.includes('AP')) {
        const apRequired = parseInt(frame.unlockRequirement.replace(' AP', ''));
        if (!isNaN(apRequired) && alphaPoints >= apRequired) {
          return { ...frame, unlocked: true };
        }
      }
      
      return frame;
    }));
  }, []);

  const loadProfile = useCallback(() => {
    setIsLoading(true);
    setUsernameChangeError(null);
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const hasOnboarding = localStorage.getItem(HAS_COMPLETED_ONBOARDING);
      
      if (saved) {
        const parsed = JSON.parse(saved);
        
        const now = Date.now();
        const lastChange = new Date(parsed.lastUsernameChange || parsed.createdDate).getTime();
        
        const canChange = parsed.usernameChangesCount === 0 || 
                         (now - lastChange) >= USERNAME_CHANGE_COOLDOWN;
        
        const updatedProfile = {
          ...parsed,
          canChangeUsername: canChange,
        };
        
        setProfile(updatedProfile);
        setIsFirstLogin(false);
        updateUnlockedItems(updatedProfile.xp || 0);
      } else {
        setIsFirstLogin(!hasOnboarding);
        
        const tempProfile: Profile = {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          username: 'CryptoTrader',
          avatar: 'avatar1',
          avatarFrame: 'none',
          bio: 'Just started my trading journey! 🚀',
          level: 1,
          xp: 0,
          xpToNextLevel: 1000,
          createdDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          lastUsernameChange: new Date().toISOString(),
          canChangeUsername: true,
          usernameChangesCount: 0,
        };
        
        setProfile(tempProfile);
        updateUnlockedItems(0);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateUnlockedItems]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const checkAndShowOnboarding = (googleUser?: any) => {
    const hasOnboarding = localStorage.getItem(HAS_COMPLETED_ONBOARDING);
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (!saved && !hasOnboarding) {
      setIsFirstLogin(true);
      
      if (googleUser) {
        const tempProfile: Profile = {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          username: googleUser.name || googleUser.email?.split('@')[0] || 'CryptoTrader',
          avatar: 'avatar1',
          avatarFrame: 'none',
          bio: 'Just started my trading journey! 🚀',
          level: 1,
          xp: 0,
          xpToNextLevel: 1000,
          createdDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          lastUsernameChange: new Date().toISOString(),
          canChangeUsername: true,
          usernameChangesCount: 0,
        };
        
        setProfile(tempProfile);
      }
      return true;
    }
    
    return false;
  };

  const saveProfile = useCallback((newProfile: Partial<Profile>) => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      ...newProfile,
      lastUpdated: new Date().toISOString(),
    };
    
    setProfile(updatedProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    
    // Оновлюємо розблоковані елементи
    updateUnlockedItems(updatedProfile.xp || 0);
    
    // Тригеримо оновлення
    updateTriggerRef.current += 1;
    console.log('Profile saved, update trigger:', updateTriggerRef.current);
  }, [profile, updateUnlockedItems]);

  const updateUsername = useCallback((newUsername: string): { success: boolean; message: string } => {
    if (!newUsername.trim()) {
      return { success: false, message: 'Username cannot be empty' };
    }
    
    if (newUsername.length > 16) {
      return { success: false, message: 'Username must be max 16 characters' };
    }
    
    if (!profile) {
      return { success: false, message: 'Profile not loaded' };
    }
    
    if (newUsername.trim() === profile.username) {
      return { success: true, message: 'Username is the same' };
    }
    
    if (profile.usernameChangesCount > 0 && !profile.canChangeUsername) {
      const lastChange = new Date(profile.lastUsernameChange).getTime();
      const now = Date.now();
      const timeSinceLastChange = now - lastChange;
      
      if (timeSinceLastChange < USERNAME_CHANGE_COOLDOWN) {
        const daysLeft = Math.ceil((USERNAME_CHANGE_COOLDOWN - timeSinceLastChange) / (24 * 60 * 60 * 1000));
        return { 
          success: false, 
          message: `You can change your username in ${daysLeft} days` 
        };
      } else {
        saveProfile({ canChangeUsername: true });
      }
    }
    
    saveProfile({
      username: newUsername.trim(),
      lastUsernameChange: new Date().toISOString(),
      usernameChangesCount: profile.usernameChangesCount + 1,
      canChangeUsername: false,
    });
    
    return { success: true, message: 'Username updated successfully!' };
  }, [profile, saveProfile]);

  const updateAvatar = useCallback((avatarId: string) => {
    let selectedId = avatarId;
    if (avatarId === 'default') {
      const firstUnlocked = avatars.find(a => a.unlocked);
      if (firstUnlocked) {
        selectedId = firstUnlocked.id;
      } else {
        selectedId = 'avatar1';
      }
    }

    const selectedAvatar = avatars.find(a => a.id === selectedId);
    if (!selectedAvatar || !selectedAvatar.unlocked) {
      console.error('Avatar not found or locked:', selectedId);
      return;
    }
    
    console.log('Updating avatar to:', selectedId);
    
    saveProfile({ 
      avatar: selectedId,
      lastUpdated: new Date().toISOString()
    });
    
    // Оновлюємо timestamp в аватарі
    setAvatars(prev => prev.map(avatar => {
      if (avatar.id === selectedId) {
        return {
          ...avatar,
          imageUrl: `${avatar.originalUrl}?t=${Date.now()}`
        };
      }
      return avatar;
    }));
  }, [avatars, saveProfile]);

  const updateAvatarFrame = useCallback((frameId: string) => {
    const selectedFrame = frames.find(f => f.id === frameId);
    if (!selectedFrame || !selectedFrame.unlocked) {
      console.error('Frame not found or locked:', frameId);
      return;
    }
    
    saveProfile({ avatarFrame: frameId });
  }, [frames, saveProfile]);

  const updateBio = useCallback((newBio: string) => {
    if (newBio.length > 120) return;
    
    saveProfile({ bio: newBio });
  }, [saveProfile]);

  const addXP = useCallback((amount: number) => {
    if (!profile) return;
    
    let newXP = profile.xp + amount;
    let newLevel = profile.level;
    let xpToNextLevel = profile.xpToNextLevel;
    
    while (newXP >= xpToNextLevel) {
      newXP -= xpToNextLevel;
      newLevel++;
      xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
    }
    
    saveProfile({
      xp: newXP,
      level: newLevel,
      xpToNextLevel,
    });
  }, [profile, saveProfile]);

  const completeOnboarding = useCallback(() => {
    setIsFirstLogin(false);
    localStorage.setItem(HAS_COMPLETED_ONBOARDING, 'true');
    
    if (profile && (!profile.username || profile.username === '')) {
      saveProfile({ username: 'CryptoTrader' });
    }
    
    addXP(500);
  }, [profile, saveProfile, addXP]);

  const getCurrentAvatar = useCallback(() => {
    if (!profile) return DEFAULT_AVATARS[0];
    
    if (profile.avatar === 'default' || !profile.avatar) {
      const unlockedAvatar = avatars.find(a => a.unlocked);
      return unlockedAvatar || DEFAULT_AVATARS[0];
    }
    
    const foundAvatar = avatars.find(a => a.id === profile.avatar);
    if (foundAvatar) {
      return foundAvatar;
    }
    
    return DEFAULT_AVATARS[0];
  }, [profile, avatars]);

  const getCurrentFrame = useCallback(() => {
    if (!profile) return DEFAULT_FRAMES[0];
    return frames.find(f => f.id === profile.avatarFrame) || DEFAULT_FRAMES[0];
  }, [profile, frames]);

  const getLevelProgress = useCallback(() => {
    if (!profile) return 0;
    return (profile.xp / profile.xpToNextLevel) * 100;
  }, [profile]);

  const getUsernameChangeCooldown = useCallback(() => {
    if (!profile || profile.canChangeUsername) return 0;
    
    const lastChange = new Date(profile.lastUsernameChange).getTime();
    const now = Date.now();
    const timeSinceLastChange = now - lastChange;
    const timeLeft = USERNAME_CHANGE_COOLDOWN - timeSinceLastChange;
    
    if (timeLeft <= 0) return 0;
    
    const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  }, [profile]);

  const getUsernameChangePercentage = useCallback(() => {
    if (!profile || profile.canChangeUsername) return 100;
    
    const lastChange = new Date(profile.lastUsernameChange).getTime();
    const now = Date.now();
    const timeSinceLastChange = now - lastChange;
    
    const percentage = Math.min(100, (timeSinceLastChange / USERNAME_CHANGE_COOLDOWN) * 100);
    return Math.round(percentage);
  }, [profile]);

  const exportProfileData = useCallback(() => {
    return {
      profile,
      avatars,
      frames,
      unlockedAvatars: avatars.filter(a => a.unlocked).length,
      unlockedFrames: frames.filter(f => f.unlocked).length,
      levelProgress: getLevelProgress(),
      usernameChangeCooldown: getUsernameChangeCooldown(),
      canChangeUsername: profile?.canChangeUsername || false,
    };
  }, [profile, avatars, frames, getLevelProgress, getUsernameChangeCooldown]);

  return {
    profile,
    isFirstLogin,
    isLoading,
    avatars: avatars.filter(a => a.unlocked),
    allAvatars: avatars,
    frames: frames.filter(f => f.unlocked),
    allFrames: frames,
    usernameChangeError,
    updateTrigger: updateTriggerRef.current,
    
    // Actions
    updateUsername,
    updateAvatar,
    updateAvatarFrame,
    updateBio,
    addXP,
    completeOnboarding,
    saveProfile,
    loadProfile,
    
    // Getters
    getCurrentAvatar,
    getCurrentFrame,
    getLevelProgress,
    getUsernameChangeCooldown,
    getUsernameChangePercentage,
    exportProfileData,
  };
}