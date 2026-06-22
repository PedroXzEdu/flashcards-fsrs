---
id: "P00"
title: "Correções Rápidas"
status: "completed"
priority: "high"
estimate: "2-3 days"
depends_on: []
---


# Fase 00 — Correções Rápidas e de Alto Impacto

## Objetivo
Resolver problemas pontuais, de baixo esforço e alto impacto imediato na qualidade do código e na apresentação para banca.

## Justificativa
São melhorias que podem ser feitas em dias, não semanas, e que eliminam "red flags" óbvias que uma banca notaria imediatamente (ex: `eslint-disable` sem justificativa, rotas duplicadas, CSS inline sem necessidade).

## Valor Técnico
Alto — mostra maturidade e atenção a detalhes.

## Esforço Estimado
Baixo (2-3 dias)

## Dependências
Nenhuma

## Success Metrics

- Validação de path params implementada em todas as rotas
- Rota PATCH duplicada removida
- Helper `withTransaction` criado e aplicado
- `useCallback` adicionado no ReviewPage
- `pool as client` renomeado para `pool`
- Índice `idx_users_email` adicionado
- `tsc --noEmit` passando sem erros
---

## Tarefas

### [x] T00.01 — Validar `cardId` e `deckId` com Zod nas rotas

**Descrição:** Adicionar validação de path params `cardId` e `deckId` como números inteiros positivos usando `z.coerce.number().int().positive()` nas rotas que recebem esses parâmetros.

**Motivação:** Atualmente `cardController` recebe `req.params.deck_id` e `req.params.card_id` como `string` e repassa sem validação. Se `parseInt` receber um valor não-numérico, vira `NaN` e o PostgreSQL faz coerção silenciosa. Uma banca de TCC vai notar a falta de validação de entrada.

**Impacto:** Médio

**Estimativa:** 1-2 horas

**Subtarefas:**
- [x] Criar `backend/src/schemas/paramsSchema.ts` com schemas `deckIdParams`, `cardParams`, `cardIdCamelParams`, `numericIdParams`
- [x] Aplicar nos controllers de card, review, deck via `schema.parse(req.params)`
- [x] Ajustar signatures de services e repositórios para `number` em vez de `string`
- [x] Remover `parseInt(deckId)` de `cardService.ts` (agora `deckId` já é `number`)

---

### [x] T00.02 — Remover duplicidade `PUT`/`PATCH` em `/decks/:id/settings`

**Descrição:** Manter apenas `PUT /decks/:id/settings` e remover `PATCH` duplicado em `deckRoutes.ts`.

**Motivação:** Ambas as rotas chamam o mesmo controller. Consumidores da API ficam confusos. A banca pode questionar se há diferença. Não há.

**Impacto:** Baixo

**Estimativa:** 5 minutos

**Subtarefas:**
- [x] Remover `router.patch("/:id/settings", ...)` em `deckRoutes.ts`
- [x] Verificar se o frontend usa `PATCH` em algum lugar (provavelmente não)
- [x] Atualizar teste `deckRoutes.test.ts` (11 rotas, sem PATCH)

---

### [x] T00.03 — Extrair lógica de transação para helper reutilizável

**Descrição:** Criar uma função `withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>` que encapsule `pool.connect()`, `BEGIN`, `COMMIT`, `ROLLBACK` e `release()`.

**Motivação:** `reviewService.submitReview` (linhas 67-121) faz a transação manualmente. Se `BEGIN` falhar, o `client` não é liberado no `finally`. Um helper elimina esse risco e reduz boilerplate.

**Impacto:** Médio

**Estimativa:** 3-4 horas

**Subtarefas:**
- [x] Criar `backend/src/utils/transaction.ts` com a função `withTransaction`
- [x] Refatorar `reviewService.submitReview` para usar o helper
- [x] Verificar se há outros pontos com transação manual (importService, deckImportService)

---

### [x] T00.04 — Adicionar `useCallback` nos handlers do `ReviewPage` e remover `eslint-disable`

**Descrição:** Envolver `handleFlip` e `handleRate` em `useCallback` para remover os comentários `eslint-disable-next-line react-hooks/exhaustive-deps`.

**Motivação:** Código com `eslint-disable` é um sinal de que algo não está certo. A banca pode questionar. Além disso, estabilizar referências evita comportamentos inesperados.

**Impacto:** Médio

**Estimativa:** 1-2 horas

**Subtarefas:**
- [x] Envolver `handleFlip` com `useCallback`
- [x] Envolver `handleRate` com `useCallback`
- [x] Atualizar dependências do `useEffect` do teclado
- [x] Verificar se `loadCards` também precisa de `useCallback`
- [x] Rodar `npx tsc -b --noEmit` no frontend

---

### [x] T00.05 — Substituir `import { pool as client }` em `deckRepository.ts`

**Descrição:** Renomear o import para `import { pool } from "../database/db"` em vez de `import { pool as client }`.

**Motivação:** Alias confuso (`client` vs `pool`). O nome `pool` é mais descritivo e consistente com os demais repositórios.

**Impacto:** Baixo

**Estimativa:** 5 minutos

**Subtarefas:**
- [x] Substituir `import { pool as client }` por `import { pool }` em `deckRepository.ts`

---

### [x] T00.06 — Adicionar índice `idx_users_email` em `migrations.sql`

**Descrição:** Adicionar `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);` no arquivo de migração.

**Motivação:** `findByEmail` é chamado em toda autenticação. Sem índice, é um sequential scan. Para uma banca de TCC, é uma pergunta clássica de performance.

**Impacto:** Baixo

**Estimativa:** 5 minutos

**Subtarefas:**
- [x] Adicionar o índice em `backend/src/database/migrations.sql`
- [ ] Verificar outros índices faltantes (ex: `review_logs (user_id, card_id)`)

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

