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

## Critério de Conclusão
Todos os PRs desta fase merged e `tsc --noEmit` passando sem erros.

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

### [ ] T00.02 — Remover duplicidade `PUT`/`PATCH` em `/decks/:id/settings`

**Descrição:** Manter apenas `PUT /decks/:id/settings` e remover `PATCH` duplicado em `deckRoutes.ts`.

**Motivação:** Ambas as rotas chamam o mesmo controller. Consumidores da API ficam confusos. A banca pode questionar se há diferença. Não há.

**Impacto:** Baixo

**Estimativa:** 5 minutos

**Subtarefas:**
- [ ] Remover `router.patch("/:id/settings", ...)` em `deckRoutes.ts`
- [ ] Verificar se o frontend usa `PATCH` em algum lugar (provavelmente não)

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

### [ ] T00.04 — Adicionar `useCallback` nos handlers do `ReviewPage` e remover `eslint-disable`

**Descrição:** Envolver `handleFlip` e `handleRate` em `useCallback` para remover os comentários `eslint-disable-next-line react-hooks/exhaustive-deps`.

**Motivação:** Código com `eslint-disable` é um sinal de que algo não está certo. A banca pode questionar. Além disso, estabilizar referências evita comportamentos inesperados.

**Impacto:** Médio

**Estimativa:** 1-2 horas

**Subtarefas:**
- [ ] Envolver `handleFlip` com `useCallback`
- [ ] Envolver `handleRate` com `useCallback`
- [ ] Atualizar dependências do `useEffect` do teclado
- [ ] Verificar se `loadCards` também precisa de `useCallback`
- [ ] Rodar `npx tsc -b --noEmit` no frontend

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
