# ARCHITECTURE — FlashFSRS

> Mapa real da estrutura do projeto. Leia antes de navegar no código.

---

## 1. Visão Geral

FlashFSRS é um monólito modular de três camadas (frontend + backend + banco).

```
**Produção (ativo):** browser → Vercel (frontend estático) → Render (backend Express) → Render PostgreSQL
**Produção (alternativa Docker):** browser → nginx (proxy reverso) → backend (Express) → PostgreSQL (via `docker-compose.prod.yml`)
**Desenvolvimento:** browser → Vite dev server → backend (Express) → SQL → PostgreSQL (via `docker-compose.yml`)
```

- **Frontend**: React 19, Vite, Tailwind v4, Catppuccin, Tiptap (rich text), KaTeX, PWA (service worker + offline page), vitest + testing-library (testes)
- **Backend**: Node.js, Express 5, TypeScript, `pg` (raw SQL), Zod, ts-fsrs
- **Banco**: PostgreSQL 16 (Alpine)
- **Infra**: Docker Compose para desenvolvimento (frontend/backend/db/db-test/tools); produção ativa em Vercel (frontend) + Render (backend + PostgreSQL); deploy Docker alternativo via `docker-compose.prod.yml`
- **Auth**: JWT stateless (7d expiry)
- **Logger**: Pino estruturado com requestId (JSON em produção, pretty-print em dev)
- **Segurança**: helmet (CSP enforce + security headers), global rate limit (1000/15min), brute force protection (5 falhas → 30min block)

Separação por camadas no backend: Controller → Service → Repository.

---

### Convenção de Ambientes `.env`

Três arquivos em `backend/` definem a configuração do backend:

| Arquivo        | Uso                                                   | `DB_HOST`   |
| -------------- | ----------------------------------------------------- | ----------- |
| `.env`         | Fonte de verdade para Docker Compose (via `env_file`) | `db`        |
| `.env.example` | Template para execução local (copiar para `.env`)     | `localhost` |
| `.env.test`    | Testes de integração (via Vitest `dotenv` option)     | `db-test`   |

**Regra:** Dentro de containers Docker, o Postgres é acessível pelo nome do serviço (`db` ou `db-test`), nunca por `localhost`.

---

## 2. Estrutura de Pastas

```
/
├── ARCHITECTURE.md
├── AGENTS.md
├── ROADMAP.md
├── DECISIONS.md
├── Dockerfile                 → Multi-stage backend (3 stages: deps/build/runtime)
├── Dockerfile.frontend        → Multi-stage frontend (build → nginx:alpine)
├── .dockerignore
├── docker-compose.yml         → Dev
├── docker-compose.prod.yml    → Produção (nginx + backend node + postgres)
├── .env.prod.example          → Template de ambiente de produção
├── e2e/
│   ├── playwright.config.ts
│   ├── .env.e2e              → Variáveis de ambiente para E2E
│   ├── global-setup.ts       → Global setup (Docker lifecycle + auth fixo)
│   ├── global-teardown.ts    → No-op (placeholder)
│   ├── auth.spec.ts
│   ├── review.spec.ts
│   ├── import.spec.ts
│   ├── analytics.spec.ts
│   ├── share.spec.ts
│   ├── deck.spec.ts
│   ├── card.spec.ts
│   ├── tsconfig.json         → TypeScript config para typecheck E2E
│   └── helpers/
│       ├── index.ts           → uniqueUser() + sampleApkgPath()
│       ├── auth.ts            → authTest fixture (storageState pré-autenticado)
│       └── generate-apkg.mjs  → Gerador de .apkg programático
├── .opencode/
│   └── agents/
│       ├── reviewer.md
│       └── doc.md
│
├── backend/
│   ├── vitest.workspace.ts       → Projetos unit + integration
│   ├── .env.test                 → Env para testes de integração
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
│   │   │   ├── achievementController.ts
│   │   │   └── healthController.ts
│   │   ├── services/           → Business logic
│   │   │   ├── authService.ts
│   │   │   ├── deckService.ts
│   │   │   ├── deckImportService.ts
│   │   │   ├── cardService.ts
│   │   │   ├── reviewService.ts      ← transactional (FSRS)
│   │   │   ├── reviewLogsService.ts
│   │   │   ├── fsrsService.ts        ← ts-fsrs wrapper
│   │   │   ├── achievementService.ts
│   │   │   ├── analyticsService.ts
│   │   │   ├── priorityQueueService.ts
│   │   │   ├── importService.ts
│   │   │   ├── exportService.ts          → .apkg export (archiver + better-sqlite3)
│   │   │   └── __tests__/
│   │   ├── repositories/       → SQL puro (pg)
│   │   │   ├── userRepository.ts
│   │   │   ├── deckRepository.ts
│   │   │   ├── cardRepository.ts
│   │   │   ├── reviewLogRepository.ts
│   │   │   ├── achievementRepository.ts
│   │   │   ├── analyticsRepository.ts
│   │   │   └── __tests__/
│   │   ├── middlewares/
│   │   │   ├── auth.ts             → JWT verify
│   │   │   ├── errorHandler.ts     → Centralized error handler
│   │   │   ├── rateLimiter.ts      → 5 limiters (4 granulares + 1 global)
│   │   │   ├── bruteForce.ts       → 5 tentativas → 30min block (in-memory)
│   │   │   ├── requestId.ts        → UUID per request
│   │   │   ├── validate.ts         → Zod middleware
│   │   │   ├── metrics.ts          → MetricsCollector + middleware (contadores, histograma)
│   │   │   └── __tests__/
│   │   ├── routes/
│   │   │   ├── index.ts            → Route aggregator
│   │   │   ├── authRoutes.ts
│   │   │   ├── deckRoutes.ts
│   │   │   ├── cardRoutes.ts
│   │   │   ├── reviewRoutes.ts
│   │   │   ├── reviewLogsRoutes.ts
│   │   │   ├── achievementRoutes.ts
│   │   │   ├── importRoutes.ts
│   │   │   ├── analyticsRoutes.ts
│   │   │   └── metricsRoutes.ts
│   │   ├── schemas/               → Zod schemas
│   │   │   ├── authSchema.ts
│   │   │   ├── cardSchema.ts
│   │   │   ├── deckSchema.ts
│   │   │   ├── paramsSchema.ts    → deck/card route param validation
│   │   │   ├── querySchemas.ts    → pagination, analyticsMonths, analyticsDays
│   │   │   └── reviewSchema.ts    → rating (1-4) validation
│   │   ├── database/
│   │   │   ├── db.ts               → PG Pool + runMigrations() + ping()
│   │   │   ├── migrations.sql      → Schema inicial (4 tabelas + índices)
│   │   │   ├── migrationRunner.ts  → Runner de migrações sequenciais (pasta `migrations/`)
│   │   │   └── migrations/         → Migrações SQL numeradas (001_*, 002_*, etc.)
│   │   ├── tests/                  → Testes de integração
│   │   │   └── integration/
│   │   │       ├── helpers/
│   │   │       │   ├── db.ts       → testPool, runMigrations, cleanDatabase
│   │   │       │   ├── factories.ts → createUser, createDeck, createCard
│   │   │       │   └── generateFixture.ts → geração de dados de teste
│   │   │       ├── auth.integration.test.ts
│   │   │       ├── decks.integration.test.ts
│   │   │       ├── review.integration.test.ts
│   │   │       ├── analytics.integration.test.ts
│   │   │       ├── import.integration.test.ts
│   │   │       └── security.integration.test.ts
│   │   ├── types/                  → Type declarations
│   │   └── utils/
│   │       ├── AppError.ts         → Error class com statusCode
│   │       ├── sanitize.ts
│   │       ├── sanitizeHtml.ts     → DOMPurify server-side (importService)
│   │       └── transaction.ts      → withTransaction() helper (BEGIN/COMMIT/ROLLBACK)
│   └── uploads/
│       ├── tmp/                    → .apkg temporário
│       └── media/                  → Mídia extraída de .apkg
│
├── frontend/
│   ├── nginx.conf                → Proxy reverso para produção
│   ├── vitest.config.ts          → Test config (jsdom, globals, setup)
│   ├── src/
│   │   ├── main.tsx               → Entry point (providers wrappers)
│   │   ├── App.tsx                → Routes definition
│   │   ├── api/                   → HTTP client (fetch)
│   │   │   ├── client.ts          → fetch wrapper genérico
│   │   │   ├── auth.ts
│   │   │   ├── decks.ts
│   │   │   ├── cards.ts
│   │   │   └── achievements.ts
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
│   │   │   ├── Tooltip.tsx
│   │   │   ├── EmptyState.tsx     → Feedback para listas vazias
│   │   │   ├── AddDeckModal.tsx
│   │   │   ├── EditDeckModal.tsx
│   │   │   ├── CardForm.tsx       → Card create/edit with tags
│   │   │   ├── CardInlineEdit.tsx → Inline card editing
│   │   │   ├── CardListItem.tsx   → Card item with state badge + tags
│   │   │   ├── BulkCreateForm.tsx → Bulk card creation
│   │   │   ├── CsvImportModal.tsx → CSV/TXT import with drag-and-drop
│   │   │   ├── EmptyDeckState.tsx → Empty deck placeholder
│   │   │   ├── LoadMoreButton.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── PasswordStrengthIndicator.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── CreateDeckForm.tsx
│   │   │   │   ├── DeckCard.tsx
│   │   │   │   ├── DeckList.tsx
│   │   │   │   ├── StreakCards.tsx
│   │   │   │   └── WorkloadChart.tsx
│   │   │   ├── review/
│   │   │   │   ├── RatingButtons.tsx
│   │   │   │   ├── ReviewCard.tsx
│   │   │   │   ├── ReviewHeader.tsx
│   │   │   │   ├── ReviewSessionProgress.tsx
│   │   │   │   └── ReviewSessionSummary.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── FormField.tsx
│   │   │   │   └── PageSection.tsx
│   │   │   └── __tests__/        → Testes de componentes (Button, CardContent, etc.)
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx     → token + user state
│   │   │   ├── ThemeContext.tsx    → dark/light
│   │   │   └── ToastContext.tsx    → Notificações toast
│   │   ├── hooks/
│   │   │   └── useFocusTrap.ts
│   │   ├── services/
│   │   │   └── analyticsApi.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── test/
│   │   │   └── setup.ts          → Vitest global setup (localStorage + matchMedia mocks)
│   │   └── index.css              → Tailwind + Catppuccin + animations + design tokens
│   │
│   └── public/
│       ├── offline.html           → Página offline do PWA
│       ├── icons.svg              → SVG sprite (bluesky, discord, documentation)
│       ├── pwa-192x192.png        → Ícone PWA
│       ├── pwa-512x512.png        → Ícone PWA
│       ├── apple-touch-icon.png
│       └── favicon.svg
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
- `validate(bodySchema?, querySchema?)`: valida req.body e/ou req.query com Zod (ambos opcionais)
- `rateLimiter`: 5 limiters (4 granulares + 1 global `1000/15min`)
- `bruteForce`: bloqueia IP após 5 tentativas de login inválidas em 15min (30min de block), armazenamento in-memory
- `requestId`: UUID + header X-Request-Id
- `errorHandler`: centraliza erros (AppError, ZodError, Multer, genérico)
- `metrics`: coleta métricas de requisição (contadores por rota, histograma de duração, erros), expõe singleton `collector` para incrementos de métricas de negócio nos services

### Frontend

**Pages** → componentes de rota (lazy loaded)
**Components** → reutilizáveis (Button, Modal, Layout)
**API layer** → fetch wrapper (`client.ts`) + módulos por recurso
**Contexts** → AuthContext (token/user), ThemeContext (dark/light), ToastContext (notificações)
**Rich text** → Tiptap + KaTeX render no `CardContent`
**State** → local (useState/useEffect), sem Redux/Zustand
**Testing** → vitest + @testing-library/react + jsdom; mocks globais em `src/test/setup.ts`
**E2E** → Playwright (Chromium) em `e2e/`, run contra Docker Compose, 7 suites (auth, review, import, analytics, share, deck, card). Global setup gerencia lifecycle do Docker (`global-setup.ts`) e autentica usuário E2E fixo, salvando `storageState` em `e2e/.auth/user.json`. Fixture `authTest` disponível para testes pré-autenticados. Configuração via `.env.e2e`. Typecheck via `e2e/tsconfig.json`.

**Infra adicional (produção ativa):** frontend servido como SPA estático no Vercel, backend Express no Render com PostgreSQL gerenciado. O Vercel faz o roteamento SPA e o proxy das requisições API para o backend no Render.

**Infra alternativa (Docker):** `docker-compose.prod.yml` — nginx atua como proxy reverso: serve arquivos estáticos do frontend, faz proxy de requisições API para o backend, e gerencia cache, compressão e headers de segurança. O build multi-stage usa `Dockerfile` (backend, 3 stages: deps/build/runtime) e `Dockerfile.frontend` (build → nginx:alpine).

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
  → Opcionalmente inclui `new_achievements` (Achievement[]) se alguma conquista for desbloqueada
```

### Achievements

```
GET /achievements                     → conquistas desbloqueadas

Request → authMiddleware → achievementController
  → achievementService.getUserAchievements
    → achievementRepository.findByUser
  → { success: true, data: Achievement[] }

**Hooks (fire-and-forget):**
  POST /decks/:deck_id/review/:cardId (submitReview) → achievementService.checkAndUnlock() → novas conquistas na resposta
  POST /decks/:id/cards (create/batch)              → achievementService.checkAndUnlock() → sem retorno ao cliente
```

**Achievements predefinidos:** first_review, streak_7, streak_30, reviews_100, reviews_1000, cards_25, cards_100

### FSRS — Spaced Repetition Architecture

**Algorithm**: FSRS-5 via `ts-fsrs` (https://github.com/open-spaced-repetition/ts-fsrs).
Wrapped by `FsrsService` which loads deck-specific parameters from `deck_fsrs_params`.

**Card States** (enum `State`):

| Value | Name        | Description                              |
|-------|-------------|------------------------------------------|
| 0     | New         | Never reviewed                           |
| 1     | Learning    | In initial learning steps                |
| 2     | Review      | Graduated, normal review cycle           |
| 3     | Relearning  | Forgotten, re-learning                   |

**Transitions** (default config):

```
New ──Again──> Learning
New ──Good───> Learning
New ──Easy───> Review

Learning ──Again──> Learning (reset to step 0)
Learning ──Good───> Review (or next learning step)
Learning ──Easy───> Review

Review ──Again───> Relearning
Review ──Hard────> Review (shorter interval)
Review ──Good────> Review (normal interval)
Review ──Easy────> Review (longer interval)

Relearning ──Again──> Relearning (reset)
Relearning ──Good───> Review (recovered)
Relearning ──Easy───> Review (recovered)
```

**Key fields on Card** (persisted in `cards` table):

| Field           | Purpose                                  |
|-----------------|------------------------------------------|
| `state`         | 0=New, 1=Learning, 2=Review, 3=Relearning |
| `stability`     | Memory stability (interval when R=90%)     |
| `difficulty`    | Card difficulty (1–10)                     |
| `due`           | Next review datetime                       |
| `scheduled_days`| Days until next review                     |
| `learning_steps`| Current learning step index (T05.03 fix)   |
| `tags`          | Array de tags TEXT (GIN index)             |
| `reps`          | Total review count                         |
| `lapses`        | Times forgotten                            |

**Priority Queue** (T05.02):

The per-deck review queue (`findDueByDeck`) and the cross-deck daily queue
(`findDailyQueue`) both separate new cards from review cards:

- **Review cards** (state > 0): ordered by `predicted_recall ASC` (most likely
  to forget first). `predicted_recall = exp(-elapsed_days / stability) × 100`.
- **New cards** (state = 0): ordered by `created_at ASC` (oldest first), after
  all review cards. Capped by `deck.new_cards_per_day` (default 20).

**Custom Parameters Per Deck** (T05.01):

Decks may override FSRS defaults via `deck_fsrs_params`:
`request_retention`, `maximum_interval`, `enable_fuzz`,
`enable_short_term`, `learning_steps`, `relearning_steps`.
If no custom params exist, `generatorParameters()` defaults are used.

**Flow: submitReview**

```
1. cardRepository.findById(cardId)       → CardRow (from DB)
2. toFsrsCard(row)                        → Card (ts-fsrs type)
3. fsrsService.review(card, rating)       → RecordLogItem (via f.repeat())
4. withTransaction:
   a. cardRepository.updateFsrsData        → saves new stability, state, due, etc.
   b. reviewLogRepository.create           → logs the review
5. Return { card, review, next_review, scheduled_days }
```

**Daily Queue** (cross-deck analytics):

```
GET /analytics/daily-queue
  → priorityQueueService.getDailyQueue(userId)
    → cardRepository.findDailyQueue(userId, limit)
  → Returns top N cards with lowest predicted_recall

Used by the DailyQueue component (frontend) to show at-risk cards.
```

### Import .apkg

```
POST /import (multipart: file)
  → authMiddleware, importRateLimiter, multer (.apkg only, 50MB)
  → importController
    → unzipper (extract ZIP)
    → better-sqlite3 (lê collection.anki2)
    → copia mídia para uploads/media/
    → importService.createDeckFromAnki()
      → deckRepository.create() + cardRepository.create()
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

### Express Review (Preview)

```
GET /decks/:deck_id/review/:cardId/preview → simula 4 ratings sem persistir

Request → authMiddleware → reviewController.previewReview
  → reviewService.previewReview(cardId, userId)
    → cardRepository.findById(cardId)
    → fsrsService.preview(card) ← f.repeat() para Again/Hard/Good/Easy
  → { success: true, data: { again, hard, good, easy } }
```

Útil para o usuário ver o impacto de cada rating antes de decidir.

---

### Export .apkg

```
POST /decks/:id/export
  → authMiddleware → deckController.exportDeck
    → exportService.exportDeck(deckId, userId)
      → deckRepository.findById
      → cardRepository.findByDeck (todos os cards)
      → Monta SQLite Anki em memória (better-sqlite3)
      → Cria collection.anki2 + media map
      → Archiver empacota .apkg (ZIP)
  → Content-Disposition: attachment → stream .apkg
```

---

### CSV/TXT Import

```
POST /import/csv (multipart: file + deckId)
  → authMiddleware → importController.importCsvTxt
    → importService.importFromCsvTxt(file, deckId)
      → parseCsv() / parseTxt() → extrai pares front/back
      → Para cada par: cardRepository.create()
  → { success: true, data: { imported, errors } }

Frontend: CsvImportModal.tsx com drag-and-drop
```

---

### Analytics Endpoints

Seis endpoints montados diretamente em `app.ts` (fora de `routes/index.ts`):

```
GET /analytics/retention-rate     → taxa de retenção real
GET /analytics/review-heatmap     → heatmap de atividade
GET /analytics/forgetting-curve   → curva de esquecimento real vs predita
GET /analytics/predicted-recall   → recall predito agregado
GET /analytics/workload-forecast  → previsão de carga de revisão
GET /analytics/daily-queue        → fila de prioridade (cross-deck)

Todos seguem: authMiddleware → analyticsController
  → analyticsService → analyticsRepository
  → { success: true, data: ... }
```

### Due Counts

```
GET /decks/review/due-counts
  → authMiddleware, dueCountsRouter (separado)
  → reviewController.getDueCounts
    → reviewService.getDueCounts(userId)
      → cardRepository.getDueCountsByUser(userId)
  → { success: true, data: [{ deck_id, due_count }] }

Usado pelo DashboardPage para mostrar contagem de revisões pendentes por deck.
```

---

## 5. Regras Arquiteturais

- **Controllers não acessam DB direto** — exceção: import (lê SQLite do .apkg, não o Postgres da app)
- **Services não conhecem Express** — sem req/res
- **Repository = SQL only** — sem regra de negócio
- **Rich text é armazenado como HTML bruto** no banco
- **Frontend sanitiza render** — `CardContent` faz `sanitizeHtml()` + KaTeX
- **Erros passam pelo `errorHandler`** — via `next(err)`
- **Validação de request** via Zod middleware (`validate.ts`) — body, query params ou ambos
- **Evitar lógica complexa em routes** — routes só registram middleware + controller
- **Transações** via `PoolClient` adquirido com `pool.connect()`
- **Respostas seguem padrão** `{ success: true, data: {} }`
- **CSP enforcement** — helmet ativo, violações reportadas via `/api/csp-report`
- **JWT sem refresh token** — stateless, 7d expiry

---

## 6. Inconsistências Conhecidas

### `importController` faz parsing de SQLite do `.apkg` diretamente

O controller de importação usa `better-sqlite3` para ler o arquivo `collection.anki2` do `.apkg`. Embora o SQL de criação de deck e cards tenha sido extraído para `importService`, a leitura do SQLite do arquivo enviado permanece no controller.

**Justificativa:** O SQLite do `.apkg` é o formato de arquivo Anki, não o banco da aplicação. O parsing ocorre antes de qualquer lógica de negócio e não envolve o Postgres. É mais próximo de file parsing do que de acesso a banco. Mantido no controller por simplicidade operacional.
