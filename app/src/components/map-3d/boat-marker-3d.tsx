"use client"

import { useRef, useMemo, Suspense } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { RouteNodeXZ } from "./bypass-route"
import { buildBypassRoute } from "./bypass-route"

// Configura o decodificador Draco
useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/")

interface BoatMarker3DProps {
  nodes: RouteNodeXZ[]
  progress: number // progresso da rota (0.0 a 1.0)
  mapWidth: number
  mapHeight: number
}

function GoingMerryModel() {
  const { scene } = useGLTF("/models/going_merry.glb")

  // Clona e redimensiona o modelo 3D da Going Merry
  const clonedScene = useMemo(() => {
    const clone = scene.clone()

    // Calcula dimensões originais do modelo
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const rawFootprint = Math.max(size.x, size.z, 0.001)

    // Escala para aprox. 26 unidades no mundo (tamanho ideal para o mapa)
    const targetSize = 26
    const autoScale = targetSize / rawFootprint
    clone.scale.setScalar(autoScale)

    // Centraliza o modelo no eixo Y (alinha o fundo do casco com y=0)
    const scaledBox = new THREE.Box3().setFromObject(clone)
    clone.position.y -= scaledBox.min.y

    // Rotaciona o modelo em 180 graus (Math.PI) para que a frente (proa) aponte
    // para a direção correta do vetor tangente (+Z de movimento)
    clone.rotation.y = Math.PI

    return clone
  }, [scene])

  return <primitive object={clonedScene} />
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
  const quat = useMemo(() => new THREE.Quaternion(), [])

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
    pos.y = 4 + Math.sin(t * 1.1) * 1.2 // balanço suave na superfície do mar (um pouco mais baixo para o modelo 3D)

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
    const swayZ = Math.sin(t * 0.8) * 0.04
    const swayQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(swayX, 0, swayZ))

    // combina a orientacao da rota com a inclinacao das ondas
    const targetQuat = new THREE.Quaternion().multiplyQuaternions(directionQuat, swayQuat)

    // suaviza a rotacao completa do barco sem conflito de euler
    groupRef.current.quaternion.slerp(targetQuat, 0.12)
  })

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <GoingMerryModel />
      </Suspense>

      {/* Rastro de espuma (Wake) atrás do navio */}
      <mesh position={[0, -2, 14]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.4, 1, 1]}>
        <circleGeometry args={[18, 14]} />
        <meshBasicMaterial color="#e8f6ff" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

// Pré-carrega o modelo da Going Merry para evitar travamento na renderização
useGLTF.preload("/models/going_merry.glb")
