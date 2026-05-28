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
├── docker-compose.yml
├── AGENTS.md
└── README.md
```

### Backend

Estrutura baseada em camadas:

```txt
src/
├── controllers/
├── services/
├── middlewares/
├── routes/
├── database/
├── config/
└── utils/
```

### Frontend

Estrutura baseada em páginas e componentes:

```txt
src/
├── components/
├── pages/
├── contexts/
├── services/
└── types/
```

---

## Como Executar o Projeto

### Ambientes .env

O projeto usa três arquivos de ambiente no diretório `backend/`:

| Arquivo        | Finalidade                           | `DB_HOST`              |
| -------------- | ------------------------------------ | ---------------------- |
| `.env`         | Fonte de verdade para Docker Compose | `db` (nome do serviço) |
| `.env.local`   | Execução local sem Docker            | `localhost`            |
| `.env.example` | Template público para onboarding     | `localhost`            |

**Regra importante:** Nunca use `localhost` como hostname do Postgres dentro de containers Docker. Dentro da rede do Docker, o banco é acessível pelo nome do serviço (`db`).

---

### Docker (recomendado)

#### Pré-requisitos

- Docker
- Docker Compose

> Não é necessário instalar Node.js localmente.

#### 1. Clone o repositório

```bash
git clone [<url-do-repositorio>](https://github.com/PedroXzEdu/flashfsrs)
cd flashcards-fsrs
```

#### 2. Suba os containers

```bash
docker compose up
```

O backend usa `backend/.env` (`DB_HOST=db`) e o Postgres sobe automaticamente com health check.

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
cp backend/.env.local backend/.env
```

Isso copia o arquivo com `DB_HOST=localhost` para o backend.

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

Executar:

```bash
docker compose exec backend npm test
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
