"use client"

import React, { useMemo, useRef } from "react"
import type { Island } from "@/types/api"

export interface MinimapProps {
  islands: Island[]
  activeIslandId: number | null
  offset: { x: number; y: number }
  viewportSize: { width: number; height: number }
  mapWidth: number
  scale: number
  onMinimapClick: (mapX: number, mapY: number) => void
}

export function Minimap({
  islands = [],
  activeIslandId = null,
  offset,
  viewportSize,
  mapWidth,
  scale = 1,
  onMinimapClick,
}: MinimapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const MINIMAP_WIDTH = 220
  const MINIMAP_HEIGHT = 140
  const SCALE = mapWidth / MINIMAP_WIDTH

  // coordenadas e dimensões do indicador de visão da tela
  const viewportFrame = useMemo(() => {
    const activeMapW = viewportSize.width / scale
    const activeMapH = viewportSize.height / scale

    const w = Math.min(MINIMAP_WIDTH, activeMapW / SCALE)
    const h = Math.min(MINIMAP_HEIGHT, activeMapH / SCALE)

    const activeMapX = -offset.x / scale
    const activeMapY = -offset.y / scale

    const x = Math.max(0, Math.min(MINIMAP_WIDTH - w, activeMapX / SCALE))
    const y = Math.max(0, Math.min(MINIMAP_HEIGHT - h, activeMapY / SCALE))

    return { x, y, w, h }
  }, [offset, viewportSize, SCALE, scale])

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const targetMapX = clickX * SCALE
    const targetMapY = clickY * SCALE

    onMinimapClick(targetMapX, targetMapY)
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="absolute bottom-6 right-6 w-[220px] h-[140px] rounded-xl border border-border/70 shadow-2xl bg-background/80 backdrop-blur-md z-20 cursor-crosshair overflow-hidden transition-all duration-300 hover:border-primary/50 select-none group"
    >
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${MINIMAP_WIDTH} ${MINIMAP_HEIGHT}`}
      >

        {islands.map((island) => {
          const xPct = island.coordinates?.x ?? island.coordinate_x ?? 50
          const yPct = island.coordinates?.y ?? island.coordinate_y ?? 50
          const mx = (xPct / 100) * MINIMAP_WIDTH
          const my = (yPct / 100) * MINIMAP_HEIGHT
          const isSelected = activeIslandId === island.id

          return (
            <g key={island.id} className="transition-all duration-300">
              {isSelected && (
                <circle
                  cx={mx}
                  cy={my}
                  r="6"
                  className="fill-primary/20 stroke-primary/40 animate-ping origin-center"
                  style={{ transformOrigin: `${mx}px ${my}px` }}
                />
              )}
              <circle
                cx={mx}
                cy={my}
                r={isSelected ? "4.5" : "3.5"}
                className={`transition-all duration-300 
                  ${isSelected 
                    ? "fill-primary stroke-background stroke-2" 
                    : "fill-foreground/35 stroke-border/50 group-hover:fill-foreground/60"
                  }`}
              />
            </g>
          )
        })}
      </svg>

      <div
        className="absolute border-2 border-primary bg-primary/10 rounded pointer-events-none transition-all duration-200"
        style={{
          left: `${viewportFrame.x}px`,
          top: `${viewportFrame.y}px`,
          width: `${viewportFrame.w}px`,
          height: `${viewportFrame.h}px`,
        }}
      />

      <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-muted/30 border border-border/20 text-[9px] font-bold text-muted-foreground/60 select-none uppercase tracking-wider">
        Minimap
      </div>
    </div>
  )
}
