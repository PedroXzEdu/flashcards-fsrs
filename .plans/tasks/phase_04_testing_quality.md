# Phase 04 — Testing & Quality Assurance

## Objetivo

Expandir a cobertura de testes para áreas críticas atualmente não testadas, adicionar testes de regressão para fluxos de borda do FSRS, melhorar a qualidade geral do código com regras de lint adicionais, e fortalecer os testes E2E.

## Escopo

- Testes de frontend para páginas (Dashboard, Review, Stats)
- Testes de integração para import e analytics
- Testes de regressão FSRS (estados New, Learning, Review, Relearning)
- Testes E2E para share/unshare e analytics
- ESLint config aprimorada
- Remoção de código morto detectado
- Testes de segurança (SQL injection, XSS via API)

## Fora de Escopo

- Testes de carga/performance
- Testes de snapshot
- Testes visuais (regression visual)
- Coverage mínimo obrigatório (não estabelecer meta numérica agora)
- Mutação de testes

## Pré-requisitos

- Fase 02 concluída (UX estável para testar)
- Todos os testes existentes verdes
- Docker Compose rodando (frontend + backend + db + db-test)
- Playwright instalado (já disponível em `e2e/`)

## Tarefas

### Task 4.1 ✅ — Testes de páginas do frontend

Adicionar testes para as páginas principais: Dashboard, Review, StatsGlobal, SharedDeck. (Concluída)

#### Subtarefas

- [x] Criar `frontend/src/pages/__tests__/DashboardPage.test.tsx` — testar renderização com dados mockados, empty state, erro ao carregar
- [x] Criar `frontend/src/pages/__tests__/ReviewPage.test.tsx` — testar fluxo de preview, mostrar resposta, rating, conclusão
- [x] Criar `frontend/src/pages/__tests__/StatsGlobalPage.test.tsx` — testar renderização de métricas
- [x] Adicionar mocks para `api/client.ts` nos testes
- [x] Verificar que loading skeletons aparecem durante carregamento
- [x] Verificar que empty states aparecem quando não há dados

#### Critérios de Aceitação

- Dashboard renderiza lista de baralhos mockados
- Dashboard mostra EmptyState quando não há baralhos
- Dashboard mostra erro com retry quando API falha
- ReviewPage simula preview → mostrar resposta → rating
- StatsGlobal renderiza gráficos com dados mockados

#### Arquivos Impactados

- `frontend/src/pages/__tests__/DashboardPage.test.tsx` (novo)
- `frontend/src/pages/__tests__/ReviewPage.test.tsx` (novo)
- `frontend/src/pages/__tests__/StatsGlobalPage.test.tsx` (novo)

---

### Task 4.2 ✅ — Testes de regressão FSRS (Concluída)

Cobrir os 4 estados de card (New, Learning, Review, Relearning) com testes que verificam comportamento correto do preview, submit, e agendamento.

#### Subtarefas

- [x] Criar `backend/src/services/__tests__/reviewService.fsrs.test.ts`
- [x] Testar: New → Again (vai para Learning), New → Good (vai para Review via learning steps)
- [x] Testar: Review → Again (vai para Relearning), Review → Good (permanece Review)
- [x] Testar: Relearning → Again (permanece Relearning), Relearning → Good → Review
- [x] Testar: Learning → Easy (vai para Review)
- [x] Verificar que `stability`, `difficulty`, `scheduled_days` são atualizados corretamente
- [x] Testar transação: se `create` review_log falhar, card NÃO é atualizado (já coberto em reviewService.test.ts)
- [x] Testar preview (GET /review) retorna cards na ordem correta (já coberto em reviewService.test.ts)
- [x] Testar limite de `new_cards_per_day` é respeitado (já coberto em reviewService.test.ts)

#### Critérios de Aceitação

- Todos os 6 cenários de transição de estado cobrem os 4 ratings
- Transação é atômica: falha em review_log não modifica card
- Preview retorna due cards ordenados por `due` ASC
- `new_cards_per_day` limita novos cards na fila de revisão
- Testes rodam via `vitest --project unit`

#### Arquivos Impactados

- `backend/src/services/__tests__/reviewService.fsrs.test.ts` (novo)
- `backend/src/services/__tests__/fsrsService.test.ts` (estender)

---

### Task 4.3 — Testes de integração para import e analytics

Adicionar testes de integração para o fluxo de import .apkg e analytics.

#### Subtarefas

- [ ] Criar fixture .apkg programaticamente (usar `e2e/helpers/generate-apkg.mjs` como referência)
- [ ] Testar `POST /import` com .apkg válido → deck + cards criados
- [ ] Testar `POST /import` com arquivo inválido → 400
- [ ] Testar `POST /import` sem arquivo → 400
- [ ] Testar `GET /analytics/retention` com dados simulados
- [ ] Testar `GET /analytics/heatmap` com dados simulados
- [ ] Testar `GET /analytics/forgetting-curve` com dados simulados
- [ ] Testar `GET /analytics/workload-forecast` com dados simulados

#### Critérios de Aceitação

- Import de .apkg válido cria deck e cards no banco
- Import de .apkg corrompido retorna 400
- Analytics endpoints retornam dados no formato esperado
- Testes rodam via `vitest --project integration`

#### Arquivos Impactados

- `backend/src/tests/integration/import.integration.test.ts` (novo)
- `backend/src/tests/integration/analytics.integration.test.ts` (novo)
- `backend/src/tests/integration/helpers/factories.ts` (estender)

---

### Task 4.4 — Testes E2E expandidos

Adicionar testes E2E para share/unshare e analytics.

#### Subtarefas

- [ ] Criar `e2e/share.spec.ts`: criar deck → share → copiar token → preview público → import por outro usuário
- [ ] Criar `e2e/analytics.spec.ts`: criar deck + cards → revisar alguns → verificar stats carregam
- [ ] Adicionar helper para criar segundo usuário nos testes
- [ ] Atualizar `playwright.config.ts` se necessário (timeout para analytics)
- [ ] Testar fluxo de unshare (remover token, verificar que link não funciona mais)

#### Critérios de Aceitação

- Share/unshare funciona via interface (navega até o modal, copia, descompartilha)
- Preview público de deck é acessível sem login
- Import de deck compartilhado cria cópia para novo usuário
- Analytics page carrega e exibe heatmap/gráficos
- Testes rodam com `npm run test:e2e`

#### Arquivos Impactados

- `e2e/share.spec.ts` (novo)
- `e2e/analytics.spec.ts` (novo)
- `e2e/helpers.ts` (estender)
- `e2e/playwright.config.ts`

---

### Task 4.5 — ESLint + qualidade de código

Aprimorar configuração ESLint e limpar código morto.

#### Subtarefas

- [ ] Revisar configs ESLint existentes (backend e frontend)
- [ ] Adicionar regras: `@typescript-eslint/no-unused-vars` com erro, `no-console` com warn (exceção para logger), `prefer-const`, `no-var`
- [ ] Rodar ESLint em toda a base e corrigir findings
- [ ] Verificar `any` types no backend — documentar ou tipar corretamente
- [ ] Remover arquivos não utilizados ou importações mortas
- [ ] Adicionar script `lint` nos `package.json` do backend e frontend
- [ ] Garantir que `husky` executa lint antes do commit

#### Critérios de Aceitação

- `npm run lint` no backend retorna 0 (sem erros, warnings aceitáveis)
- `npm run lint` no frontend retorna 0
- Zero `any` types não justificados no backend
- Zero imports não utilizados
- Código removido não quebra nenhum teste

#### Arquivos Impactados

- `backend/.eslintrc` (ou `eslint.config.*`)
- `frontend/.eslintrc` (ou `eslint.config.*`)
- `backend/package.json`
- `frontend/package.json`
- `.husky/pre-commit`
- Múltiplos arquivos conforme findings

---

### Task 4.6 — Testes de segurança

Adicionar testes que verificam proteção contra SQL injection e XSS via API.

#### Subtarefas

- [ ] Testar tentativa de SQL injection no título do deck, front/back do card
- [ ] Testar XSS via card content: `<script>alert('xss')</script>` no front/back
- [ ] Verificar que JWT inválido retorna 401
- [ ] Verificar que rate limit retorna 429 após exceder
- [ ] Verificar que CORS bloqueia origens não autorizadas
- [ ] Testar upload de arquivo não-.apkg (ex: `.exe`) retorna 400

#### Critérios de Aceitação

- SQL injection no título do deck não executa (dado é inserido literalmente)
- XSS no card front é sanitizado na renderização (CardContent)
- JWT malformado retorna 401 com `{ success: false, error }`
- Rate limit retorna 429
- Upload de .exe retorna 400 MulterError

#### Arquivos Impactados

- `backend/src/tests/integration/security.integration.test.ts` (novo)
- `backend/src/middlewares/__tests__/auth.test.ts` (estender)
- `backend/src/middlewares/__tests__/rateLimiter.test.ts` (estender)
- `frontend/src/components/__tests__/CardContent.test.tsx` (estender)

---

## Riscos e Pontos de Atenção

- Testes de integração exigem banco de teste rodando (`db-test`)
- Testes de rate limit precisam de NODE_ENV=test (já configurado para desabilitar rate limit)
- Testes E2E de analytics precisam de dados pré-existentes — usar seed via API
- Testes de SQL injection devem confirmar que o dado foi inserido literalmente (escapado)
- ESLint com `no-unused-vars` pode quebrar build se houver muitos — iterar gradualmente

## Checklist da Fase

- [ ] Todas as tarefas concluídas
- [ ] Testes implementados
- [ ] Documentação atualizada
- [ ] Revisão de código realizada
- [ ] Critérios de aceitação validados

## Instruções para o Agente Construtor

1. Execute as tarefas na ordem definida (4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6).
2. Não avance para a próxima fase sem concluir os critérios de aceitação.
3. Atualize este documento conforme o progresso.
4. Registre desvios ou decisões arquiteturais relevantes.
5. Gere commits pequenos e focados por tarefa.
6. Após cada task, rode `tsc --noEmit` (backend) ou `tsc -b --noEmit` (frontend) conforme aplicável, e invoque `@reviewer` antes de commitar.
