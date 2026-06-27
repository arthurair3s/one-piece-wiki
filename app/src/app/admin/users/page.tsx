'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie } from '@/lib/cookies'
import { USERS_ADMIN_CONFIG } from './_configuration'
import {
  getUsers,
  getProfiles,
  createUser,
  updateUser,
  deleteUser,
  type UpdateUserPayload,
} from './_service'
import type { User, Profile } from '@/types/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'



function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}



interface UserFormState {
  username: string
  email: string
  password: string
  profileId: string
}

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserFormState) => Promise<void>
  editingUser: User | null
  profiles: Profile[]
  isSubmitting: boolean
  formError: string
}

function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
  profiles,
  isSubmitting,
  formError,
}: UserFormModalProps) {
  const isEditing = !!editingUser
  const [form, setForm] = useState<UserFormState>({
    username: '',
    email: '',
    password: '',
    profileId: '',
  })

  useEffect(() => {
    if (editingUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        username: editingUser.username,
        email: editingUser.email,
        password: '',
        profileId: String(editingUser.profileId ?? ''),
      })
    } else {
      setForm({ username: '', email: '', password: '', profileId: '' })
    }
  }, [editingUser, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header do modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {isEditing
                ? <PencilIcon className="w-4 h-4 text-primary" />
                : <PlusIcon className="w-4 h-4 text-primary" />}
            </div>
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do formulário */}
        <form
          onSubmit={async (e) => { e.preventDefault(); await onSubmit(form) }}
          className="px-6 py-5 flex flex-col gap-4"
        >
          {formError && (
            <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="form-username">Username</Label>
            <Input
              id="form-username"
              placeholder="ex: monkey_d_luffy"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="form-email">E-mail</Label>
            <Input
              id="form-email"
              type="email"
              placeholder="ex: luffy@onepiece.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="form-password">
              {isEditing ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
            </Label>
            <Input
              id="form-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="form-profile">Nível de Acesso</Label>
            <Select
              value={form.profileId}
              onValueChange={(val) => setForm((f) => ({ ...f, profileId: val ?? '' }))}
            >
              <SelectTrigger id="form-profile" className="w-full">
                <SelectValue placeholder="Selecione um perfil..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    <div className="flex items-center gap-2">
                      {p.name === 'ADMIN'
                        ? <ShieldIcon className="w-3.5 h-3.5 text-amber-500" />
                        : <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />}
                      {p.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rodapé do formulário */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}



interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  username: string
  isDeleting: boolean
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, username, isDeleting }: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="w-full max-w-sm bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrashIcon className="w-4 h-4 text-destructive" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Confirmar Exclusão</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer" aria-label="Fechar">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tem certeza que deseja excluir o usuário{' '}
            <span className="font-semibold text-foreground">&quot;{username}&quot;</span>?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}



function getProfileName(profile?: string | { id: number; name: string; [key: string]: unknown }): string {
  if (!profile) return '—'
  if (typeof profile === 'string') return profile
  return profile.name ?? '—'
}

function ProfileBadge({ profile }: { profile?: string | { id: number; name: string; [key: string]: unknown } }) {
  const name = getProfileName(profile)
  const isAdmin = name === 'ADMIN'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${
      isAdmin
        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        : 'bg-muted text-muted-foreground border border-border/40'
    }`}>
      {isAdmin
        ? <ShieldIcon className="w-3 h-3" />
        : <UserIcon className="w-3 h-3" />}
      {name}
    </span>
  )
}



function TableSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border/20">
          <div className="h-3.5 w-8 bg-muted rounded animate-pulse" />
          <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3.5 w-48 bg-muted rounded animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          <div className="h-3.5 w-24 bg-muted rounded animate-pulse ml-auto" />
          <div className="flex gap-1.5">
            <div className="h-7 w-7 bg-muted rounded animate-pulse" />
            <div className="h-7 w-7 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}


function translateApiError(message?: string): string {
  if (!message) return 'Erro desconhecido.'
  const msg = Array.isArray(message) ? message.join(', ') : message
  const translations: Record<string, string> = {
    'username must be a string': 'Username deve ser um texto.',
    'username should not be empty': 'Username é obrigatório.',
    'email must be an email': 'E-mail inválido.',
    'password must be longer than or equal to 8 characters': 'A senha deve ter pelo menos 8 caracteres.',
    'password must be a string': 'Senha deve ser um texto.',
    'profile_id should not be empty': 'Selecione um nível de acesso.',
    'Unauthorized': 'Não autorizado. Faça login novamente.',
    'Forbidden': 'Sem permissão para esta ação.',
    'User not found': 'Usuário não encontrado.',
    'Internal server error': 'Erro interno do servidor.',
  }
  for (const [key, value] of Object.entries(translations)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return value
  }
  if (msg.startsWith('Erro ')) return msg
  return msg
}

export default function AdminUsersPage() {
  const router = useRouter()

  const [authChecked, setAuthChecked] = useState(false)

  const [users, setUsers] = useState<User[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [usernameInput, setUsernameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [activeUsername, setActiveUsername] = useState('')
  const [activeEmail, setActiveEmail] = useState('')
  const [page, setPage] = useState(USERS_ADMIN_CONFIG.defaultPage)
  const limit = USERS_ADMIN_CONFIG.defaultLimit
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formError, setFormError] = useState('')

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const profile = getCookie('user_profile')
    if (profile !== 'ADMIN') {
      router.push(USERS_ADMIN_CONFIG.fallbackRoute)
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthChecked(true)
  }, [router])


  const loadData = useCallback(async (username: string, email: string, currentPage: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const [usersResult, profilesResult] = await Promise.all([
        getUsers({ username: username || undefined, email: email || undefined, page: currentPage, limit }),
        profiles.length === 0 ? getProfiles() : Promise.resolve(profiles),
      ])
      setUsers(usersResult.users)
      setTotal(usersResult.total)
      if (profiles.length === 0 && Array.isArray(profilesResult)) {
        setProfiles(profilesResult)
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      setError(translateApiError(errMsg) || 'Erro ao carregar os dados.')
    } finally {
      setIsLoading(false)
    }
  }, [limit, profiles])

  useEffect(() => {
    if (!authChecked) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData(activeUsername, activeEmail, page)
  }, [authChecked, activeUsername, activeEmail, page, loadData])


  const handleUsernameChange = (value: string) => {
    setUsernameInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setActiveUsername(value)
      setPage(1)
    }, 450)
  }

  const handleEmailChange = (value: string) => {
    setEmailInput(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setActiveEmail(value)
      setPage(1)
    }, 450)
  }


  const handleFormSubmit = async (data: { username: string; email: string; password: string; profileId: string }) => {
    setFormError('')
    const cfg = USERS_ADMIN_CONFIG.validationRules
    if (!data.username || data.username.length < cfg.username.minLength) {
      setFormError(cfg.username.errorMessage); return
    }
    if (!data.email || !cfg.email.pattern.test(data.email)) {
      setFormError(cfg.email.errorMessage); return
    }
    if (!editingUser && (!data.password || data.password.length < cfg.password.minLength)) {
      setFormError(cfg.password.errorMessage); return
    }
    if (!data.profileId) {
      setFormError(cfg.profileId.required); return
    }

    setIsSubmitting(true)
    try {
      if (editingUser) {
        const payload: UpdateUserPayload = {
          username: data.username,
          email: data.email,
          profile_id: Number(data.profileId),
        }
        if (data.password) payload.password = data.password
        await updateUser(editingUser.id, payload)
      } else {
        await createUser({
          username: data.username,
          email: data.email,
          password: data.password,
          profile_id: Number(data.profileId),
        })
      }
      setIsFormOpen(false)
      setEditingUser(null)
      await loadData(activeUsername, activeEmail, page)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      const msg = translateApiError(errMsg)
      setFormError(msg || 'Erro ao salvar o usuário.')
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleDeleteConfirm = async () => {
    if (!deletingUser) return
    setIsDeleting(true)
    try {
      await deleteUser(deletingUser.id)
      setIsDeleteOpen(false)
      setDeletingUser(null)
      // se era a última linha da página, volta para a anterior
      const newTotal = total - 1
      const maxPage = Math.max(1, Math.ceil(newTotal / limit))
      const targetPage = Math.min(page, maxPage)
      setPage(targetPage)
      await loadData(activeUsername, activeEmail, targetPage)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      setError(translateApiError(errMsg) || 'Erro ao excluir o usuário.')
    } finally {
      setIsDeleting(false)
    }
  }

  const openCreate = () => { setEditingUser(null); setFormError(''); setIsFormOpen(true) }
  const openEdit = (user: User) => { setEditingUser(user); setFormError(''); setIsFormOpen(true) }
  const openDelete = (user: User) => { setDeletingUser(user); setIsDeleteOpen(true) }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }


  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho da página */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Voltar ao mapa"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                {USERS_ADMIN_CONFIG.ui.title}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {USERS_ADMIN_CONFIG.ui.subtitle}
              </p>
            </div>
          </div>
          <Button id="btn-new-user" onClick={openCreate} size="sm" className="gap-1.5 shrink-0">
            <PlusIcon className="w-4 h-4" />
            {USERS_ADMIN_CONFIG.ui.createButton}
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="filter-username"
              type="text"
              placeholder="Filtrar por username..."
              value={usernameInput}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="filter-email"
              type="text"
              placeholder="Filtrar por e-mail..."
              value={emailInput}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="pl-9"
            />
          </div>
          {(activeUsername || activeEmail) && (
            <button
              onClick={() => { setUsernameInput(''); setEmailInput(''); setActiveUsername(''); setActiveEmail(''); setPage(1) }}
              className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer transition-colors"
            >
              Limpar
            </button>
          )}
          <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
            {isLoading ? '...' : `${total} usuário${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
          {/* Estado de Erro */}
          {error && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
              <div className="text-4xl">⚠️</div>
              <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
              <Button variant="outline" size="sm" onClick={() => loadData(activeUsername, activeEmail, page)}>
                Tentar Novamente
              </Button>
            </div>
          )}

          {/* Estado de Loading */}
          {!error && isLoading && <TableSkeleton />}

          {/* Tabela de Dados */}
          {!error && !isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="hidden md:table-cell">Criado em</TableHead>
                  <TableHead className="text-right w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <UserIcon className="w-8 h-8 opacity-30" />
                        <p className="text-sm">{USERS_ADMIN_CONFIG.ui.emptyState}</p>
                        {(activeUsername || activeEmail) && (
                          <p className="text-xs opacity-70">{USERS_ADMIN_CONFIG.ui.emptyStateSearch}</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-muted-foreground font-mono text-xs">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{user.email}</TableCell>
                      <TableCell>
                        <ProfileBadge profile={user.profile} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs hidden md:table-cell">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`btn-edit-user-${user.id}`}
                            onClick={() => openEdit(user)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                            title="Editar usuário"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-user-${user.id}`}
                            onClick={() => openDelete(user)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Excluir usuário"
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
          )}
        </div>

        {/* Paginação */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                id="btn-prev-page"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              {/* Páginas numéricas */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 text-xs rounded-lg transition-colors font-medium cursor-pointer ${
                        pageNum === page
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <Button
                id="btn-next-page"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingUser(null) }}
        onSubmit={handleFormSubmit}
        editingUser={editingUser}
        profiles={profiles}
        isSubmitting={isSubmitting}
        formError={formError}
      />
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingUser(null) }}
        onConfirm={handleDeleteConfirm}
        username={deletingUser?.username ?? ''}
        isDeleting={isDeleting}
      />
    </div>
  )
}
