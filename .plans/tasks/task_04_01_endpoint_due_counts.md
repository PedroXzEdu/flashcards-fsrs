# Task 04.01 — Criar Endpoint Agregado `GET /review/due-counts`

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 04 — Performance e Banco](./phase_04_performance_banco.md)
- **Dependências**: Nenhuma

## Objetivo

Criar endpoint que retorna contagem de cards para revisão por baralho em UMA query SQL, substituindo as N chamadas paralelas no dashboard.

## Locais a Modificar

| # | Arquivo | O que fazer |
|---|---------|-------------|
| 1 | `backend/src/repositories/cardRepository.ts` | Criar `getDueCountsByUser(userId: number)` |
| 2 | `backend/src/services/reviewService.ts` | Criar `getDueCounts(userId: number)` |
| 3 | `backend/src/controllers/reviewController.ts` | Criar `getDueCounts` handler |
| 4 | `backend/src/routes/reviewRoutes.ts` | Adicionar rota `GET /decks/review/due-counts` |
| 5 | `frontend/src/api/cards.ts` | Adicionar método `getDueCounts` |
| 6 | `frontend/src/pages/decks/DashboardPage.tsx` | Substituir chamadas individuais |

## Fora de Escopo

- Refatorar o DashboardPage (será feito na T01.05)
- Modificar outras queries

## Arquivos Permitidos para Modificação

- `backend/src/repositories/cardRepository.ts`
- `backend/src/services/reviewService.ts`
- `backend/src/controllers/reviewController.ts`
- `backend/src/routes/reviewRoutes.ts`
- `frontend/src/api/cards.ts`
- `frontend/src/pages/decks/DashboardPage.tsx`

## Checklist de Implementação

- [ ] 1. Criar método `getDueCountsByUser` em `cardRepository.ts`:
  ```sql
  SELECT c.deck_id, COUNT(*) AS due_count
  FROM cards c
  JOIN decks d ON d.id = c.deck_id
  WHERE d.user_id = $1 AND c.due <= NOW()
  GROUP BY c.deck_id
  ```
- [ ] 2. Criar `getDueCounts` em `reviewService.ts`
- [ ] 3. Criar handler `getDueCounts` em `reviewController.ts`
- [ ] 4. Adicionar rota `GET /decks/review/due-counts` protegida por auth
- [ ] 5. Adicionar método `getDueCounts` em `frontend/src/api/cards.ts`
- [ ] 6. Substituir `Promise.all(data.map(...cardsApi.forReview))` no DashboardPage
- [ ] 7. Rodar `npx tsc --noEmit` (backend) e `npx tsc -b --noEmit` (frontend)

## Critérios de Aceitação

- 1 requisição HTTP substitui N requisições
- Contagem correta de due cards por baralho
- Testes existentes continuam passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [ ] Endpoint criado e funcional
- [ ] Dashboard usando endpoint agregado
- [ ] `tsc` passando
- [ ] `@reviewer` aprovou
