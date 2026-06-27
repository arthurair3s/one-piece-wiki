"use client";

import React, { useState, useEffect } from "react";
import { fetchIslandDetails, fetchIslandArcs, fetchCharacterVersions } from "@/app/_service";
import { BaseModal } from "@/components/modals/base-modal";
import { CharactersTab } from "@/components/character-carousel/characters-tab";
import { VersionsTab } from "@/components/character-carousel/versions-tab";

export interface CharacterCarouselModalProps {
  isOpen: boolean;
  islandId: number | null;
  arcId: number;
  onClose: () => void;
  onBackToIsland: () => void;
}

export function CharacterCarouselModal({
  isOpen,
  islandId,
  arcId,
  onClose,
  onBackToIsland,
}: CharacterCarouselModalProps) {
  const [activeTab, setActiveTab] = useState<"characters" | "versions">("characters");

  const [islandData, setIslandData] = useState<any>(null);
  const [loadingIsland, setLoadingIsland] = useState(false);
  const [islandError, setIslandError] = useState<string | null>(null);

  const [characterSearch, setCharacterSearch] = useState("");
  const [charCarouselIndex, setCharCarouselIndex] = useState(0);

  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [versionSearch, setVersionSearch] = useState("");
  const [versionCarouselIndex, setVersionCarouselIndex] = useState(0);

  const loadIslandData = React.useCallback(async () => {
    if (!islandId) return;
    setLoadingIsland(true);
    setIslandError(null);
    try {
      const arcsResponse = await fetchIslandArcs(islandId);
      const islandArcs = arcsResponse.arcs || [];
      const hasActiveArc = islandArcs.some((a: any) => a.id === arcId);

      let queryArcId = arcId;
      if (!hasActiveArc && islandArcs.length > 0) {
        queryArcId = islandArcs[islandArcs.length - 1].id;
      }

      const data = await fetchIslandDetails(islandId, queryArcId);
      setIslandData(data);
    } catch (err: any) {
      console.error("Erro ao carregar personagens da ilha:", err);
      setIslandError(err.message || "Erro de conexão ao carregar personagens.");
    } finally {
      setLoadingIsland(false);
    }
  }, [islandId, arcId]);

  useEffect(() => {
    if (isOpen && islandId) {
      loadIslandData();
      setActiveTab("characters");
      setCharCarouselIndex(0);
      setSelectedCharacter(null);
    }
  }, [isOpen, islandId, loadIslandData]);

  useEffect(() => {
    if (activeTab !== "versions" || !selectedCharacter?.characterId) return;

    async function loadVersions() {
      setLoadingVersions(true);
      setVersionsError(null);
      try {
        const res = await fetchCharacterVersions(selectedCharacter.characterId);
        const rows = res.rows || [];
        setVersions(rows);

        const matchingIdx = rows.findIndex((v: any) => v.id === selectedCharacter.id);
        if (matchingIdx !== -1) {
          setVersionCarouselIndex(matchingIdx);
        } else {
          setVersionCarouselIndex(0);
        }
      } catch (err: any) {
        console.error("Erro ao buscar versões do personagem:", err);
        setVersionsError(err.message || "Erro ao carregar versões do personagem.");
      } finally {
        setLoadingVersions(false);
      }
    }

    loadVersions();
  }, [activeTab, selectedCharacter]);

  if (!isOpen || !islandId) return null;

  const filteredCharacters = (islandData?.characters || []).filter((char: any) => {
    const term = characterSearch.toLowerCase();
    return (
      char.name.toLowerCase().includes(term) ||
      (char.epithet && char.epithet.toLowerCase().includes(term))
    );
  });

  const filteredVersions = versions.filter((v: any) => {
    const term = versionSearch.toLowerCase();
    const aliasMatch = v.alias?.toLowerCase().includes(term);
    const charNameMatch = v.character?.name?.toLowerCase().includes(term);
    const epithetMatch = v.epithet?.toLowerCase().includes(term);
    return aliasMatch || charNameMatch || epithetMatch;
  });

  const currentCharIndex = Math.max(0, Math.min(charCarouselIndex, filteredCharacters.length - 1));
  const currentVersionIndex = Math.max(0, Math.min(versionCarouselIndex, filteredVersions.length - 1));

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showBackButton={true}
      onBack={onClose}
      headerCustom={
        activeTab === "characters" ? (
          <input
            type="search"
            placeholder="Pesquisa..."
            value={characterSearch}
            onChange={(e) => {
              setCharacterSearch(e.target.value);
              setCharCarouselIndex(0);
            }}
            className="w-full max-w-[200px] px-3 py-1 border border-border rounded-lg text-xs bg-background focus:outline-none focus:border-primary text-center font-sans"
          />
        ) : (
          <input
            type="search"
            placeholder="Pesquisa..."
            value={versionSearch}
            onChange={(e) => {
              setVersionSearch(e.target.value);
              setVersionCarouselIndex(0);
            }}
            className="w-full max-w-[200px] px-3 py-1 border border-border rounded-lg text-xs bg-background focus:outline-none focus:border-primary text-center font-sans"
          />
        )
      }
      footer={
        <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2 font-sans">
          <button
            onClick={onBackToIsland}
            className="px-4 py-1.5 border border-border hover:border-primary hover:text-primary rounded-lg text-xs md:text-sm font-semibold cursor-pointer transition-colors bg-background hover:bg-muted/10"
          >
            &lt; Ilha
          </button>
          <span className="text-[10px] text-muted-foreground">
            {activeTab === "characters"
              ? `Total: ${filteredCharacters.length} personagens`
              : `Total: ${filteredVersions.length} versões`}
          </span>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col font-sans">
        {loadingIsland ? (
          <div className="w-full h-40 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] text-muted-foreground">Carregando diário de bordo...</p>
          </div>
        ) : islandError ? (
          <div className="w-full h-40 flex flex-col items-center justify-center text-center text-red-500 gap-2">
            <p className="text-xs">{islandError}</p>
          </div>
        ) : (
          <>
            {activeTab === "characters" && (
              <CharactersTab
                islandData={islandData}
                filteredCharacters={filteredCharacters}
                currentCharIndex={currentCharIndex}
                setCharCarouselIndex={setCharCarouselIndex}
                setSelectedCharacter={setSelectedCharacter}
                setActiveTab={setActiveTab}
                setVersionSearch={setVersionSearch}
              />
            )}

            {activeTab === "versions" && (
              <VersionsTab
                selectedCharacter={selectedCharacter}
                loadingVersions={loadingVersions}
                versionsError={versionsError}
                filteredVersions={filteredVersions}
                currentVersionIndex={currentVersionIndex}
                setVersionCarouselIndex={setVersionCarouselIndex}
                setActiveTab={setActiveTab}
                islandData={islandData}
                setCharCarouselIndex={setCharCarouselIndex}
              />
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}
