// Configurações do gerenciamento de usuários
export const USERS_ADMIN_CONFIG = {
  // Rota da página
  route: '/admin/users',
  // Fallback se não for admin
  fallbackRoute: '/',
  // Paginação padrão
  defaultPage: 1,
  defaultLimit: 10,
  // Validações de formulário
  validationRules: {
    username: {
      required: 'Username é obrigatório',
      minLength: 3,
      errorMessage: 'Username deve ter pelo menos 3 caracteres',
    },
    email: {
      required: 'E-mail é obrigatório',
      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      errorMessage: 'E-mail inválido',
    },
    password: {
      required: 'Senha é obrigatória para novos usuários',
      minLength: 8,
      errorMessage: 'A senha deve ter pelo menos 8 caracteres',
    },
    profileId: {
      required: 'Selecione um nível de acesso',
    },
  },
  // Textos da interface
  ui: {
    title: 'Gerenciamento de Usuários',
    subtitle: 'Crie, edite e remova usuários e defina seus níveis de acesso.',
    createButton: 'Novo Usuário',
    searchPlaceholder: 'Buscar por username ou e-mail...',
    emptyState: 'Nenhum usuário encontrado.',
    emptyStateSearch: 'Tente ajustar os filtros de busca.',
    confirmDeleteTitle: 'Confirmar Exclusão',
    confirmDeleteMessage: (username: string) =>
      `Tem certeza que deseja excluir o usuário "${username}"? Esta ação não pode ser desfeita.`,
  },
  // Colunas da tabela
  tableColumns: ['ID', 'Username', 'E-mail', 'Perfil', 'Criado em', 'Ações'],
}
