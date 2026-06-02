# ROADMAP — FlashFSRS

> Projeto solo · TCC · FSRS · Prazo acadêmico limitado

---

## Status Atual

MVP funcional com as features principais entregues. O que falta é
**consistência e acabamento**, não funcionalidade nova.

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
- [x] Testes de frontend (8 arquivos, 45 testes: Button, Tooltip, SkeletonCard, CardContent, AuthContext, ThemeContext, ConfirmModal, ErrorBoundary)
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

---

## Melhorias Futuras (pós-TCC, se quiser)

- Testes E2E (Puppeteer/Playwright)
- Deploy real (VPS ou Railway)
- PWA completo (já tem config base)
- Modo offline
- Sistema de tags
- Gamificação
- Sincronização em tempo real

---

## Idéias Relacionadas ao TCC/FSRS (para a monografia)

- Comparar retenção FSRS vs SM-2 com dados simulados
- Analisar correlação entre `stability` e acertos reais
- Medir impacto do `new_cards_per_day` na taxa de retenção
- Visualizar curva de esquecimento real vs predita pelo FSRS
- Estudar distribuição de ratings por estado do card (New/Learning/Review)
- Analisar a evolução da `difficulty` ao longo das revisões
