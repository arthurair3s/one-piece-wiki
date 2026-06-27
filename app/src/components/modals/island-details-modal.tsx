"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { fetchIslandDetails, fetchIslandArcs } from "@/app/_service";
import { BaseModal } from "@/components/modals/base-modal";
import { TopographicViewer } from "@/components/viewers/topographic-viewer";
import { Island3DViewer } from "@/components/viewers/island-3d-viewer";

const ISLAND_EXTRAS: Record<number, { geography: string; locations: string; history: string }> = {
  1: {
    geography: "Localizada na Ilha Dawn no East Blue. Possui relevo suave com colinas verdejantes, moinhos de vento, clima temperado e praias calmas adequadas para navegação de pequeno porte.",
    locations: "Porto de Foosha, Taverna da Makino, Casa do Prefeito, Monte Colubo (arredores).",
    history: "O berço de Monkey D. Luffy. Foi aqui que ele conheceu Shanks e os Piratas do Ruivo, comeu a Gomu Gomu no Mi, e treinou com Ace e Sabo sob os cuidados de Dadan."
  },
  2: {
    geography: "Uma ilha fortificada com terreno predominantemente plano e uma enorme base da Marinha de arquitetura imponente que centraliza o poder e a administração local.",
    locations: "Base da Marinha (153ª Divisão), Praça de Execução, Taverna de Rika, Ruas residenciais.",
    history: "Controlada pelo tirânico Capitão Morgan 'Mão de Machado'. Luffy e Koby chegam à ilha e libertam Roronoa Zoro, que se junta à tripulação após derrotarem Morgan."
  },
  3: {
    geography: "Uma pequena ilha portuária com vilas pitorescas cercadas por colinas arborizadas. O clima é subtropical e agradável, ideal para o comércio.",
    locations: "Centro de Orange Town, Pet Shop do Chou Chou, Porto de Fuga, Torre do Relógio.",
    history: "Invadida pelos Piratas do Buggy, o Palhaço. Luffy, Zoro e Nami unem forças para derrotar Buggy e libertar os cidadãos, salvando o cãozinho Chou Chou."
  },
  4: {
    geography: "Parte do arquipélago Gecko. Uma ilha com falésias acidentadas nas bordas, colinas gramadas, e a pacata Vila Syrup situada estrategicamente no topo.",
    locations: "Vila Syrup, Mansão de Kaya, Costa Norte (praia com encostas), Costa Sul.",
    history: "O lar do atirador Usopp. O bando do Chapéu de Palha desmascara o mordomo Klahadore (Capitão Kuro) e seus piratas do Gato Preto, ganhando o Going Merry de Kaya."
  },
  5: {
    geography: "Um restaurante flutuante sem território terrestre. É um navio customizado em forma de peixe gigante ancorado permanentemente nas águas do East Blue.",
    locations: "Cozinha do Baratie, Salão Principal de Refeições, Deck de Batalha (Sabashira), Barco de Apoio.",
    history: "Fundado por Zeff 'Pé Vermelho'. O local do recrutamento de Sanji, a invasão da armada de Don Krieg e o lendário duelo de Zoro contra Dracule Mihawk."
  }
};

const getIslandExtras = (id: number | null, name: string) => {
  if (id && ISLAND_EXTRAS[id]) {
    return ISLAND_EXTRAS[id];
  }
  return {
    geography: `A geografia de ${name} compreende o relevo e clima característicos das rotas marítimas da Grand Line durante este período histórico.`,
    locations: `Porto Principal de ${name}, Centro Comercial, Taberna Local, Áreas Silvestres.`,
    history: `Grandes eventos do arco temporal atual se desenrolaram em ${name}, moldando o destino de seus habitantes.`
  };
};

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

export interface IslandDetailsModalProps {
  isOpen: boolean;
  islandId: number | null;
  arcId: number;
  modelUrl?: string | null;
  onClose: () => void;
  onNavigateToCharacters: () => void;
}

export function IslandDetailsModal({
  isOpen,
  islandId,
  arcId,
  modelUrl,
  onClose,
  onNavigateToCharacters,
}: IslandDetailsModalProps) {
  const [islandData, setIslandData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<"geography" | "locations" | "history" | null>(null);

  const extraData = getIslandExtras(islandId, islandData?.name || "");

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
        {modelUrl ? (
          <Island3DViewer
            modelUrl={modelUrl}
            fallback={<TopographicViewer name={islandData.name} />}
          />
        ) : (
          <TopographicViewer name={islandData.name} />
        )}
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
        <div className="flex items-center justify-end w-full pt-2">
          <button
            onClick={onNavigateToCharacters}
            className="px-5 py-2 border border-border hover:border-primary hover:text-primary rounded-lg text-xs md:text-sm font-semibold cursor-pointer transition-colors bg-background hover:bg-muted/10 font-sans"
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
          <div className="w-full h-full flex flex-col justify-between min-h-full font-sans">
            <div className="flex-1 flex flex-col gap-5 px-1 py-2 overflow-y-auto">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {islandData.description || "Nenhum dado catalogado para esta ilha."}
              </p>

              {/* Accordions */}
              <div className="flex flex-col border-t border-border/40 mt-2">
                {/* Geografia */}
                <div className="border-b border-border/40">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "geography" ? null : "geography")}
                    className="w-full py-3 flex items-center justify-between font-serif font-bold text-sm md:text-base text-foreground hover:text-primary transition-colors text-left"
                  >
                    <span>Geografia</span>
                    <span className={`transform transition-transform duration-200 ${expandedSection === "geography" ? "rotate-180 text-primary" : "text-muted-foreground"}`}>
                      <ChevronDown />
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedSection === "geography" ? "max-h-[300px] pb-3 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {extraData.geography}
                    </p>
                  </div>
                </div>

                {/* Locais */}
                <div className="border-b border-border/40">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "locations" ? null : "locations")}
                    className="w-full py-3 flex items-center justify-between font-serif font-bold text-sm md:text-base text-foreground hover:text-primary transition-colors text-left"
                  >
                    <span>Locais de Interesse</span>
                    <span className={`transform transition-transform duration-200 ${expandedSection === "locations" ? "rotate-180 text-primary" : "text-muted-foreground"}`}>
                      <ChevronDown />
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedSection === "locations" ? "max-h-[300px] pb-3 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {extraData.locations}
                    </p>
                  </div>
                </div>

                {/* História */}
                <div className="border-b border-border/40">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "history" ? null : "history")}
                    className="w-full py-3 flex items-center justify-between font-serif font-bold text-sm md:text-base text-foreground hover:text-primary transition-colors text-left"
                  >
                    <span>História e Acontecimentos</span>
                    <span className={`transform transition-transform duration-200 ${expandedSection === "history" ? "rotate-180 text-primary" : "text-muted-foreground"}`}>
                      <ChevronDown />
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedSection === "history" ? "max-h-[300px] pb-3 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {extraData.history}
                    </p>
                  </div>
                </div>
              </div>
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
