---
id: "P04"
title: "Performance e Banco de Dados"
status: "pending"
priority: "medium"
estimate: "1-2 weeks"
depends_on: []
---

# Fase 04 — Performance e Banco de Dados

## Objetivo
Otimizar consultas problemáticas, adicionar índices faltantes e melhorar a estrutura de migrações. Resolver gargalos identificados na análise.

## Justificativa
O sistema funciona, mas tem pontos de ineficiência: N chamadas ao backend para contar revisões, migrations sem versionamento, índices faltantes. Corrigir agora evita que se tornem problemas reais com o crescimento dos dados.

## Valor Técnico
Médio — melhorias incrementais que previnem problemas futuros.

## Esforço Estimado
Médio (1-2 semanas)

## Dependências
Nenhuma

## Success Metrics

- Endpoint `GET /review/due-counts` criado e funcional
- Migrations versionadas (substituindo `migrations.sql` único)
- Índices faltantes adicionados
- Queries `analyticsRepository` consolidadas
- `findDailyQueue` otimizada com cálculo de `predicted_recall` no SQL
- Tempo de resposta do dashboard reduzido


---

## Tarefas

### [x] [T04.01 — Criar endpoint agregado `GET /review/due-counts`](./task_04_01_endpoint_due_counts.md)

**Descrição:** Criar endpoint que retorna contagem de cards para revisão por baralho em UMA query SQL, substituindo as N chamadas paralelas no frontend.

**Motivação:** `DashboardPage.tsx:203-213` faz `cardsApi.forReview(deck.id)` para CADA baralho. Se o usuário tem 20 baralhos, são 20 queries SQL. Um endpoint agregado resolve em 1 query.

**Impacto:** Alto

**Estimativa:** 4-6 horas

**Subtarefas:**
- [ ] Criar método `reviewRepository.getDueCounts(userId)` com query:
  ```sql
  SELECT c.deck_id, COUNT(*) AS due_count
  FROM cards c
  JOIN decks d ON d.id = c.deck_id
  WHERE d.user_id = $1 AND c.due <= NOW()
  GROUP BY c.deck_id
  ```
- [ ] Criar rota `GET /review/due-counts`
- [ ] Atualizar `cards.ts` (frontend api) para usar o novo endpoint
- [ ] Atualizar `DashboardPage` para carregar em uma chamada
- [ ] Remover chamada individual `cardsApi.forReview` do dashboard

---

### [x] [T04.02 — Versionar migrations](./task_04_02_versionar_migrations.md)

**Descrição:** Substituir `migrations.sql` único (executado toda vez que o servidor sobe) por arquivos numerados em ordem.

**Motivação:** A abordagem atual (`CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ADD COLUMN IF NOT EXISTS`) não permite rollback, não versiona e executa comandos desnecessários a cada startup. Para produção real, é frágil. Para TCC, mostra maturidade.

**Impacto:** Alto

**Estimativa:** 4-6 horas

**Subtarefas:**
- [ ] Criar `backend/src/database/migrations/` com arquivos numerados:
  - `001_create_users.sql`
  - `002_create_decks.sql`
  - `003_create_cards.sql`
  - `004_create_review_logs.sql`
  - `005_add_deck_indexes.sql`
- [ ] Criar `migrationRunner.ts` que lê arquivos, executa em ordem, e registra em tabela `_migrations`
- [ ] Substituir `runMigrations()` em `db.ts` pelo novo runner
- [ ] Garantir que `ALTER TABLE ADD COLUMN IF NOT EXISTS` para `share_token` e `new_cards_per_day` estejam em migrations próprias
- [ ] Criar rollback scripts (opcional mas recomendado)

---

### [x] [T04.03 — Adicionar índices faltantes](./task_04_03_adicionar_indices.md)

**Descrição:** Adicionar índices identificados na análise.

**Motivação:** `users.email` não tem índice. `review_logs (user_id, card_id, review)` pode ser útil para queries de última revisão.

**Impacto:** Médio

**Estimativa:** 1-2 horas

**Subtarefas:**
- [ ] Adicionar `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);`
- [ ] Adicionar `CREATE INDEX IF NOT EXISTS idx_review_logs_user_card ON review_logs (user_id, card_id);`
- [ ] Verificar plano de execução das queries principais com `EXPLAIN ANALYZE`
- [ ] Documentar índices em `ARCHITECTURE.md`

---

### [x] [T04.04 — Revisar e consolidar analyticsRepository queries](./task_04_04_consolidar_global_stats.md)

**Descrição:** Combinar as 4 queries separadas de `getGlobalStats` (cards, reviews, decks, daily) em uma única CTE ou reduzir para 2 queries.

**Motivação:** `reviewLogRepository.getGlobalStats` faz 4 queries independentes. Combinar em 1-2 reduz round-trips. Não é gargalo agora, mas é boa prática.

**Impacto:** Baixo

**Estimativa:** 2-3 horas

**Subtarefas:**
- [ ] Analisar se as queries podem ser combinadas com CTE
- [ ] Se viável, refatorar `getGlobalStats` para usar CTE
- [ ] Se não for viável ou ficar ilegível, manter como está e documentar

---

### [x] [T04.05 — Otimizar `findDailyQueue` com cálculo de predicted_recall no SQL](./task_04_05_otimizar_daily_queue.md)

**Descrição:** Calcular `predicted_recall` diretamente no SQL em vez de em memória no backend.

**Motivação:** `priorityQueueService.ts` calcula `Math.exp(-days/stability)` para cada card em memória. Para 50 cards, é irrelevante. Mas se o limite crescer, o cálculo em SQL é mais escalável. É uma melhoria preventiva.

**Impacto:** Baixo

**Estimativa:** 2-3 horas

**Subtarefas:**
- [ ] Substituir a query `findDailyQueue` para já retornar `predicted_recall` calculado:
  ```sql
  SELECT c.id, c.front, c.back, c.stability, c.due, c.state,
         ROUND(
           EXP(-GREATEST(EXTRACT(EPOCH FROM NOW() - c.due) / 86400, 0) / NULLIF(c.stability, 1))
           * 100, 2
         ) AS predicted_recall
  ...
  ```
- [ ] Remover cálculo em memória de `priorityQueueService.ts`
- [ ] Ordenar pelo `predicted_recall` no SQL

## Task Completion Policy

A task é considerada completa apenas quando TODAS as condições abaixo são verdadeiras:

1. Implementação finalizada
2. Validação concluída (`tsc --noEmit`, testes)
3. Revisão (`@reviewer`) executada
4. Achados da revisão corrigidos ou justificados
5. Arquivo da task atualizado (status, frontmatter)
6. Arquivo da fase atualizado (checklist)
7. Commit criado

Fluxo obrigatório:

```
Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task
```

A próxima task NÃO DEVE começar antes do commit da atual.


## Phase Completion Policy

Quando toda task da fase estiver completa:

1. Verificar que todas as tasks estão marcadas como concluídas
2. Verificar que os Success Metrics foram atingidos
3. Verificar que não há achados de revisão em aberto
4. Marcar a fase como `completed` no frontmatter
5. Mover o arquivo da fase para `.plans/completed/`
6. Mover todos os arquivos de task associados para `.plans/completed/`
7. Criar um commit de conclusão

Apenas após o arquivamento a próxima fase pode começar.


## Planning Source of Truth

Regras:

- `AGENTS.md` define a política de execução
- Arquivos de fase definem o progresso atual do roadmap
- Arquivos de task definem o escopo de implementação
- Fases concluídas são registros históricos em `.plans/completed/`
- Trabalho ativo sempre vem de `.plans/tasks/`
- Trabalho arquivado sempre vive em `.plans/completed/`


## Task Completion Policy

A task é considerada completa apenas quando TODAS as condições abaixo são verdadeiras:

1. Implementação finalizada
2. Validação concluída (`tsc --noEmit`, testes)
3. Revisão (`@reviewer`) executada
4. Achados da revisão corrigidos ou justificados
5. Arquivo da task atualizado (status, frontmatter)
6. Arquivo da fase atualizado (checklist)
7. Commit criado

Fluxo obrigatório:

```
Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task
```

A próxima task NÃO DEVE começar antes do commit da atual.


## Phase Completion Policy

Quando toda task da fase estiver completa:

1. Verificar que todas as tasks estão marcadas como concluídas
2. Verificar que os Success Metrics foram atingidos
3. Verificar que não há achados de revisão em aberto
4. Marcar a fase como `completed` no frontmatter
5. Mover o arquivo da fase para `.plans/completed/`
6. Mover todos os arquivos de task associados para `.plans/completed/`
7. Criar um commit de conclusão

Apenas após o arquivamento a próxima fase pode começar.


## Planning Source of Truth

Regras:

- `AGENTS.md` define a política de execução
- Arquivos de fase definem o progresso atual do roadmap
- Arquivos de task definem o escopo de implementação
- Fases concluídas são registros históricos em `.plans/completed/`
- Trabalho ativo sempre vem de `.plans/tasks/`
- Trabalho arquivado sempre vive em `.plans/completed/`

