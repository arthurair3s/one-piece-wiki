import { apiClient } from '@/services/api'

export async function registerUser(username: string, email: string, password: string): Promise<boolean> {
  await apiClient('/auth/register', {
    method: 'POST',
    body: { username, email, password }
  })
  return true
}
