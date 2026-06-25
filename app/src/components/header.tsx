"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Saga, Arc, Island } from "@/types/api";
import { SearchIcon, SettingsIcon } from "@/components/icons";
import { SearchSuggestions } from "./header/search-suggestions";

export interface HeaderProps {
  isAdmin?: boolean;
  sagas: Saga[];
  arcs: Arc[];
  islands: Island[];
  searchQuery?: string;
  activeSagaId?: number | null;
  activeArcId?: number | null;
  activeIslandId?: number | null;
  onSearchChange?: (val: string) => void;
  onSagaSelect?: (id: string | null) => void;
  onArcSelect?: (id: string | null) => void;
  onIslandSelect?: (id: string | null) => void;
  onLogout?: () => void;
}

export function Header({
  isAdmin = false,
  sagas = [],
  arcs = [],
  islands = [],
  searchQuery = "",
  activeSagaId = null,
  activeArcId = null,
  activeIslandId = null,
  onSearchChange,
  onSagaSelect,
  onArcSelect,
  onIslandSelect,
  onLogout,
}: HeaderProps) {
  const router = useRouter();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelectChange = (val: string | null, callback?: (id: string | null) => void) => {
    if (callback) {
      callback(val === "null" || val === null ? null : val);
    }
  };

  const sagaLabel = useMemo(() => {
    if (activeSagaId === null) return "Sagas";
    const found = sagas.find((s) => s.id === activeSagaId);
    return found ? found.name : "Sagas";
  }, [activeSagaId, sagas]);

  const arcLabel = useMemo(() => {
    if (activeArcId === null) return "Arcos";
    const found = arcs.find((a) => a.id === activeArcId);
    return found ? found.name : "Arcos";
  }, [activeArcId, arcs]);

  const islandLabel = useMemo(() => {
    if (activeIslandId === null) return "Ilhas";
    const found = islands.find((i) => i.id === activeIslandId);
    return found ? found.name : "Ilhas";
  }, [activeIslandId, islands]);

  const islandSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return islands.filter((island) => island.name.toLowerCase().includes(query));
  }, [searchQuery, islands]);

  return (
    <header className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 max-w-5xl mx-auto w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] rounded-xl border border-border/40 shadow-lg bg-background/80 backdrop-blur-md z-30 transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center gap-3 px-3.5 py-3 md:px-4 md:py-3 w-full">
        
        <div className="flex items-center gap-2 w-full md:flex-1 relative">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Pesquisar ilha..."
              value={searchQuery}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 h-9 rounded-lg border-border/50 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary"
            />

            <SearchSuggestions
              showSuggestions={showSuggestions}
              islandSuggestions={islandSuggestions}
              onIslandSelect={onIslandSelect}
              onSearchChange={onSearchChange}
              setShowSuggestions={setShowSuggestions}
            />
          </div>
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger
                id="settings-btn-mobile"
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-foreground size-9 transition-all outline-none select-none cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl mt-1 shadow-xl border border-border bg-background/95 backdrop-blur-md p-1">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs px-2.5 py-1.5 text-muted-foreground">Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem id="menu-manage-content-mobile" className="rounded-lg px-2.5 py-1.5 cursor-pointer" render={<Link href="/admin/content" />}>
                        Gerenciar Conteúdos
                      </DropdownMenuItem>
                      <DropdownMenuItem id="menu-manage-users-mobile" className="rounded-lg px-2.5 py-1.5 cursor-pointer" render={<Link href="/admin/users" />}>
                        Gerenciar Usuários
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem id="menu-edit-profile-mobile" className="rounded-lg px-2.5 py-1.5 cursor-pointer">
                    Editar Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem id="menu-toggle-theme-mobile" className="rounded-lg px-2.5 py-1.5 cursor-pointer">
                    Alternar Tema
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    id="menu-logout-mobile"
                    className="text-destructive focus:text-destructive rounded-lg px-2.5 py-1.5 cursor-pointer"
                    onClick={onLogout}
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full md:flex md:w-auto md:gap-2">
          <Select
            value={activeSagaId !== null ? String(activeSagaId) : "null"}
            onValueChange={(val: any) => handleSelectChange(val, onSagaSelect)}
          >
            <SelectTrigger id="filter-sagas" className="w-full md:w-[120px] h-9 text-xs">
              <SelectValue placeholder="Sagas">
                {sagaLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl" alignItemWithTrigger={false}>
              <SelectItem value="null">Nenhuma</SelectItem>
              {sagas.map((saga) => (
                <SelectItem key={saga.id} value={String(saga.id)}>
                  {saga.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={activeArcId !== null ? String(activeArcId) : "null"}
            onValueChange={(val: any) => handleSelectChange(val, onArcSelect)}
          >
            <SelectTrigger id="filter-arcos" className="w-full md:w-[120px] h-9 text-xs">
              <SelectValue placeholder="Arcos">
                {arcLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl" alignItemWithTrigger={false}>
              <SelectItem value="null">Nenhum</SelectItem>
              {arcs.map((arc) => (
                <SelectItem key={arc.id} value={String(arc.id)}>
                  {arc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={activeIslandId !== null ? String(activeIslandId) : "null"}
            onValueChange={(val: any) => handleSelectChange(val, onIslandSelect)}
          >
            <SelectTrigger id="filter-ilhas" className="w-full md:w-[120px] h-9 text-xs">
              <SelectValue placeholder="Ilhas">
                {islandLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl" alignItemWithTrigger={false}>
              <SelectItem value="null">Nenhuma</SelectItem>
              {islands.map((island) => (
                <SelectItem key={island.id} value={String(island.id)}>
                  {island.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger
              id="settings-btn"
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-foreground size-9 transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer"
            >
              <SettingsIcon className="w-4.5 h-4.5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 rounded-2xl mt-2 shadow-2xl border border-border/40 bg-background/95 backdrop-blur-md p-1.5">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-3 py-2 text-xs text-muted-foreground">Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem id="menu-manage-content" className="rounded-xl px-3 py-2 cursor-pointer" render={<Link href="/admin/content" />}>
                      Gerenciar Conteúdos
                    </DropdownMenuItem>
                    <DropdownMenuItem id="menu-manage-users" className="rounded-xl px-3 py-2 cursor-pointer" render={<Link href="/admin/users" />}>
                      Gerenciar Usuários
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem id="menu-edit-profile" className="rounded-xl px-3 py-2 cursor-pointer">
                  Editar Perfil
                </DropdownMenuItem>
                <DropdownMenuItem id="menu-toggle-theme" className="rounded-xl px-3 py-2 cursor-pointer">
                  Alternar Tema
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  id="menu-logout"
                  className="text-destructive focus:text-destructive rounded-xl px-3 py-2 cursor-pointer"
                  onClick={onLogout}
                >
                  Sair
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  );
}
