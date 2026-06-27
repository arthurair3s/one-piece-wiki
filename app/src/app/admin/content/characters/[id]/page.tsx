'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCookie } from '@/lib/cookies'
import type { Character, CharacterVersion, Arc } from '@/types/api'

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
import { ChevronLeftIcon, PencilIcon, TrashIcon, PlusIcon, SaveIcon, UserIcon, EyeIcon } from 'lucide-react'

import {
  getCharacter, updateCharacter, deleteCharacter,
  getCharacterVersions, getCharacterVersion, createCharacterVersion, updateCharacterVersion, deleteCharacterVersion,
  getArcs
} from '../_service'

const STATUS_OPTIONS = [
  { value: 'ALIVE', label: 'Vivo' },
  { value: 'DECEASED', label: 'Falecido' },
  { value: 'UNKNOWN', label: 'Desconhecido' },
  { value: 'IMPRISONED', label: 'Preso' },
]

export default function AdminCharacterDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const characterId = Number(params.id)

  const [authChecked, setAuthChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [character, setCharacter] = useState<Character | null>(null)
  const [versions, setVersions] = useState<CharacterVersion[]>([])
  const [arcs, setArcs] = useState<Arc[]>([])

  // Character form
  const [charName, setCharName] = useState('')
  const [charSlug, setCharSlug] = useState('')
  const [isCharSubmitting, setIsCharSubmitting] = useState(false)

  // Version form modal
  const [isVersionFormOpen, setIsVersionFormOpen] = useState(false)
  const [isVersionDeleteOpen, setIsVersionDeleteOpen] = useState(false)
  const [editingVersion, setEditingVersion] = useState<CharacterVersion | null>(null)
  const [deletingVersion, setDeletingVersion] = useState<CharacterVersion | null>(null)
  const [viewingVersion, setViewingVersion] = useState<CharacterVersion | null>(null)

  const [vArcs, setVArcs] = useState<number[]>([])
  const [vAlias, setVAlias] = useState('')
  const [vEpithet, setVEpithet] = useState('')
  const [vBounty, setVBounty] = useState('')
  const [vStatus, setVStatus] = useState('ALIVE')
  const [vImageUrl, setVImageUrl] = useState('')
  const [vDescription, setVDescription] = useState('')

  const [isVersionSubmitting, setIsVersionSubmitting] = useState(false)
  const [isVersionDeleting, setIsVersionDeleting] = useState(false)
  const [versionFormError, setVersionFormError] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const showError = (msg: string) => {
    setError(msg)
    setTimeout(() => setError(''), 5000)
  }

  useEffect(() => {
    const profile = getCookie('user_profile')
    if (profile !== 'ADMIN') {
      router.push('/')
      return
    }
    setAuthChecked(true)
  }, [router])

  const loadData = useCallback(async (expectedVersionsCount?: number) => {
    try {
      const [charRes, arcsRes] = await Promise.all([
        getCharacter(characterId),
        getArcs({ limit: 1000 })
      ])
      setCharacter(charRes)
      setCharName(charRes.name)
      setCharSlug(charRes.slug)
      const parsedArcs = (arcsRes as any)?.data || arcsRes?.rows || (Array.isArray(arcsRes) ? arcsRes : [])
      setArcs(parsedArcs)

      const fetchVersions = async (retries = 5, delay = 600): Promise<CharacterVersion[]> => {
        const versRes = await getCharacterVersions({ character_id: characterId, limit: 100 })
        if (expectedVersionsCount !== undefined && versRes.count !== expectedVersionsCount && retries > 0) {
          await new Promise(r => setTimeout(r, delay))
          return fetchVersions(retries - 1, delay)
        }
        return versRes.rows
      }

      const fetchedVersions = await fetchVersions()
      setVersions(fetchedVersions)
    } catch (err: any) {
      showError(err.message || 'Erro ao carregar dados.')
    } finally {
      setIsLoading(false)
    }
  }, [characterId])

  useEffect(() => {
    if (!authChecked) return
    loadData()
  }, [authChecked, loadData])

  const handleCharUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCharSubmitting(true)
    try {
      await updateCharacter(characterId, { name: charName, slug: charSlug })
      showSuccess('Personagem base atualizado!')
    } catch (err: any) {
      showError(err.message || 'Erro ao atualizar personagem')
    } finally {
      setIsCharSubmitting(false)
    }
  }

  const openNewVersion = () => {
    setEditingVersion(null)
    setVArcs([])
    setVAlias('')
    setVEpithet('')
    setVBounty('')
    setVStatus('ALIVE')
    setVImageUrl('')
    setVDescription('')
    setVersionFormError('')
    setIsVersionFormOpen(true)
  }

  const openEditVersion = async (v: CharacterVersion) => {
    try {
      const fullVersion = await getCharacterVersion(v.id)
      setEditingVersion(fullVersion)
      setVArcs(fullVersion.arcs?.map(a => a.id) || [])
      setVAlias(fullVersion.alias || '')
      setVEpithet(fullVersion.epithet || '')
      setVBounty(fullVersion.bounty ? String(fullVersion.bounty) : '')
      setVStatus(fullVersion.status || 'ALIVE')
      setVImageUrl(fullVersion.image_url || '')
      setVDescription(fullVersion.description || '')
      setVersionFormError('')
      setIsVersionFormOpen(true)
    } catch (err: any) {
      showError('Erro ao carregar os detalhes da versão para edição.')
    }
  }

  const openViewVersion = async (v: CharacterVersion) => {
    try {
      const fullVersion = await getCharacterVersion(v.id)
      setViewingVersion(fullVersion)
    } catch (err: any) {
      showError('Erro ao carregar detalhes da versão.')
    }
  }

  const handleVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setVersionFormError('')
    setIsVersionSubmitting(true)
    const payload = {
      character_id: characterId,
      arc_ids: vArcs,
      alias: vAlias || undefined,
      epithet: vEpithet || undefined,
      bounty: vBounty ? Number(vBounty) : undefined,
      status: vStatus,
      image_url: vImageUrl || undefined,
      description: vDescription || undefined,
    }

    try {
      if (editingVersion) {
        await updateCharacterVersion(editingVersion.id, payload)
        showSuccess('Versão atualizada!')
        await loadData() // same count expected
      } else {
        await createCharacterVersion(payload)
        showSuccess('Nova versão criada!')
        await loadData(versions.length + 1)
      }
      setIsVersionFormOpen(false)
    } catch (err: any) {
      setVersionFormError(err.message || 'Erro ao salvar versão')
    } finally {
      setIsVersionSubmitting(false)
    }
  }

  const handleVersionDelete = async () => {
    if (!deletingVersion) return
    setIsVersionDeleting(true)
    try {
      await deleteCharacterVersion(deletingVersion.id)
      showSuccess('Versão removida!')
      setIsVersionDeleteOpen(false)
      await loadData(Math.max(0, versions.length - 1))
    } catch (err: any) {
      showError(err.message || 'Erro ao remover versão')
    } finally {
      setIsVersionDeleting(false)
    }
  }

  if (!authChecked) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Carregando detalhes do personagem...</p>
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 text-center">
        <p className="text-red-500 mb-4">Personagem não encontrado.</p>
        <Button onClick={() => router.push('/admin/content/characters')} variant="outline">Voltar</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-3 mb-8">
          <button
            onClick={() => router.push('/admin/content/characters')}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-1.5"
            title="Voltar"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <UserIcon className="w-8 h-8 text-primary" />
              Editar Personagem
            </h1>
            <p className="text-muted-foreground mt-2">
              Altere as informações base ou adicione variações (versões) deste personagem ao longo da história.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/20 bg-green-500/10 text-green-500">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dados Base */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 border-b border-border/50 pb-2">Informações Base</h2>
              <form onSubmit={handleCharUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={charSlug}
                    onChange={(e) => setCharSlug(e.target.value)}
                    required
                    className="font-mono text-sm"
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={isCharSubmitting}>
                  {isCharSubmitting ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : <SaveIcon className="w-4 h-4" />}
                  Salvar Base
                </Button>
              </form>
            </div>
          </div>

          {/* Versões */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
                <h2 className="text-xl font-bold">Versões (Aparições)</h2>
                <Button size="sm" onClick={openNewVersion} className="gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Nova Versão
                </Button>
              </div>

              {versions.length === 0 ? (
                <div className="text-center p-8 bg-muted/20 rounded-xl border border-dashed border-border/50">
                  <p className="text-muted-foreground">Nenhuma versão cadastrada para este personagem.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status / Alias</TableHead>
                        <TableHead>Alcunha (Epithet)</TableHead>
                        <TableHead>Recompensa</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versions.map(v => (
                        <TableRow key={v.id}>
                          <TableCell>
                            <div className="font-medium">{v.alias || character.name}</div>
                            <div className="text-xs text-muted-foreground">Status: {v.status}</div>
                          </TableCell>
                          <TableCell>{v.epithet || '-'}</TableCell>
                          <TableCell>{v.bounty ? `฿ ${v.bounty.toLocaleString()}` : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openViewVersion(v)} title="Visualizar Detalhes">
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditVersion(v)} title="Editar Versão">
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => {
                              setDeletingVersion(v)
                              setIsVersionDeleteOpen(true)
                            }}>
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Versão */}
      {isVersionFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 shrink-0">
              <h2 className="text-xl font-bold">{editingVersion ? 'Editar Versão' : 'Nova Versão'}</h2>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nome de Referência (Opcional)</label>
                  <Input value={vAlias} onChange={e => setVAlias(e.target.value)} placeholder="Ex: Usopp / Sogeking" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Alcunha (Epithet)</label>
                  <Input value={vEpithet} onChange={e => setVEpithet(e.target.value)} placeholder="Ex: O Caçador de Piratas" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Recompensa (Bounty)</label>
                  <Input type="number" value={vBounty} onChange={e => setVBounty(e.target.value)} placeholder="Ex: 30000000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={vStatus}
                    onChange={e => setVStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">URL da Imagem</label>
                <Input value={vImageUrl} onChange={e => setVImageUrl(e.target.value)} placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <textarea
                  value={vDescription}
                  onChange={e => setVDescription(e.target.value)}
                  placeholder="Contexto desta versão..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Arcos da Aparição
                  <span className="text-muted-foreground text-xs">(Opcional)</span>
                </label>
                <div className="border border-border/50 rounded-lg max-h-48 overflow-y-auto p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-muted/10">
                  {(arcs || []).map(arc => (
                    <label key={arc.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/30 p-1.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={vArcs.includes(arc.id)}
                        onChange={(e) => {
                          if (e.target.checked) setVArcs(prev => [...prev, arc.id])
                          else setVArcs(prev => prev.filter(id => id !== arc.id))
                        }}
                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="truncate">{arc.name}</span>
                    </label>
                  ))}
                  {(!arcs || arcs.length === 0) && (
                    <div className="text-muted-foreground text-sm col-span-2 py-2">Nenhum arco encontrado. Crie arcos primeiro.</div>
                  )}
                </div>
              </div>

              {versionFormError && (
                <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
                  {versionFormError}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border/50 flex gap-3 shrink-0">
              <Button variant="outline" className="flex-1" onClick={() => setIsVersionFormOpen(false)} disabled={isVersionSubmitting}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleVersionSubmit} disabled={isVersionSubmitting}>
                {isVersionSubmitting ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : 'Salvar Versão'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar Detalhes da Versão */}
      {viewingVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 shrink-0 flex items-center gap-3">
              <EyeIcon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Detalhes da Versão</h2>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                  <div className="font-medium">{viewingVersion.status}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Nome de Referência</div>
                  <div className="font-medium">{viewingVersion.alias || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Alcunha (Epithet)</div>
                  <div className="font-medium">{viewingVersion.epithet || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Recompensa (Bounty)</div>
                  <div className="font-medium">{viewingVersion.bounty ? `฿ ${viewingVersion.bounty.toLocaleString()}` : '-'}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Descrição</div>
                <div className="bg-muted/30 p-3 rounded-lg text-sm">
                  {viewingVersion.description || 'Sem descrição.'}
                </div>
              </div>

              {/* Arcos e Eventos (Relacionamentos) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <div className="bg-muted/30 px-4 py-2 border-b border-border/50 font-medium text-sm">
                    Arcos (Aparições)
                  </div>
                  <div className="p-4 max-h-48 overflow-y-auto">
                    {viewingVersion.arcs && viewingVersion.arcs.length > 0 ? (
                      <ul className="space-y-2 text-sm">
                        {viewingVersion.arcs.map(arc => (
                          <li key={arc.id} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {arc.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum arco vinculado.</p>
                    )}
                  </div>
                </div>

                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <div className="bg-muted/30 px-4 py-2 border-b border-border/50 font-medium text-sm">
                    Eventos de Participação
                  </div>
                  <div className="p-4 max-h-48 overflow-y-auto">
                    {viewingVersion.events && viewingVersion.events.length > 0 ? (
                      <ul className="space-y-2 text-sm">
                        {viewingVersion.events.map(ev => (
                          <li key={ev.id} className="flex flex-col border-b border-border/50 pb-2 last:border-0 last:pb-0">
                            <span className="font-medium">{ev.title}</span>
                            <span className="text-xs text-muted-foreground">{ev.type}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum evento vinculado.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border/50 shrink-0">
              <Button variant="outline" className="w-full" onClick={() => setViewingVersion(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Remover Versão */}
      {isVersionDeleteOpen && deletingVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Remover Versão?</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Esta ação não pode ser desfeita. A versão será removida deste personagem permanentemente.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsVersionDeleteOpen(false)} disabled={isVersionDeleting}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" onClick={handleVersionDelete} disabled={isVersionDeleting}>
                {isVersionDeleting ? 'Removendo...' : 'Sim, remover'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
