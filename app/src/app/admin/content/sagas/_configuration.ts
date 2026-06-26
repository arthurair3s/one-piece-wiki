// Configurações e constantes do gerenciamento de Sagas

export const SAGas_ADMIN_CONFIG = {
  route: '/admin/content/sagas',
  fallbackRoute: '/',
  defaultPage: 1,
  defaultLimit: 10,
  validationRules: {
    name: {
      required: 'O nome da saga é obrigatório',
      minLength: 3,
      errorMessage: 'O nome deve ter pelo menos 3 caracteres',
    },
    order: {
      required: 'A ordem cronológica é obrigatória',
      min: 1,
      errorMessage: 'A ordem deve ser um número maior que zero',
    },
    description: {
      maxLength: 2000,
      errorMessage: 'A descrição está muito longa',
    }
  },
  ui: {
    title: 'Gerenciar Sagas',
    description: 'Adicione, edite ou remova as sagas da história.',
    createButton: 'Nova Saga',
    searchNamePlaceholder: 'Filtrar por nome...',
    searchOrderPlaceholder: 'Filtrar por ordem...',
    emptyState: 'Nenhuma saga encontrada.',
    emptyStateSearch: 'Tente ajustar os filtros de busca.',
  }
}
