import { apiClient } from '@/services/api'
import type { Arc, Saga, Island, CharacterVersion, PaginatedResponse } from '@/types/api'

// Filtros de busca para arcos
export interface ArcFilters {
  name?: string
  saga_id?: number
  page?: number
  limit?: number
}

// Payloads
export interface CreateArcPayload {
  name: string
  description: string
  saga_id: number
  order: number
  islands?: { island_id: number; order: number }[]
  character_versions?: { character_version_id: number; order: number }[]
}

export interface UpdateArcPayload {
  name?: string
  description?: string
  saga_id?: number
  order?: number
  islands?: { island_id: number; order: number }[]
  character_versions?: { character_version_id: number; order: number }[]
}

// CRUD Arcos
export async function getArcs(filters: ArcFilters = {}): Promise<{ arcs: Arc[]; total: number }> {
  const params = new URLSearchParams()
  if (filters.name) params.set('name', filters.name)
  if (filters.saga_id) params.set('saga_id', String(filters.saga_id))
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  const query = params.toString() ? `?${params.toString()}` : ''
  const response = await apiClient<any>(`/arcs${query}`)

  if (response && response.data && response.meta) {
    return { arcs: response.data, total: response.meta.total || 0 }
  }
  
  if (response && 'rows' in response) {
    return { arcs: response.rows, total: response.count || 0 }
  }

  return { arcs: response?.arcs || [], total: response?.total || 0 }
}

export async function getArcById(id: number): Promise<Arc> {
  return apiClient<Arc>(`/arcs/${id}`)
}

export async function createArc(payload: CreateArcPayload): Promise<Arc> {
  return apiClient<Arc>('/arcs', {
    method: 'POST',
    body: payload,
  })
}

export async function updateArc(id: number, payload: UpdateArcPayload): Promise<Arc> {
  return apiClient<Arc>(`/arcs/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

export async function deleteArc(id: number): Promise<void> {
  await apiClient<void>(`/arcs/${id}`, {
    method: 'DELETE',
  })
}

// Auxiliares (Sagas, Ilhas, Versões de Personagem para preenchimento de seletores)
export async function getSagas(params?: { limit?: number }): Promise<Saga[]> {
  const query = new URLSearchParams()
  if (params?.limit) query.append('limit', String(params.limit))
  const qs = query.toString()
  const response = await apiClient<any>(`/sagas${qs ? `?${qs}` : ''}`)
  return response?.data || response?.rows || (Array.isArray(response) ? response : [])
}

export async function getIslands(params?: { limit?: number }): Promise<Island[]> {
  const query = new URLSearchParams()
  if (params?.limit) query.append('limit', String(params.limit))
  const qs = query.toString()
  const response = await apiClient<any>(`/islands${qs ? `?${qs}` : ''}`)
  return response?.data || response?.rows || (Array.isArray(response) ? response : [])
}

export async function getCharacterVersions(params?: { limit?: number }): Promise<CharacterVersion[]> {
  const query = new URLSearchParams()
  if (params?.limit) query.append('limit', String(params.limit))
  const qs = query.toString()
  const response = await apiClient<any>(`/character-versions${qs ? `?${qs}` : ''}`)
  return response?.data || response?.rows || (Array.isArray(response) ? response : [])
}
