"use client"

import { useMemo } from "react"
import * as THREE from "three"
import type { RouteNodeXZ } from "./bypass-route"
import { buildBypassRoute } from "./bypass-route"

interface RoutePath3DProps {
  nodes: RouteNodeXZ[]
  mapWidth: number
  mapHeight: number
}

export function RoutePath3D({ nodes, mapWidth, mapHeight }: RoutePath3DProps) {
  const { tubeGeo } = useMemo(() => {
    if (nodes.length < 2) return { tubeGeo: null }
    const curve = buildBypassRoute(nodes, mapWidth, mapHeight)
    const tubeGeo = new THREE.TubeGeometry(curve, 200, 2.2, 8, false)
    return { tubeGeo }
  }, [nodes, mapWidth, mapHeight])

  if (!tubeGeo) return null

  return (
    <group>
      {/* tubo dourado da rota */}
      <mesh geometry={tubeGeo}>
        <meshToonMaterial color="#c8a040" transparent opacity={0.8} />
      </mesh>
      {/* contorno escuro para dar percepção de profundidade */}
      <mesh geometry={tubeGeo} scale={1.35}>
        <meshBasicMaterial color="#6b5010" transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}
