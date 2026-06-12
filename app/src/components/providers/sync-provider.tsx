'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { getCookie } from '@/lib/cookies'
import { getApiBaseUrl } from '@/services/api'

// Rotas que não exigem autenticação — o polling CDC não deve rodar nelas
const PUBLIC_ROUTES = ['/login', '/register', '/loading-screen']

interface SyncContextType {
  isOutOfSync: boolean
  lastSyncTime: Date | null
  triggerCheck: () => Promise<void>
  resolveSync: () => void
}

const SyncContext = createContext<SyncContextType | undefined>(undefined)

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOutOfSync, setIsOutOfSync] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const previousDataHash = useRef<string | null>(null)

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))

  const calculateHash = (data: any): string => JSON.stringify(data)

  const triggerCheck = useCallback(async () => {
    const token = getCookie('token')
    if (!token) return

    try {
      const API_BASE_URL = getApiBaseUrl()
      const response = await fetch(`${API_BASE_URL}/api/wiki/sagas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) return

      const data = await response.json()
      const currentHash = calculateHash(data)

      setLastSyncTime(new Date())

      if (previousDataHash.current && previousDataHash.current !== currentHash) {
        setIsOutOfSync(true)
      } else if (!previousDataHash.current) {
        previousDataHash.current = currentHash
      }
    } catch (err) {
      console.warn('[SyncProvider] Error checking backend sync status:', err)
    }
  }, [])

  // Polling periódico para detectar se o banco de leitura (Read DB) foi atualizado por eventos CDC.
  // Não executa em rotas públicas (login, register) para evitar requisições desnecessárias sem token.
  useEffect(() => {
    if (isPublicRoute) return

    const token = getCookie('token')
    if (!token) return

    triggerCheck()

    const interval = setInterval(() => {
      triggerCheck()
    }, 10000)

    return () => clearInterval(interval)
  }, [isPublicRoute, triggerCheck])

  const resolveSync = useCallback(() => {
    setIsOutOfSync(false)
    previousDataHash.current = null
  }, [])

  return (
    <SyncContext.Provider value={{ isOutOfSync, lastSyncTime, triggerCheck, resolveSync }}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSync() {
  const context = useContext(SyncContext)
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider')
  }
  return context
}
