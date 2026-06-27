'use client'

import React from 'react'
import type { Arc, Island } from '@/types/api'

export interface FooterProps {
  className?: string
  activeIslandId: number | null
  visibleIslands: Island[]
  arcs: Arc[]
  onIslandSelect: (id: number) => void
  sliderVal: number
  onSliderChange: (val: number) => void
}

export function Footer({
  className = '',
  activeIslandId,
  visibleIslands = [],
  arcs = [],
  onIslandSelect,
  sliderVal,
  onSliderChange
}: FooterProps) {
  const ISLAND_ARC_MAPPING: Record<number, number> = {
    1: 1, // vila foosha -> romance dawn
    2: 1, // shells town -> romance dawn
    3: 2, // orange town -> orange town
    4: 3, // ilha gecko -> syrup village
    5: 4, // baratie -> baratie
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    onSliderChange(val)
  }

  const handleSliderRelease = () => {
    const closestIdx = Math.round(sliderVal)
    const closestIsland = visibleIslands[closestIdx]
    if (closestIsland) {
      onIslandSelect(closestIsland.id)
    }
  }

  const progressPercent =
    visibleIslands.length > 1 ? (sliderVal / (visibleIslands.length - 1)) * 100 : 0

  // calcula as informações da ilha mais próxima para o tooltip
  const closestIdx = Math.round(sliderVal)
  const closestIsland = visibleIslands[closestIdx]
  const closestArc = closestIsland ? arcs.find(a => a.id === ISLAND_ARC_MAPPING[closestIsland.id]) : null

  return (
    <footer
      className={`absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 max-w-5xl mx-auto w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] rounded-xl border border-border/40 shadow-lg bg-background/80 backdrop-blur-md z-30 transition-all duration-300 ${className}`}
    >
      <div className="px-5 py-2.5">
        <div className="flex items-center gap-4 w-full h-11">
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              JORNADA:
            </span>
          </div>

          <div className="flex-1 relative flex items-center h-full px-4">
            {/* trilha base */}
            <div className="absolute left-4 right-4 h-[2px] bg-border/40 rounded-full pointer-events-none" />

            {/* trilha de progresso ativa */}
            <div
              className="absolute left-4 h-[2px] bg-primary/40 rounded-full pointer-events-none transition-all duration-75"
              style={{
                width: `calc(${progressPercent}% - ${(progressPercent / 100) * 32}px)`
              }}
            />

            {/* controle deslizante */}
            <div className="relative w-full flex items-center h-8">
              {/* tooltip flutuante */}
              {closestIsland && (
                <div
                  className="absolute bottom-9 whitespace-nowrap text-[10px] md:text-[11px] font-bold tracking-tight rounded-md px-2 py-0.5 md:py-1 bg-background/95 border border-primary/20 shadow-lg text-primary pointer-events-none -translate-x-1/2 z-30 transition-all"
                  style={{
                    left: `${progressPercent}%`,
                    transform: `translateX(-50%) translateY(0)`,
                  }}
                >
                  {closestArc && closestArc.sagaName
                    ? `${closestArc.sagaName.toUpperCase()} • ${closestArc.name} • ${closestIsland.name}`
                    : closestIsland.name}
                </div>
              )}

              <input
                type="range"
                min={0}
                max={visibleIslands.length > 1 ? visibleIslands.length - 1 : 0}
                step={0.01}
                value={sliderVal}
                onChange={handleSliderChange}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                className="appearance-none bg-transparent outline-none cursor-pointer w-full h-8 relative z-25
                  [&::-webkit-slider-runnable-track]:bg-transparent
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-8
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.15)]
                  [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:scale-105
                  [&::-webkit-slider-thumb]:active:scale-95
                  
                  [&::-moz-range-track]:bg-transparent
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:w-8
                  [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-primary
                  [&::-moz-range-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.15)]
                  [&::-moz-range-thumb]:transition-all
                  [&::-moz-range-thumb]:hover:scale-105
                  [&::-moz-range-thumb]:active:scale-95"
              />

              {/* marcadores das ilhas */}
              <div className="absolute left-4 right-4 top-0 bottom-0 pointer-events-none z-10">
                {visibleIslands.map((island, index) => {
                  const pct =
                    visibleIslands.length > 1
                      ? (index / (visibleIslands.length - 1)) * 100
                      : 0
                  const distance = Math.abs(sliderVal - index)
                  const isNear = distance <= 0.35

                  return (
                    <div
                      key={island.id}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center animate-fade-in"
                      style={{ left: `${pct}%` }}
                    >
                      <div
                        className={`rounded-full transition-all duration-300 ${
                          isNear
                            ? 'w-3 h-3 bg-primary ring-4 ring-primary/15 scale-110'
                            : 'w-2.5 h-2.5 bg-background border-2 border-border/80 scale-95'
                        }`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
