"use client"

import { useEffect, useRef, useMemo } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import * as THREE from "three"

import { OceanPlane } from "./ocean-plane"
import { IslandNode3D } from "./island-node-3d"
import { BoatMarker3D } from "./boat-marker-3d"
import type { Island } from "@/types/api"
import { FOV_DEG, MAP_WIDTH, MAP_HEIGHT, type CameraState } from "@/hooks/use-map-camera"

// controlador da câmera
const TILT_RATIO = 0.75

function CameraController({
  target,
  height,
  smooth,
}: {
  target: { x: number; z: number }
  height: number
  smooth: boolean
}) {
  const { camera } = useThree()
  const animRef = useRef<number>(0)
  const currentTarget = useRef(new THREE.Vector3(target.x, 0, target.z))
  const currentPos = useRef(new THREE.Vector3(target.x, height, target.z + height * TILT_RATIO))

  useEffect(() => {
    const destTarget = new THREE.Vector3(target.x, 0, target.z)
    const destPos = new THREE.Vector3(target.x, height, target.z + height * TILT_RATIO)

    if (!smooth) {
      currentTarget.current.copy(destTarget)
      currentPos.current.copy(destPos)
      camera.position.copy(destPos)
      camera.lookAt(destTarget)
      return
    }

    const speed = 0.07
    let running = true
    const animate = () => {
      if (!running) return
      currentTarget.current.lerp(destTarget, speed)
      currentPos.current.lerp(destPos, speed)
      camera.position.copy(currentPos.current)
      camera.lookAt(currentTarget.current)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => {
      running = false
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [camera, target.x, target.z, height, smooth])

  return null
}

// conteúdo da cena principal do mapa
interface RouteNode {
  id: number
  name: string
  arcId: number
  x: number
  y: number
}

interface GrandLineSceneProps {
  camera: CameraState
  smooth: boolean
  visibleNodes: RouteNode[]
  islands: Island[]
  activeIslandId: number | null
  activeArcId: number
  searchQuery: string
  sliderVal: number
  onIslandClick: (id: number) => void
}

function GrandLineScene({
  camera,
  smooth,
  visibleNodes,
  islands,
  activeIslandId,
  activeArcId,
  searchQuery,
  sliderVal,
  onIslandClick,
}: GrandLineSceneProps) {
  const allNodesXZ = useMemo(() => {
    return [1, 2, 3, 4, 5]
      .map(id => {
        const isl = islands.find(i => i.id === id)
        if (!isl) return null
        return {
          x: isl.coordinate_x,
          y: isl.coordinate_y
        }
      })
      .filter((n): n is { x: number; y: number } => !!n)
  }, [islands])
  return (
    <>
      <CameraController target={camera.target} height={camera.height} smooth={smooth} />

      {/* iluminação */}
      <ambientLight intensity={1.6} color="#fff8e7" />
      <directionalLight position={[MAP_WIDTH * 0.6, 800, MAP_HEIGHT * 0.2]} intensity={2.0} color="#ffe8b0" />
      <directionalLight position={[-MAP_WIDTH * 0.3, 500, MAP_HEIGHT * 0.8]} intensity={0.6} color="#a0d8f0" />

      {/* céu */}
      <color attach="background" args={["#6db8d8"]} />
      <fog attach="fog" args={["#8ec8e0", 2200, 4500]} />

      {/* oceano */}
      <group position={[MAP_WIDTH / 2, 0, MAP_HEIGHT / 2]}>
        <OceanPlane />
      </group>

      {/* Navio Going Merry */}
      {allNodesXZ.length >= 2 && (
        <BoatMarker3D
          nodes={allNodesXZ}
          progress={sliderVal / (allNodesXZ.length - 1)}
          mapWidth={MAP_WIDTH}
          mapHeight={MAP_HEIGHT}
        />
      )}

      {/* routepath3d removido para evitar artefatos de sombra */}

      {/* renderização das ilhas */}
      {visibleNodes.map((node) => {
        const dbIsland = islands.find((i) => i.id === node.id)
        if (!dbIsland) return null

        const isSelected = activeIslandId === dbIsland.id
        const matchesSearch = !searchQuery || dbIsland.name.toLowerCase().includes(searchQuery.toLowerCase())
        const isHighlighted = isSelected || (!activeIslandId && matchesSearch)

        const worldX = (node.x / 100) * MAP_WIDTH
        const worldZ = (node.y / 100) * MAP_HEIGHT

        // cálculo do tamanho visual combinando a escala base e a escala do banco
        const baseSizeScales: Record<number, number> = { 1: 1.4, 2: 0.9, 3: 1.1, 4: 1.1, 5: 1.25 }
        const baseSize = baseSizeScales[dbIsland.id] ?? 1.1
        const dbScale = dbIsland.scale ?? 1.0
        const sizeScale = baseSize * dbScale

        // conversão da rotação do banco de graus para radianos
        const rotDeg = dbIsland.rotation_y ?? -180
        const rotationY = (rotDeg * Math.PI) / 180

        return (
          <IslandNode3D
            key={`island-${dbIsland.id}`}
            worldX={worldX}
            worldZ={worldZ}
            name={dbIsland.name}
            modelUrl={dbIsland.model_url}
            highlighted={isHighlighted}
            selected={isSelected}
            sizeScale={sizeScale}
            rotationY={rotationY}
            onClick={() => onIslandClick(dbIsland.id)}
          />
        )
      })}
    </>
  )
}

// componente principal do mapa 3d da grand line
interface GrandLineMap3DProps {
  camera: CameraState
  smooth: boolean
  isDragging: boolean
  visibleNodes: RouteNode[]
  islands: Island[]
  activeIslandId: number | null
  activeArcId: number
  searchQuery: string
  sliderVal: number
  onIslandClick: (id: number) => void
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
}

export function GrandLineMap3D({
  camera,
  smooth,
  isDragging,
  visibleNodes,
  islands,
  activeIslandId,
  activeArcId,
  searchQuery,
  sliderVal,
  onIslandClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
}: GrandLineMap3DProps) {
  return (
    <div
      className={`absolute inset-0 z-10 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ touchAction: "none" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    >
      <Canvas
        camera={{ fov: FOV_DEG, near: 1, far: 8000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%" }}
      >
        <GrandLineScene
          camera={camera}
          smooth={smooth}
          visibleNodes={visibleNodes}
          islands={islands}
          activeIslandId={activeIslandId}
          activeArcId={activeArcId}
          searchQuery={searchQuery}
          sliderVal={sliderVal}
          onIslandClick={onIslandClick}
        />
      </Canvas>
    </div>
  )
}
