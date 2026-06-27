"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { RouteNodeXZ } from "./bypass-route"
import { buildBypassRoute } from "./bypass-route"

interface BoatMarker3DProps {
  nodes: RouteNodeXZ[]
  progress: number // progresso da rota (0.0 a 1.0)
  mapWidth: number
  mapHeight: number
}

export function BoatMarker3D({ nodes, progress, mapWidth, mapHeight }: BoatMarker3DProps) {
  const groupRef = useRef<THREE.Group>(null)

  const curve = useMemo(() => {
    if (nodes.length < 2) return null
    return buildBypassRoute(nodes, mapWidth, mapHeight)
  }, [nodes, mapWidth, mapHeight])

  // progresso atualizado do barco
  const currentProgressRef = useRef(progress)

  // vetores reutilizáveis alocados uma única vez para otimização
  const pos = useMemo(() => new THREE.Vector3(), [])
  const tangent = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const quat = useMemo(() => new THREE.Quaternion(), [])
  const mat = useMemo(() => new THREE.Matrix4(), [])

  useFrame((state, delta) => {
    if (!groupRef.current || !curve) return
    const t = state.clock.getElapsedTime()

    // velocidade constante de movimento (fração da rota total por segundo)
    const SPEED = 0.15
    const target = progress
    let current = currentProgressRef.current

    // desloca o barco suavemente com velocidade constante
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

    // limita o progresso na faixa válida da curva
    const p = Math.max(0.001, Math.min(0.999, current))

    // obtém a posição ao longo da curva
    curve.getPoint(p, pos)
    pos.y = 8 + Math.sin(t * 1.1) * 2 // balanço suave na superfície do mar

    groupRef.current.position.copy(pos)

    // obtem a direcao de movimento tangente neste ponto
    curve.getTangent(p, tangent)
    tangent.y = 0 // mantem o barco plano sem inclinacao vertical
    if (tangent.lengthSq() < 0.0001) return
    tangent.normalize()

    // calcula a direcao de movimento (yaw no eixo y)
    const targetYaw = Math.atan2(tangent.x, tangent.z)
    const directionQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetYaw)

    // calcula o balanco suave das ondas (roll em z e pitch em x)
    const swayX = Math.cos(t * 0.8) * 0.02
    const swayZ = Math.sin(t * 0.8) * 0.05
    const swayQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(swayX, 0, swayZ))

    // combina a orientacao da rota com a inclinacao das ondas
    const targetQuat = new THREE.Quaternion().multiplyQuaternions(directionQuat, swayQuat)

    // suaviza a rotacao completa do barco sem conflito de euler
    groupRef.current.quaternion.slerp(targetQuat, 0.12)
  })

  return (
    <group ref={groupRef}>
      {/* Hull */}
      <mesh>
        <boxGeometry args={[14, 5, 30]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>
      {/* Keel */}
      <mesh position={[0, -3.5, 0]}>
        <boxGeometry args={[10, 3, 26]} />
        <meshToonMaterial color="#5c2e0a" />
      </mesh>
      {/* Deck cabin */}
      <mesh position={[0, 5, -4]}>
        <boxGeometry args={[10, 7, 12]} />
        <meshToonMaterial color="#d2a06a" />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 20, 2]}>
        <cylinderGeometry args={[1, 1.2, 30, 8]} />
        <meshToonMaterial color="#7a3a0a" />
      </mesh>
      {/* Main sail */}
      <mesh position={[0, 23, 8]}>
        <planeGeometry args={[16, 18]} />
        <meshToonMaterial color="#f5f0e0" side={THREE.DoubleSide} />
      </mesh>
      {/* Sail accent */}
      <mesh position={[0, 23, 8.1]}>
        <planeGeometry args={[8, 9]} />
        <meshBasicMaterial color="#cc2222" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      {/* Wake */}
      <mesh position={[0, -5, 18]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.4, 1, 1]}>
        <circleGeometry args={[20, 14]} />
        <meshBasicMaterial color="#e8f6ff" transparent opacity={0.45} />
      </mesh>
    </group>
  )
}
