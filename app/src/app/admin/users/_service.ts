import { apiClient } from '@/services/api'
import type { User, Profile, PaginatedResponse } from '@/types/api'

// Filtros de busca de usuários
export interface UserFilters {
  username?: string
  email?: string
  page?: number
  limit?: number
}

// Dados para criação de usuário
export interface CreateUserPayload {
  username: string
  email: string
  password: string
  profile_id: number
}

// Dados para atualização de usuário
export interface UpdateUserPayload {
  username?: string
  email?: string
  password?: string
  profile_id?: number
}

// Busca usuários paginados com filtros
export async function getUsers(filters: UserFilters = {}): Promise<{
  users: User[]
  total: number
}> {
  const params = new URLSearchParams()
  if (filters.username) params.set('username', filters.username)
  if (filters.email) params.set('email', filters.email)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  const query = params.toString() ? `?${params.toString()}` : ''
  const data = await apiClient<PaginatedResponse<User> | { users: User[]; total: number }>(
    `/users${query}`
  )

  if ('rows' in data) {
    return { users: data.rows, total: data.count }
  }
  return { users: (data as any).users || [], total: (data as any).total || 0 }
}

// Busca um usuário por ID
export async function getUserById(id: number): Promise<User> {
  return apiClient<User>(`/users/${id}`)
}

// Cria um novo usuário
export async function createUser(payload: CreateUserPayload): Promise<User> {
  return apiClient<User>('/users', {
    method: 'POST',
    body: payload,
  })
}

// Atualiza dados de um usuário
export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  return apiClient<User>(`/users/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

// Exclui um usuário
export async function deleteUser(id: number): Promise<void> {
  await apiClient<void>(`/users/${id}`, {
    method: 'DELETE',
  })
}

// Busca perfis de acesso
export async function getProfiles(): Promise<Profile[]> {
  const data = await apiClient<PaginatedResponse<Profile> | { profiles: Profile[] }>('/profiles')

  if ('rows' in data) return data.rows
  return (data as any).profiles || []
}
