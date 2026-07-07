# ROADMAP — FlashFSRS

> Projeto solo · TCC · FSRS · Prazo acadêmico limitado

---

## Status Atual

MVP funcional com as features principais entregues. O que falta é
**consistência e acabamento**, não funcionalidade nova.

O projeto segue um plano de execução estruturado em fases,
detalhado em [`.plans/tasks/`](.plans/tasks/):

| Fase                                                     | Escopo                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| **01 — Observability & Monitoring** ✅                   | Métricas, health check detalhado, logs enriquecidos                      |
| **02 — UX Hardening** ✅                                 | Confirm dialogs, progresso, acessibilidade, responsivo, auto-save        |
| **03 — Database Performance & Batch** ✅                 | Índices, batch create, paginação, otimização de queries                  |
| **04 — Testing & Quality** ✅                            | Testes de frontend, regressão FSRS, integração, E2E, ESLint, segurança   |
| **05 — Production Readiness** ✅                         | CSP enforcement, PWA, hardening, build, docker-compose prod, deploy docs |
| **06 — Features Futuras** ✅                             | Tags, achievements, export .apkg, express review, TXT/CSV import       |
| **07 — Preparação Final para TCC** 🟡                   | Revisão de docs, limpeza, screencast, checklist de apresentação          |
| **08 — Testes E2E** 🟡                                  | Infraestrutura E2E, suites de auth, deck, card, review, import, etc.     |

---

## Funcionalidades Concluídas

- [x] Autenticação (register/login JWT + rate limit)
- [x] CRUD de baralhos
- [x] CRUD de cards com editor rich text + KaTeX
- [x] Sistema de revisão FSRS (preview + submit + transaction)
- [x] Fila diária de revisão (due cards ordenados por risco)
- [x] Importação .apkg (extração ZIP + SQLite Anki + mídia)
- [x] Compartilhamento de baralhos (token + preview + import)
- [x] Estatísticas (heatmap, streak, retenção, curva de esquecimento)
- [x] Dashboard com métricas globais
- [x] Tema dark/light (Catppuccin)
- [x] Logging estruturado (Pino + requestId)
- [x] Docker Compose (frontend + backend + db)
- [x] Testes unitários (auth, deck, review services)
- [x] Lazy loading no frontend
- [x] Error boundary
- [x] Testes E2E (Playwright, 3 suites: auth, review, import)
- [x] Parâmetros FSRS customizáveis por deck (request_retention, maximum_interval, enable_fuzz, enable_short_term, learning_steps, relearning_steps)
- [x] Sistema de tags (coluna `tags TEXT[]` + índice GIN, input por vírgula, badges no card, filtro por tags)
- [x] Sistema de achievements/gamificação (7 conquistas, check-and-unlock, toast de novas conquistas, exibição em stats)
- [x] Exportação de baralho para .apkg
- [x] Modo de revisão expressa (preview de 4 ratings sem persistir)
- [x] Importação TXT/CSV para baralho existente
- [x] Edição inline de cards (sem abrir modal)
- [x] Toast system (notificações toast para feedback de operações)
- [x] Cache-control headers + PWA auth fix + prompt de atualização

---

## Polimentos Concluídos

### Sessão anterior

- [x] Error handling padronizado (inline → centralizado com `next(err)`)
- [x] `VITE_API_URL` substituindo URL hardcoded
- [x] `console.log` de debug removidos
- [x] Mensagens de erro padronizadas para PT-BR
- [x] `new_cards_per_day` corrigido (query respeita o limite)
- [x] Índice `cards.due` adicionado
- [x] README corrigido (Prisma → raw SQL)
- [x] `AnalyticsPage.tsx` removida/roteada

### Sessão atual

- [x] Schema Zod para auth (`registerSchema` + `loginSchema`) aplicado via `validate()` nas rotas
- [x] `authMiddleware` retorna `{ success: false, error, requestId }` (consistente com API contract)
- [x] `.env.example` criado para backend e frontend
- [x] `axios` removido do frontend (não utilizado, só `fetch`)
- [x] Rate limiting granular: POST /decks (20/15min), POST /decks/:id/cards (100/15min), POST /import (5/15min)
- [x] `importController` padronizado com wrapper `{ success, data }`
- [x] `getSharedDeckPreview` corrigido: `Request` em vez de `AuthRequest` (rota pública)
- [x] Auth middleware padronizado com `next(err)` em vez de resposta inline
- [x] Sistema de tags em cards: coluna `tags TEXT[]` + índice GIN, backend (create/update/batch), frontend (input + badges + filtro)

### Sessão atual (tags + achievements)

- [x] Migration `011_add_card_tags.sql`: coluna `tags TEXT[]` + índice GIN
- [x] `cardRepository.ts`, `cardSchema.ts`, `cardService.ts`: suporte a tags em create/update/batch
- [x] Frontend: `CardForm.tsx` (input tags por vírgula), `CardListItem.tsx` (badges), `DeckPage.tsx` (filtro por tags)
- [x] Migration `012_add_achievements.sql`: tabela `achievements` (user_id, key, unlocked_at)
- [x] `achievementService.ts`: 7 conquistas, `checkAndUnlock` após revisão/criação de cards
- [x] Frontend: seção de conquistas em `StatsGlobalPage.tsx`, toast de novas conquistas na `ReviewPage`

### Sessão de testes e normalização

- [x] Testes de controller (7 arquivos: auth, deck, card, review, reviewLogs, analytics, health)
- [x] Testes de repositório (5 arquivos: user, deck, card, reviewLog, analytics)
- [x] Testes de segurança do FSRS e review service
- [x] Cobertura do priority queue service
- [x] Normalização da arquitetura: cardController, reviewLogsController, priorityQueueService → padrão service/repository
- [x] Remoção de código morto (useButton hook) + registro da extensão Underline no editor
- [x] Refatoração do importController (SQL extraído para importService)

### Testes

- [x] Testes de services (auth, deck, review, fsrs, analytics, priorityQueue)
- [x] Testes de repositories (user, deck, card, reviewLog, analytics)
- [x] Testes de controllers (auth, deck, card, review, reviewLogs, analytics, health)
- [x] Testes de middlewares (auth, errorHandler)
- [x] Testes de frontend (20+ arquivos, 60+ testes: Button, Tooltip, SkeletonCard, CardContent, AuthContext, ThemeContext, ToastContext, ConfirmModal, ErrorBoundary, Layout, ActivityHeatmap, DailyQueue, EmptyState, ImportModal, ShareModal, RichTextEditor, AddDeckModal, EditDeckModal, PasswordStrengthIndicator, ProgressBar, RatingButtons, ReviewCard, CreateDeckForm, DeckCard, useFocusTrap, DashboardPage, ReviewPage, StatsGlobalPage)
- [x] Testes de integração (controller → service → repo real — auth, decks, review)
- [x] Testes de serviços restantes (cardService, reviewLogsService, importService, deckImportService)
- [x] Testes de middlewares restantes (rateLimiter, requestId, validate)
- [x] Teste do importController

### Sessão de UI/UX

- [x] Toast notifications (`ToastContext.tsx`) com feedback visual de operações
- [x] Global focus system (outline visível em elementos focados)
- [x] Empty states (`EmptyState.tsx`) para listas vazias
- [x] Loading feedback em Dashboard, Deck, Review e StatsGlobal
- [x] Design tokens iniciais (CSS custom properties para `border-radius`)
- [x] Normalização de `border-radius` em formulários de login/register
- [x] Melhorias nos botões de rating da revisão (feedback visual)
- [x] Remoção de `heatmap.css` legado (não utilizado)
- [x] Password strength indicator no registro
- [x] Progress bar na sessão de revisão
- [x] Página de seção com título e ações (`PageSection.tsx`)
- [x] Badge de estado do card (`Badge.tsx`)
- [x] Componente `Card` reutilizável com variantes
- [x] `FormField` com label e mensagem de erro
- [x] Componentes de dashboard extraídos: `CreateDeckForm`, `DeckCard`, `DeckList`, `StreakCards`, `WorkloadChart`
- [x] Componentes de review extraídos: `RatingButtons`, `ReviewCard`, `ReviewHeader`, `ReviewSessionProgress`, `ReviewSessionSummary`

### Sessão de E2E e automação (Fase 08)

- [x] Infraestrutura E2E: `global-setup.ts` com Docker lifecycle, `authTest` fixture, `.env.e2e`, `e2e/tsconfig.json`
- [x] Testes de autenticação: 16 testes (registro, login, logout, rotas protegidas)
- [x] Testes de baralhos CRUD: 7 testes
- [x] Testes de cards CRUD: 6 testes
- [x] Testes de revisão FSRS
- [x] Testes de importação .apkg
- [x] Testes de analytics
- [x] Testes de compartilhamento de deck
- [x] Subagent `@doc` para revisão de documentação
- [x] Rate limiting desabilitado em modo de teste (NODE_ENV=test)
- [x] Fixture .apkg gerado programaticamente via `better-sqlite3`

### Sessão de Features Futuras (Fase 06)

- [x] Sistema de tags (migration, backend CRUD, frontend com badges e filtro)
- [x] Sistema de achievements (7 conquistas, hook após revisão/criação, toast)
- [x] Exportar baralho para .apkg (exportService com archiver + better-sqlite3)
- [x] Modo de revisão expressa (preview de 4 ratings sem persistir)
- [x] Importação TXT/CSV (drag-and-drop, parser, frontend CsvImportModal)
- [x] Cache-control headers + PWA auth fix + prompt de atualização de conteúdo

---

### Fase 01 — Observability & Monitoring

- [x] Metrics middleware (`metrics.ts`) com contadores por rota, histograma de duração (50ms–5s), tracking de erros
- [x] `GET /metrics` expondo: uptime, totalRequests, errorRate, requestsByRoute (avgDuration + histogram), business metrics
- [x] `GET /health` enriquecido: db status (`ping()`), versão do `ts-fsrs`, uptime, memoryUsage (rss, heap)
- [x] Logs enriquecidos via `pino-http`: customLogLevel (info/warn/error), customProps com `userId`, responseTime
- [x] Business metrics: `decksCreated`, `cardsCreated`, `reviewsSubmitted`, `importsCompleted` (incrementados nos services)
- [x] `ping()` function em `db.ts` para health check do banco

---

### Fase 05 — Production Readiness

- [x] CSP Enforcement (helmet, report-uri, cobre KaTeX/Tiptap)
- [x] PWA: Manifest & Icons, Service Worker, Offline Page
- [x] Hardening: Global Rate Limit, Brute Force Login, Security Headers
- [x] Build Pipeline (tsc + vite build, chunk splitting, PWA SW)
- [x] Production Runtime (logger JSON, VITE_API_URL configurável)
- [x] Docker multi-stage (backend node:20-alpine + tini, frontend nginx:alpine)
- [x] docker-compose.prod.yml (db → backend → frontend, volumes, healthchecks)
- [x] Deploy docs (README + .env.prod.example)

---

- [x] Índices compostos: `idx_cards_deck_state_due`, `idx_review_logs_user_id_review`, `idx_review_logs_card_id_review`, `idx_decks_user_id_created_at`
- [x] Batch create: `POST /decks/:id/cards/batch` (até 50 cards, schema Zod)
- [x] Paginação server-side em `GET /decks/:id/cards` com `page`/`limit` e metadados
- [x] "Carregar mais" no frontend (DeckPage com paginação incremental)
- [x] `findDueByDeck` com `LIMIT 200` e `CASE` ordering refinado
- [x] Analytics queries filtradas por `months` (default 12, max 120)

---

## Melhorias Futuras

Itens não cobertos pelas fases planejadas:

- Sincronização em tempo real

---

## Idéias Relacionadas ao TCC/FSRS (para a monografia)

- Comparar retenção FSRS vs SM-2 com dados simulados
- Analisar correlação entre `stability` e acertos reais
- Medir impacto do `new_cards_per_day` na taxa de retenção
- Visualizar curva de esquecimento real vs predita pelo FSRS
- Estudar distribuição de ratings por estado do card (New/Learning/Review)
- Analisar a evolução da `difficulty` ao longo das revisões
