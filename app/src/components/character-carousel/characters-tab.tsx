import React from "react";

interface CharactersTabProps {
  islandData: any;
  filteredCharacters: any[];
  currentCharIndex: number;
  setCharCarouselIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedCharacter: (char: any) => void;
  setActiveTab: (tab: "characters" | "versions") => void;
  setVersionSearch: (search: string) => void;
}

export function CharactersTab({
  islandData,
  filteredCharacters,
  currentCharIndex,
  setCharCarouselIndex,
  setSelectedCharacter,
  setActiveTab,
  setVersionSearch,
}: CharactersTabProps) {
  return (
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
  );
}
