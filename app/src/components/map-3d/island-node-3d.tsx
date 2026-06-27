import React, { useRef, useMemo, Suspense } from "react"
import { Html, useGLTF, Center } from "@react-three/drei"
import * as THREE from "three"

class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any) {
    console.error("[IslandNode3D] Falha ao carregar modelo 3D, usando fallback procedimental:", error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/")

/**
 * raio alvo em unidades do mundo para uma ilha padrão (sizeScale=1).
 * usado tanto pela geometria procedimental quanto pelo redimensionador automático do GLB.
 */
export const ISLAND_WORLD_RADIUS = 120

// geometria desenhada para ISLAND_WORLD_RADIUS = 120 com sizeScale = 1
// plano do oceano em y = -1. grupo da ilha em y = 0
function ProceduralIsland({
  highlighted,
  selected,
  scale = 1,
}: {
  highlighted: boolean
  selected: boolean
  scale?: number
}) {
  const sandColor = selected ? "#e8c87a" : "#d4aa60"
  const baseColor = selected ? "#bca374" : highlighted ? "#d2b48c" : "#c8a87a"
  const peakColor = selected ? "#8fae6a" : highlighted ? "#7da05a" : "#5a8840"
  const treeColor = selected ? "#4e7a3a" : "#3a6030"

  return (
    <group scale={[scale, scale, scale]}>
      {/* base rochosa submersa */}
      <mesh position={[0, -16, 0]}>
        <cylinderGeometry args={[108, 122, 30, 10]} />
        <meshToonMaterial color="#3a6080" />
      </mesh>

      {/* costa arenosa com raio compatível com o limite da ilha */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[92, 108, 18, 10]} />
        <meshToonMaterial color={sandColor} />
      </mesh>

      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[76, 92, 14, 10]} />
        <meshToonMaterial color={baseColor} />
      </mesh>

      <mesh position={[0, 36, 0]}>
        <coneGeometry args={[72, 90, 9]} />
        <meshToonMaterial color={peakColor} />
      </mesh>

      <mesh position={[28, 44, 16]}>
        <coneGeometry args={[40, 58, 8]} />
        <meshToonMaterial color={peakColor} />
      </mesh>

      {(([
        [-30, 22, -22],
        [38, 22, 14],
        [-10, 22, 35],
        [28, 22, -30],
        [0, 24, -40],
      ] as [number, number, number][]).map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[3, 3.5, 16, 6]} />
            <meshToonMaterial color="#5c4a2a" />
          </mesh>
          <mesh position={[0, 18, 0]}>
            <coneGeometry args={[14, 24, 7]} />
            <meshToonMaterial color={treeColor} />
          </mesh>
        </group>
      )))}
    </group>
  )
}

// carregador de modelo GLB com redimensionamento automático
function GLBIsland({ url, targetDiameter }: { url: string; targetDiameter: number }) {
  const { scene } = useGLTF(url)

  const scaledScene = useMemo(() => {
    const clone = scene.clone()

    // calcula as dimensões XZ do modelo original
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const rawFootprint = Math.max(size.x, size.z, 0.001) // evita divisão por zero

    // escala o modelo para o diâmetro desejado
    const autoScale = targetDiameter / rawFootprint
    clone.scale.setScalar(autoScale)

    // alinha o modelo para repousar sobre o plano y=0
    const scaledBox = new THREE.Box3().setFromObject(clone)
    const minY = scaledBox.min.y
    clone.position.y -= minY

    return clone
  }, [scene, targetDiameter])

  return <primitive object={scaledScene} />
}

export interface IslandNode3DProps {
  worldX: number
  worldZ: number
  name: string
  modelUrl?: string | null
  highlighted: boolean
  selected: boolean
  /** multiplicador do tamanho da ilha */
  sizeScale?: number
  /** rotação aplicada no eixo Y */
  rotationY?: number
  onClick: () => void
}

export function IslandNode3D({
  worldX,
  worldZ,
  name,
  modelUrl,
  highlighted,
  selected,
  sizeScale = 1,
  rotationY = -180,
  onClick,
}: IslandNode3DProps) {
  const ringColor = selected ? "#f5c842" : highlighted ? "#e8d878" : "#a09060"
  const ringR = ISLAND_WORLD_RADIUS * sizeScale
  // diâmetro desejado para o redimensionador GLB
  const glbDiameter = ISLAND_WORLD_RADIUS * 2 * sizeScale

  return (
    <group position={[worldX, 0, worldZ]}>
      {/* anel de destaque logo acima da superfície do oceano */}
      <mesh
        position={[0, 1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClick() }}
      >
        <ringGeometry args={[ringR, ringR + (selected ? 9 : 5), 48]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={selected ? 0.85 : highlighted ? 0.55 : 0.22}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* volume de clique invisível */}
      <mesh position={[0, 60, 0]} visible={false} onClick={(e) => { e.stopPropagation(); onClick() }}>
        <cylinderGeometry args={[ringR, ringR, 150, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* geometria da ilha com rotação aplicada */}
      <group rotation={[0, rotationY, 0]} onClick={(e) => { e.stopPropagation(); onClick() }}>
        {modelUrl ? (
          <ErrorBoundary fallback={<ProceduralIsland highlighted={highlighted} selected={selected} scale={sizeScale} />}>
            <Suspense fallback={<ProceduralIsland highlighted={highlighted} selected={selected} scale={sizeScale} />}>
              <GLBIsland url={modelUrl} targetDiameter={glbDiameter} />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <ProceduralIsland highlighted={highlighted} selected={selected} scale={sizeScale} />
        )}
      </group>

      {/* rótulo de texto flutuante com o nome da ilha */}
      <Html
        position={[0, (selected ? 130 : 110) * sizeScale, 0]}
        center
        distanceFactor={600}
        occlude={false}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div style={{
          background: selected ? "rgba(251,249,244,0.97)" : "rgba(251,249,244,0.88)",
          color: "#4f3f24",
          padding: "3px 10px",
          borderRadius: "4px",
          fontSize: selected ? "14px" : "12px",
          fontWeight: "700",
          border: `1px solid ${selected ? "#4f3f24" : "#d2c29d"}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
          whiteSpace: "nowrap",
          transform: selected ? "scale(1.08)" : "scale(1)",
          transition: "all 0.3s ease",
        }}>
          {name}
        </div>
      </Html>
    </group>
  )
}
