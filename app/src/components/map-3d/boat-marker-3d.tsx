"use client"

import { useRef, useMemo, Suspense } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { RouteNodeXZ } from "./bypass-route"
import { buildBypassRoute } from "./bypass-route"
import { ISLAND_WORLD_RADIUS } from "./island-node-3d"

useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/")

interface BoatMarker3DProps {
  nodes: RouteNodeXZ[]
  progress: number
  mapWidth: number
  mapHeight: number
  clickedTarget: THREE.Vector3 | null
}

function GoingMerryModel() {
  const { scene } = useGLTF("/models/going_merry.glb")

  const clonedScene = useMemo(() => {
    const clone = scene.clone()

    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const rawFootprint = Math.max(size.x, size.z, 0.001)

    // Escala e centralização vertical
    const targetSize = 38
    const autoScale = targetSize / rawFootprint
    clone.scale.setScalar(autoScale)

    const scaledBox = new THREE.Box3().setFromObject(clone)
    clone.position.y -= scaledBox.min.y

    // Rotação corretiva de 90 graus (modelo exportado no eixo X)
    clone.rotation.y = Math.PI / 2

    return clone
  }, [scene])

  return <primitive object={clonedScene} />
}

export function BoatMarker3D({ nodes, progress, mapWidth, mapHeight, clickedTarget }: BoatMarker3DProps) {
  const groupRef = useRef<THREE.Group>(null)

  const curve = useMemo(() => {
    if (nodes.length < 2) return null
    return buildBypassRoute(nodes, mapWidth, mapHeight)
  }, [nodes, mapWidth, mapHeight])

  const currentProgressRef = useRef(progress)
  const currentPosRef = useRef<THREE.Vector3 | null>(null)

  const tangent = useMemo(() => new THREE.Vector3(), [])
  const pathPos = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    if (!groupRef.current || !curve) return
    const t = state.clock.getElapsedTime()

    // 1. Atualiza progresso da rota
    const SPEED = 0.06
    const target = progress
    let current = currentProgressRef.current

    const diff = target - current
    if (Math.abs(diff) > 0.0001) {
      const step = SPEED * delta
      current += Math.abs(diff) <= step ? diff : Math.sign(diff) * step
      currentProgressRef.current = current
    }

    const p = Math.max(0.001, Math.min(0.999, current))
    curve.getPointAt(p, pathPos)

    if (!currentPosRef.current) {
      currentPosRef.current = new THREE.Vector3().copy(pathPos)
    }

    // 2. Transição suave (lerp) para o alvo (clique no mar ou rota)
    const finalTarget = clickedTarget ? clickedTarget : pathPos
    const lerpSpeed = clickedTarget ? 0.005 : 0.03
    currentPosRef.current.lerp(finalTarget, lerpSpeed)

    // 3. Colisão com as ilhas (impede de atravessar e desliza pela costa)
    for (const node of nodes) {
      const islandX = (node.x / 100) * mapWidth
      const islandZ = (node.y / 100) * mapHeight
      const minDistance = node.radius ?? (ISLAND_WORLD_RADIUS + 30)

      const dx = currentPosRef.current.x - islandX
      const dz = currentPosRef.current.z - islandZ
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist < minDistance) {
        const angle = Math.atan2(dx, dz)
        currentPosRef.current.x = islandX + Math.sin(angle) * minDistance
        currentPosRef.current.z = islandZ + Math.cos(angle) * minDistance
      }
    }

    // 4. Posição final (com balanço das ondas)
    const bobbingY = 4 + Math.sin(t * 1.1) * 1.2
    groupRef.current.position.set(
      currentPosRef.current.x,
      bobbingY,
      currentPosRef.current.z
    )

    // 5. Rotação (alinha a proa com o movimento)
    let targetYaw = 0
    const dirX = finalTarget.x - currentPosRef.current.x
    const dirZ = finalTarget.z - currentPosRef.current.z
    const dist = Math.sqrt(dirX * dirX + dirZ * dirZ)

    if (dist > 1.5) {
      targetYaw = Math.atan2(dirX, dirZ)
    } else {
      curve.getTangentAt(p, tangent)
      targetYaw = Math.atan2(tangent.x, tangent.z)
    }

    const directionQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetYaw)

    // Balanço físico de ondas (roll e pitch)
    const swayX = Math.cos(t * 0.8) * 0.02
    const swayZ = Math.sin(t * 0.8) * 0.04
    const swayQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(swayX, 0, swayZ))

    const targetQuat = new THREE.Quaternion().multiplyQuaternions(directionQuat, swayQuat)
    groupRef.current.quaternion.slerp(targetQuat, 0.04)
  })

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <GoingMerryModel />
      </Suspense>

      <mesh position={[0, -2, 20]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.4, 1, 1]}>
        <circleGeometry args={[26, 14]} />
        <meshBasicMaterial color="#e8f6ff" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

useGLTF.preload("/models/going_merry.glb")
