'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCookie } from '@/lib/cookies'
import { MapIcon, BookOpenIcon, UsersIcon, ShieldAlertIcon, ChevronLeftIcon } from 'lucide-react'

const CONTENT_MODULES = [
  {
    id: 'sagas',
    name: 'Sagas',
    description: 'Gerencie as grandes eras e divisões principais da história.',
    href: '/admin/content/sagas',
    icon: BookOpenIcon,
    active: true,
  },
  {
    id: 'arcos',
    name: 'Arcos',
    description: 'Gerencie os arcos de história pertencentes a cada saga.',
    href: '/admin/content/arcos',
    icon: MapIcon,
    active: true,
  },
  {
    id: 'ilhas',
    name: 'Ilhas',
    description: 'Gerencie as ilhas e localizações geográficas.',
    href: '/admin/content/ilhas',
    icon: MapIcon, // Placeholder, can change later
    active: false,
  },
  {
    id: 'characters',
    name: 'Personagens',
    description: 'Gerencie personagens e suas variações.',
    href: '/admin/content/characters',
    icon: UsersIcon,
    active: true,
  },
]

export default function AdminContentHubPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Controle de acesso
  useEffect(() => {
    const profile = getCookie('user_profile')
    if (profile !== 'ADMIN') {
      router.push('/')
      return
    }
    setIsAuthorized(true)
  }, [router])

  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      {/* Cabeçalho da Página */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer mt-1.5"
            title="Voltar para o mapa."
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Conteúdos</h1>
            <p className="text-muted-foreground mt-2">
              Selecione a entidade que deseja gerenciar. Apenas as opções ativas estão disponíveis no momento.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Módulos */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONTENT_MODULES.map((module) => {
            const Icon = module.icon
            return (
              <div
                key={module.id}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${module.active
                  ? 'border-border/60 bg-card hover:bg-muted/50 hover:border-primary/50 shadow-sm hover:shadow-md cursor-pointer group'
                  : 'border-border/20 bg-muted/20 opacity-60 cursor-not-allowed'
                  }`}
              >
                {!module.active && (
                  <div className="absolute top-4 right-4 inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    Em breve
                  </div>
                )}

                <div className={`p-3 rounded-xl w-fit ${module.active ? 'bg-primary/10 text-primary group-hover:scale-110 transition-transform' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="mt-4 text-xl font-bold">{module.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {module.description}
                </p>

                {module.active && (
                  <Link href={module.href} className="absolute inset-0 z-10">
                    <span className="sr-only">Ir para {module.name}</span>
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
