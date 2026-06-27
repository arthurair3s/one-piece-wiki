import type { Saga, Arc, Island } from '@/types/api'
import { apiClient } from '@/services/api'

interface SagasResponse {
  sagas: Saga[]
}

interface ArcsResponse {
  arcs: Arc[]
}

interface MapResponse {
  islands: Island[]
}

export interface MapFilters {
  sagaId?: number | null
  arcId?: number | null
  search?: string
}

// busca inicial do dashboard (sagas, arcos e ilhas)
export async function fetchDashboardData() {
  const [sagasRes, arcsRes, islandsRes] = await Promise.all([
    apiClient<SagasResponse>('/wiki/sagas').catch((err) => {
      console.warn('[DashboardService] Falha ao carregar sagas da API:', err)
      return null
    }),
    apiClient<ArcsResponse>('/wiki/arcs').catch((err) => {
      console.warn('[DashboardService] Falha ao carregar arcos da API:', err)
      return null
    }),
    apiClient<Island[]>('/islands/map').catch((err) => {
      console.warn('[DashboardService] Falha ao carregar todas as ilhas da API (/islands/map):', err)
      return null
    })
  ])

  return {
    sagas: sagasRes?.sagas || [],
    arcs: arcsRes?.arcs || [],
    islands: Array.isArray(islandsRes) ? islandsRes : []
  }
}

// busca as ilhas filtradas de acordo com a busca ou seleção
export async function fetchFilteredMap(filters: MapFilters): Promise<Island[]> {
  const params = new URLSearchParams()
  if (filters.sagaId) params.set('sagaId', String(filters.sagaId))
  if (filters.arcId) params.set('arcId', String(filters.arcId))
  if (filters.search) params.set('search', filters.search)

  const query = params.toString()
  const endpoint = query ? `/wiki/map/filter?${query}` : '/wiki/map'

  const res = await apiClient<MapResponse>(endpoint)
  return res?.islands || []
}

// busca os personagens e eventos vigentes na ilha durante o arco
export async function fetchIslandDetails(islandId: number, arcId: number) {
  return apiClient<any>(`/islands/${islandId}/details?arc_id=${arcId}`)
}

// busca a lista de arcos temporais de uma ilha
export async function fetchIslandArcs(islandId: number) {
  return apiClient<any>(`/islands/${islandId}/arcs`)
}

// busca as versões de um personagem pelo id
export async function fetchCharacterVersions(characterId: number) {
  return apiClient<any>(`/character-versions?character_id=${characterId}&limit=100`)
}

// atualiza coordenadas, rotação e escala da ilha
export async function updateIsland(
  id: number,
  data: {
    coordinate_x?: number
    coordinate_y?: number
    rotation_y?: number
    scale?: number
  }
) {
  return apiClient<any>(`/islands/${id}`, { method: 'PATCH', body: data })
}
