import { apiClient } from '@/services/api'
import type { Saga, PaginatedResponse } from '@/types/api'

// Filtros de busca
export interface SagaFilters {
  name?: string
  order?: number
  page?: number
  limit?: number
}

// Payloads
export interface CreateSagaPayload {
  name: string
  description?: string
  order: number
}

export interface UpdateSagaPayload {
  name?: string
  description?: string
  order?: number
}

// Busca sagas paginadas
export async function getSagas(filters: SagaFilters = {}): Promise<{ sagas: Saga[]; total: number }> {
  const params = new URLSearchParams()
  if (filters.name) params.set('name', filters.name)
  if (filters.order) params.set('order', String(filters.order))
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  const query = params.toString() ? `?${params.toString()}` : ''
  const response = await apiClient<any>(`/sagas${query}`)

  // A API retorna no formato { data: [...], meta: { total: ... } }
  if (response && response.data && response.meta) {
    return { sagas: response.data, total: response.meta.total || 0 }
  }
  
  // Fallback
  if (response && 'rows' in response) {
    return { sagas: response.rows, total: response.count || 0 }
  }

  return { sagas: response?.sagas || [], total: response?.total || 0 }
}

// Busca uma saga específica
export async function getSagaById(id: number): Promise<Saga> {
  return apiClient<Saga>(`/sagas/${id}`)
}

// Cria uma nova saga
export async function createSaga(payload: CreateSagaPayload): Promise<Saga> {
  return apiClient<Saga>('/sagas', {
    method: 'POST',
    body: payload,
  })
}

// Atualiza uma saga
export async function updateSaga(id: number, payload: UpdateSagaPayload): Promise<Saga> {
  return apiClient<Saga>(`/sagas/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

// Deleta uma saga
export async function deleteSaga(id: number): Promise<void> {
  await apiClient<void>(`/sagas/${id}`, {
    method: 'DELETE',
  })
}
