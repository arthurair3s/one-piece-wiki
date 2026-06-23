"use client";

import React, { useState, useEffect } from "react";
import { fetchIslandDetails, fetchIslandArcs, fetchCharacterVersions } from "@/app/_service";
import { BaseModal } from "@/components/base-modal";

export interface CharacterCarouselModalProps {
  isOpen: boolean;
  islandId: number | null;
  arcId: number;
  onClose: () => void; // Fecha todos os modais e volta para Homepage
  onBackToIsland: () => void; // Retorna para detalhes da ilha
}

export function CharacterCarouselModal({
  isOpen,
  islandId,
  arcId,
  onClose,
  onBackToIsland,
}: CharacterCarouselModalProps) {
  // Controle de Abas Interno: characters | versions
  const [activeTab, setActiveTab] = useState<"characters" | "versions">("characters");

  // Dados da Ilha (Personagens)
  const [islandData, setIslandData] = useState<any>(null);
  const [loadingIsland, setLoadingIsland] = useState(false);
  const [islandError, setIslandError] = useState<string | null>(null);

  // Estados do Carrossel de Personagens
  const [characterSearch, setCharacterSearch] = useState("");
  const [charCarouselIndex, setCharCarouselIndex] = useState(0);

  // Estados do Carrossel de Versões
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [versionSearch, setVersionSearch] = useState("");
  const [versionCarouselIndex, setVersionCarouselIndex] = useState(0);

  // Carrega os detalhes da ilha para obter a lista de personagens ativos
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

  // Carrega as versões do personagem selecionado
  useEffect(() => {
    if (activeTab !== "versions" || !selectedCharacter?.characterId) return;

    async function loadVersions() {
      setLoadingVersions(true);
      setVersionsError(null);
      try {
        const res = await fetchCharacterVersions(selectedCharacter.characterId);
        const rows = res.rows || [];
        setVersions(rows);

        // Achar a versão inicial que corresponde ao card da página anterior para manter a continuidade visual
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

  // Filtragem de Personagens (Charpage)
  const filteredCharacters = (islandData?.characters || []).filter((char: any) => {
    const term = characterSearch.toLowerCase();
    return (
      char.name.toLowerCase().includes(term) ||
      (char.epithet && char.epithet.toLowerCase().includes(term))
    );
  });

  // Filtragem de Versões (CharVersionpage)
  const filteredVersions = versions.filter((v: any) => {
    const term = versionSearch.toLowerCase();
    const aliasMatch = v.alias?.toLowerCase().includes(term);
    const charNameMatch = v.character?.name?.toLowerCase().includes(term);
    const epithetMatch = v.epithet?.toLowerCase().includes(term);
    return aliasMatch || charNameMatch || epithetMatch;
  });

  // Prevenir index out of bounds ao filtrar
  const currentCharIndex = Math.max(0, Math.min(charCarouselIndex, filteredCharacters.length - 1));
  const currentVersionIndex = Math.max(0, Math.min(versionCarouselIndex, filteredVersions.length - 1));

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showBackButton={true}
      onBack={onClose} // Sempre leva para a Homepage direto (fecha o modal)
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
            {/* ── 1. CARROSSEL DE PERSONAGENS (CHARPAGE) ── */}
            {activeTab === "characters" && (
              <div className="flex-1 flex flex-col justify-between min-h-full">
                <div>
                  <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                    Personagens em {islandData?.name}
                  </h3>

                  {filteredCharacters.length === 0 ? (
                    <div className="w-full h-48 border border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                      <span className="text-xl mb-1">🌊</span>
                      <p className="text-xs font-medium">Nenhum personagem localizado.</p>
                    </div>
                  ) : (
                    /* ── Carrossel 3D de Personagens ── */
                    <div className="relative w-full h-[280px] md:h-[35vh] flex items-center justify-center overflow-hidden py-4 select-none">
                      {/* Botão Esquerda */}
                      {filteredCharacters.length > 1 && (
                        <button
                          onClick={() => setCharCarouselIndex((prev) => (prev > 0 ? prev - 1 : filteredCharacters.length - 1))}
                          className="absolute left-2 z-30 w-8 h-8 rounded-full border border-border bg-background hover:border-primary hover:text-primary flex items-center justify-center font-bold text-xs cursor-pointer shadow transition-colors"
                        >
                          &lt;
                        </button>
                      )}

                      {/* Container do Carrossel */}
                      <div className="relative w-full max-w-[280px] h-[250px] md:h-[32vh] flex items-center justify-center">
                        {filteredCharacters.map((char: any, idx: number) => {
                          const offset = idx - currentCharIndex;
                          const absOffset = Math.abs(offset);

                          if (absOffset > 2) return null;

                          const style = {
                            transform: `translateX(${offset * 120}px) scale(${1 - absOffset * 0.15}) translateZ(${-absOffset * 100}px)`,
                            opacity: 1 - absOffset * 0.45,
                            filter: absOffset > 0 ? "blur(2px) grayscale(50%)" : "none",
                            zIndex: 10 - absOffset,
                            transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                          };

                          const isFeatured = idx === currentCharIndex;

                          return (
                            <div
                              key={char.id}
                              style={style}
                              onClick={() => {
                                if (!isFeatured) setCharCarouselIndex(idx);
                              }}
                              className={`absolute w-[200px] h-[240px] md:h-[30vh] bg-card text-card-foreground border-2 ${
                                isFeatured ? "border-primary shadow-lg" : "border-border shadow"
                              } rounded-2xl p-4 flex flex-col items-center justify-between select-none cursor-pointer`}
                            >
                              <div className="w-full flex-1 flex flex-col items-center text-center overflow-hidden">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center text-xl mb-2">
                                  {char.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={char.image}
                                      alt={char.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "";
                                        (e.target as HTMLImageElement).style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    "🏴‍☠️"
                                  )}
                                </div>

                                <h4 className="text-xs font-bold text-foreground truncate max-w-full">
                                  {char.name}
                                </h4>

                                {char.epithet && (
                                  <p className="text-[10px] text-muted-foreground italic truncate max-w-full">
                                    "{char.epithet}"
                                  </p>
                                )}

                                {isFeatured && (
                                  <div className="flex flex-col items-center gap-1.5 mt-2">
                                    {char.bounty ? (
                                      <span className="text-[8px] font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded">
                                        ฿ {Number(char.bounty).toLocaleString()}
                                      </span>
                                    ) : (
                                      <span className="text-[8px] text-muted-foreground bg-muted/20 border border-border/30 px-1.5 py-0.5 rounded">
                                        Sem recompensa
                                      </span>
                                    )}
                                    <span className={`text-[8px] font-medium px-1 rounded uppercase border ${
                                      char.status === "ACTIVE" || char.status === "ativo"
                                        ? "bg-green-500/5 text-green-500 border-green-500/10"
                                        : "bg-red-500/5 text-red-500 border-red-500/10"
                                    }`}>
                                      {char.status || "Ativo"}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {isFeatured && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCharacter(char);
                                    setActiveTab("versions");
                                    setVersionSearch("");
                                  }}
                                  className="mt-2 text-[9px] text-primary hover:underline font-bold text-center block w-full py-1 border border-border/40 hover:border-primary/40 rounded-lg bg-background"
                                >
                                  Ver versões do personagem &gt;
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Botão Direita */}
                      {filteredCharacters.length > 1 && (
                        <button
                          onClick={() => setCharCarouselIndex((prev) => (prev < filteredCharacters.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2 z-30 w-8 h-8 rounded-full border border-border bg-background hover:border-primary hover:text-primary flex items-center justify-center font-bold text-xs cursor-pointer shadow transition-colors"
                        >
                          &gt;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 2. CARROSSEL DE VERSÕES DO PERSONAGEM (CHARVERSIONPAGE) ── */}
            {activeTab === "versions" && (
              <div className="flex-1 flex flex-col justify-between min-h-full">
                <div>
                  <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                    Versões de {selectedCharacter?.name}
                  </h3>

                  {loadingVersions ? (
                    <div className="w-full h-48 flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] text-muted-foreground">Consultando registros do personagem...</p>
                    </div>
                  ) : versionsError ? (
                    <div className="w-full h-48 flex flex-col items-center justify-center text-center text-red-500 gap-2">
                      <p className="text-xs">{versionsError}</p>
                    </div>
                  ) : filteredVersions.length === 0 ? (
                    <div className="w-full h-48 border border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                      <p className="text-xs">Nenhuma versão localizada.</p>
                    </div>
                  ) : (
                    /* ── Carrossel 3D de Versões ── */
                    <div className="relative w-full h-[280px] md:h-[35vh] flex items-center justify-center overflow-hidden py-4 select-none">
                      {/* Botão Esquerda */}
                      {filteredVersions.length > 1 && (
                        <button
                          onClick={() => setVersionCarouselIndex((prev) => (prev > 0 ? prev - 1 : filteredVersions.length - 1))}
                          className="absolute left-2 z-30 w-8 h-8 rounded-full border border-border bg-background hover:border-primary hover:text-primary flex items-center justify-center font-bold text-xs cursor-pointer shadow transition-colors"
                        >
                          &lt;
                        </button>
                      )}

                      {/* Container do Carrossel */}
                      <div className="relative w-full max-w-[280px] h-[250px] md:h-[32vh] flex items-center justify-center">
                        {filteredVersions.map((version: any, idx: number) => {
                          const offset = idx - currentVersionIndex;
                          const absOffset = Math.abs(offset);

                          if (absOffset > 2) return null;

                          const style = {
                            transform: `translateX(${offset * 120}px) scale(${1 - absOffset * 0.15}) translateZ(${-absOffset * 100}px)`,
                            opacity: 1 - absOffset * 0.45,
                            filter: absOffset > 0 ? "blur(2px) grayscale(50%)" : "none",
                            zIndex: 10 - absOffset,
                            transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                          };

                          const isFeatured = idx === currentVersionIndex;

                          // Regras de Exibição de Títulos (Nomenclatura)
                          const cardTitle = version.alias || selectedCharacter?.name || "Sem Nome";
                          const cardSubtitle = version.epithet;

                          return (
                            <div
                              key={version.id}
                              style={style}
                              onClick={() => {
                                if (!isFeatured) setVersionCarouselIndex(idx);
                              }}
                              className={`absolute w-[200px] h-[240px] md:h-[30vh] bg-card text-card-foreground border-2 ${
                                isFeatured ? "border-primary shadow-lg" : "border-border shadow"
                              } rounded-2xl p-4 flex flex-col items-center justify-between select-none cursor-pointer`}
                            >
                              <div className="w-full flex-1 flex flex-col items-center text-center overflow-hidden">
                                {/* Avatar Versão */}
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center text-xl mb-2">
                                  {version.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={version.image_url}
                                      alt={cardTitle}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "";
                                        (e.target as HTMLImageElement).style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    "🏴‍☠️"
                                  )}
                                </div>

                                <h4 className="text-xs font-bold text-foreground truncate max-w-full">
                                  {cardTitle}
                                </h4>

                                {cardSubtitle && (
                                  <p className="text-[10px] text-muted-foreground italic truncate max-w-full">
                                    "{cardSubtitle}"
                                  </p>
                                )}

                                {isFeatured && (
                                  <p className="text-[9px] text-muted-foreground leading-normal mt-2 overflow-y-auto max-h-[60px] scrollbar-thin px-1 text-center">
                                    {version.description || "Nenhuma descrição histórica disponível para esta versão."}
                                  </p>
                                )}
                              </div>

                              {isFeatured && (
                                <div className="w-full flex flex-col items-center gap-2 mt-2 pt-2 border-t border-border/60">
                                  {version.bounty ? (
                                    <span className="text-[9px] font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded">
                                      ฿ {Number(version.bounty).toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-muted-foreground bg-muted/20 border border-border/30 px-2 py-0.5 rounded">
                                      Sem Recompensa
                                    </span>
                                  )}

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Retorna à lista de personagens
                                      setActiveTab("characters");

                                      // Sincroniza o índice do carrossel principal para manter a continuidade do personagem pai
                                      if (islandData?.characters) {
                                        const matchingCharIdx = islandData.characters.findIndex(
                                          (c: any) => c.characterId === selectedCharacter.characterId
                                        );
                                        if (matchingCharIdx !== -1) {
                                          setCharCarouselIndex(matchingCharIdx);
                                        }
                                      }
                                    }}
                                    className="px-2.5 py-1 border border-border hover:border-primary hover:text-primary rounded-lg text-[9px] font-semibold transition-colors bg-background"
                                  >
                                    &lt; Personagens
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Botão Direita */}
                      {filteredVersions.length > 1 && (
                        <button
                          onClick={() => setVersionCarouselIndex((prev) => (prev < filteredVersions.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2 z-30 w-8 h-8 rounded-full border border-border bg-background hover:border-primary hover:text-primary flex items-center justify-center font-bold text-xs cursor-pointer shadow transition-colors"
                        >
                          &gt;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}
