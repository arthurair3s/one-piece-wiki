"use client"

import * as THREE from "three"

// oceano estático plano e simples
export function OceanPlane({ onClick }: { onClick?: (e: any) => void }) {
  return (
    <group>
      {/* superfície principal do oceano, plana em y=-1 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
        receiveShadow
        onClick={onClick}
      >
        <planeGeometry args={[8000, 7000]} />
        <meshBasicMaterial color="#0d5f8a" />
      </mesh>
      {/* superfície interna um pouco mais clara para dar sensação de profundidade */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[5000, 4000]} />
        <meshBasicMaterial color="#1a7fbe" />
      </mesh>
    </group>
  )
}
