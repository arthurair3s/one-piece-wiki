"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSagas, getArcs, getIslands } from "@/services/api";
import type { Saga, Arc, Island } from "@/types/api";

// Importações dos novos componentes modulares e reutilizáveis
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { IslandPlaceholder } from "@/components/island-placeholder";

export default function HomePage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(true);
  const [isAdmin] = useState(true); // TODO: carregar do auth context / session real
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArcId, setActiveArcId] = useState<number>(1);

  // ── Proteção de Rota e Fluxo de Redirecionamento Seguro ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const hasLoaded = sessionStorage.getItem("dashboard_loaded");
    if (hasLoaded !== "true") {
      router.push("/loading-screen");
      return;
    }

    setIsNavigating(false);
  }, [router]);

  // ── States com dados reais de One Piece (fallbacks consistentes com o banco) ──
  const [sagas, setSagas] = useState<Saga[]>([
    { id: 1, name: "Saga do East Blue", order: 1, createdAt: "", updatedAt: "" },
  ]);

  const [arcs, setArcs] = useState<Arc[]>([
    { id: 1, name: "Romance Dawn", order: 1, sagaId: 1, createdAt: "", updatedAt: "" },
    { id: 2, name: "Shells Town", order: 2, sagaId: 1, createdAt: "", updatedAt: "" },
    { id: 3, name: "Orange Town", order: 3, sagaId: 1, createdAt: "", updatedAt: "" },
  ]);

  const [islands, setIslands] = useState<Island[]>([
    { id: 1, name: "Dawn Island", description: "Ilha natal de Luffy.", coordinate_x: 15, coordinate_y: 45, coordinate_z: 0, model_url: "", thumbnail_url: "", is_active: true, createdAt: "", updatedAt: "" },
    { id: 2, name: "Alvida Ship", description: "Navio onde Coby era prisioneiro.", coordinate_x: 35, coordinate_y: 25, coordinate_z: 0, model_url: "", thumbnail_url: "", is_active: true, createdAt: "", updatedAt: "" },
    { id: 3, name: "Shells Town", description: "Base da Marinha comandada por Morgan.", coordinate_x: 55, coordinate_y: 40, coordinate_z: 0, model_url: "", thumbnail_url: "", is_active: true, createdAt: "", updatedAt: "" },
    { id: 4, name: "Orange Town", description: "Cidade dominada por Buggy.", coordinate_x: 75, coordinate_y: 20, coordinate_z: 0, model_url: "", thumbnail_url: "", is_active: true, createdAt: "", updatedAt: "" },
  ]);

  // ── Carregamento Assíncrono dos Dados da API Real ──
  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token") || "";
        if (!token) return;

        const [apiSagas, apiArcs, apiIslands] = await Promise.all([
          getSagas(token).catch(() => null),
          getArcs(token).catch(() => null),
          getIslands(token).catch(() => null),
        ]);

        // Trata as respostas com suporte tanto a arrays diretos quanto a objetos contendo a chave 'data' da API real
        if (apiSagas) {
          const sagasArray = Array.isArray(apiSagas) ? apiSagas : (apiSagas as any)?.data;
          if (sagasArray && sagasArray.length > 0) setSagas(sagasArray);
        }
        if (apiArcs) {
          const arcsArray = Array.isArray(apiArcs) ? apiArcs : (apiArcs as any)?.data;
          if (arcsArray && arcsArray.length > 0) setArcs(arcsArray);
        }
        if (apiIslands) {
          const islandsArray = Array.isArray(apiIslands) ? apiIslands : (apiIslands as any)?.data;
          if (islandsArray && islandsArray.length > 0) setIslands(islandsArray);
        }
      } catch (err) {
        console.warn("Utilizando dados do banco via fallback estático realista:", err);
      }
    }

    loadData();
  }, []);

  if (isNavigating) {
    return <div className="w-screen h-screen bg-background" />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      
      {/* ══════════════════════════════════════════════
          BACKGROUND — Mapa 3D e Oceano Decorativo
          ══════════════════════════════════════════════ */}
      <main className="absolute inset-0 z-10 overflow-hidden flex items-center justify-center">
        {/* Fundo oceano suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-primary/10" />

        {/* Ondas decorativas de fundo */}
        <svg
          className="absolute bottom-0 left-0 w-full h-32 text-primary/5 pointer-events-none"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>

        {/* Ilhas reais posicionadas de forma natural e isométrica */}
        <div className="relative w-full h-full max-w-4xl flex items-center justify-center pointer-events-auto">
          <div className="relative w-[800px] h-[500px]">
            {islands.map((island, index) => {
              // Extrai as coordenadas suportando o aninhamento real 'coordinates.x/y' do NestJS ou chaves do banco de dados
              const xPos = island.coordinates?.x ?? island.coordinate_x ?? (15 + index * 20);
              const yPos = island.coordinates?.y ?? island.coordinate_y ?? (20 + (index % 2 === 0 ? 20 : 5));
              
              const sizes: Array<"sm" | "md" | "lg"> = ["lg", "sm", "md", "md"];
              const currentSize = sizes[index % sizes.length];

              return (
                <IslandPlaceholder
                  key={island.id}
                  size={currentSize}
                  name={island.name}
                  className="absolute transition-transform duration-500 hover:scale-105"
                  style={{
                    left: `${xPos}%`,
                    top: `${yPos}%`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Label central discreto */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center opacity-30 select-none">
            <span className="text-6xl block mb-3 animate-pulse">🗺️</span>
            <p className="text-lg font-medium text-muted-foreground">
              Mapa 3D Interativo
            </p>
            <p className="text-sm text-muted-foreground/60">
              Fase 5 — Em desenvolvimento
            </p>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════
          BARRA SUPERIOR (DESACOPLADA, LARGA E FLUTUANTE)
          ══════════════════════════════════════════════ */}
      <Header
        isAdmin={isAdmin}
        sagas={sagas}
        arcs={arcs}
        islands={islands}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onArcSelect={(arcId) => arcId && setActiveArcId(Number(arcId))}
      />

      {/* ══════════════════════════════════════════════
          BARRA INFERIOR / TIMELINE (OTIMIZADA E COMPACTA)
          ══════════════════════════════════════════════ */}
      <Footer
        activeArcId={activeArcId}
        arcs={arcs}
        onArcClick={setActiveArcId}
      />
    </div>
  );
}
