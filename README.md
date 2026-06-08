# FlashFSRS

Sistema de flashcards inteligente inspirado no Anki, com algoritmo **FSRS (Free Spaced Repetition Scheduler)** para revisão espaçada, importação de decks `.apkg`, compartilhamento de baralhos e estatísticas de aprendizagem.

## Preview

- Dashboard
- Revisão FSRS
- Estatísticas
- Compartilhamento de decks
- Importação `.apkg`

---

## Funcionalidades

### Autenticação

- Cadastro e login com JWT
- Proteção de rotas
- Rate limiting em login e registro
- Sanitização de entradas
- Request ID para rastreamento de erros

### Gestão de Baralhos

- Criar, renomear e excluir baralhos
- Configuração personalizada por deck
- Compartilhamento por link
- Importação de decks `.apkg`

### Gestão de Cards

- Criar, editar e excluir cards
- Editor rico (Rich Text)
- Suporte a fórmulas matemáticas com KaTeX
- Busca e gerenciamento em lote

### Sistema de Revisão (FSRS)

- Agendamento inteligente de revisões
- Estados de aprendizado
- Avaliações:
  - Repetir
  - Difícil
  - Bom
  - Fácil
- Fila diária de revisão

### Estatísticas

- Heatmap de atividade
- Taxa de acerto
- Distribuição de reviews
- Progresso por deck
- Métricas globais

### Qualidade e Engenharia

- Docker-first workflow
- Lazy loading no frontend
- Logging estruturado com Pino
- Health check endpoint
- Error boundary no frontend
- ESLint + Prettier
- Husky + lint-staged
- Testes automatizados

---

## Stack Tecnológica

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Tiptap
- Recharts
- KaTeX

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- pg (raw SQL)
- JWT Authentication
- Pino Logger

### Infraestrutura

- Docker
- Docker Compose

### Qualidade

- ESLint
- Prettier
- Husky
- lint-staged
- Vitest

---

## Arquitetura

O projeto segue uma arquitetura separada entre frontend e backend.

```txt
flashfsrs/
├── frontend/          # React + Vite
├── backend/           # Express + PostgreSQL
├── e2e/               # Playwright (E2E)
├── .plans/            # Planos de desenvolvimento
├── .graphify/         # Knowledge graph
├── .husky/            # Git hooks
├── docker-compose.yml
├── Dockerfile
├── package.json
├── AGENTS.md
└── README.md
```

### Backend

Estrutura baseada em camadas:

```txt
src/
├── app.ts
├── server.ts
├── config/
├── controllers/
├── database/
├── middlewares/
├── repositories/
├── routes/
├── schemas/
├── services/
├── tests/
├── types/
└── utils/
```

### Frontend

Estrutura baseada em páginas e componentes:

```txt
src/
├── main.tsx
├── App.tsx
├── api/
├── assets/
├── components/
├── contexts/
├── hooks/
├── pages/
├── services/
├── test/
└── types/
```

---

## Como Executar o Projeto

### Ambientes .env

O projeto usa três arquivos de ambiente no diretório `backend/`:

| Arquivo        | Finalidade                           | `DB_HOST`              |
| -------------- | ------------------------------------ | ---------------------- |
| `.env`         | Fonte de verdade para Docker Compose | `db` (nome do serviço) |
| `.env.example` | Template para execução local         | `localhost`            |
| `.env.test`    | Ambiente de testes (docker)          | `db-test`              |

**Regra importante:** Nunca use `localhost` como hostname do Postgres dentro de containers Docker. Dentro da rede do Docker, o banco é acessível pelo nome do serviço (`db`).

---

### Docker (recomendado)

#### Pré-requisitos

- Docker
- Docker Compose

> Não é necessário instalar Node.js localmente.

#### 1. Clone o repositório

```bash
git clone https://github.com/PedroXzEdu/flashfsrs
cd flashfsrs
```

#### 2. Suba os containers

```bash
docker compose up
```

O backend usa `backend/.env` (`DB_HOST=db`) e o Postgres sobe automaticamente com health check.
O `docker compose.yml` também define os serviços `tools` (utilitários CLI) e `db-test` (banco de testes).

#### 3. Acesse a aplicação

Frontend: `http://localhost:5173`
Backend: `http://localhost:3000`
Health: `http://localhost:3000/health`

---

### Local (sem Docker)

#### Pré-requisitos

- Node.js 20
- PostgreSQL 16 rodando localmente

#### 1. Configure o ambiente local

```bash
cp backend/.env.example backend/.env
```

Edite `DB_HOST=localhost` e ajuste as credenciais do seu PostgreSQL local.

#### 2. Instale as dependências

```bash
cd backend && npm install
```

#### 3. Execute o backend

```bash
npm run dev
```

> O frontend requer Docker ou configuração separada com `VITE_API_URL=http://localhost:3000`.

---

## Scripts Úteis

### Frontend

```bash
docker compose exec frontend npm run dev
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
docker compose exec frontend npm run test
```

### Backend

```bash
docker compose exec backend npm run dev
docker compose exec backend npm run build
docker compose exec backend npm run test
```

### Formatação

```bash
docker compose exec frontend npm run format
docker compose exec backend npm run format
```

### Graphify — Knowledge Graph

O projeto usa [@nodesify/graphify](https://www.npmjs.com/package/@nodesify/graphify) para gerar um grafo de conhecimento do código-fonte, analisando arquivos, dependências, módulos e suas relações.

#### Regenerar o grafo manualmente

```bash
npm run graphify
```

Gera o grafo completo em `.graphify/graph.json` e o relatório em `.graphify/graph_report.md`.

#### Atualização incremental

```bash
npm run graphify:update
```

Atualiza apenas os arquivos modificados desde a última execução (mais rápido).

#### Modo watch

```bash
npm run graphify:watch
```

Monitora mudanças no código e atualiza o grafo automaticamente.

#### Consultar o grafo

```bash
npx @nodesify/graphify query "Como funciona o algoritmo FSRS?"
```

O comando `query` faz uma travessia BFS/DFS no grafo a partir de nós relevantes à pergunta.

#### Atualização automática (pre-commit)

O hook do Husky executa `graphify:update` automaticamente antes de cada commit, mantendo o grafo sincronizado com o código. Os arquivos modificados em `.graphify/` são incluídos no próprio commit.

---

## Testes

O projeto possui testes automatizados para:

### Backend — Services (10 arquivos)

- Auth, Deck, Review, FSRS, Analytics, PriorityQueue
- Card, ReviewLogs, Import, DeckImport

### Backend — Controllers (8 arquivos)

- Auth, Deck, Card, Review, ReviewLogs, Analytics, Health, Import

### Backend — Middlewares (5 arquivos)

- Auth, ErrorHandler, RateLimiter, RequestId, Validate

### E2E (Playwright)

- Autenticação (login, registro)
- Importação `.apkg`
- Revisão FSRS

Executar testes unitários do backend:

```bash
docker compose exec backend npm test
```

Executar testes E2E:

```bash
npm run test:e2e
```

---

## Segurança

O projeto implementa medidas básicas de segurança para um MVP:

- JWT Authentication
- Rate limiting em autenticação
- Sanitização de entradas
- Upload seguro de `.apkg`
- Request IDs para rastreamento
- Logging estruturado
- Error handling centralizado

---

## Roadmap

Consulte o arquivo [`ROADMAP.md`](./ROADMAP.md) para o status atual, funcionalidades concluídas e próximas prioridades.

---

## Autor

**Pedro Eduardo**

Projeto desenvolvido como sistema de estudo baseado em repetição espaçada utilizando o algoritmo **FSRS**.

---

## Licença

Este projeto é destinado para fins acadêmicos e educacionais.
