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

// Busca inicial do dashboard: sagas, arcos e todas as ilhas registradas via /islands/map
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

// Chama o endpoint de mapa filtrado pelo CQRS Read Model quando o usuário aplica filtros no HUD
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
