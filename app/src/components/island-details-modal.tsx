"use client";

import React, { useState, useEffect } from "react";
import { fetchIslandDetails, fetchIslandArcs } from "@/app/_service";
import { BaseModal } from "@/components/base-modal";
import { TopographicViewer } from "./topographic-viewer";

export interface IslandDetailsModalProps {
  isOpen: boolean;
  islandId: number | null;
  arcId: number;
  onClose: () => void;
  onNavigateToCharacters: () => void;
}

export function IslandDetailsModal({
  isOpen,
  islandId,
  arcId,
  onClose,
  onNavigateToCharacters,
}: IslandDetailsModalProps) {
  const [islandData, setIslandData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const visualizerOutside = true;

  const loadDetails = React.useCallback(async () => {
    if (!islandId) return;
    setLoading(true);
    setError(null);
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
      console.error("Erro ao carregar detalhes da ilha:", err);
      setError(err.message || "Erro de conexão com o banco de dados.");
    } finally {
      setLoading(false);
    }
  }, [islandId, arcId]);

  useEffect(() => {
    if (!islandId || !isOpen) {
      setIslandData(null);
      return;
    }
    loadDetails();
  }, [islandId, isOpen, loadDetails]);

  if (!isOpen || !islandId) return null;

  const leftAddon = islandData ? (
    <div className="w-full h-full flex flex-col gap-2">
      <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block text-center md:text-left">
        Modelo 3D da Ilha
      </span>
      <div className="flex-1 min-h-[220px] md:min-h-0">
        <TopographicViewer name={islandData.name} />
      </div>
    </div>
  ) : null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={islandData?.name}
      showBackButton={true}
      onBack={onClose}
      leftAddon={leftAddon}
      leftAddonOutside={visualizerOutside}
      footer={
        <div className="flex items-center justify-end">
          <button
            onClick={onNavigateToCharacters}
            className="px-4 py-1.5 border border-border hover:border-primary hover:text-primary rounded-lg text-xs md:text-sm font-semibold cursor-pointer transition-colors bg-background hover:bg-muted/10 font-sans"
          >
            Personagens &gt;
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 py-10">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground animate-pulse font-sans">Buscando cartas náuticas...</p>
        </div>
      ) : error ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center py-10 font-sans">
          <div className="text-red-500 text-3xl">⚠️</div>
          <h3 className="text-sm font-bold text-foreground">Sinal Perdido</h3>
          <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
          <button
            onClick={() => loadDetails()}
            className="mt-2 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:border-primary transition-colors bg-background"
          >
            Tentar Novamente
          </button>
        </div>
      ) : islandData ? (
        <div className="w-full h-full flex flex-col justify-between min-h-full">
          <div className="flex-1 flex items-center justify-center px-4 py-6 md:px-8">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center font-sans max-w-xl">
              {islandData.description || "Nenhum dado catalogado para esta ilha."}
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs py-10 font-sans">
          Nenhum dado encontrado para a ilha selecionada.
        </div>
      )}
    </BaseModal>
  );
}
