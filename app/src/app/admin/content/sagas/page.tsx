'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie } from '@/lib/cookies'
import type { Saga } from '@/types/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, BookOpenIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { SAGas_ADMIN_CONFIG as CONFIG } from './_configuration'
import { getSagas, createSaga, updateSaga, deleteSaga } from './_service'

// Tradução de mensagens de erro da API para PT-BR
function translateApiError(message?: string): string {
  if (!message) return 'Erro desconhecido.'
  const msg = Array.isArray(message) ? message.join(', ') : message
  const translations: Record<string, string> = {
    'name must be a string': 'Nome deve ser um texto.',
    'name should not be empty': 'Nome é obrigatório.',
    'order must be an integer number': 'Ordem deve ser um número inteiro.',
    'order must not be less than 1': 'A ordem deve ser maior que zero.',
    'description must be a string': 'A descrição deve ser um texto.',
    'Conflict': 'Já existe uma saga com este nome ou ordem cronológica.',
    'Unauthorized': 'Não autorizado. Faça login novamente.',
    'Forbidden': 'Sem permissão para esta ação.',
    'Saga não encontrada': 'Saga não encontrada.',
    'Não é possível deletar uma saga com arcos vinculados': 'Esta saga possui arcos vinculados e não pode ser deletada.',
  }
  for (const [key, value] of Object.entries(translations)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return value
  }
  if (msg.startsWith('Erro ')) return msg
  return msg
}

export default function AdminSagasPage() {
  const router = useRouter()

  // Controle de Acesso
  const [authChecked, setAuthChecked] = useState(false)

  // Estado dos Dados
  const [sagas, setSagas] = useState<Saga[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros e Paginação
  const [nameInput, setNameInput] = useState('')
  const [orderInput, setOrderInput] = useState('')
  const [activeName, setActiveName] = useState('')
  const [activeOrder, setActiveOrder] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(CONFIG.defaultPage)
  const limit = CONFIG.defaultLimit
  const totalPages = Math.max(1, Math.ceil(total / limit))

  // Modais e Formulário
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingSaga, setEditingSaga] = useState<Saga | null>(null)
  const [deletingSaga, setDeletingSaga] = useState<Saga | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  // Notificação de sucesso por 3 segundos
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Verifica Autenticação
  useEffect(() => {
    const profile = getCookie('user_profile')
    if (profile !== 'ADMIN') {
      router.push(CONFIG.fallbackRoute)
      return
    }
    setAuthChecked(true)
  }, [router])

  // Carrega Dados (com suporte a Short Polling para CQRS Eventual Consistency)
  const loadData = useCallback(async (name: string, order: number | undefined, currentPage: number, expectedTotalItems?: number, isUpdate?: boolean) => {
    setIsLoading(true)
    setError(null)

    const fetchWithRetry = async (retries = 5, delay = 600): Promise<{ sagas: Saga[], total: number }> => {
      try {
        const result = await getSagas({ name: name || undefined, order, page: currentPage, limit })
        
        // Verifica se é uma criação/remoção e o total ainda não atualizou no banco de leitura
        if (expectedTotalItems !== undefined && result.total !== expectedTotalItems && retries > 0) {
          console.log(`[CQRS] Polling: Expected ${expectedTotalItems}, got ${result.total}. Retrying... (${retries} left)`)
          await new Promise(res => setTimeout(res, delay))
          return fetchWithRetry(retries - 1, delay)
        }
        
        return result
      } catch (err: any) {
        if (retries > 0) {
          await new Promise(res => setTimeout(res, delay))
          return fetchWithRetry(retries - 1, delay)
        }
        throw err
      }
    }

    try {
      if (isUpdate) {
        // Para updates, o total não muda, então aguardamos a replicação do CDC proativamente
        await new Promise(res => setTimeout(res, 800))
      }
      const result = await fetchWithRetry()
      setSagas(result.sagas)
      setTotal(result.total)
    } catch (err: any) {
      setError(translateApiError(err.message) || 'Erro ao carregar as sagas.')
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    if (!authChecked) return
    loadData(activeName, activeOrder, page)
  }, [authChecked, activeName, activeOrder, page, loadData])

  // Debounce dos Filtros
  const handleNameChange = (value: string) => {
    setNameInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setActiveName(value)
      setPage(1)
    }, 450)
  }

  const handleOrderChange = (value: string) => {
    setOrderInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      const parsed = parseInt(value, 10)
      setActiveOrder(isNaN(parsed) ? undefined : parsed)
      setPage(1)
    }, 450)
  }

  // Ações de Modal
  const openCreate = () => { setEditingSaga(null); setFormError(''); setIsFormOpen(true) }
  const openEdit = (saga: Saga) => { setEditingSaga(saga); setFormError(''); setIsFormOpen(true) }
  const openDelete = (saga: Saga) => { setDeletingSaga(saga); setDeleteError(''); setIsDeleteOpen(true) }

  // Submit Formulário
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const orderStr = formData.get('order') as string
    const description = formData.get('description') as string

    if (!name || name.length < CONFIG.validationRules.name.minLength) {
      setFormError(CONFIG.validationRules.name.errorMessage)
      return
    }
    const order = parseInt(orderStr, 10)
    if (isNaN(order) || order < CONFIG.validationRules.order.min) {
      setFormError(CONFIG.validationRules.order.errorMessage)
      return
    }

    setIsSubmitting(true)
    try {
      if (editingSaga) {
        await updateSaga(editingSaga.id, { name, order, description })
        setIsFormOpen(false)
        setEditingSaga(null)
        showSuccess('Saga atualizada com sucesso!')
        await loadData(activeName, activeOrder, page, undefined, true)
      } else {
        await createSaga({ name, order, description })
        setIsFormOpen(false)
        setEditingSaga(null)
        showSuccess('Saga criada com sucesso!')
        // Avisa que esperamos que o total de itens aumente no Read DB
        await loadData(activeName, activeOrder, page, total + 1)
      }
    } catch (err: any) {
      setFormError(translateApiError(err.message) || 'Erro ao salvar a saga.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirmar Exclusão
  const handleDeleteConfirm = async () => {
    if (!deletingSaga) return
    setIsDeleting(true)
    try {
      await deleteSaga(deletingSaga.id)
      setIsDeleteOpen(false)
      setDeletingSaga(null)
      showSuccess('Saga excluída com sucesso!')
      
      // Retrocede página se era o último item dela
      const newTotal = total - 1
      const maxPage = Math.max(1, Math.ceil(newTotal / limit))
      const targetPage = Math.min(page, maxPage)
      
      if (targetPage !== page) {
        setPage(targetPage)
        // O useEffect do page vai cuidar do fetch normal, mas chamamos 
        // proativamente com polling para garantir que pegamos o estado CDC correto
        await loadData(activeName, activeOrder, targetPage, newTotal)
      } else {
        await loadData(activeName, activeOrder, targetPage, newTotal)
      }
    } catch (err: any) {
      setDeleteError(translateApiError(err.message) || 'Erro ao excluir a saga.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!authChecked) return null

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      {/* Toast de Sucesso */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-green-600/90 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-green-500/30">
            <span className="text-base">✓</span>
            {successMessage}
          </div>
        </div>
      )}
      {/* Header Interno */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/content')}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Voltar para gerenciamento de conteúdo"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold tracking-tight">{CONFIG.ui.title}</h1>
            </div>
          </div>
          <Button onClick={openCreate} size="sm" className="gap-1.5 shrink-0">
            <PlusIcon className="w-4 h-4" />
            {CONFIG.ui.createButton}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={CONFIG.ui.searchNamePlaceholder}
              value={nameInput}
              onChange={(e) => handleNameChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative flex-1 min-w-[120px] max-w-[160px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              placeholder={CONFIG.ui.searchOrderPlaceholder}
              value={orderInput}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="pl-9"
            />
          </div>
          {(activeName || activeOrder !== undefined) && (
            <button
              onClick={() => { setNameInput(''); setOrderInput(''); setActiveName(''); setActiveOrder(undefined); setPage(1) }}
              className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer transition-colors"
            >
              Limpar
            </button>
          )}
          <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
            {isLoading ? '...' : `${total} saga${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}`}
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[600px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead className="w-16">Ordem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Estados */}
                {error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="text-4xl">⚠️</div>
                        <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
                        <Button variant="outline" size="sm" onClick={() => loadData(activeName, activeOrder, page)}>
                          Tentar Novamente
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-6 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-6 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell className="hidden md:table-cell"><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-6 w-16 ml-auto bg-muted animate-pulse rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : sagas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <BookOpenIcon className="w-8 h-8 opacity-30" />
                        <p className="text-sm">{CONFIG.ui.emptyState}</p>
                        {(activeName || activeOrder !== undefined) && (
                          <p className="text-xs opacity-70">{CONFIG.ui.emptyStateSearch}</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sagas.map((saga) => (
                    <TableRow key={saga.id}>
                      <TableCell className="text-muted-foreground font-mono text-xs">{saga.id}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold">{saga.order}</TableCell>
                      <TableCell className="font-medium">{saga.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs hidden md:table-cell max-w-[200px] truncate">
                        {saga.description || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(saga)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDelete(saga)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Excluir"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Paginação */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 mt-2">
            <p className="text-xs text-muted-foreground">Página {page} de {totalPages}</p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline" size="icon-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (page > 3 && page < totalPages - 2) pageNum = page - 2 + i
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 text-xs rounded-lg transition-colors font-medium ${pageNum === page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted border border-border/40'}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <Button
                variant="outline" size="icon-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulário */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold tracking-tight mb-1">
                {editingSaga ? 'Editar Saga' : 'Nova Saga'}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {editingSaga ? 'Atualize as informações da saga.' : 'Preencha os dados da nova saga cronológica.'}
              </p>

              {formError && (
                <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
                  <div className="mt-0.5">⚠️</div>
                  <p className="leading-relaxed">{formError}</p>
                </div>
              )}

              <form id="saga-form" onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome da Saga <span className="text-destructive">*</span></label>
                  <Input
                    id="name" name="name" type="text" required
                    defaultValue={editingSaga?.name || ''}
                    placeholder="Ex: Alabasta"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="order" className="text-sm font-medium">Ordem Cronológica <span className="text-destructive">*</span></label>
                  <Input
                    id="order" name="order" type="number" min="1" required
                    defaultValue={editingSaga?.order || ''}
                    placeholder="Ex: 1"
                  />
                  <p className="text-xs text-muted-foreground">Posição numérica da saga na história.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Descrição</label>
                  <textarea
                    id="description" name="description"
                    defaultValue={editingSaga?.description || ''}
                    placeholder="Resumo dos eventos desta saga..."
                    className="flex min-h-[100px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 px-6 bg-muted/30 border-t border-border/40 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" form="saga-form" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {isDeleteOpen && deletingSaga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto">
                <TrashIcon className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-center mb-2">
                Excluir Saga?
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Tem certeza que deseja excluir a saga <strong>{deletingSaga.name}</strong>? Esta ação não pode ser desfeita.
              </p>

              {deleteError && (
                <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
                  <div className="mt-0.5">⚠️</div>
                  <p className="leading-relaxed">{deleteError}</p>
                </div>
              )}
            </div>
            <div className="p-4 px-6 bg-muted/30 border-t border-border/40 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? 'Excluindo...' : 'Excluir Saga'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
