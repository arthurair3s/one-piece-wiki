'use client'

import React from 'react'
import type { Arc } from '@/types/api'

export interface FooterProps {
  className?: string
  activeArcId?: number
  arcs?: Arc[]
  onArcClick?: (id: number) => void
}

export function Footer({
  className = '',
  activeArcId = 1,
  arcs = [],
  onArcClick
}: FooterProps) {
  // Caso os arcos reais não estejam carregados ou vazios, usa os fallbacks estáticos realistas do One Piece
  const fallbackArcs = [
    { id: 1, name: 'Romance Dawn' },
    { id: 2, name: 'Shells Town' },
    { id: 3, name: 'Orange Town' }
  ]

  const currentArcs = arcs && arcs.length > 0 ? arcs : fallbackArcs

  const activeIndex = currentArcs.findIndex(arc => arc.id === activeArcId)
  const initialSliderVal = activeIndex >= 0 ? activeIndex : 0

  const [sliderVal, setSliderVal] = React.useState<number>(initialSliderVal)

  // Sincroniza o slider local quando o arco ativo mudar externamente (ex: selects no header)
  React.useEffect(() => {
    const idx = currentArcs.findIndex(arc => arc.id === activeArcId)
    if (idx >= 0) {
      setSliderVal(idx)
    }
  }, [activeArcId, currentArcs])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setSliderVal(val)

    // Identifica o arco mais próximo pelo arredondamento matemático
    const closestIdx = Math.round(val)
    const closestArc = currentArcs[closestIdx]
    if (closestArc && closestArc.id !== activeArcId) {
      onArcClick && onArcClick(closestArc.id)
    }
  }

  const progressPercent =
    currentArcs.length > 1 ? (sliderVal / (currentArcs.length - 1)) * 100 : 0

  return (
    <footer
      className={`absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 max-w-5xl mx-auto w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] rounded-xl border border-border/40 shadow-lg bg-background/80 backdrop-blur-md z-30 transition-all duration-300 ${className}`}
    >
      <div className="px-5 py-2.5">
        <div className="flex items-center gap-4 w-full h-11">
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              TIMELINE:
            </span>
          </div>

          {/* Área da Timeline e Marcadores */}
          <div className="flex-1 relative flex items-center h-full px-4">
            {/* Linha Horizontal Fina de Fundo (Track Estático) */}
            <div className="absolute left-4 right-4 h-[2px] bg-border/40 rounded-full pointer-events-none" />

            {/* Linha Horizontal de Progresso Ativo Dinamicamente Compensada para o Thumb (32px de largura / 16px de raio) */}
            <div
              className="absolute left-4 h-[2px] bg-primary/40 rounded-full pointer-events-none transition-all duration-75"
              style={{
                width: `calc(${progressPercent}% - ${(progressPercent / 100) * 32}px)`
              }}
            />

            {/* O Slider de Range Interativo com o Thumb Customizado (Pílula da Cor da Identidade) */}
            <div className="relative w-full flex items-center h-8">
              <input
                type="range"
                min={0}
                max={currentArcs.length - 1}
                step={0.01}
                value={sliderVal}
                onChange={handleSliderChange}
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

              {/* Pontos de História Absolutos com Revelação Sob Proximidade */}
              <div className="absolute left-4 right-4 top-0 bottom-0 pointer-events-none z-10">
                {currentArcs.map((arc, index) => {
                  const pct =
                    currentArcs.length > 1
                      ? (index / (currentArcs.length - 1)) * 100
                      : 0
                  const distance = Math.abs(sliderVal - index)
                  const isNear = distance <= 0.35 // A pílula passou por cima!

                  return (
                    <div
                      key={arc.id}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center animate-fade-in"
                      style={{ left: `${pct}%` }}
                    >
                      {/* Nome do Arco - Flutua e clareia apenas quando perto da pílula */}
                      <span
                        className={`absolute bottom-5 whitespace-nowrap text-[10px] font-bold tracking-tight rounded-md px-1.5 py-0.5 bg-background/95 border border-border/40 shadow-sm transition-all duration-300 ${
                          isNear
                            ? 'opacity-100 translate-y-0 scale-100 text-primary border-primary/20'
                            : 'opacity-0 translate-y-1 scale-75'
                        }`}
                      >
                        {arc.name}
                      </span>

                      {/* Pontinho Discreto da Linha */}
                      <div
                        className={`rounded-full transition-all duration-300 ${
                          isNear
                            ? 'w-2.5 h-2.5 bg-primary ring-2 ring-primary/20 scale-110'
                            : 'w-1 h-1 bg-border/80 scale-90'
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
