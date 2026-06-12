'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie, deleteCookie } from '@/lib/cookies'
import { fetchDashboardData } from './_service'
import { DASHBOARD_CONFIG } from './_configuration'
import { useSync } from '@/components/providers/sync-provider'
import type { Saga, Arc, Island } from '@/types/api'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { IslandPlaceholder } from '@/components/island-placeholder'
import { Minimap } from '@/components/minimap'

const MAP_WIDTH = 2200
const MAP_HEIGHT = 1400

export default function HomePage() {
  const router = useRouter()
  const viewportRef = useRef<HTMLDivElement>(null)

  const [isNavigating, setIsNavigating] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeArcId, setActiveArcId] = useState<number>(1)
  const [activeSagaId, setActiveSagaId] = useState<number | null>(null)
  const [activeIslandId, setActiveIslandId] = useState<number | null>(null)

  const { isOutOfSync, resolveSync } = useSync()

  const [sagas, setSagas] = useState<Saga[]>([])
  const [arcs, setArcs] = useState<Arc[]>([])
  const [islands, setIslands] = useState<Island[]>([])

  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1.0)
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 800 })
  const [smoothTransition, setSmoothTransition] = useState(false)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const dragOffsetStart = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const token = getCookie('token')
    if (!token) {
      router.push(DASHBOARD_CONFIG.loginUrl)
      return
    }

    const profile = getCookie('user_profile')
    setIsAdmin(profile === 'ADMIN')

    const hasLoaded = sessionStorage.getItem('dashboard_loaded')
    if (hasLoaded !== 'true') {
      router.push(DASHBOARD_CONFIG.loadingScreenUrl)
      return
    }

    setIsNavigating(false)
  }, [router])

  // Limite de translação (Clamping) adaptado para a escala (zoom)
  const clampOffset = useCallback((x: number, y: number, vw: number, vh: number, currentScale: number) => {
    const effWidth = MAP_WIDTH * currentScale
    const effHeight = MAP_HEIGHT * currentScale

    const minX = vw >= effWidth ? -(effWidth - vw) / 2 : -(effWidth - vw)
    const maxX = vw >= effWidth ? -(effWidth - vw) / 2 : 0
    const minY = vh >= effHeight ? -(effHeight - vh) / 2 : -(effHeight - vh)
    const maxY = vh >= effHeight ? -(effHeight - vh) / 2 : 0

    const finalX = vw >= effWidth ? (vw - effWidth) / 2 : Math.max(minX, Math.min(maxX, x))
    const finalY = vh >= effHeight ? (vh - effHeight) / 2 : Math.max(minY, Math.min(maxY, y))

    return { x: finalX, y: finalY }
  }, [])

  useEffect(() => {
    if (isNavigating || isLoadingData) return

    const handleResize = () => {
      if (viewportRef.current) {
        setViewportSize({
          width: viewportRef.current.clientWidth,
          height: viewportRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [isNavigating, isLoadingData])

  useEffect(() => {
    if (!isNavigating && !isLoadingData && viewportRef.current) {
      const vw = viewportRef.current.clientWidth
      const vh = viewportRef.current.clientHeight
      const centerOffset = clampOffset(
        -(MAP_WIDTH / 2 - vw / 2),
        -(MAP_HEIGHT / 2 - vh / 2),
        vw,
        vh,
        1.0
      )
      setOffset(centerOffset)
    }
  }, [isNavigating, isLoadingData, clampOffset])

  // Evento nativo de Roda do Mouse (Wheel) para zoom suave não passivo
  useEffect(() => {
    if (isNavigating || isLoadingData) return

    const viewport = viewportRef.current
    if (!viewport) return

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault()
      const zoomStep = 0.05
      const direction = e.deltaY < 0 ? 1 : -1
      
      setScale((prev) => {
        const next = Math.max(0.7, Math.min(1.3, prev + direction * zoomStep))
        return parseFloat(next.toFixed(2))
      })
    }

    viewport.addEventListener('wheel', handleWheelEvent, { passive: false })
    return () => {
      viewport.removeEventListener('wheel', handleWheelEvent)
    }
  }, [isNavigating, isLoadingData])

  // Ajusta o offset da câmera quando a escala muda para manter o mapa dentro dos limites corretos
  useEffect(() => {
    if (!viewportRef.current) return
    const vw = viewportRef.current.clientWidth
    const vh = viewportRef.current.clientHeight
    setOffset((prev) => clampOffset(prev.x, prev.y, vw, vh, scale))
  }, [scale, clampOffset])

  const handleLogout = useCallback(() => {
    deleteCookie('token')
    deleteCookie('user_profile')
    sessionStorage.removeItem('dashboard_loaded')
    router.push(DASHBOARD_CONFIG.loginUrl)
  }, [router])

  const loadData = useCallback(async () => {
    setIsLoadingData(true)
    setError(null)
    const startTime = performance.now()

    try {
      const token = getCookie('token') || ''
      if (!token) {
        setIsLoadingData(false)
        return
      }

      const result = await fetchDashboardData()

      setSagas(result.sagas)
      setArcs(result.arcs)
      setIslands(result.islands)

      const duration = (performance.now() - startTime).toFixed(1)
      console.log(`[Dashboard] Dados carregados em ${duration}ms diretamente do banco.`)
    } catch (err: any) {
      console.error('Erro ao buscar dados do banco:', err)
      if (err.message === 'Unauthorized' || err.message?.includes('401')) {
        deleteCookie('token')
        deleteCookie('user_profile')
        sessionStorage.removeItem('dashboard_loaded')
        router.push(DASHBOARD_CONFIG.loginUrl)
        return
      }
      setError(err.message || 'Erro ao carregar dados do backend')
    } finally {
      setIsLoadingData(false)
    }
  }, [router])

  useEffect(() => {
    if (!isNavigating) {
      loadData()
    }
  }, [isNavigating, loadData])

  useEffect(() => {
    if (isOutOfSync) {
      loadData().then(() => {
        resolveSync()
      })
    }
  }, [isOutOfSync, resolveSync, loadData])

  const activeArc = useMemo(() => {
    return arcs.find((a) => a.id === activeArcId)
  }, [arcs, activeArcId])

  const activeArcOrder = activeArc ? activeArc.order : 1

  // Filtra as ilhas desbloqueadas com base no arco ativo (anti-spoiler)
  const unlockedIslands = useMemo(() => {
    /*
      TODO: Substituir o mapeamento estático abaixo por dados dinâmicos do backend.
      Isso deve ser feito adicionando o campo `arcIds: number[]` no retorno da query
      do endpoint `/islands/map` (GetIslandsMapHandler no NestJS) por meio de um
      eager join com a tabela de Arcos.
    */
    const ISLAND_ARC_MAPPING: Record<number, number> = {
      1: 1,
      2: 1,
      3: 2,
      4: 3,
    }

    return islands.filter((island) => {
      const islandArcId = ISLAND_ARC_MAPPING[island.id]
      if (!islandArcId) return true
      const islandArc = arcs.find((a) => a.id === islandArcId)
      if (!islandArc) return true
      return islandArc.order <= activeArcOrder
    })
  }, [islands, arcs, activeArcOrder])

  // Centralização automática ao selecionar uma ilha (via clique ou HUD)
  useEffect(() => {
    if (!activeIslandId || unlockedIslands.length === 0 || !viewportRef.current) return

    const island = unlockedIslands.find((i) => i.id === activeIslandId)
    if (!island) return

    const xPct = island.coordinates?.x ?? island.coordinate_x ?? 50
    const yPct = island.coordinates?.y ?? island.coordinate_y ?? 50

    const islandPxX = (xPct / 100) * MAP_WIDTH
    const islandPxY = (yPct / 100) * MAP_HEIGHT

    const vw = viewportRef.current.clientWidth
    const vh = viewportRef.current.clientHeight

    const targetX = -(islandPxX * scale - vw / 2)
    const targetY = -(islandPxY * scale - vh / 2)

    const centeredOffset = clampOffset(targetX, targetY, vw, vh, scale)

    setSmoothTransition(true)
    setOffset(centeredOffset)

    const timer = setTimeout(() => {
      setSmoothTransition(false)
    }, 700)

    return () => clearTimeout(timer)
  }, [activeIslandId, unlockedIslands, clampOffset, scale])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, [role="combobox"], a')) {
      return
    }
    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
    dragOffsetStart.current = { ...offset }
    setSmoothTransition(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !viewportRef.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y

    const vw = viewportRef.current.clientWidth
    const vh = viewportRef.current.clientHeight

    const newOffset = clampOffset(
      dragOffsetStart.current.x + dx,
      dragOffsetStart.current.y + dy,
      vw,
      vh,
      scale
    )
    setOffset(newOffset)
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, [role="combobox"], a')) {
      return
    }
    if (e.touches.length === 1) {
      isDragging.current = true
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      dragOffsetStart.current = { ...offset }
      setSmoothTransition(false)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !viewportRef.current || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - dragStart.current.x
    const dy = e.touches[0].clientY - dragStart.current.y

    const vw = viewportRef.current.clientWidth
    const vh = viewportRef.current.clientHeight

    const newOffset = clampOffset(
      dragOffsetStart.current.x + dx,
      dragOffsetStart.current.y + dy,
      vw,
      vh,
      scale
    )
    setOffset(newOffset)
  }

  const handleMinimapNavigation = useCallback((mapX: number, mapY: number) => {
    if (!viewportRef.current) return
    const vw = viewportRef.current.clientWidth
    const vh = viewportRef.current.clientHeight

    const targetX = -(mapX * scale - vw / 2)
    const targetY = -(mapY * scale - vh / 2)

    const newOffset = clampOffset(targetX, targetY, vw, vh, scale)

    setSmoothTransition(true)
    setOffset(newOffset)

    const timer = setTimeout(() => {
      setSmoothTransition(false)
    }, 700)

    return () => clearTimeout(timer)
  }, [clampOffset, scale])

  // Criação do caminho pontilhado conectando apenas as ilhas desbloqueadas (da esquerda para a direita)
  const pathD = useMemo(() => {
    if (unlockedIslands.length === 0) return ''
    const sorted = [...unlockedIslands].sort((a, b) => {
      const ax = a.coordinates?.x ?? a.coordinate_x ?? 0
      const bx = b.coordinates?.x ?? b.coordinate_x ?? 0
      return ax - bx
    })
    return sorted
      .map((island, index) => {
        const xPct = island.coordinates?.x ?? island.coordinate_x ?? 50
        const yPct = island.coordinates?.y ?? island.coordinate_y ?? 50
        const px = (xPct / 100) * MAP_WIDTH
        const py = (yPct / 100) * MAP_HEIGHT
        return `${index === 0 ? 'M' : 'L'} ${px} ${py}`
      })
      .join(' ')
  }, [unlockedIslands])

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
          ${isDragging.current ? 'cursor-grabbing' : 'cursor-grab'}`}
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

          {pathD && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            >
              <path
                d={pathD}
                fill="none"
                stroke="rgba(var(--primary), 0.2)"
                strokeWidth="4"
                strokeDasharray="8,8"
                className="transition-all duration-500"
              />
            </svg>
          )}

          {unlockedIslands.map((island, index) => {
            const xPct = island.coordinates?.x ?? island.coordinate_x ?? 50
            const yPct = island.coordinates?.y ?? island.coordinate_y ?? 50

            const sizes: Array<'sm' | 'md' | 'lg'> = ['lg', 'sm', 'md', 'md']
            const currentSize = sizes[index % sizes.length]

            const isSelected = activeIslandId === island.id
            const matchesSearch = !searchQuery || island.name.toLowerCase().includes(searchQuery.toLowerCase())
            const isHighlighted = isSelected || (!activeIslandId && matchesSearch)

            return (
              <IslandPlaceholder
                key={island.id}
                size={currentSize}
                name={island.name}
                highlighted={isHighlighted}
                selected={isSelected}
                onClick={() => setActiveIslandId(island.id)}
                className="absolute transition-all duration-500"
                style={{
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  opacity: isSelected ? 1 : isHighlighted ? 1 : 0.2,
                  transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.15)' : 'scale(1)'}`,
                }}
              />
            )
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
        islands={unlockedIslands}
        searchQuery={searchQuery}
        activeSagaId={activeSagaId}
        activeArcId={activeArcId}
        activeIslandId={activeIslandId}
        onSearchChange={setSearchQuery}
        onSagaSelect={id => setActiveSagaId(id ? Number(id) : null)}
        onArcSelect={id => { if (id) setActiveArcId(Number(id)) }}
        onIslandSelect={id => setActiveIslandId(id ? Number(id) : null)}
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
        islands={unlockedIslands}
        activeIslandId={activeIslandId}
        offset={offset}
        viewportSize={viewportSize}
        mapWidth={MAP_WIDTH}
        mapHeight={MAP_HEIGHT}
        scale={scale}
        onMinimapClick={handleMinimapNavigation}
      />

      <Footer
        activeArcId={activeArcId}
        arcs={arcs}
        onArcClick={setActiveArcId}
      />
    </div>
  )
}
