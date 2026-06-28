'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie } from '@/lib/cookies'
import type { Island, Arc } from '@/types/api'

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
import {
  SearchIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  EyeIcon,
  GlobeIcon
} from 'lucide-react'
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal'

import { ISLANDS_ADMIN_CONFIG as CONFIG } from './_configuration'
import {
  getIslands,
  getIslandById,
  createIsland,
  updateIsland,
  deleteIsland,
  getArcs
} from './_service'

function translateApiError(message?: string): string {
  if (!message) return 'Erro desconhecido.'
  const msg = Array.isArray(message) ? message.join(', ') : message
  const translations: Record<string, string> = {
    'name must be a string': 'Nome deve ser um texto.',
    'name should not be empty': 'Nome é obrigatório.',
    'description must be a string': 'Descrição deve ser um texto.',
    'description should not be empty': 'Descrição é obrigatória.',
    'coordinate_x must be a number': 'Coordenada X deve ser um número.',
    'coordinate_y must be a number': 'Coordenada Y deve ser um número.',
    'coordinate_z must be a number': 'Coordenada Z deve ser um número.',
    'model_url must be a string': 'URL do modelo deve ser um texto.',
    'model_url should not be empty': 'URL do modelo é obrigatória.',
    'thumbnail_url must be a URL address': 'A miniatura deve ser uma URL válida.',
    'arc_ids must contain at least 1 elements': 'Vincule a ilha a pelo menos um arco de história.',
    'Conflict': 'Conflito de dados. Verifique se o nome já existe.',
    'Unauthorized': 'Não autorizado. Faça login novamente.',
    'Forbidden': 'Sem permissão para esta ação.',
    'Island não encontrada': 'Ilha não encontrada.',
  }
  for (const [key, value] of Object.entries(translations)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return value
  }
  return msg
}

interface ArcSelection {
  arc_id: number
  order: number
}

export default function AdminIslandsPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  // Data lists
  const [islands, setIslands] = useState<Island[]>([])
  const [arcs, setArcs] = useState<Arc[]>([])

  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [nameFilter, setNameFilter] = useState('')
  const [activeName, setActiveName] = useState('')
  const [page, setPage] = useState(CONFIG.defaultPage)
  const limit = CONFIG.defaultLimit
  const totalPages = Math.max(1, Math.ceil(total / limit))

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingIsland, setEditingIsland] = useState<Island | null>(null)
  const [deletingIsland, setDeletingIsland] = useState<Island | null>(null)

  // Details Modal State
  const [viewingIsland, setViewingIsland] = useState<Island | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  // Inputs State
  const [nameInput, setNameInput] = useState('')
  const [descriptionInput, setDescriptionInput] = useState('')
  const [xInput, setXInput] = useState('')
  const [yInput, setYInput] = useState('')
  const [zInput, setZInput] = useState('')
  const [rotationInput, setRotationInput] = useState('-180')
  const [scaleInput, setScaleInput] = useState('1')
  const [modelUrlInput, setModelUrlInput] = useState('')
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('')
  const [isActiveInput, setIsActiveInput] = useState(true)

  // Linkages
  const [selectedArcs, setSelectedArcs] = useState<ArcSelection[]>([])

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

  // Load Arcos list once
  useEffect(() => {
    if (!authChecked) return
    const loadArcs = async () => {
      try {
        const arcosList = await getArcs({ limit: 1000 })
        setArcs(arcosList)
      } catch (err) {
        console.error('Erro ao carregar lista de arcos:', err)
      }
    }
    loadArcs()
  }, [authChecked])

  // Load Islands with pagination and search
  const loadData = useCallback(async (name: string, currentPage: number, expectedTotalItems?: number) => {
    setIsLoading(true)
    setError(null)

    const fetchWithRetry = async (retries = 5, delay = 600): Promise<{ islands: Island[], total: number }> => {
      try {
        const result = await getIslands({ name: name || undefined, page: currentPage, limit, is_active: undefined })
        if (expectedTotalItems !== undefined && result.total !== expectedTotalItems && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay))
          return fetchWithRetry(retries - 1, delay)
        }
        return { islands: result.islands, total: result.total }
      } catch (err: any) {
        throw new Error(translateApiError(err.message))
      }
    }

    try {
      const { islands: fetched, total: fetchedTotal } = await fetchWithRetry()
      setIslands(fetched)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    if (!authChecked) return
    loadData(activeName, page)
  }, [authChecked, activeName, page, loadData])

  const handleSearchNameChange = (val: string) => {
    setNameFilter(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setActiveName(val)
      setPage(1)
    }, 500)
  }

  const openCreateModal = () => {
    setEditingIsland(null)
    setNameInput('')
    setDescriptionInput('')
    setXInput('0')
    setYInput('0')
    setZInput('0')
    setRotationInput('-180')
    setScaleInput('1')
    setModelUrlInput('')
    setThumbnailUrlInput('')
    setIsActiveInput(true)
    setSelectedArcs([])
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditModal = async (island: Island) => {
    setFormError('')
    setIsSubmitting(true)
    try {
      const fullIsland = await getIslandById(island.id)
      setEditingIsland(fullIsland)
      setNameInput(fullIsland.name)
      setDescriptionInput(fullIsland.description || '')
      setXInput(String(fullIsland.coordinate_x ?? fullIsland.coordinates?.x ?? 0))
      setYInput(String(fullIsland.coordinate_y ?? fullIsland.coordinates?.y ?? 0))
      setZInput(String(fullIsland.coordinate_z ?? fullIsland.coordinates?.z ?? 0))
      setRotationInput(String(fullIsland.rotation_y ?? -180))
      setScaleInput(String(fullIsland.scale ?? 1))
      setModelUrlInput(fullIsland.model_url || '')
      setThumbnailUrlInput(fullIsland.thumbnail_url || fullIsland.thumbnailUrl || '')
      setIsActiveInput(fullIsland.is_active ?? true)

      // preencher arcos selecionados
      if (fullIsland.arcs) {
        setSelectedArcs(fullIsland.arcs.map(a => ({
          arc_id: a.id,
          order: (a as any).ArcIslandRead?.order ?? (a as any).ArcIsland?.order ?? 0
        })))
      } else {
        setSelectedArcs([])
      }

      setIsFormOpen(true)
    } catch (err: any) {
      setError('Erro ao carregar detalhes da ilha: ' + (err.message || ''))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDetailsModal = async (island: Island) => {
    setIsDetailsLoading(true)
    setViewingIsland(null)
    setIsDetailsOpen(true)
    try {
      const fullIsland = await getIslandById(island.id)
      setViewingIsland(fullIsland)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao carregar detalhes da ilha: ' + (err.message || ''))
      setIsDetailsOpen(false)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (selectedArcs.length === 0) {
      setFormError('Erro: Você deve selecionar pelo menos um arco de pertencimento para esta ilha.')
      return
    }

    setIsSubmitting(true)

    const payload = {
      name: nameInput,
      description: descriptionInput,
      coordinate_x: Number(xInput),
      coordinate_y: Number(yInput),
      coordinate_z: Number(zInput),
      rotation_y: Number(rotationInput),
      scale: Number(scaleInput),
      model_url: modelUrlInput,
      thumbnail_url: thumbnailUrlInput || undefined,
      is_active: isActiveInput,
      arc_ids: selectedArcs
    }

    try {
      if (editingIsland) {
        await updateIsland(editingIsland.id, payload)
        showSuccess('Ilha atualizada com sucesso!')
        setIsFormOpen(false)
        await loadData(activeName, page)
      } else {
        await createIsland(payload)
        showSuccess('Ilha criada com sucesso!')
        setIsFormOpen(false)
        setPage(1)
        await loadData(activeName, 1, total + 1)
      }
    } catch (err: any) {
      setFormError(translateApiError(err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingIsland) return
    setDeleteError('')
    setIsDeleting(true)

    try {
      await deleteIsland(deletingIsland.id)
      showSuccess('Ilha removida com sucesso!')
      setIsDeleteOpen(false)
      setDeletingIsland(null)
      let newPage = page
      if (islands.length === 1 && page > 1) {
        newPage = page - 1
        setPage(newPage)
      }
      await loadData(activeName, newPage, Math.max(0, total - 1))
    } catch (err: any) {
      setDeleteError(translateApiError(err.message))
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleArcSelection = (arcId: number) => {
    setSelectedArcs(prev => {
      const exists = prev.find(a => a.arc_id === arcId)
      if (exists) {
        return prev.filter(a => a.arc_id !== arcId)
      } else {
        const maxOrder = prev.reduce((max, curr) => Math.max(max, curr.order), 0)
        return [...prev, { arc_id: arcId, order: maxOrder + 1 }]
      }
    })
  }

  const updateArcOrder = (arcId: number, orderVal: string) => {
    const orderNum = Number(orderVal) || 0
    setSelectedArcs(prev => prev.map(a => a.arc_id === arcId ? { ...a, order: orderNum } : a))
  }

  if (!authChecked) return null

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
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
              <GlobeIcon className="w-8 h-8 text-primary" />
              {CONFIG.ui.title}
            </h1>
            <p className="text-muted-foreground mt-2">{CONFIG.ui.description}</p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/20 bg-green-500/10 text-green-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {successMessage}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={CONFIG.ui.searchNamePlaceholder}
              className="pl-9"
              value={nameFilter}
              onChange={(e) => handleSearchNameChange(e.target.value)}
            />
          </div>
          <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2">
            <PlusIcon className="w-4 h-4" />
            {CONFIG.ui.createButton}
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          {isLoading && islands.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Carregando ilhas...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 bg-red-500/5">
              <p className="font-medium">Erro ao carregar dados</p>
              <p className="text-sm opacity-80 mt-1">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => loadData(activeName, page)}>
                Tentar novamente
              </Button>
            </div>
          ) : islands.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GlobeIcon className="w-8 h-8 text-muted-foreground" />
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
                    <TableHead className="w-[60px]">Miniatura</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Coordenadas (X, Y, Z)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {islands.map((island) => {
                    const thumb = island.thumbnail_url || island.thumbnailUrl
                    const coords = island.coordinates || {
                      x: island.coordinate_x ?? 0,
                      y: island.coordinate_y ?? 0,
                      z: island.coordinate_z ?? 0
                    }
                    return (
                      <TableRow key={island.id} className="group">
                        <TableCell className="font-medium text-muted-foreground">#{island.id}</TableCell>
                        <TableCell>
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={island.name}
                              className="w-8 h-8 rounded-lg object-cover border border-border/50 bg-muted"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-muted border border-border/50 flex items-center justify-center">
                              <MapIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{island.name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {coords.x.toFixed(1)}, {coords.y.toFixed(1)}, {coords.z.toFixed(1)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            island.is_active !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {island.is_active !== false ? 'Ativa' : 'Inativa'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-primary"
                              onClick={() => openDetailsModal(island)}
                              title="Visualizar Detalhes"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-primary"
                              onClick={() => openEditModal(island)}
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => {
                                setDeletingIsland(island)
                                setIsDeleteOpen(true)
                              }}
                              title="Remover"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
              <h2 className="text-xl font-bold">{editingIsland ? 'Editar Ilha' : 'Nova Ilha'}</h2>
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
                    <label className="text-sm font-medium">Nome da Ilha</label>
                    <Input
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Ex: Dawn Island"
                    />
                  </div>
                  <div className="space-y-2 flex items-center gap-3 pt-8 pl-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActiveInput}
                      onChange={(e) => setIsActiveInput(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                      Ilha Ativa (Exibir no Mapa 3D)
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <textarea
                    required
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Descrição detalhada e pontos turísticos da ilha..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* Coordenadas 3D */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coordenadas no Mapa 3D</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">X</span>
                      <Input
                        required
                        type="number"
                        step="any"
                        value={xInput}
                        onChange={(e) => setXInput(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Y</span>
                      <Input
                        required
                        type="number"
                        step="any"
                        value={yInput}
                        onChange={(e) => setYInput(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Z</span>
                      <Input
                        required
                        type="number"
                        step="any"
                        value={zInput}
                        onChange={(e) => setZInput(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Rotação e Escala */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rotação Y (Graus)</label>
                    <Input
                      required
                      type="number"
                      step="any"
                      value={rotationInput}
                      onChange={(e) => setRotationInput(e.target.value)}
                      placeholder="-180"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Escala 3D</label>
                    <Input
                      required
                      type="number"
                      step="any"
                      min="0.1"
                      value={scaleInput}
                      onChange={(e) => setScaleInput(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* URLs de Modelos */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL do Modelo 3D (.GLB)</label>
                  <Input
                    required
                    value={modelUrlInput}
                    onChange={(e) => setModelUrlInput(e.target.value)}
                    placeholder="https://models.onepiece.com/dawn.glb"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL da Imagem / Miniatura (Opcional)</label>
                  <Input
                    type="url"
                    value={thumbnailUrlInput}
                    onChange={(e) => setThumbnailUrlInput(e.target.value)}
                    placeholder="https://images.onepiece.com/dawn.jpg"
                  />
                </div>

                {/* Arcos Pivot List */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Arcos em que a Ilha aparece
                    <span className="text-xs text-muted-foreground">(Selecione ao menos 1 arco e sua ordem)</span>
                  </label>
                  <div className="border border-border/50 rounded-lg max-h-48 overflow-y-auto p-3 space-y-2 bg-muted/10">
                    {arcs.map(arc => {
                      const selection = selectedArcs.find(sa => sa.arc_id === arc.id)
                      const isChecked = !!selection
                      return (
                        <div key={arc.id} className="flex items-center justify-between p-1.5 rounded hover:bg-muted/40 transition-colors">
                          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleArcSelection(arc.id)}
                              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                            />
                            <span>{arc.name}</span>
                          </label>
                          {isChecked && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Ordem da ilha neste arco:</span>
                              <input
                                type="number"
                                min="1"
                                className="w-16 h-7 rounded border bg-card px-2 text-xs focus:outline-none text-center"
                                value={selection.order}
                                onChange={(e) => updateArcOrder(arc.id, e.target.value)}
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
                  'Salvar Ilha'
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
        title="Remover Ilha"
        description={
          <>
            Tem certeza que deseja remover a ilha <strong>{deletingIsland?.name}</strong>?
            Isso removerá apenas a ilha e seus vínculos temporais nos arcos. Os Arcos em si não serão deletados.
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
                <GlobeIcon className="w-5 h-5 text-primary" />
                Detalhes da Ilha
              </h2>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground" onClick={() => setIsDetailsOpen(false)}>
                Fechar
              </Button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {isDetailsLoading || !viewingIsland ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Carregando detalhes da ilha...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* General Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border/30">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Nome da Ilha</div>
                      <div className="font-semibold text-lg">{viewingIsland.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Coordenadas 3D</div>
                      <div className="font-semibold text-base font-mono">
                        X: {(viewingIsland.coordinates?.x ?? viewingIsland.coordinate_x ?? 0).toFixed(1)},{' '}
                        Y: {(viewingIsland.coordinates?.y ?? viewingIsland.coordinate_y ?? 0).toFixed(1)},{' '}
                        Z: {(viewingIsland.coordinates?.z ?? viewingIsland.coordinate_z ?? 0).toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Status</div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          viewingIsland.is_active !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {viewingIsland.is_active !== false ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3D configurations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border/20">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Rotação Y</div>
                      <div className="font-semibold">{viewingIsland.rotation_y ?? -180}°</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Escala do Modelo</div>
                      <div className="font-semibold">{viewingIsland.scale ?? 1}x</div>
                    </div>
                  </div>

                  {viewingIsland.description && (
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-muted-foreground">Descrição</div>
                      <p className="text-sm leading-relaxed p-4 rounded-xl bg-muted/30 border border-border/20 text-foreground">
                        {viewingIsland.description}
                      </p>
                    </div>
                  )}

                  {/* Models Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl border border-border/20 bg-muted/10 space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Arquivo do Modelo 3D</span>
                      <p className="text-xs truncate font-mono text-muted-foreground" title={viewingIsland.model_url}>
                        {viewingIsland.model_url || '-'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl border border-border/20 bg-muted/10 space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Imagem / Miniatura</span>
                      <p className="text-xs truncate font-mono text-muted-foreground" title={viewingIsland.thumbnail_url || viewingIsland.thumbnailUrl}>
                        {viewingIsland.thumbnail_url || viewingIsland.thumbnailUrl || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Arcs Section */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      Arcos de História em que a ilha aparece ({viewingIsland.arcs?.length || 0})
                    </h3>
                    {!viewingIsland.arcs || viewingIsland.arcs.length === 0 ? (
                      <div className="p-4 text-center rounded-xl bg-muted/20 border border-dashed border-border/50 text-muted-foreground text-sm">
                        Nenhum arco vinculado a esta ilha.
                      </div>
                    ) : (
                      <div className="border border-border/30 rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead>Arco</TableHead>
                              <TableHead className="text-right">Ordem Cronológica</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...((viewingIsland as any).arcs || [])]
                              .sort((a, b) => ((a as any).ArcIslandRead?.order ?? (a as any).ArcIsland?.order ?? 0) - ((b as any).ArcIslandRead?.order ?? (a as any).ArcIsland?.order ?? 0))
                              .map((arc) => (
                                <TableRow key={arc.id}>
                                  <TableCell className="font-semibold">{arc.name}</TableCell>
                                  <TableCell className="text-right font-medium text-primary">
                                    #{ (arc as any).ArcIslandRead?.order ?? (arc as any).ArcIsland?.order ?? 0 }
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
