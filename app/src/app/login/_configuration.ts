// Configurações e constantes específicas da página de login

export const LOGIN_CONFIG = {
  defaultEmail: 'admin@admin.com',
  redirectUrl: '/loading-screen',
  cookieExpiryDays: 7,
  validationRules: {
    email: {
      required: 'E-mail é obrigatório',
      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      errorMessage: 'E-mail inválido'
    },
    password: {
      required: 'Senha é obrigatória',
      minLength: 8,
      errorMessage: 'A senha deve ter pelo menos 6 caracteres'
    }
  },
  // Credenciais das seeds do banco de dados para acesso rápido nos testes
  demoUsers: [
    {
      label: 'Admin',
      email: 'admin@admin.com',
      password: 'admin123'
    },
    {
      label: 'User',
      email: 'luffy@onepiece.com',
      password: 'luffy123'
    }
  ]
}
