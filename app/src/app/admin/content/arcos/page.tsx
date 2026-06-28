'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie } from '@/lib/cookies'
import type { Arc, Saga, Island, CharacterVersion } from '@/types/api'

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
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, MapIcon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, EyeIcon, UserIcon } from 'lucide-react'
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal'
import { AdminPageHeader } from '@/components/layout/admin-page-header'

import { ARCS_ADMIN_CONFIG as CONFIG } from './_configuration'
import { getArcs, getArcById, createArc, updateArc, deleteArc, getSagas, getIslands, getCharacterVersions } from './_service'

function translateApiError(message?: string): string {
  if (!message) return 'Erro desconhecido.'
  const msg = Array.isArray(message) ? message.join(', ') : message
  const translations: Record<string, string> = {
    'name must be a string': 'Nome deve ser um texto.',
    'name should not be empty': 'Nome é obrigatório.',
    'description must be a string': 'Descrição deve ser um texto.',
    'saga_id must be an integer number': 'Saga é obrigatória.',
    'order must be an integer number': 'Ordem deve ser um número inteiro.',
    'order must not be less than 1': 'A ordem deve ser maior que zero.',
    'Conflict': 'Conflito de dados. Verifique se o nome ou ordem já existe nesta saga.',
    'Unauthorized': 'Não autorizado. Faça login novamente.',
    'Forbidden': 'Sem permissão para esta ação.',
    'Arc não encontrado': 'Arco não encontrado.',
  }
  for (const [key, value] of Object.entries(translations)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return value
  }
  return msg
}

interface IslandSelection {
  island_id: number
  order: number
}

interface VersionSelection {
  character_version_id: number
  character_id: number
  order: number
}

export default function AdminArcsPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  // Data lists
  const [arcs, setArcs] = useState<Arc[]>([])
  const [sagas, setSagas] = useState<Saga[]>([])
  const [islands, setIslands] = useState<Island[]>([])
  const [characterVersions, setCharacterVersions] = useState<CharacterVersion[]>([])

  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [nameFilter, setNameFilter] = useState('')
  const [sagaFilter, setSagaFilter] = useState('')
  const [activeName, setActiveName] = useState('')
  const [activeSagaId, setActiveSagaId] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(CONFIG.defaultPage)
  const limit = CONFIG.defaultLimit
  const totalPages = Math.max(1, Math.ceil(total / limit))

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingArc, setEditingArc] = useState<Arc | null>(null)
  const [deletingArc, setDeletingArc] = useState<Arc | null>(null)
  
  // Details Modal State
  const [viewingArc, setViewingArc] = useState<Arc | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  const [nameInput, setNameInput] = useState('')
  const [descriptionInput, setDescriptionInput] = useState('')
  const [sagaIdInput, setSagaIdInput] = useState('')
  const [orderInput, setOrderInput] = useState('')

  // Relations state in the form
  const [selectedIslands, setSelectedIslands] = useState<IslandSelection[]>([])
  const [selectedVersions, setSelectedVersions] = useState<VersionSelection[]>([])

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

  // Load supporting lists once
  useEffect(() => {
    if (!authChecked) return
    const loadSupportData = async () => {
      try {
        const [sagasList, islandsList, versionsList] = await Promise.all([
          getSagas({ limit: 1000 }),
          getIslands({ limit: 1000 }),
          getCharacterVersions({ limit: 1000 })
        ])
        setSagas(sagasList)
        setIslands(islandsList)
        // filter versions that might be invalid
        setCharacterVersions(versionsList.filter(v => v.character_id))
      } catch (err) {
        console.error('Erro ao carregar dados auxiliares:', err)
      }
    }
    loadSupportData()
  }, [authChecked])

  // Load Arcs with polling support
  const loadData = useCallback(async (name: string, sagaId: number | undefined, currentPage: number, expectedTotalItems?: number) => {
    setIsLoading(true)
    setError(null)

    const fetchWithRetry = async (retries = 5, delay = 600): Promise<{ arcs: Arc[], total: number }> => {
      try {
        const result = await getArcs({ name: name || undefined, saga_id: sagaId, page: currentPage, limit })
        if (expectedTotalItems !== undefined && result.total !== expectedTotalItems && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay))
          return fetchWithRetry(retries - 1, delay)
        }
        return { arcs: result.arcs, total: result.total }
      } catch (err: any) {
        throw new Error(translateApiError(err.message))
      }
    }

    try {
      const { arcs: fetched, total: fetchedTotal } = await fetchWithRetry()
      setArcs(fetched)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    if (!authChecked) return
    loadData(activeName, activeSagaId, page)
  }, [authChecked, activeName, activeSagaId, page, loadData])

  const handleSearchNameChange = (val: string) => {
    setNameFilter(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setActiveName(val)
      setPage(1)
    }, 500)
  }

  const handleSearchSagaChange = (val: string) => {
    setSagaFilter(val)
    const sId = val ? Number(val) : undefined
    setActiveSagaId(sId)
    setPage(1)
  }

  const openCreateModal = () => {
    setEditingArc(null)
    setNameInput('')
    setDescriptionInput('')
    setSagaIdInput('')
    setOrderInput('')
    setSelectedIslands([])
    setSelectedVersions([])
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditModal = async (arc: Arc) => {
    setFormError('')
    setIsSubmitting(true)
    try {
      const fullArc = await getArcById(arc.id)
      setEditingArc(fullArc)
      setNameInput(fullArc.name)
      setDescriptionInput(fullArc.description || '')
      setSagaIdInput(String(fullArc.saga_id || ''))
      setOrderInput(String(fullArc.order))

      // preencher ilhas selecionadas
      if (fullArc.islands) {
        setSelectedIslands(fullArc.islands.map(i => ({
          island_id: i.id,
          order: (i as any).ArcIsland?.order || 0
        })))
      } else {
        setSelectedIslands([])
      }

      // preencher versões selecionadas
      if (fullArc.character_versions) {
        setSelectedVersions(fullArc.character_versions.map(v => ({
          character_version_id: v.id,
          character_id: v.character_id,
          order: (v as any).ArcCharacterVersion?.order || 0
        })))
      } else {
        setSelectedVersions([])
      }

      setIsFormOpen(true)
    } catch (err: any) {
      setError('Erro ao carregar detalhes do arco: ' + (err.message || ''))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDetailsModal = async (arc: Arc) => {
    setIsDetailsLoading(true)
    setViewingArc(null)
    setIsDetailsOpen(true)
    try {
      const fullArc = await getArcById(arc.id)
      setViewingArc(fullArc)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao carregar detalhes do arco: ' + (err.message || ''))
      setIsDetailsOpen(false)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!sagaIdInput) {
      setFormError('Selecione uma saga.')
      return
    }

    // Validação no cliente: Unicidade do personagem raiz no arco
    const characterIds = selectedVersions.map(v => v.character_id)
    if (new Set(characterIds).size !== characterIds.length) {
      setFormError('Erro: Você selecionou mais de uma versão para o mesmo personagem. Cada personagem só pode ter uma versão vinculada por arco.')
      return
    }

    setIsSubmitting(true)

    const payload = {
      name: nameInput,
      description: descriptionInput,
      saga_id: Number(sagaIdInput),
      order: Number(orderInput),
      islands: selectedIslands,
      character_versions: selectedVersions.map(v => ({
        character_version_id: v.character_version_id,
        order: v.order
      }))
    }

    try {
      if (editingArc) {
        await updateArc(editingArc.id, payload)
        showSuccess('Arco atualizado com sucesso!')
        setIsFormOpen(false)
        await loadData(activeName, activeSagaId, page)
      } else {
        await createArc(payload)
        showSuccess('Arco criado com sucesso!')
        setIsFormOpen(false)
        setPage(1)
        await loadData(activeName, activeSagaId, 1, total + 1)
      }
    } catch (err: any) {
      setFormError(translateApiError(err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingArc) return
    setDeleteError('')
    setIsDeleting(true)

    try {
      await deleteArc(deletingArc.id)
      showSuccess('Arco removido com sucesso!')
      setIsDeleteOpen(false)
      setDeletingArc(null)
      let newPage = page
      if (arcs.length === 1 && page > 1) {
        newPage = page - 1
        setPage(newPage)
      }
      await loadData(activeName, activeSagaId, newPage, Math.max(0, total - 1))
    } catch (err: any) {
      setDeleteError(translateApiError(err.message))
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleIslandSelection = (islandId: number) => {
    setSelectedIslands(prev => {
      const exists = prev.find(i => i.island_id === islandId)
      if (exists) {
        return prev.filter(i => i.island_id !== islandId)
      } else {
        // pega a ordem máxima atual + 1 como sugestão
        const maxOrder = prev.reduce((max, curr) => Math.max(max, curr.order), 0)
        return [...prev, { island_id: islandId, order: maxOrder + 1 }]
      }
    })
  }

  const updateIslandOrder = (islandId: number, orderVal: string) => {
    const orderNum = Number(orderVal) || 0
    setSelectedIslands(prev => prev.map(i => i.island_id === islandId ? { ...i, order: orderNum } : i))
  }

  const toggleVersionSelection = (versionId: number, characterId: number) => {
    setSelectedVersions(prev => {
      const exists = prev.find(v => v.character_version_id === versionId)
      if (exists) {
        return prev.filter(v => v.character_version_id !== versionId)
      } else {
        // Verifica se outra versão deste mesmo personagem já está selecionada
        const otherVer = prev.find(v => v.character_id === characterId)
        if (otherVer) {
          // Desvincula a anterior e vincula a nova (ou avisa)
          const filtered = prev.filter(v => v.character_id !== characterId)
          return [...filtered, { character_version_id: versionId, character_id: characterId, order: 0 }]
        }
        return [...prev, { character_version_id: versionId, character_id: characterId, order: 0 }]
      }
    })
  }

  const updateVersionOrder = (versionId: number, orderVal: string) => {
    const orderNum = Number(orderVal) || 0
    setSelectedVersions(prev => prev.map(v => v.character_version_id === versionId ? { ...v, order: orderNum } : v))
  }

  if (!authChecked) return null

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <AdminPageHeader
          title={CONFIG.ui.title}
          description={CONFIG.ui.description}
          icon={MapIcon}
        />

        {successMessage && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/20 bg-green-500/10 text-green-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {successMessage}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={CONFIG.ui.searchNamePlaceholder}
                className="pl-9"
                value={nameFilter}
                onChange={(e) => handleSearchNameChange(e.target.value)}
              />
            </div>
            <div className="flex-1 sm:w-48">
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={sagaFilter}
                onChange={(e) => handleSearchSagaChange(e.target.value)}
              >
                <option value="">Filtrar por Saga...</option>
                {sagas.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2">
            <PlusIcon className="w-4 h-4" />
            {CONFIG.ui.createButton}
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          {isLoading && arcs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Carregando arcos...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 bg-red-500/5">
              <p className="font-medium">Erro ao carregar dados</p>
              <p className="text-sm opacity-80 mt-1">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => loadData(activeName, activeSagaId, page)}>
                Tentar novamente
              </Button>
            </div>
          ) : arcs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">{CONFIG.ui.emptyState}</h3>
              <p className="text-muted-foreground mt-1">{CONFIG.ui.emptyStateSearch}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Saga</TableHead>
                    <TableHead>Ordem Cronológica</TableHead>
                    <TableHead className="w-[150px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arcs.map((arc) => (
                    <TableRow key={arc.id} className="group">
                      <TableCell className="font-medium text-muted-foreground">#{arc.id}</TableCell>
                      <TableCell className="font-medium">{arc.name}</TableCell>
                      <TableCell className="text-muted-foreground">{(arc as any).saga?.name || 'Saga #' + arc.saga_id}</TableCell>
                      <TableCell className="text-muted-foreground">Posição: {arc.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-primary"
                            onClick={() => openDetailsModal(arc)}
                            title="Visualizar Detalhes"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-primary"
                            onClick={() => openEditModal(arc)}
                            title="Editar"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => {
                              setDeletingArc(arc)
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

        {/* Pagination */}
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

      {/* Form Modal (Create / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 shrink-0">
              <h2 className="text-xl font-bold">{editingArc ? 'Editar Arco' : 'Novo Arco'}</h2>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
                  {formError}
                </div>
              )}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Arco</label>
                    <Input
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Ex: Alabasta"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ordem na Saga</label>
                    <Input
                      required
                      type="number"
                      min="1"
                      value={orderInput}
                      onChange={(e) => setOrderInput(e.target.value)}
                      placeholder="Ex: 1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Saga de Pertencimento</label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={sagaIdInput}
                    onChange={(e) => setSagaIdInput(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma saga...</option>
                    {sagas.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Ordem: {s.order})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <textarea
                    required
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Resumo dos acontecimentos deste arco..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* Ilhas pivot */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Ilhas deste Arco
                    <span className="text-xs text-muted-foreground">(Selecione e defina a ordem cronológica)</span>
                  </label>
                  <div className="border border-border/50 rounded-lg max-h-48 overflow-y-auto p-3 space-y-2 bg-muted/10">
                    {islands.map(isl => {
                      const selection = selectedIslands.find(si => si.island_id === isl.id)
                      const isChecked = !!selection
                      return (
                        <div key={isl.id} className="flex items-center justify-between p-1.5 rounded hover:bg-muted/40 transition-colors">
                          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleIslandSelection(isl.id)}
                              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                            />
                            <span>{isl.name}</span>
                          </label>
                          {isChecked && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Ordem:</span>
                              <input
                                type="number"
                                min="0"
                                className="w-16 h-7 rounded border bg-card px-2 text-xs focus:outline-none text-center"
                                value={selection.order}
                                onChange={(e) => updateIslandOrder(isl.id, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Versões de Personagem pivot */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Aparições de Personagens
                    <span className="text-xs text-muted-foreground">(Max 1 versão de cada personagem base)</span>
                  </label>
                  <div className="border border-border/50 rounded-lg max-h-48 overflow-y-auto p-3 space-y-2 bg-muted/10">
                    {characterVersions.map(ver => {
                      const selection = selectedVersions.find(sv => sv.character_version_id === ver.id)
                      const isChecked = !!selection

                      // Verifica se outra versão deste mesmo personagem base já está selecionada
                      const otherVersionSelected = !isChecked && selectedVersions.some(sv => sv.character_id === ver.character_id)

                      return (
                        <div key={ver.id} className="flex items-center justify-between p-1.5 rounded hover:bg-muted/40 transition-colors">
                          <label className={`flex items-center gap-2 text-sm cursor-pointer select-none ${otherVersionSelected ? 'opacity-50' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleVersionSelection(ver.id, ver.character_id)}
                              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                            />
                            <span>{ver.alias || 'Versão #' + ver.id} <span className="text-xs text-muted-foreground">({(ver as any).character?.name || 'Base'})</span></span>
                          </label>
                          {otherVersionSelected && (
                            <span className="text-[10px] text-yellow-600 bg-yellow-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <InfoIcon className="w-3 h-3" /> Outra versão já marcada
                            </span>
                          )}
                          {isChecked && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Ordem de Exibição:</span>
                              <input
                                type="number"
                                min="0"
                                className="w-16 h-7 rounded border bg-card px-2 text-xs focus:outline-none text-center"
                                value={selection.order}
                                onChange={(e) => updateVersionOrder(ver.id, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border/50 flex gap-3 shrink-0">
              <Button variant="outline" className="flex-1" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleFormSubmit} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Salvar Arco'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remover Arco"
        description={
          <>
            Tem certeza que deseja remover o arco <strong>{deletingArc?.name}</strong>?
          </>
        }
        isLoading={isDeleting}
        errorMessage={deleteError}
      />

      {/* Details Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 shrink-0 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-primary" />
                Detalhes do Arco
              </h2>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground" onClick={() => setIsDetailsOpen(false)}>
                Fechar
              </Button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {isDetailsLoading || !viewingArc ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Carregando detalhes do arco...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* General Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border/30">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Nome do Arco</div>
                      <div className="font-semibold text-lg">{viewingArc.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Saga</div>
                      <div className="font-semibold text-lg">{(viewingArc as any).saga?.name || 'Saga #' + viewingArc.saga_id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Ordem na Saga</div>
                      <div className="font-semibold text-lg">{viewingArc.order}</div>
                    </div>
                  </div>

                  {viewingArc.description && (
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-muted-foreground">Descrição</div>
                      <p className="text-sm leading-relaxed p-4 rounded-xl bg-muted/30 border border-border/20 text-foreground">
                        {viewingArc.description}
                      </p>
                    </div>
                  )}

                  {/* Islands Section */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      Ilhas do Arco ({viewingArc.islands?.length || 0})
                    </h3>
                    {!viewingArc.islands || viewingArc.islands.length === 0 ? (
                      <div className="p-4 text-center rounded-xl bg-muted/20 border border-dashed border-border/50 text-muted-foreground text-sm">
                        Nenhuma ilha vinculada a este arco.
                      </div>
                    ) : (
                      <div className="border border-border/30 rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead>Ilha</TableHead>
                              <TableHead>Região</TableHead>
                              <TableHead className="text-right">Ordem Cronológica</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...(viewingArc.islands || [])]
                              .sort((a, b) => ((a as any).ArcIsland?.order ?? 0) - ((b as any).ArcIsland?.order ?? 0))
                              .map((island) => (
                                <TableRow key={island.id}>
                                  <TableCell className="font-semibold">{island.name}</TableCell>
                                  <TableCell className="text-muted-foreground">{island.region || '-'}</TableCell>
                                  <TableCell className="text-right font-medium text-primary">
                                    #{ (island as any).ArcIsland?.order || 0 }
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  {/* Character Versions Section */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      Personagens e Versões ({viewingArc.character_versions?.length || 0})
                    </h3>
                    {!viewingArc.character_versions || viewingArc.character_versions.length === 0 ? (
                      <div className="p-4 text-center rounded-xl bg-muted/20 border border-dashed border-border/50 text-muted-foreground text-sm">
                        Nenhum personagem vinculado a este arco.
                      </div>
                    ) : (
                      <div className="border border-border/30 rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead>Personagem / Versão</TableHead>
                              <TableHead>Título (Epíteto)</TableHead>
                              <TableHead>Recompensa</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Ordem de Exibição</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...(viewingArc.character_versions || [])]
                              .sort((a, b) => ((a as any).ArcCharacterVersion?.order ?? 0) - ((b as any).ArcCharacterVersion?.order ?? 0))
                              .map((version) => (
                                <TableRow key={version.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      {version.image_url ? (
                                        <img
                                          src={version.image_url}
                                          alt={version.alias}
                                          className="w-8 h-8 rounded-full object-cover border border-border/50"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                                          <UserIcon className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-semibold">{version.alias || '-'}</div>
                                        <div className="text-xs text-muted-foreground">
                                          Base: {(version as any).character?.name || '-'}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">{version.epithet || '-'}</TableCell>
                                  <TableCell>
                                    {version.bounty ? `฿ ${version.bounty.toLocaleString()}` : '-'}
                                  </TableCell>
                                  <TableCell>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      version.status === 'ALIVE' ? 'bg-green-500/10 text-green-500' :
                                      version.status === 'DECEASED' ? 'bg-red-500/10 text-red-500' :
                                      version.status === 'IMPRISONED' ? 'bg-yellow-500/10 text-yellow-500' :
                                      'bg-gray-500/10 text-gray-500'
                                    }`}>
                                      {
                                        version.status === 'ALIVE' ? 'Vivo' :
                                        version.status === 'DECEASED' ? 'Falecido' :
                                        version.status === 'IMPRISONED' ? 'Preso' : 'Desconhecido'
                                      }
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-primary">
                                    #{ (version as any).ArcCharacterVersion?.order || 0 }
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border/50 shrink-0 flex justify-end bg-muted/20">
              <Button onClick={() => setIsDetailsOpen(false)}>
                Fechar Detalhes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
