// ============================================================
// Grand Line API — Interfaces TypeScript
// Espelham os modelos do backend (NestJS + Sequelize)
// ============================================================

export interface Saga {
  id: number;
  name: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Arc {
  id: number;
  name: string;
  description?: string;
  order: number;
  saga_id: number;
  sagaId?: number;
  sagaName?: string;
  islandsCount?: number;
  islands?: (Island & { ArcIsland?: { order: number } })[];
  character_versions?: (CharacterVersion & { ArcCharacterVersion?: { order: number } })[];
  saga?: Saga;
  createdAt?: string;
  updatedAt?: string;
}

// /wiki/map retorna apenas coordinates (objeto aninhado) e thumbnailUrl (camelCase)
export interface Island {
  id: number;
  name: string;
  description?: string;
  coordinates?: {
    x: number;
    y: number;
    z: number;
  };
  // campos do modelo de escrita (usados nos endpoints CRUD /islands)
  coordinate_x?: number;
  coordinate_y?: number;
  coordinate_z?: number;
  model_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  arcCount?: number;
  is_active?: boolean;
  rotation_y?: number;
  scale?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Character {
  id: number;
  name: string;
  slug: string;
  current_status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterVersion {
  id: number;
  character_id: number;
  alias?: string;
  epithet?: string;
  bounty?: number;
  status: string;
  image_url?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  arcs?: Arc[];
  events?: Event[];
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  type: string;
  order: number;
  islandId: number;
  arcId: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  profile?: string | { id: number; name: string; description?: string; createdAt?: string; updatedAt?: string; deletedAt?: string | null };
  profileId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Resposta paginada
export interface PaginatedResponse<T> {
  count: number;
  rows: T[];
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    profile: string;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
