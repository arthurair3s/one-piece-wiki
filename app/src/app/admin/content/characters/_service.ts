import { apiClient } from '@/services/api'
import type { Character, CharacterVersion, PaginatedResponse, Arc } from '@/types/api'

// Characters
export async function getCharacters(params?: { name?: string; slug?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams()
  if (params?.name) query.append('name', params.name)
  if (params?.slug) query.append('slug', params.slug)
  if (params?.page) query.append('page', String(params.page))
  if (params?.limit) query.append('limit', String(params.limit))

  const qs = query.toString()
  return apiClient<PaginatedResponse<Character>>(`/characters${qs ? `?${qs}` : ''}`)
}

export async function getCharacter(id: number) {
  return apiClient<Character>(`/characters/${id}`)
}

export async function createCharacter(data: { name: string; slug: string }) {
  return apiClient<Character>('/characters', {
    method: 'POST',
    body: data,
  })
}

export async function updateCharacter(id: number, data: { name?: string; slug?: string }) {
  return apiClient<Character>(`/characters/${id}`, {
    method: 'PATCH',
    body: data,
  })
}

export async function deleteCharacter(id: number) {
  return apiClient<void>(`/characters/${id}`, {
    method: 'DELETE',
  })
}

// Character Versions
export async function getCharacterVersions(params?: { character_id?: number; page?: number; limit?: number }) {
  const query = new URLSearchParams()
  if (params?.character_id) query.append('character_id', String(params.character_id))
  if (params?.page) query.append('page', String(params.page))
  if (params?.limit) query.append('limit', String(params.limit))

  const qs = query.toString()
  return apiClient<PaginatedResponse<CharacterVersion>>(`/character-versions${qs ? `?${qs}` : ''}`)
}

export async function getCharacterVersion(id: number) {
  return apiClient<CharacterVersion>(`/character-versions/${id}`)
}

export async function createCharacterVersion(data: {
  character_id: number;
  arc_ids: number[];
  alias?: string;
  epithet?: string;
  bounty?: number;
  status?: string;
  image_url?: string;
  description?: string;
}) {
  return apiClient<CharacterVersion>('/character-versions', {
    method: 'POST',
    body: data,
  })
}

export async function updateCharacterVersion(id: number, data: Partial<Parameters<typeof createCharacterVersion>[0]>) {
  return apiClient<CharacterVersion>(`/character-versions/${id}`, {
    method: 'PATCH',
    body: data,
  })
}

export async function deleteCharacterVersion(id: number) {
  return apiClient<void>(`/character-versions/${id}`, {
    method: 'DELETE',
  })
}

// Arcs (for the select)
export async function getArcs(params?: { limit?: number }) {
  const query = new URLSearchParams()
  if (params?.limit) query.append('limit', String(params.limit))
  
  const qs = query.toString()
  return apiClient<PaginatedResponse<Arc>>(`/arcs${qs ? `?${qs}` : ''}`)
}
