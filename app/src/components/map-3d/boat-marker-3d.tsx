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

    // Escala para aprox. 38 unidades no mundo (tamanho ideal para o mapa)
    const targetSize = 38
    const autoScale = targetSize / rawFootprint
    clone.scale.setScalar(autoScale)

    // Centraliza o modelo no eixo Y (alinha o fundo do casco com y=0)
    const scaledBox = new THREE.Box3().setFromObject(clone)
    clone.position.y -= scaledBox.min.y

    // Rotaciona o modelo em 90 graus (Math.PI / 2) para alinhar a frente (proa)
    // caso o modelo original tenha sido exportado de lado (eixo X)
    clone.rotation.y = Math.PI / 2

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

  // progresso atualizado do barco ao longo da rota
  const currentProgressRef = useRef(progress)

  // Referência para armazenar a posição atual do barco em coordenadas do mundo 3D
  const currentPosRef = useRef<THREE.Vector3 | null>(null)

  // Controle de estado para rastrear interação com o mouse
  const lastPointer = useRef(new THREE.Vector2())
  const isMouseActive = useRef(false)
  const lastActiveTime = useRef(0)
  const lastTargetProgress = useRef(progress)

  // vetores reutilizáveis alocados uma única vez para otimização
  const pos = useMemo(() => new THREE.Vector3(), [])
  const tangent = useMemo(() => new THREE.Vector3(), [])
  const planeY = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -4), [])
  const mousePos = useMemo(() => new THREE.Vector3(), [])
  const pathPos = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    if (!groupRef.current || !curve) return
    const t = state.clock.getElapsedTime()

    // 1. Atualiza a posição alvo ao longo do caminho da rota
    const SPEED = 0.15
    const target = progress
    let current = currentProgressRef.current

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

    const p = Math.max(0.001, Math.min(0.999, current))
    curve.getPointAt(p, pathPos)

    // Inicializa a posição atual se for o primeiro frame
    if (!currentPosRef.current) {
      currentPosRef.current = new THREE.Vector3().copy(pathPos)
    }

    // 2. Intercepta o ponteiro do mouse com o plano do oceano
    state.raycaster.ray.intersectPlane(planeY, mousePos)

    // Detecta se o mouse está se movendo de forma ativa
    const currentPointer = state.pointer
    const pointerDiff = currentPointer.distanceTo(lastPointer.current)

    // Se houve mudança significativa na posição do ponteiro
    if (pointerDiff > 0.01) {
      isMouseActive.current = true
      lastActiveTime.current = t
      lastPointer.current.copy(currentPointer)
    }

    // Desativa modo mouse se o usuário interagir com o slider ou trocar de ilha
    if (Math.abs(progress - lastTargetProgress.current) > 0.001) {
      isMouseActive.current = false
      lastTargetProgress.current = progress
    }

    // Desativa modo mouse após 3 segundos de inatividade
    if (t - lastActiveTime.current > 3.0) {
      isMouseActive.current = false
    }

    // Define qual é a posição alvo final deste frame
    const finalTarget = isMouseActive.current ? mousePos : pathPos

    // 3. Move o barco suavemente (lerp)
    // Velocidade bem lenta ao seguir o mouse (0.012), velocidade padrão na rota (0.06)
    const lerpSpeed = isMouseActive.current ? 0.012 : 0.06
    currentPosRef.current.lerp(finalTarget, lerpSpeed)

    // Define a coordenada Y (balanço suave no mar)
    const bobbingY = 4 + Math.sin(t * 1.1) * 1.2
    groupRef.current.position.set(
      currentPosRef.current.x,
      bobbingY,
      currentPosRef.current.z
    )

    // 4. Calcula e suaviza a rotação de direção do barco
    let targetYaw = 0
    if (isMouseActive.current) {
      // Aponta na direção do movimento em relação ao alvo do mouse
      const dirX = finalTarget.x - currentPosRef.current.x
      const dirZ = finalTarget.z - currentPosRef.current.z
      if (Math.sqrt(dirX * dirX + dirZ * dirZ) > 1.0) {
        targetYaw = Math.atan2(dirX, dirZ)
      } else {
        // Se estiver muito perto, mantém a direção da tangente da rota
        curve.getTangentAt(p, tangent)
        targetYaw = Math.atan2(tangent.x, tangent.z)
      }
    } else {
      // Aponta na direção da tangente da rota
      curve.getTangentAt(p, tangent)
      targetYaw = Math.atan2(tangent.x, tangent.z)
    }

    const directionQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetYaw)

    // Balanço suave das ondas (roll em z e pitch em x)
    const swayX = Math.cos(t * 0.8) * 0.02
    const swayZ = Math.sin(t * 0.8) * 0.04
    const swayQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(swayX, 0, swayZ))

    const targetQuat = new THREE.Quaternion().multiplyQuaternions(directionQuat, swayQuat)

    // Suaviza a rotação
    groupRef.current.quaternion.slerp(targetQuat, 0.08)
  })

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <GoingMerryModel />
      </Suspense>

      {/* Rastro de espuma (Wake) atrás do navio */}
      <mesh position={[0, -2, 20]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.4, 1, 1]}>
        <circleGeometry args={[26, 14]} />
        <meshBasicMaterial color="#e8f6ff" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

// Pré-carrega o modelo da Going Merry para evitar travamento na renderização
useGLTF.preload("/models/going_merry.glb")
