// ============================================================
// Grand Line API — Cliente HTTP
// Fetch wrapper configurado para comunicação com o backend
// ============================================================

import type {
  Saga,
  Arc,
  Island,
  Character,
  Event,
  AuthResponse,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// --------------- Utilitário de Fetch ---------------

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
}

async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.message || `Erro ${response.status}: ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

// --------------- Auth ---------------

export function login(email: string, password: string) {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

// --------------- Sagas ---------------

export function getSagas(token: string) {
  return apiClient<Saga[]>("/sagas", { token });
}

export function getSaga(id: number, token: string) {
  return apiClient<Saga>(`/sagas/${id}`, { token });
}

// --------------- Arcos ---------------

export function getArcs(token: string) {
  return apiClient<Arc[]>("/arcs", { token });
}

export function getArc(id: number, token: string) {
  return apiClient<Arc>(`/arcs/${id}`, { token });
}

// --------------- Ilhas ---------------

export function getIslands(token: string) {
  return apiClient<Island[]>("/islands", { token });
}

export function getIsland(id: number, token: string) {
  return apiClient<Island>(`/islands/${id}`, { token });
}

// --------------- Personagens ---------------

export function getCharacters(token: string) {
  return apiClient<Character[]>("/characters", { token });
}

export function getCharacter(id: number, token: string) {
  return apiClient<Character>(`/characters/${id}`, { token });
}

// --------------- Eventos ---------------

export function getEvents(token: string) {
  return apiClient<Event[]>("/events", { token });
}

export function getEvent(id: number, token: string) {
  return apiClient<Event>(`/events/${id}`, { token });
}
