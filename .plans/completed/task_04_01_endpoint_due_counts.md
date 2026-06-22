---
id: "T04.01"
phase: "P04"
title: "Criar Endpoint Agregado `GET /review/due-counts`"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

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

## Regression Risks

- N+1 chamadas no dashboard substituídas por 1 chamada agregada
- `forReview` ainda usado em DeckPage e ReviewPage — não removido, sem risco
- Rota não colide com `/decks/:deck_id/review` (segmento `due-counts` vs `review`)

## Validation Scope

### Manual

- Abrir dashboard e verificar due counts por baralho
- Navegar para revisão de um baralho e verificar que os cards corretos aparecem

### Automated

- `npx tsc --noEmit`
- Build
- Testes relevantes

## Checklist de Implementação

- [x] 1. Criar método `getDueCountsByUser` em `cardRepository.ts`:
- [x] 2. Criar `getDueCounts` em `reviewService.ts`
- [x] 3. Criar handler `getDueCounts` em `reviewController.ts`
- [x] 4. Adicionar rota `GET /decks/review/due-counts` protegida por auth
- [x] 5. Adicionar método `getDueCounts` em `frontend/src/api/cards.ts`
- [x] 6. Substituir `Promise.all(data.map(...cardsApi.forReview))` no DashboardPage
- [x] 7. Rodar `npx tsc --noEmit` (backend) e `npx tsc -b --noEmit` (frontend)

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

- [x] Endpoint criado e funcional
- [x] Dashboard usando endpoint agregado
- [x] `tsc` passando
- [x] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
