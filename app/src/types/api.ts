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
  createdAt: string;
  updatedAt: string;
}

export interface Island {
  id: number;
  name: string;
  description: string;
  coordinate_x: number;
  coordinate_y: number;
  coordinate_z: number;
  coordinates?: {
    x: number;
    y: number;
    z: number;
  };
  model_url: string;
  thumbnail_url?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
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
  name: string;
  email: string;
  profileId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
