"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import type { Island } from "@/types/api"

export const MAP_WIDTH = 2600
export const MAP_HEIGHT = 1600
export const FOV_DEG = 40
const FOV_RAD = (FOV_DEG * Math.PI) / 180
const MIN_HEIGHT = 650
const MAX_HEIGHT = 1300
const DEFAULT_HEIGHT = 950
// a câmera fica atrás do alvo nesta proporção para criar a inclinação isométrica
const TILT_RATIO = 0.75

// unidades do mundo visíveis verticalmente em uma dada altura da câmera
function visibleWorldHeight(height: number) {
  return 2 * height * Math.tan(FOV_RAD / 2)
}

export interface CameraState {
  target: { x: number; z: number }
  height: number
}

interface UseMapCameraProps {
  activeIslandId: number | null
  unlockedIslands: Island[]
}

export function useMapCamera({ activeIslandId, unlockedIslands }: UseMapCameraProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 1440, height: 900 })

  const [camera, setCamera] = useState<CameraState>({
    target: { x: MAP_WIDTH / 2, z: MAP_HEIGHT / 2 },
    height: DEFAULT_HEIGHT,
  })
  const [smoothTransition, setSmoothTransition] = useState(false)

  // estado de arrasto (salvo em refs para evitar re-renderizações)
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  // observador de redimensionamento da janela
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setViewportSize({ width: el.clientWidth, height: el.clientHeight })
    })
    observer.observe(el)
    setViewportSize({ width: el.clientWidth, height: el.clientHeight })
    return () => observer.disconnect()
  }, [])

  // limita o alvo da câmera para evitar que saia do mapa
  const clampTarget = useCallback((x: number, z: number) => ({
    x: Math.max(0, Math.min(MAP_WIDTH, x)),
    z: Math.max(0, Math.min(MAP_HEIGHT, z)),
  }), [])

  // zoom através da roda do mouse
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const step = camera.height * 0.05
      setCamera(prev => ({
        ...prev,
        height: Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, prev.height + (e.deltaY > 0 ? step : -step))),
      }))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [camera.height])

  // arrasto via mouse/toque
  const worldPerPixel = useCallback((height: number) => {
    const aspect = viewportSize.width / viewportSize.height
    const vwWorld = visibleWorldHeight(height) * aspect
    return vwWorld / viewportSize.width
  }, [viewportSize])

  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    isPanning.current = true
    lastPointer.current = { x: clientX, y: clientY }
    setSmoothTransition(false)
  }, [])

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isPanning.current) return
    const dx = clientX - lastPointer.current.x
    const dy = clientY - lastPointer.current.y
    lastPointer.current = { x: clientX, y: clientY }
    const wpp = worldPerPixel(camera.height)
    setCamera(prev => ({
      ...prev,
      target: clampTarget(prev.target.x - dx * wpp, prev.target.z - dy * wpp),
    }))
  }, [camera.height, worldPerPixel, clampTarget])

  const handlePointerUp = useCallback(() => {
    isPanning.current = false
  }, [])

  // wrappers de eventos do mouse
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button,input,select,a,[role='combobox']")) return
    handlePointerDown(e.clientX, e.clientY)
  }, [handlePointerDown])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handlePointerMove(e.clientX, e.clientY)
  }, [handlePointerMove])

  const handleMouseUp = useCallback(() => handlePointerUp(), [handlePointerUp])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)
  }, [handlePointerDown])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
  }, [handlePointerMove])

  // navegação automática até a ilha selecionada
  useEffect(() => {
    if (!activeIslandId || unlockedIslands.length === 0) return
    const island = unlockedIslands.find(i => i.id === activeIslandId)
    if (!island) return
    const xPct = island.coordinates?.x ?? island.coordinate_x ?? 50
    const yPct = island.coordinates?.y ?? island.coordinate_y ?? 50
    setSmoothTransition(true)
    setCamera(prev => ({
      ...prev,
      target: { x: (xPct / 100) * MAP_WIDTH, z: (yPct / 100) * MAP_HEIGHT },
    }))
    const t = setTimeout(() => setSmoothTransition(false), 800)
    return () => clearTimeout(t)
  }, [activeIslandId, unlockedIslands])

  // navegação através do minimapa
  const handleMinimapNavigation = useCallback((mapX: number, mapY: number) => {
    setSmoothTransition(true)
    setCamera(prev => ({ ...prev, target: clampTarget(mapX, mapY) }))
    const t = setTimeout(() => setSmoothTransition(false), 700)
    return () => clearTimeout(t)
  }, [clampTarget])

  // botões de controle de zoom
  const zoomIn = useCallback(() =>
    setCamera(prev => ({ ...prev, height: Math.max(MIN_HEIGHT, prev.height - prev.height * 0.10) })), [])
  const zoomOut = useCallback(() =>
    setCamera(prev => ({ ...prev, height: Math.min(MAX_HEIGHT, prev.height + prev.height * 0.10) })), [])

  // cálculo do offset para manter compatibilidade com o minimapa
  const effectiveScale = viewportSize.width / (visibleWorldHeight(camera.height) * (viewportSize.width / viewportSize.height))
  const offset = {
    x: -(camera.target.x * effectiveScale - viewportSize.width / 2),
    y: -(camera.target.z * effectiveScale - viewportSize.height / 2),
  }

  return {
    viewportRef,
    camera,
    offset,
    scale: effectiveScale,
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
    TILT_RATIO,
  }
}
