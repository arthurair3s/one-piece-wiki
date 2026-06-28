// Configurações e constantes do gerenciamento de Ilhas

export const ISLANDS_ADMIN_CONFIG = {
  route: '/admin/content/ilhas',
  fallbackRoute: '/',
  defaultPage: 1,
  defaultLimit: 10,
  validationRules: {
    name: {
      required: 'O nome da ilha é obrigatório',
      minLength: 3,
      errorMessage: 'O nome deve ter pelo menos 3 caracteres',
    },
    description: {
      required: 'A descrição da ilha é obrigatória',
      maxLength: 2000,
      errorMessage: 'A descrição está muito longa',
    },
    coordinates: {
      required: 'As coordenadas x, y e z são obrigatórias',
    },
    model_url: {
      required: 'A URL do modelo 3D é obrigatória',
    }
  },
  ui: {
    title: 'Gerenciar Ilhas',
    description: 'Adicione, edite, ative ou remova as ilhas no mapa 3D.',
    createButton: 'Nova Ilha',
    searchNamePlaceholder: 'Filtrar por nome...',
    emptyState: 'Nenhuma ilha encontrada',
    emptyStateSearch: 'Tente alterar os filtros ou adicione uma nova ilha.',
  }
}
