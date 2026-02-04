// components/UserProfile.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy, Shield } from "lucide-react";
import { useProfile } from "../hooks/useProfile";

interface UserProfileProps {
  googleUser: any;
  onEditClick: () => void;
}

export function UserProfile({ googleUser, onEditClick }: UserProfileProps) {
  const {
    profile,
    getCurrentAvatar,
    getCurrentFrame,
    isLoading: profileLoading,
    _debug,
  } = useProfile();
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const [userStats] = useState({
      level: 1,
      alphaPoints: 1250,
      nftCount: 3,
      boxesOpened: 42,
      referralCode: "ALPHA123",
      joinedDate: "2024-01-15",
    });

      const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Примусово залежимо від profile.avatar та avatars
  const currentAvatar = useMemo(() => {
    const avatar = getCurrentAvatar();
    
    return avatar;
  }, [profile?.avatar, getCurrentAvatar]); // ← ключова залежність

  const currentFrame = useMemo(
    () => getCurrentFrame(),
    [profile?.avatar_frame, getCurrentFrame],
  );

  const fallbackImage = "https://via.placeholder.com/96?text=Avatar";

  // Логування при кожній зміні аватара
  React.useEffect(() => {
   
  }, [
    profile?.avatar,
    currentAvatar?.avatar_id,
    currentFrame?.frame_id,
    _debug.assetsLoading,
    profileLoading,
  ]);

  if (_debug.authLoading || _debug.assetsLoading || profileLoading) {
    return <LoadingSkeleton />;
  }

  if (!profile || !googleUser) {
    return (
      <div className="p-4 rounded-xl ui-inner mb-4">
        <p className="text-sm text-[#a0a0a0] text-center">Loading profile...</p>
      </div>
    );
  }

  const displayName =
    profile.username || googleUser.name || googleUser.email.split("@")[0];
  

  return (
    // Key на всьому блоці — змушує React перестворювати DOM при зміні аватара
    <div className="grid grid-cols-2 gap-2"
      key={`user-profile-avatar-${profile.avatar || "default"}-${profile.last_updated || ""}`}
    >
      <div className="flex items-start gap-4 p-4 rounded-xl ui-inner mb-4">
        <div className="relative">
          <div className="relative w-12 h-12">
            {/* Аватарка */}
            <img
              src={currentAvatar?.imageUrl || fallbackImage}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover border-2 border-[#1f1f1f]"
            />

            {/* Фрейм поверх аватарки */}
            {profile.avatar_frame !== "none" && currentFrame?.image_url && (
              <img
                src={currentFrame.image_url}
                alt="Frame"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ zIndex: 1 }} // фрейм поверх аватарки
              />
            )}

            {/* Кнопка Edit */}
            <button
              onClick={onEditClick}
              className="absolute top-14 left-0 rounded-xl text-[10px] px-3 py-1 bg-[#1f1f1f] hover:bg-[#2a2a2a]  rounded transition-colors z-10"
              title="Edit Profile"
            >
              Edit
            </button>

            {/* Shield */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#3b82f6] rounded-full flex items-center justify-center z-10">
              <Shield className="w-3 h-3 text-white" />
            </div>

            {/* <div className="w-full h-full rounded-full overflow-hidden bg-[#1f1f1f] relative">
              <img 
                key={`img-${profile.avatar}-${Date.now()}`} // подвійний захист
                src={currentAvatar?.imageUrl || fallbackImage}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = fallbackImage; }}
              />
              
              <button
                onClick={onEditClick}
                className="absolute bottom-1 right-1 text-[10px] px-2 py-0.5 bg-[#1f1f1f]/90 hover:bg-[#2a2a2a] rounded transition-colors z-10"
                title="Edit Profile"
              >
                Edit
              </button>
            </div> */}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#3b82f6] rounded-full flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#e0e0e0] text-sm">
                {displayName} 
              </h3>
              <div className="inline-flex items-center gap-1">
  {/* <span className="w-1 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" /> */}
  <span className="text-[10px] text-[#a0a0a0] font-mono">
    {profile.id.slice(0, 4)}...{profile.id.slice(-4)}
  </span>
  {/* <div className="w-px h-3 bg-[#374151]" /> */}
  <button 
    onClick={() => navigator.clipboard.writeText(profile.id)}
    className="text-[#6b7280] hover:text-cyan-400 transition-colors"
  >
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  </button>
</div>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-[#707070]">Lv.</span>
              <span className="font-bold text-white">{profile.level}</span>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-[#707070] mb-1">
              <span>Level Progress</span>
              <span>
                {profile.xp}/{profile.xp_to_next_level} XP
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22c1c3] to-[#3b82f6] transition-all duration-500"
                style={{
                  width: `${(profile.xp / profile.xp_to_next_level) * 100}%`,
                }}
              />
            </div>
          </div>
         
        </div>
      </div>
       <div className="mb-4">
              <div className="p-3 rounded-xl ui-inner">
                <div className="text-xs text-[#707070]">Boxes Opened</div>
                <div className="text-sm font-semibold text-[#e0e0e0]">
                  {userStats.boxesOpened}
                </div>
                <div className="text-xs text-[#707070] mt-1">Referral Code</div>
                <div className="text-sm font-semibold text-[#3b82f6] flex items-center justify-between">
                  {userStats.referralCode}
                  <button
                    onClick={() =>
                      copyToClipboard(userStats.referralCode, "referral")
                    }
                    className="text-xs px-2 py-1 bg-[#1f1f1f] rounded hover:bg-[#2a2a2a]"
                  >
                    {copiedAddress === "referral" ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl ui-inner mb-4">
      <div className="animate-pulse">
        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        <div className="h-2 bg-gray-700 rounded w-full"></div>
      </div>
    </div>
  );
}
