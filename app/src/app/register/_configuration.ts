// Configurações e constantes específicas da página de registro

export const REGISTER_CONFIG = {
  redirectUrl: '/login',
  validationRules: {
    name: {
      required: 'Nome é obrigatório',
      minLength: 3,
      errorMessage: 'O nome deve ter pelo menos 3 caracteres'
    },
    email: {
      required: 'E-mail é obrigatório',
      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      errorMessage: 'E-mail inválido'
    },
    password: {
      required: 'Senha é obrigatória',
      minLength: 8,
      errorMessage: 'A senha deve ter pelo menos 8 caracteres'
    },
    confirmPassword: {
      required: 'Confirmação de senha é obrigatória',
      matchMessage: 'As senhas não coincidem'
    }
  }
}
