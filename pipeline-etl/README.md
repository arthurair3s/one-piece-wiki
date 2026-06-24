# Grand Line ETL - Microsserviço de Pipeline

Este microsserviço Python é responsável pela extração, staging, refinamento e publicação de dados do universo de One Piece a partir da Wiki Fandom pt-br para a API Core (NestJS).

## Arquitetura do ETL

1. **Extraction (Raspagem/Scraping)**: Consulta a API da Wiki Fandom pt-br para buscar informações sobre Sagas, Arcos, Ilhas e Personagens, enriquecendo os dados com raspagem de páginas adicionais.
2. **Staging (Banco SQLite)**: Armazena os dados brutos e normalizados no banco de staging local (`pipeline.db`) com status `preview_ready`, permitindo a visualização dos dados antes de impactar o ambiente de produção.
3. **Refinement (Refinamento)**: Permite que um operador edite ou corrija informações de staging através da rota de refinamento (`POST /pipeline-jobs/{id}/refine`).
4. **Publishing (Publicação)**: Autentica-se na API Core e publica as entidades normalizadas (Sagas, Arcos, Ilhas, Personagens, Versões e Eventos) garantindo idempotência e preservando os históricos no PostgreSQL de escrita (Write DB).

---

## Pré-requisitos

- Python 3.10 ou superior
- Pip (gerenciador de pacotes do Python)

---

## Instalação

1. Acesse a pasta do microsserviço:
   ```bash
   cd pipeline-etl
   ```

2. Instale as dependências listadas no `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

---

## Configuração

O microsserviço carrega as credenciais e configurações automaticamente a partir dos arquivos `.env` presentes nas pastas superiores. Ele busca em ordem:
1. `pipeline-etl/.env`
2. `.env` (na raiz do projeto)
3. `api/.env` (na pasta da API NestJS)

### Variáveis Disponíveis no `.env`

- `DB_HOST`: Endereço do PostgreSQL de escrita (Padrão: `127.0.0.1`).
- `DB_PORT`: Porta do PostgreSQL (Padrão: `5432`).
- `DB_USERNAME`: Usuário do banco (Padrão: `postgres`).
- `DB_PASSWORD`: Senha do banco (Padrão: `postgres`).
- `DB_DATABASE`: Nome do banco de dados (Padrão: `grand_line_db`).
- `API_BASE_URL`: URL base da API Core (Padrão: `http://localhost:3000/api`).

---

## Executando o Servidor de Desenvolvimento

Para rodar o microsserviço FastAPI localmente:
```bash
uvicorn main:app --reload --port 8000
```
O servidor estará disponível em [http://127.0.0.1:8000](http://127.0.0.1:8000). A documentação interativa das rotas pode ser acessada em `/docs` (Swagger UI).

---

## Rotas da API (Endpoints)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/pipeline-jobs` | Cria um novo job de ETL (Inicia extração em segundo plano). |
| `GET` | `/pipeline-jobs` | Lista todos os jobs criados e seus estados. |
| `GET` | `/pipeline-jobs/{id}` | Retorna o status detalhado e log de auditoria de um job. |
| `GET` | `/pipeline-jobs/{id}/preview` | Visualiza os dados normalizados coletados no banco de staging. |
| `POST` | `/pipeline-jobs/{id}/refine` | Permite que o operador aplique patches/correções nos dados coletados. |
| `POST` | `/pipeline-jobs/{id}/approve` | Aprova o job para publicação. |
| `POST` | `/pipeline-jobs/{id}/publish` | Dispara a publicação dos dados aprovados para a API Core. |

---

## Executando os Testes de Integração

O microsserviço possui um script de teste de integração que valida todo o fluxo end-to-end (coleta, staging, refinamento, aprovação e publicação de arcos do East Blue):

1. Certifique-se de que a API NestJS e os bancos de dados estejam rodando (`npm run start:dev` ou similar).
2. Execute o script de testes:
   ```bash
   python3 test_pipeline.py
   ```
O teste irá instanciar o servidor FastAPI temporariamente em segundo plano, realizar as requisições de ponta a ponta e validar se os dados foram inseridos ou atualizados corretamente na API.
