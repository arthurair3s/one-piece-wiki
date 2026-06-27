"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { RouteNodeXZ } from "./bypass-route"
import { buildBypassRoute } from "./bypass-route"

interface Navigator3DProps {
  nodes: RouteNodeXZ[]
  progress: number // progresso da rota (0.0 a 1.0)
  mapWidth: number
  mapHeight: number
}

export function Navigator3D({ nodes, progress, mapWidth, mapHeight }: Navigator3DProps) {
  const groupRef = useRef<THREE.Group>(null)

  // calcula a curva de desvio das ilhas
  const curve = useMemo(() => {
    if (nodes.length < 2) return null
    return buildBypassRoute(nodes, mapWidth, mapHeight)
  }, [nodes, mapWidth, mapHeight])

  // progresso atualizado do navegador
  const currentProgressRef = useRef(progress)

  // vetores reutilizaveis para otimizacao de performance
  const pos = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    if (!groupRef.current || !curve) return
    const t = state.clock.getElapsedTime()

    // velocidade constante de movimento (fração da rota total por segundo)
    const SPEED = 0.08 // movimento suave e alongado
    const target = progress
    let current = currentProgressRef.current

    // deslocamento suave com velocidade constante
    const diff = target - current
    if (Math.abs(diff) > 0.0001) {
      const step = SPEED * delta
      if (Math.abs(diff) <= step) {
        current = target
      } else {
        current += Math.sign(diff) * step
      }
      currentProgressRef.current = current
    }

    // limita o progresso na faixa valida da curva
    const p = Math.max(0.001, Math.min(0.999, current))

    // obtem a posicao ao longo da curva
    curve.getPoint(p, pos)
    pos.y = 7 + Math.sin(t * 1.2) * 1.5 // balanco suave na superficie do mar

    groupRef.current.position.copy(pos)

    // o navegador nunca gira no eixo y (yaw = 0)
    groupRef.current.rotation.y = 0

    // balanco suave nos eixos x (pitch) e z (roll) simulando ondas
    groupRef.current.rotation.x = Math.cos(t * 0.9) * 0.04
    groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.06
  })

  // design simples e bonito de uma jangada (raft) de madeira
  return (
    <group ref={groupRef}>
      {/* troncos da jangada (deck) */}
      <group position={[0, -1, 0]}>
        {/* 5 toras paralelas de madeira */}
        <mesh position={[-6, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 20, 8]} />
          <meshToonMaterial color="#8B5A2B" />
        </mesh>
        <mesh position={[-3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 21, 8]} />
          <meshToonMaterial color="#a06d3b" />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.7, 1.7, 22, 8]} />
          <meshToonMaterial color="#8B5A2B" />
        </mesh>
        <mesh position={[3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 21, 8]} />
          <meshToonMaterial color="#a06d3b" />
        </mesh>
        <mesh position={[6, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 20, 8]} />
          <meshToonMaterial color="#8B5A2B" />
        </mesh>

        {/* cordas transversais prendendo as toras */}
        <mesh position={[0, 1.2, -6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 14, 6]} />
          <meshToonMaterial color="#d2b48c" />
        </mesh>
        <mesh position={[0, 1.2, 6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 14, 6]} />
          <meshToonMaterial color="#d2b48c" />
        </mesh>
      </group>

      {/* mastro principal */}
      <mesh position={[0, 9, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 18, 8]} />
        <meshToonMaterial color="#5c3a21" />
      </mesh>

      {/* vela triangular simples */}
      <mesh position={[0, 11, 3.5]} rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[4.5, 12, 4]} />
        <meshToonMaterial color="#fcf8f2" side={THREE.DoubleSide} />
      </mesh>

      {/* rastro de espuma na agua atras da jangada */}
      <mesh position={[0, -1.8, 12]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.5, 1.2, 1]}>
        <circleGeometry args={[12, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}
