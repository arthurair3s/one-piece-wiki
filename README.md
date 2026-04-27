# 🏴‍☠️ Grand Line API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  <br>
  <strong>A API definitiva do universo One Piece</strong>
</p>

## 🌊 Visão Geral

A **Grand Line API** é um poderoso ecossistema RESTful desenvolvido para gerenciar e fornecer dados estruturados sobre o vasto universo de One Piece. 

A API foi projetada para suportar sistemas complexos de:
- 📖 **Enciclopédia de Dados**: Gestão cronológica de Sagas, Arcos, Personagens, Facções e Akuma no Mi.
- 🗺️ **Cartografia Estruturada**: Dados detalhados de ilhas e regiões com coordenadas para mapeamento.
- 🎮 **Lógica de Gamificação**: Sistema de exploração e Quizzes integrados por localidade.
- 🛡️ **Segurança e Regras**: Controle de acesso baseado em perfis (RBAC) e uma **Política de Spoilers Dinâmica** que filtra dados conforme o progresso do usuário.

---

## 🛠️ Stack Tecnológica

- **Backend**: [NestJS](https://nestjs.com/) (Arquitetura Modular)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Sequelize-Typescript](https://github.com/sequelize/sequelize-typescript)
- **Arquitetura**: **CQRS** (Command Query Responsibility Segregation) para separação clara entre leitura e escrita.
- **Banco de Dados**: PostgreSQL & Redis (Cache e Filas).
- **Mensageria**: BullMQ (Processamento assíncrono).

---

## 🚀 Começo Rápido

### Pré-requisitos
- Docker & Docker Compose
- Node.js v20+

### 1. Configurar o Ambiente
Crie o arquivo `.env` na raiz (veja `.env.example`):
```bash
cp .env.example .env
```

### 2. Subir a Infraestrutura
```bash
docker-compose up -d
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Executar Migrations e Seeders
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 5. Rodar a Aplicação
```bash
npm run start:dev
```

---

## 🗺️ Mapa da API (Domínios Principais)

- **/auth**: Gestão de identidade e JWT.
- **/profiles**: Controle granular de permissões (RBAC).
- **/islands**: Dados cartográficos de regiões e ilhas.
- **/sagas**: Estrutura cronológica (Sagas -> Arcos -> Personagens).
- **/quizzes**: Lógica de progresso e exploração.

---

## 📜 Regras de Negócio

1. **Spoiler-Free**: Endpoints de listagem aplicam filtros automáticos baseados no `current_arc_id` do perfil.
2. **Ciclo das Akuma no Mi**: Implementação de lógica para garantir a unicidade e ciclo de vida das frutas no sistema.
3. **Exploração Dinâmica**: Status de exploração de ilhas vinculados ao desempenho em Quizzes.

---

## 📄 Licença

Este projeto está sob a licença UNLICENSED. Desenvolvido para fins de demonstração técnica e paixão pela obra de Eiichiro Oda.
