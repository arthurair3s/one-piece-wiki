import * as THREE from "three"
import { ISLAND_WORLD_RADIUS } from "./island-node-3d"

export interface RouteNodeXZ {
  x: number // porcentagem (0-100)
  y: number // porcentagem (0-100, mapeia para o Z do mundo)
}

// folga extra além do raio da ilha para evitar que a rota cruze a praia
const BYPASS_MARGIN = 60 // unidades do mundo além de ISLAND_WORLD_RADIUS

/**
 * constrói um CatmullRomCurve3 que contorna cada ilha,
 * evitando passar pelo seu perímetro.
 *
 * estratégia: para cada ilha, substitui a sua posição por 3 pontos de desvio (waypoints) —
 * aproximação → lateral → partida. a direção perpendicular para contornar a ilha
 * é escolhida de modo a manter a consistência da rota.
 */
export function buildBypassRoute(
  nodes: RouteNodeXZ[],
  mapWidth: number,
  mapHeight: number,
  bypassRadius: number = ISLAND_WORLD_RADIUS + BYPASS_MARGIN,
  routeY: number = 6
): THREE.CatmullRomCurve3 {
  if (nodes.length === 0) return new THREE.CatmullRomCurve3([new THREE.Vector3()])
  if (nodes.length === 1) {
    const p = worldPos(nodes[0], mapWidth, mapHeight, routeY)
    return new THREE.CatmullRomCurve3([p])
  }

  const allPoints: THREE.Vector3[] = []

  for (let i = 0; i < nodes.length; i++) {
    const curr = worldPos(nodes[i], mapWidth, mapHeight, routeY)

    const prev = i > 0 ? worldPos(nodes[i - 1], mapWidth, mapHeight, routeY) : null
    const next = i < nodes.length - 1 ? worldPos(nodes[i + 1], mapWidth, mapHeight, routeY) : null

    // direção de chegada a esta ilha
    const inDir = prev
      ? new THREE.Vector3().subVectors(curr, prev).setY(0).normalize()
      : new THREE.Vector3().subVectors(next!, curr).setY(0).normalize()

    // direção de saída desta ilha
    const outDir = next
      ? new THREE.Vector3().subVectors(next, curr).setY(0).normalize()
      : inDir.clone()

    // direção média (bissetriz) para o ponto médio lateral
    const bisector = inDir.clone().add(outDir).normalize()

    // perpendicular à bissetriz no plano XZ — representa o lado do desvio
    // sempre escolhemos o lado esquerdo em relação à direção de entrada para consistência
    const perp = new THREE.Vector3(-inDir.z, 0, inDir.x)

    // garante que a perpendicular aponte de forma consistente para fora de curvas internas
    // através do produto vetorial entre a direção de entrada e de saída
    const cross = new THREE.Vector3().crossVectors(inDir, outDir)
    const side = cross.y >= 0 ? 1 : -1

    const perpDir = perp.multiplyScalar(side)

    // 3 pontos de arco ao redor da ilha
    // 1. tangente de aproximação: deslocamento da ilha na direção perpendicular, um pouco atrás
    const approach = curr.clone()
      .add(perpDir.clone().multiplyScalar(bypassRadius))
      .sub(inDir.clone().multiplyScalar(bypassRadius * 0.4))

    // 2. ponto lateral: deslocamento lateral máximo
    const broadside = curr.clone()
      .add(perpDir.clone().multiplyScalar(bypassRadius * 1.15))

    // 3. tangente de partida: deslocamento da ilha na direção perpendicular, um pouco adiante
    const departure = curr.clone()
      .add(perpDir.clone().multiplyScalar(bypassRadius))
      .add(outDir.clone().multiplyScalar(bypassRadius * 0.4))

    // para a primeira ilha, adiciona um ponto de entrada antes do arco
    if (i === 0) {
      const entry = curr.clone().sub(inDir.clone().multiplyScalar(bypassRadius * 1.5))
      allPoints.push(entry)
    }

    allPoints.push(approach, broadside, departure)

    // para a última ilha, adiciona um ponto de saída após o arco
    if (i === nodes.length - 1) {
      const exit = curr.clone().add(outDir.clone().multiplyScalar(bypassRadius * 1.5))
      allPoints.push(exit)
    }
  }

  return new THREE.CatmullRomCurve3(allPoints, false, "catmullrom", 0.5)
}

function worldPos(node: RouteNodeXZ, mapWidth: number, mapHeight: number, y: number): THREE.Vector3 {
  return new THREE.Vector3(
    (node.x / 100) * mapWidth,
    y,
    (node.y / 100) * mapHeight
  )
}
