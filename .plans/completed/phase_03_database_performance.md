# Phase 03 — Database Performance & Batch Operations

## Objetivo

Otimizar consultas ao banco de dados, adicionar índices faltantes, implementar operações em lote para criação de múltiplos cards, e reduzir latência em queries críticas (review queue, analytics, deck stats).

## Escopo

- Análise de queries lentas (EXPLAIN ANALYZE)
- Índices compostos adicionais
- Batch create de cards (múltiplos cards em uma requisição)
- Otimização da query de due cards (FSRS ordering)
- Paginação em listas (cards no deck)
- Consultas de analytics otimizadas

## Fora de Escopo

- Cache layer (Redis)
- Migração de banco
- Sharding ou replicação
- Materialized views
- Query builder ou ORM migration
- Conexão pool tuning fino

## Pré-requisitos

- Fase 01 concluída (para medir baseline de performance)
- Banco de dados rodando (Docker Compose)
- Dados de teste populados (pelo menos 1000 cards em 5 decks)
- Testes de integração existentes verdes

## Tarefas

### Task 3.1 — Índices compostos adicionais

Analisar EXPLAIN ANALYZE das queries mais frequentes e adicionar índices onde faltam.

#### Subtarefas

- [x] Rodar EXPLAIN ANALYZE nas queries: `findDueByDeck`, `findDailyQueue`, `getReviewHeatmap`, `getRetentionRate`, `getWorkloadForecast`, `getDeckStats`
- [x] Identificar scans sequenciais em tabelas grandes (cards, review_logs)
- [x] Adicionar índices em `migrations.sql`:
  - `(deck_id, state, due)` para due cards
  - `(user_id, review)` para review_logs (heatmap)
  - `(card_id, review)` para review_logs (histórico por card)
  - `(user_id, created_at)` para decks
- [x] Implementar migration incremental (ALTER TABLE ADD INDEX IF NOT EXISTS)
- [x] Testar via integração que queries usam os índices

#### Critérios de Aceitação

- `findDueByDeck` faz Index Scan (não Sequential Scan) com 1000+ cards
- `getReviewHeatmap` usa índice composto em `review_logs(user_id, review)`
- Migration é idempotente (pode rodar múltiplas vezes)
- Nenhuma query de listagem faz seq scan em tabela com > 100 registros

#### Arquivos Impactados

- `backend/src/database/migrations.sql`
- `backend/src/database/db.ts` (runMigrations)
- `backend/src/repositories/cardRepository.ts`
- `backend/src/repositories/reviewLogRepository.ts`
- `backend/src/repositories/analyticsRepository.ts`

---

### Task 3.2 — Batch create de cards

Endpoint para criar múltiplos cards em uma única requisição.

#### Subtarefas

- [x] Criar schema `createCardsBatchSchema` que aceita array de cards
- [x] Limitar batch a 50 cards por requisição (validar no schema)
- [x] Criar `cardRepository.createBatch(deckId, cards[], client?)` com INSERT múltiplo (`INSERT INTO cards (...) VALUES (...), (...), (...)` com `RETURNING *`)
- [x] Criar `cardService.createBatch` que chama repositório
- [x] Adicionar rota `POST /decks/:id/cards/batch`
- [x] Atualizar frontend (DeckPage) com botão "Adicionar múltiplos" que abre formulário simples (front/back repetido) ou área de texto para colar pares
- [x] Validar via schema que cada card tem front/back dentro do limite de caracteres
- [x] Testar via supertest + integration + testing-library

#### Critérios de Aceitação

- `POST /decks/:id/cards/batch` com 3 cards válidos retorna 201 com array
- `POST /decks/:id/cards/batch` com 51 cards retorna 400
- `POST /decks/:id/cards/batch` com card inválido retorna 400 sem criar nenhum card
- Frontend tem interface para criar múltiplos cards de uma vez
- Batch INSERT é 5x mais rápido que criar individualmente (com 50 cards)

#### Arquivos Impactados

- `backend/src/schemas/cardSchema.ts`
- `backend/src/repositories/cardRepository.ts`
- `backend/src/services/cardService.ts`
- `backend/src/controllers/cardController.ts`
- `backend/src/routes/cardRoutes.ts`
- `frontend/src/pages/decks/DeckPage.tsx`
- `frontend/src/api/cards.ts`

---

### Task 3.3 — Paginação na lista de cards do baralho

Adicionar paginação server-side na listagem de cards de um baralho.

#### Subtarefas

- [x] Adicionar parâmetros `page` e `limit` (default 20, max 100) em `GET /decks/:id/cards`
- [x] Adicionar `OFFSET` + `LIMIT` no `cardRepository.findByDeck`
- [x] Retornar metadados de paginação: `{ total, page, limit, totalPages }`
- [x] Atualizar frontend para carregar cards paginados (scroll infinito ou "Carregar mais")
- [x] Atualizar client.ts com parâmetros de paginação
- [x] Testar via supertest + integration

#### Critérios de Aceitação

- `GET /decks/:id/cards?page=2&limit=10` retorna página 2
- Response inclui `pagination: { total, page, limit, totalPages }`
- Baralho com 100 cards carrega página inicial em < 200ms
- Frontend exibe "Carregar mais" ao final da lista

#### Arquivos Impactados

- `backend/src/repositories/cardRepository.ts`
- `backend/src/controllers/cardController.ts`
- `backend/src/services/cardService.ts`
- `frontend/src/pages/decks/DeckPage.tsx`
- `frontend/src/api/cards.ts`

---

### Task 3.4 — Otimização da query de due cards

Revisar a query `findDueByDeck` para garantir que usa índices corretamente e retorna ordenação eficiente.

#### Subtarefas

- [x] Rodar EXPLAIN ANALYZE da query atual com 5000+ cards
- [x] Verificar se o `ORDER BY` está usando índice
- [x] Reescrever a query para usar o índice `(deck_id, state, due)`
- [x] Limitar resultado a um número máximo (ex: 200 cards por vez)
- [x] Adicionar teste de integração que verifica performance com carga
- [x] Verificar que `PriorityQueueService` continua funcionando com a query otimizada

#### Critérios de Aceitação

- Query `findDueByDeck` completa em < 50ms com 5000 cards
- Ordenação por `due` ASC permanece correta
- Limite de 200 cards evita timeouts
- Query usa Index Scan (não Sequential Scan)

#### Arquivos Impactados

- `backend/src/repositories/cardRepository.ts`
- `backend/src/services/priorityQueueService.ts`

---

### Task 3.5 — Otimização de analytics queries

Revisar queries analíticas que agregam dados históricos.

#### Subtarefas

- [x] Rodar EXPLAIN ANALYZE em: `getRetentionRate`, `getReviewHeatmap`, `getForgettingCurve`, `getWorkloadForecast`, `getGlobalStats`
- [x] Adicionar índices onde necessário (ver Task 3.1)
- [x] Limitar escopo temporal das queries (ex: últimos 12 meses por padrão)
- [x] Adicionar parâmetro `months` nos endpoints de analytics com default 12
- [x] Verificar se `getWorkloadForecast` pode ser simplificada
- [x] Testar via integração com dados históricos simulados

#### Critérios de Aceitação

- Analytics queries com 12 meses de dados completam em < 200ms
- Heatmap com 365 dias de dados retorna em < 100ms
- Queries usam índices (Index Scan)
- Parâmetro `months` é respeitado e limita escopo

#### Arquivos Impactados

- `backend/src/repositories/analyticsRepository.ts`
- `backend/src/services/analyticsService.ts`
- `backend/src/controllers/analyticsController.ts`
- `frontend/src/services/analyticsApi.ts`

---

## Riscos e Pontos de Atenção

- Batch INSERT com `RETURNING *` pode retornar muitos dados — limitar a 50
- Paginação com OFFSET fica lenta em páginas muito avançadas (milhares) — aceitável para MVP
- Migração de índices precisa ser idempotente (verificar se índice já existe)
- Limitar analytics a 12 meses pode quebrar se usuário tem mais dados — adicionar aviso no frontend
- Testes de performance exigem dados artificiais — criar seed script

## Checklist da Fase

- [x] Todas as tarefas concluídas
- [x] Testes implementados
- [x] Documentação atualizada
- [x] Revisão de código realizada
- [x] Critérios de aceitação validados

## Instruções para o Agente Construtor

1. Execute as tarefas na ordem definida (3.1 → 3.2 → 3.3 → 3.4 → 3.5).
2. Não avance para a próxima fase sem concluir os critérios de aceitação.
3. Atualize este documento conforme o progresso.
4. Registre desvios ou decisões arquiteturais relevantes.
5. Gere commits pequenos e focados por tarefa.
6. Após cada task, rode `tsc --noEmit` no backend e invoque `@reviewer` antes de commitar.
7. Rode manualmente EXPLAIN ANALYZE para confirmar melhoria antes de declarar task concluída.
