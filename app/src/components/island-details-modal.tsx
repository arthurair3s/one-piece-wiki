"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchIslandDetails, fetchIslandArcs } from "@/app/_service";
import { BaseModal } from "@/components/base-modal";

// Função utilitária para extrair cores computadas do tema CSS/Tailwind ativo
function getThemeColor(className: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    const dummy = document.createElement("div");
    dummy.className = className;
    dummy.style.position = "absolute";
    dummy.style.visibility = "hidden";
    dummy.style.left = "-9999px";
    document.body.appendChild(dummy);
    const color = window.getComputedStyle(dummy).color;
    document.body.removeChild(dummy);
    return color || fallback;
  } catch (e) {
    return fallback;
  }
}

// ── Componente do Visualizador 3D Topográfico (Estilo Croqui/Mapa de Navegação) ──
interface TopographicViewerProps {
  name: string;
}

function TopographicViewer({ name }: TopographicViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [yaw, setYaw] = useState<number>(0.6); 
  const [pitch, setPitch] = useState<number>(0.8); 
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Geração determinística do relevo da ilha com base no nome
  const points = React.useMemo(() => {
    const grid: { x: number; y: number; z: number }[] = [];
    const size = 11; // Grid 11x11 para um estilo wireframe mais "clean" e desenhado à mão
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash) % 100;
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const x = (i - (size - 1) / 2) / ((size - 1) / 2);
        const y = (j - (size - 1) / 2) / ((size - 1) / 2);
        const dist = Math.sqrt(x * x + y * y);
        
        let z = 0;
        if (dist < 0.9) {
          const baseHeight = Math.cos(dist * Math.PI / 2) * 1.4;
          const noise = 0.12 * Math.sin(x * 4 + seed) * Math.cos(y * 4 - seed);
          z = Math.max(0, baseHeight + noise);
        }
        grid.push({ x: x * 80, y: -z * 40, z: y * 80 });
      }
    }
    return grid;
  }, [name]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2 + 10;

      ctx.clearRect(0, 0, width, height);

      // Obter cores do tema ativo
      const primaryColor = getThemeColor("text-primary", "#E2B53E");
      const foregroundColor = getThemeColor("text-foreground", "#1E293B");
      const mutedColor = getThemeColor("text-muted-foreground", "#64748B");
      const borderColor = getThemeColor("border-border", "#CBD5E1");

      // Auxiliar para aplicar opacidade
      const hexToRgba = (hex: string, alpha: number) => {
        if (hex.startsWith("rgb")) {
          return hex.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
        }
        return hex;
      };

      // Desenhar elipse de base da ilha (Nível do mar Z=0)
      ctx.strokeStyle = hexToRgba(borderColor, 0.4);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(1.2, 1.2 * Math.sin(pitch));
      ctx.arc(0, 0, 70, 0, Math.PI * 2);
      ctx.restore();
      ctx.stroke();

      // Projeção 3D dos pontos
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      const projectedPoints = points.map((p) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;

        const y2 = p.y * cosP - z1 * sinP;
        const z2 = p.y * sinP + z1 * cosP;

        const focalLength = 280;
        const scale = focalLength / (focalLength + z2);
        const px = centerX + x1 * scale * 1.2;
        const py = centerY + y2 * scale * 1.2;

        return { x: px, y: py, heightVal: p.y };
      });

      // Linhas da malha topográfica (estilo croqui/desenho topográfico)
      const size = 11;
      ctx.lineWidth = 1;

      // Curvas latitudinais (Horizontais)
      for (let i = 0; i < size; i++) {
        ctx.beginPath();
        for (let j = 0; j < size; j++) {
          const pt = projectedPoints[i * size + j];
          if (j === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = hexToRgba(foregroundColor, 0.25);
        ctx.stroke();
      }

      // Curvas longitudinais (Verticais)
      for (let j = 0; j < size; j++) {
        ctx.beginPath();
        for (let i = 0; i < size; i++) {
          const pt = projectedPoints[i * size + j];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = hexToRgba(primaryColor, 0.35);
        ctx.stroke();
      }

      // Desenhar bússola decorativa discreta no topo esquerdo do Canvas
      ctx.strokeStyle = hexToRgba(mutedColor, 0.3);
      ctx.beginPath();
      ctx.arc(20, 20, 10, 0, Math.PI * 2);
      ctx.stroke();
      
      const northX = 20 + 10 * Math.sin(yaw);
      const northY = 20 - 10 * Math.cos(yaw);
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(northX, northY);
      ctx.strokeStyle = primaryColor;
      ctx.stroke();

      ctx.fillStyle = primaryColor;
      ctx.font = "8px monospace";
      ctx.fillText("N", 20 + 14 * Math.sin(yaw) - 2.5, 20 - 14 * Math.cos(yaw) + 3);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [points, yaw, pitch]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setYaw((prev) => prev - dx * 0.007);
    setPitch((prev) => Math.max(0.1, Math.min(1.45, prev - dy * 0.007)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative w-full h-full bg-muted/20 border border-border/60 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none group flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full"
      />
      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-[9px] text-center text-muted-foreground bg-background/80 border border-border/30 px-2 py-0.5 rounded pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
        Girar Câmera (Mouse Drag)
      </div>
    </div>
  );
}

// ── Componente Principal do Modal ──
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

  // DECISÃO DE DESIGN: Define se o visualizador 3D do terreno deve ficar FORA do modal principal
  // (lado esquerdo, empurrando o card de detalhes para a direita) ou DENTRO do card.
  // IMPORTANTE: De acordo com o croqui, mantemos como TRUE (fora do modal). Altere para FALSE para reverter a decisão.
  const visualizerOutside = true;

  // Controle de expansão das seções de detalhes (Geografia, Locais, História)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    geografia: false,
    locais: false,
    historia: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Carrega os detalhes da ilha
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

  // Placeholder textual estilizado com a lore do East Blue
  const getLore = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("dawn") || lowerName.includes("foosha")) {
      return {
        geografia: "Relevo coberto por florestas densas, costas rochosas e clima ameno. É a maior ilha do East Blue.",
        locais: "Vila Foosha (porto pacato de pescadores) e o Monte Colubo (esconderijo dos bandidos da montanha comandados por Dadan).",
        historia: "Ilha natal de Monkey D. Luffy. Serviu de ancoradouro temporário para os Piratas do Ruivo e local onde Luffy consumiu a Akuma no Mi."
      };
    }
    if (lowerName.includes("goat") || lowerName.includes("alvida")) {
      return {
        geografia: "Pequeno atol arenoso tropical, plano e com vegetação de palmeiras, propício para ancoragem furtiva.",
        locais: "Base temporária dos Piratas da Alvida e docas de botes na enseada norte.",
        historia: "Onde Luffy conhece e liberta o jovem Coby, que trabalhava como tripulante forçado no bando da pirata Alvida."
      };
    }
    if (lowerName.includes("shells") || lowerName.includes("morgan")) {
      return {
        geografia: "Ilha portuária com relevo urbano suave, cercada por baías protegidas e dominada por fortificações militares.",
        locais: "Base de Operações da 153ª Divisão da Marinha e a Taberna local de Rika.",
        historia: "Cenário da queda da tirania do Capitão Morgan. Foi onde Roronoa Zoro juntou-se a Luffy, tornando-se o primeiro tripulante."
      };
    }
    if (lowerName.includes("orange") || lowerName.includes("buggy")) {
      return {
        geografia: "Ilha costeira plana com bosques frutíferos e pomares abundantes de laranjas de Orange Town.",
        locais: "Porto de Orange Town, o Pet Shop do cão leal Chouchou e a Prefeitura central.",
        historia: "Cidade ocupada e devastada pelos Piratas do Buggy, onde Luffy, Zoro e Nami unem forças para libertar a cidade."
      };
    }
    return {
      geografia: "Ilha típica do East Blue com praias de areia branca, vegetação temperada e planaltos relvados.",
      locais: "Porto comercial mercantil, farol de aviso e praça central.",
      historia: "Ponto estratégico de abastecimento na rota para a temida e cobiçada Grand Line."
    };
  };

  const lore = islandData ? getLore(islandData.name) : { geografia: "", locais: "", historia: "" };

  // Elemento lateral do visualizador 3D para ser passado como addon
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
      onBack={onClose} // Sempre leva para a Homepage direto (fecha o modal)
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
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed text-center font-sans px-2 md:px-8 mb-6 mt-2">
              {islandData.description || "Nenhum dado catalogado para esta ilha."}
            </p>

            <div className="flex flex-col justify-center px-2 md:px-6 font-sans">
              {/* Geografia */}
              <div className="border-t border-border/80">
                <button
                  onClick={() => toggleSection("geografia")}
                  className="w-full py-2.5 text-center text-xs font-bold tracking-widest text-foreground uppercase cursor-pointer hover:text-primary transition-colors focus:outline-none"
                >
                  Geografia
                </button>
                {expandedSections.geografia && (
                  <div className="pb-3 text-xs text-muted-foreground text-center px-4 leading-relaxed animate-fade-in">
                    {lore.geografia}
                  </div>
                )}
              </div>

              {/* Locais */}
              <div className="border-t border-border/80">
                <button
                  onClick={() => toggleSection("locais")}
                  className="w-full py-2.5 text-center text-xs font-bold tracking-widest text-foreground uppercase cursor-pointer hover:text-primary transition-colors focus:outline-none"
                >
                  Locais
                </button>
                {expandedSections.locais && (
                  <div className="pb-3 text-xs text-muted-foreground text-center px-4 leading-relaxed animate-fade-in">
                    {lore.locais}
                  </div>
                )}
              </div>

              {/* História */}
              <div className="border-t border-b border-border/80">
                <button
                  onClick={() => toggleSection("historia")}
                  className="w-full py-2.5 text-center text-xs font-bold tracking-widest text-foreground uppercase cursor-pointer hover:text-primary transition-colors focus:outline-none"
                >
                  História
                </button>
                {expandedSections.historia && (
                  <div className="pb-3 text-xs text-muted-foreground text-center px-4 leading-relaxed animate-fade-in">
                    {lore.historia}
                  </div>
                )}
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
