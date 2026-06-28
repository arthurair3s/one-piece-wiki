import { apiClient } from '@/services/api'
import type { Island, Arc } from '@/types/api'

export interface IslandFilters {
  name?: string
  is_active?: boolean
  page?: number
  limit?: number
}

export interface CreateIslandPayload {
  name: string
  description: string
  arc_ids: { arc_id: number; order: number }[]
  coordinate_x: number
  coordinate_y: number
  coordinate_z: number
  model_url: string
  thumbnail_url?: string
  is_active?: boolean
}

export interface UpdateIslandPayload {
  name?: string
  description?: string
  arc_ids?: { arc_id: number; order: number }[]
  coordinate_x?: number
  coordinate_y?: number
  coordinate_z?: number
  model_url?: string
  thumbnail_url?: string
  is_active?: boolean
  rotation_y?: number
  scale?: number
}

// CRUD Ilhas
export async function getIslands(filters: IslandFilters = {}): Promise<{ islands: Island[]; total: number }> {
  const params = new URLSearchParams()
  if (filters.name) params.set('name', filters.name)
  if (filters.is_active !== undefined) params.set('is_active', String(filters.is_active))
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  const query = params.toString() ? `?${params.toString()}` : ''
  const response = await apiClient<any>(`/islands${query}`)

  if (response && response.data && response.meta) {
    return { islands: response.data, total: response.meta.total || 0 }
  }
  
  if (response && 'rows' in response) {
    return { islands: response.rows, total: response.count || 0 }
  }

  return { islands: response?.islands || [], total: response?.total || 0 }
}

export async function getIslandById(id: number): Promise<Island> {
  return apiClient<Island>(`/islands/${id}`)
}

export async function createIsland(payload: CreateIslandPayload): Promise<Island> {
  return apiClient<Island>('/islands', {
    method: 'POST',
    body: payload,
  })
}

export async function updateIsland(id: number, payload: UpdateIslandPayload): Promise<Island> {
  return apiClient<Island>(`/islands/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

export async function deleteIsland(id: number): Promise<void> {
  await apiClient<void>(`/islands/${id}`, {
    method: 'DELETE',
  })
}

// Auxiliar: buscar todos os arcos para o multiselect
export async function getArcs(params?: { limit?: number }): Promise<Arc[]> {
  const query = new URLSearchParams()
  if (params?.limit) query.append('limit', String(params.limit))
  const qs = query.toString()
  const response = await apiClient<any>(`/arcs${qs ? `?${qs}` : ''}`)
  return response?.data || response?.rows || response?.arcs || (Array.isArray(response) ? response : [])
}
