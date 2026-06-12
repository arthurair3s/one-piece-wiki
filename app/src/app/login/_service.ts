import { apiClient } from '@/services/api'
import { setCookie } from '@/lib/cookies'
import { LOGIN_CONFIG } from './_configuration'
import type { AuthResponse } from '@/types/api'

export async function loginUser(email: string, password: string): Promise<string> {
  const data = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password }
  })

  const token = data.accessToken
  if (!token) throw new Error('Token de autenticação não retornado pelo servidor')

  setCookie('token', token, LOGIN_CONFIG.cookieExpiryDays)

  // Armazena o perfil do usuário para controle de RBAC no frontend
  if (data.user?.profile) {
    setCookie('user_profile', data.user.profile, LOGIN_CONFIG.cookieExpiryDays)
  }

  return token
}
