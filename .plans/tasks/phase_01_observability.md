# Phase 01 — Observability & Monitoring

## Objetivo

Implementar observabilidade estruturada no backend: métricas de requisição, health check detalhado, logs enriquecidos com telemetria, e ponto de partida para monitoramento de performance. Hoje o projeto já usa Pino com `requestId`, mas falta visibilidade sobre latência, taxas de erro por rota, e estado do banco.

## Escopo

- Métricas de requisição (contadores, duration histogram)
- health check detalhado (banco, fsrs, uptime)
- Logs enriquecidos (response time, status, rota)
- Endpoint `/metrics` (formato Prometheus ou JSON simples)
- Ponto de extensão para métricas de negócio (cards created, reviews submitted)
- Observability middleware

## Fora de Escopo

- Dashboards ou integração com SaaS (Datadog, Grafana Cloud)
- Tracing distribuído (OpenTelemetry)
- Métricas no frontend
- Alertas automáticos
- Coleta de métricas históricas (banco de série temporal)

## Pré-requisitos

- Backend rodando com Docker Compose
- `tsc --noEmit` passando sem erros
- Testes unitários do auth, deck, review services verdes

## Tarefas

### Task 1.1 — Criar middleware de métricas

Middleware que coleta:
- contador de requisições por método + rota + status
- histograma de duração (buckets: 50ms, 100ms, 200ms, 500ms, 1s, 2s, 5s)
- contador de erros (status >= 400) por rota

Armazenar em memória (Map<string, { count, errors, totalDuration }>).

#### Subtarefas

- [x] Criar `backend/src/middlewares/metrics.ts` com coleta de métricas por rota
- [x] Registrar antes de todas as rotas no `app.ts` (antes do router)
- [x] Testar unitariamente: verificar que contadores incrementam corretamente
- [x] Verificar que não afeta performance mensurável em cenário normal

#### Critérios de Aceitação

- Middleware registrado no topo da stack do Express
- Contador de requisições distingue método + rota + status code
- Histograma de duração registra ao final de cada request
- Middleware não quebra fluxo de erro (chama `next()`)

#### Arquivos Impactados

- `backend/src/middlewares/metrics.ts` (novo)
- `backend/src/app.ts` (registrar middleware)
- `backend/src/middlewares/__tests__/metrics.test.ts` (novo)

---

### Task 1.2 — Endpoint `/metrics`

Endpoint que expõe as métricas coletadas em formato JSON simples e/ou Prometheus.

#### Subtarefas

- [x] Criar rota `GET /metrics` em `metricsRoutes.ts` (ou adicionar em `healthController`)
- [x] Retornar JSON com: `uptime`, `totalRequests`, `requestsByRoute`, `errorRate`
- [ ] Incluir métricas do Event Loop Lag (opcional via `process.hrtime`) — *não implementado, aceitável para MVP*
- [x] Atualizar `routes/index.ts` para incluir nova rota
- [x] Testar via supertest: verificar shape da resposta

#### Critérios de Aceitação

- `GET /metrics` retorna 200 com JSON no formato `{ success: true, data: { ... } }`
- Resposta inclui `uptime`, `totalRequests`, `requestsByRoute`, `errorRate`
- Rota não exige autenticação (mas pode ser restrita por IP em produção)

#### Arquivos Impactados

- `backend/src/controllers/healthController.ts` (estender)
- `backend/src/routes/index.ts`
- `backend/src/__tests__/integration/health.integration.test.ts` (estender)

---

### Task 1.3 — Health check detalhado

Melhorar `GET /health` para incluir status do banco de dados e versão do FSRS.

#### Subtarefas

- [x] Adicionar no health check: `SELECT 1` no PostgreSQL
- [x] Incluir versão do `ts-fsrs` (ler de `package.json`)
- [x] Incluir `uptime`, `memoryUsage`, `dbConnected`
- [x] Estruturar resposta como `{ success: true, data: { status, db, fsrs, uptime, memory } }`
- [x] Testar via supertest

#### Critérios de Aceitação

- `GET /health` retorna status do banco (`connected` / `disconnected`)
- Inclui versão do `ts-fsrs`
- Inclui `uptime` em segundos e `memoryUsage` (rss, heap)

#### Arquivos Impactados

- `backend/src/controllers/healthController.ts`
- `backend/src/database/db.ts` (expor função `ping()`)
- `backend/src/config/env.ts` (se precisar expor versão)

---

### Task 1.4 — Logs enriquecidos com métricas

Atualizar o logger Pino para incluir `responseTime`, `route`, e `status` em cada log de request.

#### Subtarefas

- [x] Configurar `pino-http` (já instalado) com custom serializers para incluir `responseTime`, `route`, `userId`
- [x] Garantir que `userId` é logado quando disponível (após auth middleware)
- [x] Não logar body de requisições POST (evitar dados sensíveis)
- [x] Não logar tokens JWT
- [x] Testar via supertest que logs contêm os campos esperados

#### Critérios de Aceitação

- Cada request logado contém: `method`, `url`, `statusCode`, `responseTime`, `requestId`
- `userId` aparece apenas em rotas autenticadas
- Body de requisições POST não aparece no log
- Nível de log é `info` para 2xx/3xx, `warn` para 4xx, `error` para 5xx

#### Arquivos Impactados

- `backend/src/app.ts` (configuração do pino-http)
- `backend/src/config/logger.ts`

---

### Task 1.5 — Métricas de negócio (cardinal count)

Adicionar contadores de métricas de negócio: decks criados, cards criados, revisões submetidas, imports realizados.

#### Subtarefas

- [x] Exportar uma interface `BusinessMetrics` em `metrics.ts`
- [x] Incrementar contadores nos services correspondentes (deckService, cardService, reviewService, importService)
- [x] Expor no endpoint `/metrics` sob a chave `business`
- [x] Testar via supertest que contadores aparecem após ações

#### Critérios de Aceitação

- `POST /decks` incrementa `decksCreated`
- `POST /decks/:id/cards` incrementa `cardsCreated`
- `POST /decks/:id/review/:cardId` incrementa `reviewsSubmitted`
- `POST /import` incrementa `importsCompleted`
- Valores resetam ao reiniciar o servidor (in-memory)

#### Arquivos Impactados

- `backend/src/middlewares/metrics.ts` (estender)
- `backend/src/services/deckService.ts`
- `backend/src/services/cardService.ts`
- `backend/src/services/reviewService.ts`
- `backend/src/services/importService.ts`

---

## Riscos e Pontos de Atenção

- Métricas em memória são perdidas ao reiniciar (aceitável para MVP)
- `pino-http` custom serializer não deve quebrar por campo faltante
- Histograma em memória pode crescer se muitas rotas dinâmicas (ex: `/decks/:id/review/:cardId`) — usar `req.route.path` em vez de `req.path`

## Checklist da Fase

- [x] Todas as tarefas concluídas
- [x] Testes implementados
- [ ] Documentação atualizada
- [ ] Revisão de código realizada
- [x] Critérios de aceitação validados

## Instruções para o Agente Construtor

1. Execute as tarefas na ordem definida (1.1 → 1.2 → 1.3 → 1.4 → 1.5).
2. Não avance para a próxima fase sem concluir os critérios de aceitação.
3. Atualize este documento conforme o progresso.
4. Registre desvios ou decisões arquiteturais relevantes.
5. Gere commits pequenos e focados por tarefa.
6. Após cada task, rode `tsc --noEmit` no backend e invoque `@reviewer` antes de commitar.
