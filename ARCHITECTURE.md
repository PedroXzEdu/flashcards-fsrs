# ARCHITECTURE — FlashFSRS

> Mapa real da estrutura do projeto. Leia antes de navegar no código.

---

## 1. Visão Geral

FlashFSRS é um monólito modular de três camadas (frontend + backend + banco) rodando via Docker Compose.

```
frontend (React + Vite) → HTTP/JSON → backend (Express) → SQL → PostgreSQL
```

- **Frontend**: React 19, Vite, Tailwind v4, Catppuccin, Tiptap (rich text), KaTeX
- **Backend**: Node.js, Express 5, TypeScript, `pg` (raw SQL), Zod, ts-fsrs
- **Banco**: PostgreSQL 16 (Alpine)
- **Infra**: Docker Compose (Node 20, serviços frontend/backend/db/tools)
- **Auth**: JWT stateless (7d expiry)
- **Logger**: Pino estruturado com requestId

Separação por camadas no backend: Controller → Service → Repository.

---

### Convenção de Ambientes `.env`

Três arquivos em `backend/` definem a configuração do backend:

| Arquivo        | Uso                                                   | `DB_HOST`   |
| -------------- | ----------------------------------------------------- | ----------- |
| `.env`         | Fonte de verdade para Docker Compose (via `env_file`) | `db`        |
| `.env.local`   | Execução local sem Docker (copiar para `.env`)        | `localhost` |
| `.env.example` | Template público com valores placeholder              | `localhost` |

**Regra:** Dentro de containers Docker, o Postgres é acessível pelo nome do serviço (`db`), nunca por `localhost`.

---

## 2. Estrutura de Pastas

```
/
├── ARCHITECTURE.md
├── AGENTS.md
├── ROADMAP.md
├── DECISIONS.md
├── docker-compose.yml
│
├── backend/
│   ├── src/
│   │   ├── app.ts               → Express setup (middleware stack)
│   │   ├── server.ts             → Entry point (migrate + listen + graceful shutdown)
│   │   ├── config/
│   │   │   ├── env.ts            → Zod env validation
│   │   │   └── logger.ts        → Pino logger
│   │   ├── controllers/         → HTTP layer (req/res/next)
│   │   │   ├── authController.ts
│   │   │   ├── deckController.ts
│   │   │   ├── cardController.ts
│   │   │   ├── reviewController.ts
│   │   │   ├── reviewLogsController.ts
│   │   │   ├── importController.ts    ← raw SQL
│   │   │   ├── analyticsController.ts
│   │   │   └── healthController.ts
│   │   ├── services/           → Business logic
│   │   │   ├── authService.ts
│   │   │   ├── deckService.ts
│   │   │   ├── deckImportService.ts
│   │   │   ├── reviewService.ts      ← transactional (FSRS)
│   │   │   ├── fsrsService.ts        ← ts-fsrs wrapper
│   │   │   ├── analyticsService.ts
│   │   │   ├── priorityQueueService.ts
│   │   │   └── __tests__/
│   │   ├── repositories/       → SQL puro (pg)
│   │   │   ├── userRepository.ts
│   │   │   ├── deckRepository.ts
│   │   │   ├── cardRepository.ts
│   │   │   ├── reviewLogRepository.ts
│   │   │   └── analyticsRepository.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts             → JWT verify
│   │   │   ├── errorHandler.ts     → Centralized error handler
│   │   │   ├── rateLimiter.ts      → 4 rate limiters
│   │   │   ├── requestId.ts        → UUID per request
│   │   │   ├── validate.ts         → Zod middleware
│   │   │   └── __tests__/
│   │   ├── routes/
│   │   │   ├── index.ts            → Route aggregator
│   │   │   ├── authRoutes.ts
│   │   │   ├── deckRoutes.ts
│   │   │   ├── cardRoutes.ts
│   │   │   ├── reviewRoutes.ts
│   │   │   ├── reviewLogsRoutes.ts
│   │   │   ├── importRoutes.ts
│   │   │   └── analyticsRoutes.ts
│   │   ├── schemas/               → Zod schemas
│   │   │   ├── authSchema.ts
│   │   │   ├── cardSchema.ts
│   │   │   └── deckSchema.ts
│   │   ├── database/
│   │   │   ├── db.ts               → PG Pool + runMigrations()
│   │   │   └── migrations.sql      → 4 tabelas + índices
│   │   ├── types/                  → Type declarations
│   │   └── utils/
│   │       ├── AppError.ts         → Error class com statusCode
│   │       └── sanitize.ts
│   └── uploads/
│       ├── tmp/                    → .apkg temporário
│       └── media/                  → Mídia extraída de .apkg
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx               → Entry point (providers wrappers)
│   │   ├── App.tsx                → Routes definition
│   │   ├── api/                   → HTTP client (fetch)
│   │   │   ├── client.ts          → fetch wrapper genérico
│   │   │   ├── auth.ts
│   │   │   ├── decks.ts
│   │   │   └── cards.ts
│   │   ├── pages/
│   │   │   ├── auth/              → LoginPage, RegisterPage
│   │   │   ├── decks/             → DashboardPage, DeckPage, StatsPage
│   │   │   ├── review/            → ReviewPage
│   │   │   ├── SharedDeckPage.tsx
│   │   │   └── StatsGlobalPage.tsx
│   │   ├── components/           → UI components
│   │   │   ├── Layout.tsx         → App shell (header + nav)
│   │   │   ├── Button.tsx
│   │   │   ├── RichTextEditor.tsx → Tiptap wrapper
│   │   │   ├── CardContent.tsx    → HTML render + KaTeX + sanitize
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── ImportModal.tsx
│   │   │   ├── ShareModal.tsx
│   │   │   ├── ActivityHeatmap.tsx
│   │   │   ├── DailyQueue.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx     → token + user state
│   │   │   └── ThemeContext.tsx    → dark/light
│   │   ├── hooks/
│   │   │   └── useButton.ts
│   │   ├── services/
│   │   │   └── analyticsApi.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── styles/
│   │       ├── index.css          → Tailwind + Catppuccin + animations
│   │       └── heatmap.css        → Legacy (não usado)
│   └── public/
```

---

## 3. Responsabilidades por Camada

### Backend

**Controller**

- Recebe request (req.params, req.body, req.userId)
- Chama service
- Retorna `{ success: true, data: ... }`

**Service**

- Lógica de negócio
- Coordena repositórios
- Regras do FSRS
- Transações (BEGIN/COMMIT/ROLLBACK)

**Repository**

- SQL parametrizado via `pg`
- Sem regra de negócio
- Aceita `PoolClient` opcional para transações
- SELECT/INSERT/UPDATE/DELETE puro

**Middleware**

- `auth`: verifica JWT, seta `req.userId`
- `validate(schema)`: valida req.body com Zod
- `rateLimiter`: 4 limiters granulares
- `requestId`: UUID + header X-Request-Id
- `errorHandler`: centraliza erros (AppError, ZodError, Multer, genérico)

### Frontend

**Pages** → componentes de rota (lazy loaded)
**Components** → reutilizáveis (Button, Modal, Layout)
**API layer** → fetch wrapper (`client.ts`) + módulos por recurso
**Contexts** → AuthContext (token/user), ThemeContext (dark/light)
**Rich text** → Tiptap + KaTeX render no `CardContent`
**State** → local (useState/useEffect), sem Redux/Zustand

---

## 4. Fluxos Importantes

### Revisão FSRS

```
GET  /decks/:deck_id/review          → due cards
POST /decks/:deck_id/review/:cardId  → submit rating (1-4)

Request → authMiddleware → reviewController
  → reviewService.getDueCards/submitReview
    → cardRepository.findDueByDeck/findById
    → fsrsService (ts-fsrs: f.repeat())
    → [transação] cardRepository.updateFsrsData + reviewLogRepository.create
  → { success: true, data: { card, review, next_review, scheduled_days } }
```

### Import .apkg

```
POST /import (multipart: file)
  → authMiddleware, importRateLimiter, multer (.apkg only, 50MB)
  → importController
    → unzipper (extract ZIP)
    → better-sqlite3 (lê collection.anki2)
    → copia mídia para uploads/media/
    → cria deck + cards (createEmptyCard FSRS defaults)
  → { success: true, data: { deck, imported, skipped, message } }
```

### Compartilhamento de Deck

```
POST /decks/:id/share → gera token (crypto.randomBytes)
DELETE /decks/:id/share → remove token

GET  /decks/shared/:token/preview → público (sem auth)
POST /decks/shared/:token/import  → cópia transactional
```

---

## 5. Regras Arquiteturais

- **Controllers não acessam DB direto** — exceção: import (lê SQLite do .apkg, não o Postgres da app)
- **Services não conhecem Express** — sem req/res
- **Repository = SQL only** — sem regra de negócio
- **Rich text é armazenado como HTML bruto** no banco
- **Frontend sanitiza render** — `CardContent` faz `sanitizeHtml()` + KaTeX
- **Erros passam pelo `errorHandler`** — via `next(err)`
- **Validação de request** via Zod middleware (`validate.ts`)
- **Evitar lógica complexa em routes** — routes só registram middleware + controller
- **Transações** via `PoolClient` adquirido com `pool.connect()`
- **Respostas seguem padrão** `{ success: true, data: {} }` — exceção: `importController`
- **CSP em reportOnly** — violações logadas mas não bloqueadas
- **JWT sem refresh token** — stateless, 7d expiry

---

## 6. Inconsistências Conhecidas

### `importController` acessa SQLite diretamente

O controller de importação usa `better-sqlite3` para ler o arquivo `collection.anki2` do `.apkg` — que é um banco SQLite, não o Postgres da aplicação. Isso é aceitável pois lê de um arquivo enviado pelo usuário, mas foge do padrão controller → service → repository para essa etapa específica.
