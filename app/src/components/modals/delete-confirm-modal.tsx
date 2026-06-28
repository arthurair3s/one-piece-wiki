import React from 'react'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'

export interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: React.ReactNode
  isLoading: boolean
  errorMessage?: string
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
  errorMessage,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border/50 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <TrashIcon className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <div className="text-muted-foreground mb-6 text-sm">{description}</div>
          {errorMessage && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
              {errorMessage}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" className="flex-1" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Sim, remover'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
