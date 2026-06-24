'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useMapViewport } from '@/hooks/use-map-viewport'
import { useDashboardData } from '@/hooks/use-dashboard-data'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { IslandPlaceholder } from '@/components/island-placeholder'
import { Minimap } from '@/components/minimap'
import { IslandDetailsModal } from '@/components/island-details-modal'
import { CharacterCarouselModal } from '@/components/character-carousel-modal'

import { Ship } from 'lucide-react'

const MAP_WIDTH = 2600
const MAP_HEIGHT = 1600

const ROUTE_NODES = [
  { id: 1, name: "Vila Foosha", arcId: 1, x: 83.30, y: 26.94, exists: true },
  { id: 2, name: "Shells Town", arcId: 1, x: 71.20, y: 18.10, exists: true },
  { id: 3, name: "Orange Town", arcId: 2, x: 44.94, y: 39.64, exists: true },
  { id: 4, name: "Ilha Gecko", arcId: 3, x: 21.60, y: 47.50, exists: true },
  { id: 5, name: "Baratie", arcId: 4, x: 16.32, y: 78.00, exists: true },
]

const ROUTE_SEGMENTS = [
  {
    fromId: 1,
    toId: 2,
    toArcId: 1,
    d: "M2165.73 431.02 C2137.51 434.22, 2048.93 447.71, 2006.14 436.25 C1963.36 424.79, 1934.83 386.70, 1909.02 362.26 C1883.21 337.82, 1862.53 299.39, 1851.28 289.62"
  },
  {
    fromId: 2,
    toId: 3,
    toArcId: 2,
    d: "C1834.04 307.31, 1806.77 349.71, 1778.64 374.95 C1750.50 400.19, 1732.26 413.85, 1682.47 441.06 C1632.68 468.27, 1565.56 505.98, 1479.89 538.19 C1394.21 570.39, 1225.47 614.78, 1168.43 634.26"
  },
  {
    fromId: 3,
    toId: 4,
    toArcId: 3,
    d: "C1122.84 654.99, 998.59 720.99, 907.66 743.38 C816.73 765.77, 680.53 765.84, 622.85 768.60 C565.17 771.36, 573.93 758.86, 561.60 759.96"
  },
  {
    fromId: 4,
    toId: 5,
    toArcId: 4,
    d: "C542.45 793.22, 514.16 818.21, 491.30 899.55 C468.43 980.90, 442.99 1179.97, 424.41 1248.04"
  }
]

const TOTAL_CURVED_PATH = "M2165.73 431.02 C2137.51 434.22, 2048.93 447.71, 2006.14 436.25 C1963.36 424.79, 1934.83 386.70, 1909.02 362.26 C1883.21 337.82, 1862.53 299.39, 1851.28 289.62 C1834.04 307.31, 1806.77 349.71, 1778.64 374.95 C1750.50 400.19, 1732.26 413.85, 1682.47 441.06 C1632.68 468.27, 1565.56 505.98, 1479.89 538.19 C1394.21 570.39, 1225.47 614.78, 1168.43 634.26 C1122.84 654.99, 998.59 720.99, 907.66 743.38 C816.73 765.77, 680.53 765.84, 622.85 768.60 C565.17 771.36, 573.93 758.86, 561.60 759.96 C542.45 793.22, 514.16 818.21, 491.30 899.55 C468.43 980.90, 442.99 1179.97, 424.41 1248.04"

const ISLAND_DISTANCE_MAPPING: Record<number, number> = {
  1: 0.00,
  2: 16.38,
  3: 50.27,
  4: 77.75,
  5: 100.00
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeArcId, setActiveArcId] = useState<number>(1)
  const [activeSagaId, setActiveSagaId] = useState<number | null>(null)
  const [activeIslandId, setActiveIslandId] = useState<number | null>(null)
  const [activeModal, setActiveModal] = useState<'details' | 'characters' | null>(null)
  const [sliderVal, setSliderVal] = useState(0)

  const {
    isNavigating,
    isLoadingData,
    error,
    isAdmin,
    sagas,
    arcs,
    islands,
    loadData,
    handleLogout,
  } = useDashboardData()

  // Get all route islands in chronological sequence order (always 5 islands)
  const allRouteIslands = useMemo(() => {
    const sequence = [1, 2, 3, 4, 5]
    return sequence
      .map(id => islands.find(isl => isl.id === id))
      .filter((isl): isl is NonNullable<typeof isl> => !!isl)
  }, [islands])

  const activeArc = useMemo(() => {
    return arcs.find((a) => a.id === activeArcId)
  }, [arcs, activeArcId])

  const activeArcOrder = activeArc ? activeArc.order : 1

  const getNodeArcOrder = useCallback((nodeArcId: number) => {
    const arc = arcs.find(a => a.id === nodeArcId)
    return arc ? arc.order : nodeArcId
  }, [arcs])

  const visibleNodes = useMemo(() => {
    return ROUTE_NODES.filter(node => {
      const nodeOrder = getNodeArcOrder(node.arcId)
      return nodeOrder <= activeArcOrder
    })
  }, [activeArcOrder, getNodeArcOrder])

  const visibleDbIslands = useMemo(() => {
    const ISLAND_ARC_MAPPING: Record<number, number> = {
      1: 1,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
    }
    return islands.filter((island) => {
      const islandArcId = ISLAND_ARC_MAPPING[island.id]
      if (!islandArcId) return false
      const nodeOrder = getNodeArcOrder(islandArcId)
      return nodeOrder <= activeArcOrder
    })
  }, [islands, activeArcOrder, getNodeArcOrder])

  // Interpolate boatDistance along the 5-island spline based on sliderVal
  const boatDistance = useMemo(() => {
    if (allRouteIslands.length === 0) return 0
    if (allRouteIslands.length === 1) return 0

    const idx = Math.floor(sliderVal)
    const fraction = sliderVal - idx

    if (idx >= allRouteIslands.length - 1) {
      const lastIsland = allRouteIslands[allRouteIslands.length - 1]
      return ISLAND_DISTANCE_MAPPING[lastIsland.id] ?? 0
    }

    const currentIsland = allRouteIslands[idx]
    const nextIsland = allRouteIslands[idx + 1]

    const dStart = ISLAND_DISTANCE_MAPPING[currentIsland.id] ?? 0
    const dEnd = ISLAND_DISTANCE_MAPPING[nextIsland.id] ?? 0

    return dStart + fraction * (dEnd - dStart)
  }, [sliderVal, allRouteIslands])

  const selectedIslandArcId = useMemo(() => {
    if (activeIslandId === null) return activeArcId
    const ISLAND_ARC_MAPPING: Record<number, number> = {
      1: 1,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
    }
    return ISLAND_ARC_MAPPING[activeIslandId] || activeArcId
  }, [activeIslandId, activeArcId])

  const {
    viewportRef,
    offset,
    scale,
    setScale,
    viewportSize,
    smoothTransition,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleMinimapNavigation,
  } = useMapViewport({
    activeIslandId,
    unlockedIslands: visibleDbIslands,
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
  })

  const routePathD = useMemo(() => {
    const activeSegments = ROUTE_SEGMENTS.filter(seg => {
      const segArcOrder = getNodeArcOrder(seg.toArcId)
      return segArcOrder <= activeArcOrder
    })
    return activeSegments.map(seg => seg.d).join(' ')
  }, [activeArcOrder, getNodeArcOrder])

  if (isNavigating || isLoadingData) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          Carregando dados do banco...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background gap-4 px-4 text-center">
        <div className="text-red-500 text-5xl mb-2">⚠️</div>
        <h2 className="text-xl font-semibold text-foreground">Erro de Carregamento</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error}
        </p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all text-sm font-medium"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <main
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className={`absolute inset-0 z-10 overflow-hidden select-none outline-none
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-primary/10 pointer-events-none" />

        <div
          className="relative origin-top-left"
          style={{
            width: `${MAP_WIDTH}px`,
            height: `${MAP_HEIGHT}px`,
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transition: smoothTransition ? 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
          }}
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:100px_100px]" />



          {/* Animated Boat */}
          <div
            className="absolute pointer-events-none z-30"
            style={{
              width: "48px",
              height: "48px",
              left: "-24px",
              top: "-24px",
              offsetPath: `path("${TOTAL_CURVED_PATH}")`,
              offsetDistance: `${boatDistance}%`,
              offsetRotate: "auto 180deg",
              transition: "offset-distance 2.5s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center bg-primary/20 backdrop-blur-sm rounded-full border border-primary/50 shadow-lg shadow-primary/20">
              <Ship className="w-6 h-6 text-primary fill-primary/10 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Active and Past visible nodes along the route */}
          {visibleNodes.map((node) => {
            const px = (node.x / 100) * MAP_WIDTH
            const py = (node.y / 100) * MAP_HEIGHT

            // Check if the island exists in the database
            const dbIsland = islands.find(i => i.id === node.id)

            if (dbIsland) {
              const isSelected = activeIslandId === dbIsland.id
              const matchesSearch = !searchQuery || dbIsland.name.toLowerCase().includes(searchQuery.toLowerCase())
              const isHighlighted = isSelected || (!activeIslandId && matchesSearch)

              const sizes: Array<'sm' | 'md' | 'lg'> = ['lg', 'sm', 'md', 'md']
              const currentSize = sizes[dbIsland.id % sizes.length]

              const isFromCurrentArc = node.arcId === activeArcId

              return (
                <IslandPlaceholder
                  key={`island-${dbIsland.id}`}
                  size={currentSize}
                  name={dbIsland.name}
                  highlighted={isHighlighted}
                  selected={isSelected}
                  onClick={() => {
                    setActiveIslandId(dbIsland.id)
                    setActiveModal('details')
                  }}
                  className="absolute transition-all duration-500"
                  style={{
                    left: `${px}px`,
                    top: `${py}px`,
                    opacity: isSelected ? 1 : isHighlighted ? (isFromCurrentArc ? 1 : 0.9) : 0.65,
                    transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.15)' : 'scale(1)'}`,
                  }}
                />
              )
            } else {
              // Planned node in past/current arc that does not exist in DB yet
              return (
                <div
                  key={`planned-${node.id}`}
                  className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 group animate-fade-in"
                  style={{
                    left: `${px}px`,
                    top: `${py}px`,
                  }}
                >
                  <div 
                    onClick={() => {
                      alert(`Exploração Futura: O território de ${node.name} ainda não foi mapeado nesta jornada.`);
                    }}
                    className="w-10 h-10 rounded-full border-2 border-dashed border-primary/40 bg-background/50 flex items-center justify-center transition-all duration-300 cursor-pointer hover:border-primary hover:bg-primary/5 hover:scale-105 shadow-md"
                    title="Marcador de Posicionamento (Pendente no Banco)"
                  >
                    <span className="text-[10px] text-primary/60 font-mono">🛠️</span>
                  </div>

                  <span className="mt-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 transition-colors group-hover:text-primary/80 select-none">
                    {node.name}
                  </span>
                </div>
              )
            }
          })}
        </div>

        <div className="absolute bottom-16 left-6 z-20 pointer-events-none select-none">
          <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase opacity-40">
            Navegação Livre
          </p>
          <h2 className="text-xl font-bold text-foreground opacity-50">
            Mapa da Grand Line
          </h2>
        </div>
      </main>

      <Header
        isAdmin={isAdmin}
        sagas={sagas}
        arcs={arcs}
        islands={islands}
        searchQuery={searchQuery}
        activeSagaId={activeSagaId}
        activeArcId={activeArcId}
        activeIslandId={activeIslandId}
        onSearchChange={setSearchQuery}
        onSagaSelect={id => setActiveSagaId(id ? Number(id) : null)}
        onArcSelect={id => { if (id) setActiveArcId(Number(id)) }}
        onIslandSelect={id => {
          setActiveIslandId(id ? Number(id) : null)
          setActiveModal(null)
        }}
        onLogout={handleLogout}
      />

      <div className="absolute bottom-[172px] right-6 flex flex-col gap-2 z-20">
        <button
          onClick={() => setScale(prev => Math.min(1.3, parseFloat((prev + 0.1).toFixed(2))))}
          className="w-9 h-9 rounded-lg border border-border/40 bg-background/80 backdrop-blur-md text-foreground flex items-center justify-center shadow-lg transition-all hover:bg-muted active:scale-95 text-base font-bold select-none cursor-pointer"
          title="Aumentar Zoom"
        >
          ＋
        </button>
        <button
          onClick={() => setScale(prev => Math.max(0.7, parseFloat((prev - 0.1).toFixed(2))))}
          className="w-9 h-9 rounded-lg border border-border/40 bg-background/80 backdrop-blur-md text-foreground flex items-center justify-center shadow-lg transition-all hover:bg-muted active:scale-95 text-base font-bold select-none cursor-pointer"
          title="Diminuir Zoom"
        >
          －
        </button>
      </div>

      <Minimap
        islands={visibleDbIslands}
        activeIslandId={activeIslandId}
        offset={offset}
        viewportSize={viewportSize}
        mapWidth={MAP_WIDTH}
        mapHeight={MAP_HEIGHT}
        scale={scale}
        onMinimapClick={handleMinimapNavigation}
      />

      <Footer
        activeIslandId={activeIslandId}
        visibleIslands={allRouteIslands}
        arcs={arcs}
        onIslandSelect={(id) => {
          setActiveIslandId(id)
          setActiveModal(null)
          const ISLAND_ARC_MAPPING: Record<number, number> = {
            1: 1,
            2: 1,
            3: 2,
            4: 3,
            5: 4,
          }
          const arcId = ISLAND_ARC_MAPPING[id]
          if (arcId) {
            setActiveArcId(arcId)
          }
        }}
        sliderVal={sliderVal}
        onSliderChange={(val) => {
          setSliderVal(val)
          setActiveModal(null)
        }}
      />

      {activeIslandId !== null && (
        <>
          <IslandDetailsModal
            isOpen={activeModal === 'details'}
            islandId={activeIslandId}
            arcId={selectedIslandArcId}
            onClose={() => setActiveIslandId(null)}
            onNavigateToCharacters={() => setActiveModal('characters')}
          />
          <CharacterCarouselModal
            isOpen={activeModal === 'characters'}
            islandId={activeIslandId}
            arcId={selectedIslandArcId}
            onClose={() => setActiveIslandId(null)}
            onBackToIsland={() => setActiveModal('details')}
          />
        </>
      )}
    </div>
  )
}
