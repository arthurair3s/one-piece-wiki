"use client";

import React, { useState, useEffect, useRef } from "react";
import { BaseModal } from "./base-modal";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { EditIcon } from "../ui/icons";
import { apiClient } from "@/services/api";
import type { User } from "@/types/api";

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  { name: "Luffy", path: "/characters/luffy-v1.jpg" },
  { name: "Zoro", path: "/characters/zoro-v1.webp" },
  { name: "Nami", path: "/characters/nami-v1.webp" },
  { name: "Buggy", path: "/characters/buggy-v1.webp" },
  { name: "Coby", path: "/characters/Kobe-v1.jpg" },
  { name: "Alvida", path: "/characters/alvida-v1.webp" },
];

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Toggle edit modes
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Avatar states
  const [selectedAvatar, setSelectedAvatar] = useState("/characters/luffy-v1.jpg");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const nickInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user details on mount/open
  useEffect(() => {
    if (!isOpen) return;

    // Reset messages and states
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditingNick(false);
    setIsEditingPassword(false);
    setPassword("");
    setShowAvatarPicker(false);

    // Retrieve saved avatar path from localStorage
    const savedAvatar = localStorage.getItem("user_avatar");
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar);
    } else {
      setSelectedAvatar("/characters/luffy-v1.jpg");
    }

    async function loadUserData() {
      setLoading(true);
      try {
        const data = await apiClient<User>("/users/me");
        setUser(data);
        setUsername(data.username);
      } catch (err: any) {
        console.error("Erro ao carregar dados do usuário:", err);
        setErrorMsg(err.message || "Não foi possível carregar as informações do perfil.");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [isOpen]);

  // Focus nick input when edit mode is toggled to true
  useEffect(() => {
    if (isEditingNick && nickInputRef.current) {
      nickInputRef.current.focus();
    }
  }, [isEditingNick]);

  // Focus password input when edit mode is toggled to true
  useEffect(() => {
    if (isEditingPassword && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [isEditingPassword]);

  const selectAvatar = (avatarPath: string) => {
    setSelectedAvatar(avatarPath);
    localStorage.setItem("user_avatar", avatarPath);
    setShowAvatarPicker(false);
    setSuccessMsg("Avatar atualizado localmente com sucesso!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!username.trim()) {
      setErrorMsg("O Nick não pode ser vazio.");
      return;
    }

    if (isEditingPassword && password.length > 0 && password.length < 8) {
      setErrorMsg("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = { username };
      if (isEditingPassword && password.length >= 8) {
        payload.password = password;
      }

      await apiClient<User>("/users/me", {
        method: "PATCH",
        body: payload,
      });

      setSuccessMsg("Perfil atualizado com sucesso!");
      setIsEditingNick(false);
      setIsEditingPassword(false);
      setPassword("");

      // Atualiza o estado do usuário logado
      if (user) {
        setUser({ ...user, username });
      }

      setTimeout(() => {
        setSuccessMsg("");
      }, 4000);
    } catch (err: any) {
      console.error("Erro ao salvar perfil:", err);
      setErrorMsg(err.message || "Erro ao salvar as alterações do perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showBackButton={true}
      onBack={onClose}
    >
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6 py-4 relative select-none">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground animate-pulse font-medium">
              Obtendo dados do perfil...
            </p>
          </div>
        ) : (
          <>
            {/* Status alerts */}
            {errorMsg && (
              <div className="w-full text-xs text-red-500 font-medium bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 text-center animate-in fade-in zoom-in-95 duration-200">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="w-full text-xs text-emerald-500 font-medium bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-center animate-in fade-in zoom-in-95 duration-200">
                {successMsg}
              </div>
            )}

            {/* Avatar Section */}
            <div className="relative group/avatar">
              <div className="relative w-32 h-32 rounded-full border-4 border-primary/20 bg-muted overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedAvatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/characters/luffy-v1.jpg";
                  }}
                />
              </div>
              
              {/* Pencil icon overlay */}
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center border-2 border-background shadow-md transition-all active:scale-95 cursor-pointer z-10"
                title="Editar avatar"
              >
                <EditIcon className="w-4 h-4" />
              </button>

              {/* Avatar Selector Panel */}
              {showAvatarPicker && (
                <div className="absolute top-36 left-1/2 -translate-x-1/2 w-64 bg-background/95 border border-border/60 rounded-xl shadow-2xl p-3 z-30 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                    Escolha seu Avatar
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => selectAvatar(opt.path)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                          selectedAvatar === opt.path ? "border-primary scale-102" : "border-border/30 hover:border-muted-foreground/60"
                        }`}
                        title={opt.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={opt.path}
                          alt={opt.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile fields */}
            <div className="w-full flex flex-col gap-5 mt-2">
              
              {/* Email (Read-only, watermarked) */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-email" className="text-xs font-semibold text-muted-foreground tracking-wide">
                  Email
                </Label>
                <div className="relative">
                  {/* Watermark look: subtle text overlay, lock icon, and dashed border */}
                  <Input
                    id="profile-email"
                    type="email"
                    value={user?.email || "email.email@gmail.com"}
                    disabled
                    className="bg-muted/10 border-border/30 text-muted-foreground/60 select-none cursor-not-allowed pr-16 font-medium dark:bg-muted/5 dark:text-muted-foreground/40"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-muted-foreground/45 bg-muted/40 px-1.5 py-0.5 rounded border border-border/20 select-none pointer-events-none uppercase tracking-widest">
                    🔒 FIXO
                  </span>
                </div>
              </div>

              {/* Nick (Editable username) */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-nick" className="text-xs font-semibold text-muted-foreground tracking-wide">
                  Nick
                </Label>
                <div className="relative flex items-center">
                  <Input
                    ref={nickInputRef}
                    id="profile-nick"
                    type="text"
                    value={username}
                    disabled={!isEditingNick}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`pr-10 h-9 font-medium transition-all ${
                      isEditingNick
                        ? "bg-background border-primary ring-1 ring-primary focus-visible:border-primary focus-visible:ring-primary"
                        : "bg-muted/10 border-border/40 hover:border-border/60 cursor-pointer"
                    }`}
                    onClick={() => setIsEditingNick(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingNick(!isEditingNick)}
                    className="absolute right-2 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={isEditingNick ? "Desabilitar edição" : "Editar campo"}
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Senha (Editable password) */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-password" className="text-xs font-semibold text-muted-foreground tracking-wide">
                  Senha
                </Label>
                <div className="relative flex items-center">
                  <Input
                    ref={passwordInputRef}
                    id="profile-password"
                    type="password"
                    value={password}
                    placeholder={isEditingPassword ? "Nova senha" : "••••••••••••••••"}
                    disabled={!isEditingPassword}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pr-10 h-9 font-medium transition-all ${
                      isEditingPassword
                        ? "bg-background border-primary ring-1 ring-primary focus-visible:border-primary focus-visible:ring-primary"
                        : "bg-muted/10 border-border/40 hover:border-border/60 cursor-pointer"
                    }`}
                    onClick={() => setIsEditingPassword(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingPassword(!isEditingPassword)}
                    className="absolute right-2 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={isEditingPassword ? "Desabilitar edição" : "Editar campo"}
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="w-full flex justify-end mt-4">
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || (!isEditingNick && (!isEditingPassword || !password))}
                className="px-6 py-2 transition-all duration-300 hover:opacity-90 active:scale-[0.98] cursor-pointer text-xs font-bold gap-1"
              >
                {saving ? "Salvando..." : "Salvar >"}
              </Button>
            </div>
          </>
        )}

      </div>
    </BaseModal>
  );
}
