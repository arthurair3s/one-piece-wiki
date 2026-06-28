// Configurações e constantes do gerenciamento de Arcos

export const ARCS_ADMIN_CONFIG = {
  route: '/admin/content/arcos',
  fallbackRoute: '/',
  defaultPage: 1,
  defaultLimit: 10,
  validationRules: {
    name: {
      required: 'O nome do arco é obrigatório',
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
    title: 'Gerenciar Arcos',
    description: 'Adicione, edite ou remova os arcos da história.',
    createButton: 'Novo Arco',
    searchNamePlaceholder: 'Filtrar por nome...',
    searchSagaPlaceholder: 'Filtrar por saga...',
    emptyState: 'Nenhum arco encontrado.',
    emptyStateSearch: 'Tente ajustar os filtros de busca.',
  }
}
