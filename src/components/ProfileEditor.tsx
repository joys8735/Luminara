// components/ProfileEditor.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  X,
  Save,
  Palette,
  Edit3,
  Sparkles,
  AlertCircle,
  Calendar,
  Lock,
  Check,
  RefreshCw,
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { toast } from "sonner";

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditor({ isOpen, onClose }: ProfileEditorProps) {
  const {
    profile,
    allAvatars: avatars,
    allFrames: frames,
    updateUsername,
    updateAvatar,
    updateAvatarFrame,
    updateBio,
    getUsernameChangeCooldown,
    getUsernameChangePercentage,
    loadProfile,
    refreshProfile,
  } = useProfile();

  const [editingName, setEditingName] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [tempBio, setTempBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedFrame, setSelectedFrame] = useState<string>("none");
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  const bioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ініціалізація та синхронізація станів при відкритті/закритті
  useEffect(() => {
    if (!isOpen || !profile) {
      // Скидаємо стани при закритті
      if (!isOpen) {
        setSelectedFrame("none");
      }
      return;
    }

    // Синхронізуємо локальні стани з профілем
    setSelectedAvatar(profile.avatar || "avatar1");
    setSelectedFrame(profile.avatar_frame || "none");
    setTempUsername(profile.username || "");
    setTempBio(profile.bio || "");

    // Скидаємо повідомлення
    setUsernameError(null);
    setUsernameSuccess(null);
    setEditingName(false);

    // Форс-оновити для коректного рендерингу
    setForceUpdate((prev) => prev + 1);
  }, [isOpen, profile]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setUsernameError(null);

    try {
      const updates: Promise<any>[] = [];

      // Оновлення аватара
      if (selectedAvatar !== profile.avatar) {
        updates.push(updateAvatar(selectedAvatar));
      }

      // Оновлення фрейма
      const currentFrame = profile.avatar_frame || "none";
      if (selectedFrame !== currentFrame) {
        updates.push(updateAvatarFrame(selectedFrame));
      }

      // Оновлення біо
      if (tempBio !== profile.bio && tempBio.length <= 120) {
        updates.push(updateBio(tempBio));
      }

      // Виконуємо всі оновлення паралельно
      if (updates.length > 0) {
        await Promise.all(updates);
      }

      // Оновлюємо профіль
      await refreshProfile();

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Помилка збереження:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleUsernameChange = useCallback(() => {
    if (!profile) return;

    if (
      editingName &&
      tempUsername.trim() &&
      tempUsername !== profile.username
    ) {
      const trimmedUsername = tempUsername.trim();
      const result = updateUsername(trimmedUsername);

      if (result.success) {
        setUsernameSuccess(result.message);
        setUsernameError(null);
        setEditingName(false);
        setTempUsername(trimmedUsername);
        setTimeout(() => setUsernameSuccess(null), 3000);
      } else {
        setUsernameError(result.message);
        setUsernameSuccess(null);
      }
    } else {
      setEditingName(!editingName);
      setUsernameError(null);
      setUsernameSuccess(null);
    }
  }, [editingName, tempUsername, profile, updateUsername]);

  const handleAvatarChange = useCallback(
    (avatarId: string) => {
      const avatar = avatars.find((a) => a.avatar_id === avatarId);
      if (avatar && avatar.unlocked) {
        setSelectedAvatar(avatarId);
      }
    },
    [avatars],
  );

  const handleFrameChange = useCallback(
    (frameId: string) => {
      const frame = frames.find((f) => f.frame_id === frameId);
      if (frame && frame.unlocked) {
        setSelectedFrame(frameId);
      }
    },
    [frames],
  );

  const handleBioChange = useCallback(
    (value: string) => {
      // Обмежуємо довжину
      if (value.length <= 120) {
        setTempBio(value);

        // Авто-збереження з debounce
        if (bioTimeoutRef.current) {
          clearTimeout(bioTimeoutRef.current);
        }

        bioTimeoutRef.current = setTimeout(() => {
          if (value !== profile?.bio) {
            updateBio(value);
          }
        }, 800);
      }
    },
    [profile, updateBio],
  );

  const handleRefresh = useCallback(() => {
    const googleUser = localStorage.getItem("google_user");
    if (googleUser) {
      try {
        const parsedUser = JSON.parse(googleUser);
        loadProfile(parsedUser);
        toast.info("Profile refreshed");
      } catch (error) {
        console.error("Error refreshing profile:", error);
      }
    }
  }, [loadProfile]);

  // Cleanup на unmount
  useEffect(() => {
    return () => {
      if (bioTimeoutRef.current) {
        clearTimeout(bioTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen || !profile) return null;

  const cooldownDays = getUsernameChangeCooldown();
  const canChangeUsername = profile.canChangeUsername || cooldownDays === 0;
  const currentFrame = frames.find((f) => f.frame_id === selectedFrame);

  // Розрахунок статистики
  const unlockedAvatarsCount = avatars.filter((a) => a.unlocked).length;
  const unlockedFramesCount = frames.filter((f) => f.unlocked).length;
  const avatarProgress = (unlockedAvatarsCount / avatars.length) * 100;
  const frameProgress = (unlockedFramesCount / frames.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="ui-card rounded-2xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Хедер з кнопкою оновлення */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Edit Profile</h2>
              <p className="text-xs text-[#707070]">
                Changes save automatically
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 hover:ui-inner rounded-lg transition-colors"
              title="Refresh profile"
              disabled={saving}
            >
              <RefreshCw className="w-4 h-4 text-[#707070]" />
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:ui-inner rounded-lg transition-colors"
              disabled={saving}
            >
              <X className="w-5 h-5 text-[#707070]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Ліва колонка: Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-1 space-y-4">
              {/* Live Preview Card */}
              <div className="p-3 rounded-xl ui-card">
                {/* Заголовок і рівень */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <h3 className="text-xs font-semibold text-white">
                      Live Preview
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-[#707070]">Lv.</span>
                    <span className="font-bold text-white">
                      {profile.level}
                    </span>
                  </div>
                </div>

                {/* Аватар з фреймом */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-20 h-20">
                    {/* Аватарка */}
                    <img
                      src={
                        avatars.find((a) => a.avatar_id === selectedAvatar)
                          ?.image_url ||
                        "https://via.placeholder.com/80?text=Avatar"
                      }
                      alt="Avatar preview"
                      className="w-full h-full rounded-full object-cover border-2 border-[#1f1f1f]"
                    />

                    {/* Фрейм */}
                    {selectedFrame !== "none" && currentFrame?.image_url && (
                      <img
                        src={currentFrame.image_url}
                        alt="Frame preview"
                        className="absolute inset-0  -top-12 w-full h-full object-contain pointer-events-none z-10"
                      />
                    )}

                    {/* Замок, якщо locked */}
                    {currentFrame && !currentFrame.unlocked && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-20">
                        <Lock className="w-6 h-6 text-white opacity-80" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Ім'я користувача */}
                <div className="mb-3">
                  <div className="flex items-center justify-center gap-2">
                    {editingName ? (
                      <div className="flex-1 flex items-center gap-1">
                        <input
                          type="text"
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-[#111827] border border-[#1f1f1f] rounded text-white text-xs text-center"
                          maxLength={20}
                          autoFocus
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleUsernameChange()
                          }
                          placeholder="Enter username"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={handleUsernameChange}
                            disabled={!canChangeUsername}
                            className={`p-1.5 rounded ${
                              canChangeUsername
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-500 cursor-not-allowed"
                            }`}
                            title={
                              !canChangeUsername
                                ? `Wait ${cooldownDays} days`
                                : "Save"
                            }
                          >
                            <Check className="w-3 h-3 text-white" />
                          </button>
                          <button
                            onClick={() => setEditingName(false)}
                            className="p-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded"
                          >
                            <X className="w-3 h-3 text-[#707070]" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-bold text-white truncate max-w-[140px]">
                          {profile.username || "Anonymous"}
                        </h4>
                        <button
                          onClick={() => setEditingName(true)}
                          disabled={
                            !canChangeUsername &&
                            profile.usernameChangesCount > 0
                          }
                          className="p-1.5 hover:bg-[#1f1f1f] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            !canChangeUsername &&
                            profile.usernameChangesCount > 0
                              ? `Can change in ${cooldownDays} days`
                              : "Edit name"
                          }
                        >
                          <Edit3 className="w-3 h-3 text-[#707070]" />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-[#707070] text-center mt-1">
                    ID: {profile.id.substring(0, 6)}...
                  </p>
                </div>

                {/* Прогресбар зміни імені */}
                {profile.usernameChangesCount > 0 &&
                  !profile.canChangeUsername && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[9px] text-[#707070] mb-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>Unlock in {cooldownDays}d</span>
                        </div>
                        <span>
                          {Math.round(getUsernameChangePercentage())}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-[#111827] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#3b82f6] to-[#a855f7] transition-all duration-300"
                          style={{ width: `${getUsernameChangePercentage()}%` }}
                        />
                      </div>
                    </div>
                  )}

                {/* Повідомлення про помилку/успіх */}
                <div className="mb-3 space-y-1">
                  {usernameError && (
                    <div className="p-1.5 bg-red-500/10 border border-red-500/20 rounded">
                      <p className="text-[10px] text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{usernameError}</span>
                      </p>
                    </div>
                  )}

                  {usernameSuccess && (
                    <div className="p-1.5 bg-green-500/10 border border-green-500/20 rounded">
                      <p className="text-[10px] text-green-400 flex items-center gap-1.5">
                        <Check className="w-3 h-3 flex-shrink-0" />
                        <span>{usernameSuccess}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Біо */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-[#707070]">Bio</label>
                    <span
                      className={`text-[9px] ${tempBio.length >= 120 ? "text-red-400" : "text-[#707070]"}`}
                    >
                      {tempBio.length}/120
                    </span>
                  </div>
                  <textarea
                    value={tempBio}
                    onChange={(e) => handleBioChange(e.target.value)}
                    placeholder="Describe yourself..."
                    className="w-full px-3 py-2 bg-[#111827] border border-[#1f1f1f] rounded-lg text-white text-xs h-16 resize-none focus:border-[#3b82f6]/50 focus:outline-none transition-colors"
                    maxLength={120}
                  />
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg ui-inner">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="text-[9px] text-[#707070]">Avatars</div>
                      <div className="text-[9px] text-[#3b82f6] font-bold">
                        {unlockedAvatarsCount}
                      </div>
                    </div>
                    <div className="h-1 bg-[#111827] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3b82f6] transition-all duration-300"
                        style={{ width: `${avatarProgress}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-[#707070] text-right mt-0.5">
                      /{avatars.length}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg ui-inner">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="text-[9px] text-[#707070]">Frames</div>
                      <div className="text-[9px] text-[#a855f7] font-bold">
                        {unlockedFramesCount}
                      </div>
                    </div>
                    <div className="h-1 bg-[#111827] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#a855f7] transition-all duration-300"
                        style={{ width: `${frameProgress}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-[#707070] text-right mt-0.5">
                      /{frames.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-[#707070]">
                Changes save automatically • Last updated:{" "}
                {new Date(profile.lastUpdated).toLocaleTimeString()}
              </div>

              {/* Кнопки дій */}
              <div className="flex justify-start items-center">
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs ui-inner rounded-lg text-[#a0a0a0] hover:text-white transition-colors disabled:opacity-50"
                    disabled={saving}
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 ui-card text-[#3b82f6] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 text-sm border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3" />
                        <span className="text-xs">Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Права колонка: Контент */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Аватари */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-white">Avatars</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#707070]">
                      <span className="text-[#3b82f6]">
                        {unlockedAvatarsCount}
                      </span>
                      <span className="text-[#707070]">/{avatars.length}</span>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.avatar_id}
                      onClick={() => handleAvatarChange(avatar.avatar_id)}
                      className={`aspect-square p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                        selectedAvatar === avatar.avatar_id
                          ? "ui-inner scale-105 ring-1 ring-white/30"
                          : "ui-card hover:scale-102 hover:border-[#1f1f1f]"
                      } ${!avatar.unlocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      disabled={!avatar.unlocked}
                      title={avatar.unlocked ? avatar.name : "Locked"}
                    >
                      <div className="relative mb-1.5">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-[#1f1f1f]">
                          <img
                            src={avatar.image_url}
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/48?text=?";
                            }}
                          />
                        </div>
                        {!avatar.unlocked && (
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-white font-medium truncate w-full text-center mb-1">
                        {avatar.name}
                      </span>
                      <div
                        className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                          avatar.rarity === "common"
                            ? "bg-gray-500/20 text-gray-400"
                            : avatar.rarity === "rare"
                              ? "bg-blue-500/20 text-blue-400"
                              : avatar.rarity === "epic"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {avatar.rarity}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Фрейми */}
              <div key={forceUpdate}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-white">Frames</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#707070]">
                      <span className="text-[#a855f7]">
                        {unlockedFramesCount}
                      </span>
                      <span className="text-[#707070]">/{frames.length}</span>
                    </span>
                    <div className="w-1 h-1 rounded-full bg-[#707070]"></div>
                    <select className="text-[10px] bg-[#111827] border border-[#1f1f1f] text-[#a0a0a0] rounded px-2 py-1">
                      <option>All</option>
                      <option>Unlocked</option>
                      <option>By Rarity</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {frames.map((frame) => {
                    const isActive = selectedFrame === frame.frame_id;
                    const isUnlocked = frame.unlocked;

                    return (
                      <button
                        key={frame.frame_id}
                        onClick={() => handleFrameChange(frame.frame_id)}
                        className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                          isActive
                            ? "bg-gradient-to-br from-[#111827] to-[#1e293b] ring-2 ring-[#3b82f6] scale-105 shadow-lg"
                            : "ui-card hover:bg-[#1a1a1a] hover:scale-102"
                        } ${!isUnlocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        disabled={!isUnlocked}
                        title={isUnlocked ? frame.name : "Locked"}
                      >
                        <div className="relative mb-2 w-14 h-14">
                          {/* Аватарка для прев'ю */}
                          <div className="w-full h-full rounded-full overflow-hidden border border-[#1f1f1f]">
                            <img
                              src={
                                avatars.find(
                                  (a) => a.avatar_id === selectedAvatar,
                                )?.image_url ||
                                "https://via.placeholder.com/56?text=?"
                              }
                              alt="Avatar preview"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Фрейм поверх */}
                          {isActive && frame.image_url && (
                            <img
                              src={frame.image_url}
                              alt={`${frame.name} frame`}
                              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                            />
                          )}

                          {/* Замок, якщо locked */}
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-20">
                              <Lock className="w-6 h-6 text-white opacity-90" />
                            </div>
                          )}
                        </div>

                        {/* Назва + rarity */}
                        <span className="text-[9px] text-white font-medium text-center truncate w-full mb-1">
                          {frame.name}
                        </span>
                        <div
                          className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                            frame.rarity === "common"
                              ? "bg-gray-500/20 text-gray-400"
                              : frame.rarity === "rare"
                                ? "bg-blue-500/20 text-blue-400"
                                : frame.rarity === "epic"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {frame.rarity}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Примітка про зміну імені */}
        <div className="mt-4 text-[10px] p-3 rounded-lg bg-gradient-to-r from-[#3b82f6]/10 to-transparent border border-[#3b82f6]/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#3b82f6] mt-0.5 flex-shrink-0" />
            <div className="text-[#a0a0a0]">
              <p className="font-medium text-white mb-1 text-[11px]">
                Username Change Policy
              </p>
              <p className="text-[11px]">• First username change is free</p>
              <p className="text-[11px]">• After that: once every 30 days</p>
              <p className="text-[11px]">
                • Current changes: {profile.usernameChangesCount}/∞
              </p>
              <p className="text-[11px]">
                • Next available change:{" "}
                {canChangeUsername ? "Now" : `in ${cooldownDays} days`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
