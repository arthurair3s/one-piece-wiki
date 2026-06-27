"use client";

import React, { useState, useCallback, useEffect } from "react";
import { updateIsland } from "@/app/_service";

export interface IslandPreview {
  islandId: number;
  coordX: number;
  coordY: number;
  rotationY: number; // radians (for internal use / map rendering)
  scale: number;
}

export interface IslandConfigModalProps {
  isOpen: boolean;
  islandId: number | null;
  islandName: string;
  coordX: number;
  coordY: number;
  rotationY: number;   // radians (converted from DB degrees in page.tsx)
  scale: number;
  onClose: () => void;
  onSaved: () => void;
  /** Called on every change so the map can preview in real time */
  onPreviewChange: (preview: IslandPreview | null) => void;
}

const ROTATION_STEP = Math.PI / 8; // 22.5°
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

  // sync when modal opens for a different island
  useEffect(() => {
    setCoordX(initialX);
    setCoordY(initialY);
    setRotationY(initialRot);
    setScale(initialScale);
    setError(null);
    setSaved(false);
  }, [islandId, initialX, initialY, initialRot, initialScale]);

  // broadcast live preview to the map every time any value changes
  useEffect(() => {
    if (!isOpen || !islandId) {
      onPreviewChange(null);
      return;
    }
    onPreviewChange({ islandId, coordX, coordY, rotationY, scale });
  }, [isOpen, islandId, coordX, coordY, rotationY, scale, onPreviewChange]);

  // clear preview when unmounted/closed
  useEffect(() => {
    return () => onPreviewChange(null);
  }, [onPreviewChange]);

  const handleSave = useCallback(async () => {
    if (!islandId) return;
    setSaving(true);
    setError(null);
    try {
      // db stores rotation_y in degrees — convert from radians before saving
      await updateIsland(islandId, {
        coordinate_x: parseFloat(coordX.toFixed(4)),
        coordinate_y: parseFloat(coordY.toFixed(4)),
        rotation_y:   parseFloat(((rotationY * 180) / Math.PI).toFixed(4)),
        scale:        parseFloat(scale.toFixed(4)),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved(); // triggers loadData → re-fetches from DB
    } catch (e: any) {
      setError(e.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }, [islandId, coordX, coordY, rotationY, scale, onSaved]);

  const handleCancel = useCallback(() => {
    onPreviewChange(null); // revert map to DB values
    onClose();
  }, [onClose, onPreviewChange]);

  if (!isOpen || !islandId) return null;

  const panel    = "bg-black/45 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl";
  const label    = "text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1 block";
  const valueBadge = "text-[10px] font-mono text-amber-300 ml-1.5";
  const iconBtn  = (extra = "") =>
    `w-8 h-8 rounded-lg border border-white/20 bg-white/10 hover:bg-white/25 text-white flex items-center justify-center active:scale-90 transition-all text-sm select-none cursor-pointer font-bold ${extra}`;
  const nudgeBtn = iconBtn("w-7 h-7 text-xs");
  const slider   = "flex-1 accent-amber-400 cursor-pointer h-1 rounded-full";

  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 z-[70] flex flex-col gap-2 w-[270px] pointer-events-auto">

      {/* Header */}
      <div className={`${panel} flex items-center justify-between px-3 py-2`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400 font-bold">⚙</span>
          <div>
            <p className="text-[10px] font-bold text-white leading-none">{islandName}</p>
            <p className="text-[9px] text-white/40 mt-0.5">Pré-visualização ativa</p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="w-6 h-6 rounded-md border border-white/15 bg-white/10 hover:bg-white/25 text-white/60 hover:text-white flex items-center justify-center text-xs cursor-pointer transition-all"
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
            <div className="w-7 h-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-[8px] text-white/30">✛</span>
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
            <span className="text-[9px] font-mono text-white/40 w-3">X</span>
            <input type="range" className={slider} min={0} max={100} step={0.5}
              value={coordX} onChange={e => setCoordX(Number(e.target.value))} />
            <span className="text-[9px] font-mono text-amber-300 w-9 text-right">{coordX.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/40 w-3">Y</span>
            <input type="range" className={slider} min={0} max={100} step={0.5}
              value={coordY} onChange={e => setCoordY(Number(e.target.value))} />
            <span className="text-[9px] font-mono text-amber-300 w-9 text-right">{coordY.toFixed(1)}%</span>
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
            className="flex-1 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-[11px] font-semibold cursor-pointer transition-all disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-all disabled:opacity-40
              ${saved
                ? "border-green-400/60 bg-green-500/20 text-green-300"
                : "border-amber-400/60 bg-amber-500/20 hover:bg-amber-500/35 text-amber-200"
              }`}
          >
            {saving ? "Salvando…" : saved ? "✓ Salvo!" : "✓ Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
