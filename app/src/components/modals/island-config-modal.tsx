"use client";

import React, { useState, useCallback, useEffect } from "react";
import { updateIsland } from "@/app/_service";

export interface IslandPreview {
  islandId: number;
  coordX: number;
  coordY: number;
  rotationY: number; // radianos (para uso interno / renderização do mapa)
  scale: number;
}

export interface IslandConfigModalProps {
  isOpen: boolean;
  islandId: number | null;
  islandName: string;
  coordX: number;
  coordY: number;
  rotationY: number;   // radianos (convertidos de graus do banco em page.tsx)
  scale: number;
  onClose: () => void;
  onSaved: () => void;
  /** Called on every change so the map can preview in real time */
  onPreviewChange: (preview: IslandPreview | null) => void;
}

const ROTATION_STEP = Math.PI / 8; // passo de 22.5 graus
const COORD_NUDGE   = 1.0;
const SCALE_STEP    = 0.1;
const MIN_SCALE     = 0.2;
const MAX_SCALE     = 3.0;

function radToDeg(r: number) { return Math.round((r * 180) / Math.PI); }
function degToRad(d: number) { return (d * Math.PI) / 180; }
function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

export function IslandConfigModal({
  isOpen,
  islandId,
  islandName,
  coordX:    initialX,
  coordY:    initialY,
  rotationY: initialRot,
  scale:     initialScale,
  onClose,
  onSaved,
  onPreviewChange,
}: IslandConfigModalProps) {
  const [coordX,    setCoordX]    = useState(initialX);
  const [coordY,    setCoordY]    = useState(initialY);
  const [rotationY, setRotationY] = useState(initialRot);
  const [scale,     setScale]     = useState(initialScale);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);

  // sincroniza o estado local ao abrir o modal para uma ilha diferente
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoordX(initialX);
    setCoordY(initialY);
    setRotationY(initialRot);
    setScale(initialScale);
    setError(null);
    setSaved(false);
  }, [islandId, initialX, initialY, initialRot, initialScale]);

  // transmite a pré-visualização em tempo real para o mapa ao alterar qualquer valor
  useEffect(() => {
    if (!isOpen || !islandId) {
      onPreviewChange(null);
      return;
    }
    onPreviewChange({ islandId, coordX, coordY, rotationY, scale });
  }, [isOpen, islandId, coordX, coordY, rotationY, scale, onPreviewChange]);

  // limpa a pré-visualização ao desmontar ou fechar o modal
  useEffect(() => {
    return () => onPreviewChange(null);
  }, [onPreviewChange]);

  const handleSave = useCallback(async () => {
    if (!islandId) return;
    setSaving(true);
    setError(null);
    try {
      // converte radianos para graus antes de persistir no banco de dados
      await updateIsland(islandId, {
        coordinate_x: parseFloat(coordX.toFixed(4)),
        coordinate_y: parseFloat(coordY.toFixed(4)),
        rotation_y:   parseFloat(((rotationY * 180) / Math.PI).toFixed(4)),
        scale:        parseFloat(scale.toFixed(4)),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro ao salvar.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [islandId, coordX, coordY, rotationY, scale, onSaved]);

  const handleCancel = useCallback(() => {
    onPreviewChange(null);
    onClose();
  }, [onClose, onPreviewChange]);

  if (!isOpen || !islandId) return null;

  const panel    = "bg-background/80 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl";
  const label    = "text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block";
  const valueBadge = "text-[10px] font-mono text-primary ml-1.5";
  const iconBtn  = (extra = "") =>
    `w-8 h-8 rounded-lg border border-border/50 bg-background/50 hover:bg-muted text-foreground flex items-center justify-center active:scale-90 transition-all text-sm select-none cursor-pointer font-bold ${extra}`;
  const nudgeBtn = iconBtn("w-7 h-7 text-xs");
  const slider   = "flex-1 accent-primary cursor-pointer h-1 rounded-full bg-border/40";

  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 z-[70] flex flex-col gap-2 w-[270px] pointer-events-auto">

      {/* Header */}
      <div className={`${panel} flex items-center justify-between px-3 py-2`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-primary font-bold">⚙</span>
          <div>
            <p className="text-[10px] font-bold text-foreground leading-none">{islandName}</p>
            <p className="text-[9px] text-muted-foreground/80 mt-0.5">Pré-visualização ativa</p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="w-6 h-6 rounded-md border border-border/50 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center text-xs cursor-pointer transition-all"
          title="Cancelar e reverter"
        >
          ✕
        </button>
      </div>

      {/* Rotation */}
      <div className={`${panel} px-3 py-2.5 flex flex-col gap-1.5`}>
        <span className={label}>
          Rotação <span className={valueBadge}>{radToDeg(rotationY)}°</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button className={iconBtn()} title="↺ 22.5°"
            onClick={() => setRotationY(r => r - ROTATION_STEP)}>↺</button>
          <input type="range" className={slider}
            min={-540} max={540} step={1}
            value={radToDeg(rotationY)}
            onChange={e => setRotationY(degToRad(Number(e.target.value)))}
          />
          <button className={iconBtn()} title="↻ 22.5°"
            onClick={() => setRotationY(r => r + ROTATION_STEP)}>↻</button>
        </div>
      </div>

      {/* Scale */}
      <div className={`${panel} px-3 py-2.5 flex flex-col gap-1.5`}>
        <span className={label}>
          Tamanho <span className={valueBadge}>{scale.toFixed(2)}×</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button className={iconBtn()} title="Diminuir"
            onClick={() => setScale(s => clamp(+(s - SCALE_STEP).toFixed(2), MIN_SCALE, MAX_SCALE))}>−</button>
          <input type="range" className={slider}
            min={MIN_SCALE} max={MAX_SCALE} step={0.05}
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
          />
          <button className={iconBtn()} title="Aumentar"
            onClick={() => setScale(s => clamp(+(s + SCALE_STEP).toFixed(2), MIN_SCALE, MAX_SCALE))}>＋</button>
        </div>
      </div>

      {/* Position */}
      <div className={`${panel} px-3 py-2.5 flex flex-col gap-1.5`}>
        <span className={label}>
          Posição <span className={valueBadge}>X {coordX.toFixed(1)}% · Y {coordY.toFixed(1)}%</span>
        </span>
        {/* D-Pad */}
        <div className="flex flex-col items-center gap-0.5 my-1">
          <button className={nudgeBtn} title="Cima"
            onClick={() => setCoordY(y => clamp(+(y - COORD_NUDGE).toFixed(1), 0, 100))}>▲</button>
          <div className="flex gap-4">
            <button className={nudgeBtn} title="Esquerda"
              onClick={() => setCoordX(x => clamp(+(x - COORD_NUDGE).toFixed(1), 0, 100))}>◀</button>
            <div className="w-7 h-7 rounded-full border border-border/50 bg-background/50 flex items-center justify-center">
              <span className="text-[8px] text-muted-foreground/50">✛</span>
            </div>
            <button className={nudgeBtn} title="Direita"
              onClick={() => setCoordX(x => clamp(+(x + COORD_NUDGE).toFixed(1), 0, 100))}>▶</button>
          </div>
          <button className={nudgeBtn} title="Baixo"
            onClick={() => setCoordY(y => clamp(+(y + COORD_NUDGE).toFixed(1), 0, 100))}>▼</button>
        </div>
        {/* Precision sliders */}
        <div className="flex flex-col gap-1.5 mt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-muted-foreground w-3">X</span>
            <input type="range" className={slider} min={0} max={100} step={0.5}
              value={coordX} onChange={e => setCoordX(Number(e.target.value))} />
            <span className="text-[9px] font-mono text-primary w-9 text-right">{coordX.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-muted-foreground w-3">Y</span>
            <input type="range" className={slider} min={0} max={100} step={0.5}
              value={coordY} onChange={e => setCoordY(Number(e.target.value))} />
            <span className="text-[9px] font-mono text-primary w-9 text-right">{coordY.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`${panel} px-3 py-2.5 flex flex-col gap-1.5`}>
        {error && <p className="text-[10px] text-red-400 text-center">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-semibold cursor-pointer transition-all disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-all disabled:opacity-40
              ${saved
                ? "border-green-500/40 bg-green-500/10 text-green-500"
                : "border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary"
              }`}
          >
            {saving ? "Salvando…" : saved ? "✓ Salvo!" : "✓ Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
