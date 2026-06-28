import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon } from 'lucide-react'

export interface AdminPageHeaderProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  backRoute?: string // padrão: '/admin/content'
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  backRoute = '/admin/content',
}: AdminPageHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex items-start gap-3 mb-8">
      <button
        onClick={() => router.push(backRoute)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-1.5 cursor-pointer"
        title="Voltar"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Icon className="w-8 h-8 text-primary animate-[fadeIn_0.5s_ease-out]" />
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      </div>
    </div>
  )
}
