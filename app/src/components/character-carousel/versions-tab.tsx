/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface VersionsTabProps {
  selectedCharacter: any;
  loadingVersions: boolean;
  versionsError: string | null;
  filteredVersions: any[];
  currentVersionIndex: number;
  setVersionCarouselIndex: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab: (tab: "characters" | "versions") => void;
  islandData: any;
  setCharCarouselIndex: React.Dispatch<React.SetStateAction<number>>;
}

export function VersionsTab({
  selectedCharacter,
  loadingVersions,
  versionsError,
  filteredVersions,
  currentVersionIndex,
  setVersionCarouselIndex,
  setActiveTab,
  islandData,
  setCharCarouselIndex,
}: VersionsTabProps) {
  return (
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
          <div className="relative w-full h-[280px] md:h-[35vh] flex items-center justify-center overflow-hidden py-4 select-none">
            {/* Botão Esquerda */}
            {filteredVersions.length > 1 && (
              <button
                onClick={() => setVersionCarouselIndex((prev) => (prev > 0 ? prev - 1 : filteredVersions.length - 1))}
                className="absolute left-2 z-30 w-8 h-8 rounded-full border border-border/50 bg-background/50 text-foreground hover:border-primary hover:text-primary flex items-center justify-center font-bold text-xs cursor-pointer shadow transition-all hover:bg-muted active:scale-90"
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
                const cardTitle = version.alias || selectedCharacter?.name || "Sem Nome";
                const cardSubtitle = version.epithet;

                return (
                  <div
                    key={version.id}
                    style={style}
                    onClick={() => {
                      if (!isFeatured) setVersionCarouselIndex(idx);
                    }}
                    className={`absolute w-[200px] h-[240px] md:h-[30vh] text-card-foreground border transition-all duration-300 ${
                      isFeatured ? "border-primary bg-card/85 shadow-lg" : "border-border/40 bg-card/45 shadow"
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
                          &ldquo;{cardSubtitle}&rdquo;
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
                            setActiveTab("characters");

                            if (islandData?.characters) {
                              const matchingCharIdx = islandData.characters.findIndex(
                                (c: any) => c.characterId === selectedCharacter.characterId
                              );
                              if (matchingCharIdx !== -1) {
                                setCharCarouselIndex(matchingCharIdx);
                              }
                            }
                          }}
                          className="px-2.5 py-1 border border-border/40 hover:border-primary hover:text-primary rounded-lg text-[9px] font-semibold transition-all bg-background/50 hover:bg-muted active:scale-95"
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
                className="absolute right-2 z-30 w-8 h-8 rounded-full border border-border/50 bg-background/50 text-foreground hover:border-primary hover:text-primary flex items-center justify-center font-bold text-xs cursor-pointer shadow transition-all hover:bg-muted active:scale-90"
              >
                &gt;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
