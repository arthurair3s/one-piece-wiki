"use client";

import React, { useState, useEffect, useRef } from "react";

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

interface TopographicViewerProps {
  name: string;
}

export function TopographicViewer({ name }: TopographicViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [yaw, setYaw] = useState<number>(0.6); 
  const [pitch, setPitch] = useState<number>(0.8); 
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const points = React.useMemo(() => {
    const grid: { x: number; y: number; z: number }[] = [];
    const size = 11;
    
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

    let animationId = 0;

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

      const primaryColor = getThemeColor("text-primary", "#E2B53E");
      const foregroundColor = getThemeColor("text-foreground", "#1E293B");
      const mutedColor = getThemeColor("text-muted-foreground", "#64748B");
      const borderColor = getThemeColor("border-border", "#CBD5E1");

      const hexToRgba = (hex: string, alpha: number) => {
        if (hex.startsWith("rgb")) {
          return hex.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
        }
        return hex;
      };

      ctx.strokeStyle = hexToRgba(borderColor, 0.4);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(1.2, 1.2 * Math.sin(pitch));
      ctx.arc(0, 0, 70, 0, Math.PI * 2);
      ctx.restore();
      ctx.stroke();

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

      const size = 11;
      ctx.lineWidth = 1;

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
