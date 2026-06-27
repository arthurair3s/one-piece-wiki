'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { useMapCamera, MAP_WIDTH } from '@/hooks/use-map-camera'
import { useDashboardData } from '@/hooks/use-dashboard-data'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { GrandLineMap3D } from '@/components/map-3d/grand-line-map-3d'
import { Minimap } from '@/components/layout/minimap'
import { IslandDetailsModal } from '@/components/modals/island-details-modal'
import { CharacterCarouselModal } from '@/components/modals/character-carousel-modal'
import { IslandConfigModal, type IslandPreview } from '@/components/modals/island-config-modal'

// posições padrão usadas como fallback quando a ilha não possui coordenadas no banco de dados
const ROUTE_NODES = [
  { id: 1, name: "Vila Foosha", arcId: 1, x: 89.3, y: 35.9 },
  { id: 2, name: "Shells Town", arcId: 1, x: 65.2, y: 9.1 },
  { id: 3, name: "Orange Town", arcId: 2, x: 44.9, y: 39.6 },
  { id: 4, name: "Ilha Gecko",  arcId: 3, x: 16.0, y: 37.5 },
  { id: 5, name: "Baratie",     arcId: 4, x: 4.3,  y: 81.0 },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery]   = useState('')
  const [activeArcId, setActiveArcId]   = useState<number>(1)
  const [activeSagaId, setActiveSagaId] = useState<number | null>(null)
  const [activeIslandId, setActiveIslandId] = useState<number | null>(null)
  const [activeModal, setActiveModal]   = useState<'details' | 'characters' | 'config' | null>(null)
  const [sliderVal, setSliderVal]       = useState(0)

  // sobreposição para visualização em tempo real — aplicada ao mapa antes de salvar
  const [configPreview, setConfigPreview] = useState<IslandPreview | null>(null)

  const isDragging = useRef(false)

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

  /**
   * Merge live preview values over the raw DB island data so the 3D map
   * reflects changes instantly. Rotation_y is kept in degrees inside the
   * Island type (matching DB), but the preview stores it in radians for
   * the map renderer. We convert here.
   */
  const mergedIslands = useMemo(() => {
    if (!configPreview) return islands
    return islands.map(isl => {
      if (isl.id !== configPreview.islandId) return isl
      const rotDeg = parseFloat(((configPreview.rotationY * 180) / Math.PI).toFixed(4))
      return {
        ...isl,
        coordinates: {
          x: configPreview.coordX,
          y: configPreview.coordY,
          z: isl.coordinates?.z ?? 0,
        },
        coordinate_x: configPreview.coordX,
        coordinate_y: configPreview.coordY,
        rotation_y:   rotDeg,
        scale:         configPreview.scale,
      }
    })
  }, [islands, configPreview])

  // nós de rotas dinâmicas: lidos a partir de mergedIslands para atualizar também a rota do barco
  const currentNodes = useMemo(() => {
    return ROUTE_NODES.map(node => {
      const dbIsland = mergedIslands.find(isl => isl.id === node.id)
      return {
        ...node,
        x: dbIsland?.coordinates?.x ?? dbIsland?.coordinate_x ?? node.x,
        y: dbIsland?.coordinates?.y ?? dbIsland?.coordinate_y ?? node.y,
      }
    })
  }, [mergedIslands])

  const allRouteIslands = useMemo(() => {
    return [1, 2, 3, 4, 5]
      .map(id => mergedIslands.find(isl => isl.id === id))
      .filter((isl): isl is NonNullable<typeof isl> => !!isl)
  }, [mergedIslands])

  const activeArc      = useMemo(() => arcs.find((a) => a.id === activeArcId), [arcs, activeArcId])
  const activeArcOrder = activeArc ? activeArc.order : 1

  const getNodeArcOrder = useCallback((nodeArcId: number) => {
    const arc = arcs.find(a => a.id === nodeArcId)
    return arc ? arc.order : nodeArcId
  }, [arcs])

  const visibleNodes = useMemo(() => {
    return currentNodes.filter(node => {
      const nodeOrder = getNodeArcOrder(node.arcId)
      return nodeOrder <= activeArcOrder
    })
  }, [currentNodes, activeArcOrder, getNodeArcOrder])

  const visibleDbIslands = useMemo(() => {
    const ISLAND_ARC_MAPPING: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 4 }
    return mergedIslands.filter((island) => {
      const islandArcId = ISLAND_ARC_MAPPING[island.id]
      if (!islandArcId) return false
      return getNodeArcOrder(islandArcId) <= activeArcOrder
    })
  }, [mergedIslands, activeArcOrder, getNodeArcOrder])

  const selectedIslandArcId = useMemo(() => {
    if (activeIslandId === null) return activeArcId
    const MAP: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 4 }
    return MAP[activeIslandId] || activeArcId
  }, [activeIslandId, activeArcId])

  const {
    viewportRef,
    camera,
    offset,
    scale,
    viewportSize,
    smoothTransition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleMinimapNavigation,
    zoomIn,
    zoomOut,
  } = useMapCamera({
    activeIslandId,
    unlockedIslands: visibleDbIslands,
  })

  const handleMouseDownWrapped = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    handleMouseDown(e)
  }, [handleMouseDown])

  const handleMouseUpWrapped = useCallback(() => {
    isDragging.current = false
    handleMouseUp()
  }, [handleMouseUp])

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
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        <button
          onClick={() => loadData()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all text-sm font-medium"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  // propriedades para o modal de configuração: lidas diretamente da ilha bruta do banco (não mesclada) para manter valores persistidos
  const activeIslandDb    = islands.find(isl => isl.id === activeIslandId)
  const activeNodeDefaults = currentNodes.find(n => n.id === activeIslandId)

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#6db8d8]">
      <div ref={viewportRef} className="absolute inset-0">
        <GrandLineMap3D
          camera={camera}
          smooth={smoothTransition}
          // eslint-disable-next-line react-hooks/refs
          isDragging={isDragging.current}
          visibleNodes={visibleNodes}
          islands={mergedIslands}
          activeIslandId={activeIslandId}
          activeArcId={activeArcId}
          searchQuery={searchQuery}
          onIslandClick={(id) => {
            setActiveIslandId(id)
            setActiveModal(isAdmin ? 'config' : 'details')
          }}
          onMouseDown={handleMouseDownWrapped}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpWrapped}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        />
      </div>

      {/* Map title overlay */}
      <div className="absolute bottom-[172px] left-6 z-20 pointer-events-none select-none rounded-xl border border-border/60 bg-background/80 backdrop-blur-md px-4 py-2.5 shadow-lg max-w-[200px]">
        <span className="text-[8px] font-bold text-primary-foreground bg-primary px-1.5 py-0.5 rounded uppercase tracking-wider mb-1.5 inline-block">Navegação Livre</span>
        <h2 className="text-sm font-bold text-foreground">Mapa da Grand Line</h2>
      </div>

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

      {/* Zoom controls */}
      <div className="absolute bottom-[172px] right-6 flex flex-col gap-2 z-20">
        <button onClick={zoomIn}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80 hover:bg-muted text-foreground size-9 transition-all outline-none select-none shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
          title="Aumentar Zoom">＋</button>
        <button onClick={zoomOut}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80 hover:bg-muted text-foreground size-9 transition-all outline-none select-none shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
          title="Diminuir Zoom">－</button>
      </div>

      <Minimap
        islands={visibleDbIslands}
        activeIslandId={activeIslandId}
        offset={offset}
        viewportSize={viewportSize}
        mapWidth={MAP_WIDTH}
        scale={scale}
        onMinimapClick={handleMinimapNavigation}
      />

      <Footer
        visibleIslands={allRouteIslands}
        arcs={arcs}
        onIslandSelect={(id) => {
          setActiveIslandId(id)
          setActiveModal(null)
          const MAP: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 4 }
          const arcId = MAP[id]
          if (arcId) setActiveArcId(arcId)
        }}
        sliderVal={sliderVal}
        onSliderChange={(val) => {
          setSliderVal(val)
          setActiveModal(null)
        }}
      />

      {/* Admin: Island config HUD */}
      {isAdmin && activeIslandId !== null && (
        <IslandConfigModal
          isOpen={activeModal === 'config'}
          islandId={activeIslandId}
          islandName={activeIslandDb?.name ?? ''}
          coordX={activeIslandDb?.coordinates?.x ?? activeIslandDb?.coordinate_x ?? activeNodeDefaults?.x ?? 50}
          coordY={activeIslandDb?.coordinates?.y ?? activeIslandDb?.coordinate_y ?? activeNodeDefaults?.y ?? 50}
          rotationY={((activeIslandDb?.rotation_y ?? -180) * Math.PI) / 180}
          scale={activeIslandDb?.scale ?? 1.0}
          onClose={() => {
            setConfigPreview(null)
            setActiveIslandId(null)
          }}
          onSaved={async () => {
            // atualização silenciosa: recarrega sem indicador visual, aguardando novos dados antes de limpar o preview
            await loadData(true)
            setConfigPreview(null)
          }}
          onPreviewChange={setConfigPreview}
        />
      )}

      {/* Public modals */}
      {activeIslandId !== null && (
        <>
          <IslandDetailsModal
            isOpen={activeModal === 'details'}
            islandId={activeIslandId}
            arcId={selectedIslandArcId}
            modelUrl={activeIslandDb?.model_url}
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
