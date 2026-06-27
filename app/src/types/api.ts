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
  sagaId: number;
  sagaName?: string;
  islandsCount?: number;
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
  characterId: number;
  arcId: number;
  epithet?: string;
  bounty?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
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
  profile?: string;
  profileId?: number;
  createdAt?: string;
  updatedAt?: string;
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
