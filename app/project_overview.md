# 🏴‍☠️ Grand Line Frontend: Project Overview & Blueprint

Este documento estabelece as diretrizes de arquitetura, padrões de design, fluxo de dados e guia de estilo para o desenvolvimento do frontend do projeto **Grand Line**. Ele serve como base para manter a consistência do código, da UI/UX e do relacionamento com a API.

---

## 🎯 Objetivo e Escopo
O frontend foi concebido para ser uma aplicação web responsiva, interativa e performática desenvolvida em **Next.js (v15+)**. Ele se conecta à **Grand Line API** e exibe um HUD dinâmico do universo de One Piece, apresentando um mapa interativo das ilhas (com suporte a atualizações em tempo real) e interfaces administrativas (tabelas, modais e formulários) para gerenciar o ecossistema.

---

## 🛠️ Stack Tecnológica & Padrões
- **Framework**: Next.js (v15+) usando **App Router**
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + Shadcn/ui (para componentes base)
- **Autenticação**: Cookies HTTP-only/Secure no navegador (segurança contra XSS)
- **Estado Global/Reatividade**: React Context + SyncProvider (sincronização baseada em eventos CDC do Kafka/Debezium)
- **Padrão de Arquitetura**: **Colocation Pattern** (colocalização) combinada com Clean Architecture no nível do cliente.

---

## 📁 Estrutura de Pastas (Colocation Pattern)

Para evitar que serviços, configurações e componentes fiquem espalhados em pastas distantes, adotamos o padrão de **colocalização**. Tudo que é exclusivo de uma página/rota deve residir dentro da pasta dessa rota:

```text
src/app/
├── (routes)/
│   ├── login/
│   │   ├── _components/         ← Componentes exclusivos da tela de login
│   │   ├── _service.ts          ← Chamadas de API específicas de login
│   │   ├── _configuration.ts    ← Regras de validação, mensagens e seeds do login
│   │   └── page.tsx             ← UI (Client Component) da rota /login
│   │
│   ├── register/
│   │   ├── _service.ts          ← Serviço específico de cadastro
│   │   ├── _configuration.ts    ← Configuração e regras do formulário de registro
│   │   └── page.tsx             ← UI da rota /register
│   │
│   ├── page.tsx                 ← Dashboard Principal (Mapa e HUD)
│   ├── _service.ts              ← Serviço do Dashboard (Busca Sagas, Arcos, Mapa)
│   ├── _configuration.ts        ← Configurações e constantes do Dashboard
│   └── layout.tsx               ← Layout raiz (onde ficam os Providers)
```

### 🧱 Componentes Globais vs Locais
- **Componentes Locais**: Pastas prefixadas com sublinhado (ex: `_components/`) dentro da rota. São exclusivos daquela tela.
- **Componentes Globais (`src/components/`)**: Componentes compartilhados por mais de uma página (ex: `Header`, `Footer`, `ui/`).

---

## 🔄 Fluxo de Dados e Integração (Data Adapters)

O frontend nunca consome as respostas brutas da API diretamente na tela. Nós implementamos a camada de **Serviço Local (`_service.ts`)** para atuar como um **Adapter (Adaptador de Dados)**.

```
[API REST] → { sagas: [...] } (Envelope JSON)
   ↓
[_service.ts] → Desenvolve e filtra os dados (Adapter)
   ↓
[page.tsx] → Recebe a lista limpa [Saga, Saga, ...]
```

### Exemplo do Adaptador em `_service.ts`:
```typescript
import { apiClient } from '@/services/api'
import type { Saga } from '@/types/api'

interface SagasResponse {
  sagas: Saga[]
}

export async function fetchSagas() {
  const response = await apiClient<SagasResponse>('/wiki/sagas')
  return response?.sagas || [] // Remove o envelope JSON e retorna o array limpo
}
```

---

## 🔐 Autenticação com Cookies
Não utilizamos `localStorage` por questões de segurança contra ataques XSS.
- O token JWT recebido no login é armazenado em cookie usando o utilitário `src/lib/cookies.ts`.
- O `apiClient` global lê esse cookie automaticamente e injeta o header `Authorization: Bearer <token>` em todas as requisições HTTP.

---

## ⚡ CDC & Sincronização em Tempo Real (SyncProvider)
O backend da Grand Line usa CDC (Change Data Capture) via Kafka e Debezium para manter um modelo de leitura otimizado (Read DB). 
O frontend acompanha essa reatividade usando o **`SyncProvider`** (`src/components/providers/sync-provider.tsx`):
1. O `SyncProvider` faz um polling rápido (a cada 10s por padrão) na rota de leitura `/wiki/sagas`.
2. Se o hash dos dados mudar (indicando que ocorreu uma inserção/atualização no banco pelo Debezium), ele define `isOutOfSync` como `true`.
3. Os componentes da tela reagem a este sinal recarregando seus dados via `loadData()` e chamam `resolveSync()` para restabelecer a sincronia.

---

## 🎨 Consistência de UI/UX & Padrões Estéticos

Para manter o visual premium ("Grand Line 3D/RPG"), siga estas diretrizes:

### 1. Paleta de Cores e Estilo
* **Tema Escuro de Alto Contraste**: Tons de cinza e azul escuro profundo (`bg-background`).
* **Elementos de Glassmorphism**: Utilização de fundos com blur e transparência para painéis administrativos flutuantes:
  `bg-background/80 backdrop-blur-md border border-muted/30`
* **Gradients de Ação**: Use degradês sutis nos botões de ação e headers:
  `bg-gradient-to-r from-primary to-primary/80`

### 2. Estados de Feedback Obrigatórios
Qualquer componente que faça requisições assíncronas deve implementar três estados visuais limpos:
- **Loading State (Carregando)**: Um spinner ou esqueleto (`Skeleton`) enquanto os dados carregam do banco.
- **Error State (Erro)**: Um alerta amigável mostrando a mensagem de falha da API e um botão de **Tentar Novamente**.
- **Empty State (Vazio)**: Uma ilustração ou texto sutil quando a consulta retornar sem registros.

### 3. Facilidade nos Testes (Acesso Rápido)
Telas de autenticação ou que exijam formulários complexos devem dispor de um pequeno painel de **Acesso Rápido** com botões para auto-preenchimento das credenciais de teste padrão das seeds (`admin@admin.com` e `luffy@onepiece.com`).

---

## 🚀 Guia Passo a Passo: Criar uma Nova Tela/Funcionalidade

Sempre que for criar uma nova página (ex: Gerenciamento de Personagens `/admin/characters`), siga esta ordem estrita:

### Passo 1: Criar a Pasta e Rotas
Crie a pasta `src/app/admin/characters` contendo `page.tsx`.

### Passo 2: Definir as Configurações (`_configuration.ts`)
Defina constantes de rota, regras de validação (ex: formulário de criação) e textos estáticos.

### Passo 3: Criar o Serviço (`_service.ts`)
Defina as chamadas de API usando o `apiClient`. Exemplo:
```typescript
import { apiClient } from '@/services/api';
import type { Character } from '@/types/api';

export async function getCharacters(filters: { page: number }) {
  // Retorna os dados mapeados/desembrulhados
  const res = await apiClient<{ characters: Character[] }>(`/characters?page=${filters.page}`);
  return res?.characters || [];
}
```

### Passo 4: Implementar a UI (`page.tsx`)
1. Adicione `'use client'` se a página necessitar de estados ou interações do usuário.
2. Crie os estados (`useState`) para os dados, loading e erro.
3. Importe o `_service` e carregue os dados dentro do `useEffect`.
4. Renderize o loading spinner, o container de erro e a tabela de dados real.

---

## 🤝 Correspondência de Rotas (Frontend ↔ Backend)

| Rota Frontend | Finalidade | Endpoint Backend |
|---|---|---|
| `/login` | Autenticação de Usuário | `POST /api/auth/login` |
| `/register` | Cadastro de Usuário | `POST /api/auth/register` |
| `/` | HUD e Mapa Interativo | `GET /api/wiki/sagas`<br>`GET /api/wiki/arcs`<br>`GET /api/wiki/map` |
| `/admin/users` (futuro) | Gestão de Contas (Admin) | `GET /api/users`<br>`POST /api/users`<br>`DELETE /api/users/:id` |
| `/admin/islands` (futuro) | CRUD de Ilhas | `GET /api/islands`<br>`POST /api/islands`<br>`PATCH /api/islands/:id` |
| `/admin/characters` (futuro) | CRUD de Personagens | `GET /api/characters`<br>`POST /api/characters`<br>`PATCH /api/characters/:id` |
