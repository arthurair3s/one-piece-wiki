'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie } from '@/lib/cookies'
import type { Character } from '@/types/api'

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
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, UsersIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { CHARACTERS_ADMIN_CONFIG as CONFIG } from './_configuration'
import { getCharacters, createCharacter, deleteCharacter } from './_service'

function translateApiError(message?: string): string {
  if (!message) return 'Erro desconhecido.'
  const msg = Array.isArray(message) ? message.join(', ') : message
  const translations: Record<string, string> = {
    'name must be a string': 'Nome deve ser um texto.',
    'name should not be empty': 'Nome é obrigatório.',
    'slug must be a string': 'Slug deve ser um texto.',
    'slug should not be empty': 'Slug é obrigatório.',
    'Conflict': 'Já existe um personagem com este slug.',
    'Unauthorized': 'Não autorizado. Faça login novamente.',
    'Forbidden': 'Sem permissão para esta ação.',
    'Personagem não encontrado': 'Personagem não encontrado.',
  }
  for (const [key, value] of Object.entries(translations)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return value
  }
  if (msg.startsWith('Erro ')) return msg
  return msg
}

export default function AdminCharactersPage() {
  const router = useRouter()

  const [authChecked, setAuthChecked] = useState(false)

  const [characters, setCharacters] = useState<Character[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nameInput, setNameInput] = useState('')
  const [slugInput, setSlugInput] = useState('')
  const [activeName, setActiveName] = useState('')
  const [activeSlug, setActiveSlug] = useState('')
  const [page, setPage] = useState(CONFIG.defaultPage)
  const limit = CONFIG.defaultLimit
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingCharacter, setDeletingCharacter] = useState<Character | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const profile = getCookie('user_profile')
    if (profile !== 'ADMIN') {
      router.push(CONFIG.fallbackRoute)
      return
    }
    setAuthChecked(true)
  }, [router])

  // carrega dados com suporte a short polling para consistência eventual do cdc/cqrs
  const loadData = useCallback(async (name: string, slug: string, currentPage: number, expectedTotalItems?: number) => {
    setIsLoading(true)
    setError(null)

    const fetchWithRetry = async (retries = 5, delay = 600): Promise<{ characters: Character[], total: number }> => {
      try {
        const result = await getCharacters({ name: name || undefined, slug: slug || undefined, page: currentPage, limit })
        
        if (expectedTotalItems !== undefined && result.count !== expectedTotalItems && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay))
          return fetchWithRetry(retries - 1, delay)
        }
        
        return { characters: result.rows, total: result.count }
      } catch (err: any) {
        throw new Error(translateApiError(err.message))
      }
    }

    try {
      const { characters: fetched, total: fetchedTotal } = await fetchWithRetry()
      setCharacters(fetched)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    if (!authChecked) return
    loadData(activeName, activeSlug, page)
  }, [authChecked, activeName, activeSlug, page, loadData])

  const handleSearchChange = (nameVal: string, slugVal: string) => {
    setNameInput(nameVal)
    setSlugInput(slugVal)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setActiveName(nameVal)
      setActiveSlug(slugVal)
      setPage(1)
    }, 500)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsSubmitting(true)

    try {
      await createCharacter({ name: nameInput, slug: slugInput })
      showSuccess('Personagem criado com sucesso!')
      setIsFormOpen(false)
      setNameInput('')
      setSlugInput('')
      setPage(1)
      await loadData(activeName, activeSlug, 1, total + 1)
    } catch (err: any) {
      setFormError(translateApiError(err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCharacter) return
    setDeleteError('')
    setIsDeleting(true)

    try {
      await deleteCharacter(deletingCharacter.id)
      showSuccess('Personagem removido com sucesso!')
      setIsDeleteOpen(false)
      setDeletingCharacter(null)
      let newPage = page
      if (characters.length === 1 && page > 1) {
        newPage = page - 1
        setPage(newPage)
      }
      await loadData(activeName, activeSlug, newPage, Math.max(0, total - 1))
    } catch (err: any) {
      setDeleteError(translateApiError(err.message))
    } finally {
      setIsDeleting(false)
    }
  }

  if (!authChecked) return null

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-3 mb-8">
          <button
            onClick={() => router.push('/admin/content')}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-1.5"
            title="Voltar"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <UsersIcon className="w-8 h-8 text-primary" />
              Personagens
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os personagens base. As versões de cada um (alias, recompensa, status) são editadas em seus detalhes.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/20 bg-green-500/10 text-green-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {successMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                className="pl-9"
                value={nameInput}
                onChange={(e) => handleSearchChange(e.target.value, slugInput)}
              />
            </div>
            <div className="relative flex-1 sm:w-48">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por slug..."
                className="pl-9"
                value={slugInput}
                onChange={(e) => handleSearchChange(nameInput, e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => {
            setNameInput('')
            setSlugInput('')
            setIsFormOpen(true)
          }} className="w-full sm:w-auto gap-2">
            <PlusIcon className="w-4 h-4" />
            Novo Personagem
          </Button>
        </div>

        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          {isLoading && characters.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Carregando personagens...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 bg-red-500/5">
              <p className="font-medium">Erro ao carregar dados</p>
              <p className="text-sm opacity-80 mt-1">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => loadData(activeName, activeSlug, page)}>
                Tentar novamente
              </Button>
            </div>
          ) : characters.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Nenhum personagem encontrado</h3>
              <p className="text-muted-foreground mt-1">Crie um novo personagem para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="w-[150px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {characters.map((char) => (
                    <TableRow key={char.id} className="group">
                      <TableCell className="font-medium text-muted-foreground">#{char.id}</TableCell>
                      <TableCell className="font-medium">{char.name}</TableCell>
                      <TableCell className="text-muted-foreground">{char.slug}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-primary"
                            onClick={() => router.push(`/admin/content/characters/${char.id}`)}
                            title="Gerenciar Detalhes e Versões"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => {
                              setDeletingCharacter(char)
                              setIsDeleteOpen(true)
                            }}
                            title="Remover"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> a{' '}
              <span className="font-medium text-foreground">{Math.min(page * limit, total)}</span> de{' '}
              <span className="font-medium text-foreground">{total}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <div className="text-sm font-medium px-4">
                Página {page} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Criar */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Novo Personagem</h2>
              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
                  {formError}
                </div>
              )}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    required
                    value={nameInput}
                    onChange={(e) => {
                      const val = e.target.value
                      setNameInput(val)
                      // Auto-gerar slug se vazio ou se o usuário estava digitando normal
                      setSlugInput(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                    }}
                    placeholder="Ex: Monkey D. Luffy"
                    className="w-full"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    required
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value)}
                    placeholder="Ex: monkey-d-luffy"
                    className="w-full font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">URL amigável única do personagem.</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Criar Personagem'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      {isDeleteOpen && deletingCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <TrashIcon className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Remover Personagem</h2>
              <p className="text-muted-foreground mb-6">
                Tem certeza que deseja remover <strong>{deletingCharacter.name}</strong>?
              </p>
              {deleteError && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
                  {deleteError}
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
                  Cancelar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDeleteConfirm} disabled={isDeleting}>
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Sim, remover'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
