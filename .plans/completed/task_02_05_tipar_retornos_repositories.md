---
id: "T02.05"
phase: "P02"
title: "Tipar Retornos dos Repositories"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 02.05 — Tipar Retornos dos Repositories

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 02 — Qualidade de Código e Tipagem](./phase_02_qualidade_tipagem.md)
- **Dependências**: T02.01, T02.02, T02.03 (recomendado)

## Objetivo

Garantir que todos os métodos dos repositories tenham tipo de retorno explícito, não apenas inferido de `result.rows[0]`.

## Locais a Modificar

| # | Arquivo | Métodos sem retorno explícito |
|---|---------|------------------------------|
| 1 | `backend/src/repositories/userRepository.ts` | `findByEmail`, `create` |
| 2 | `backend/src/repositories/deckRepository.ts` | `findByUser`, `findById`, `exists`, `getCardStats`, `getReviewStats`, etc. |
| 3 | `backend/src/repositories/cardRepository.ts` | `findByDeckId`, `findByDeckIdPaginated`, `findDueByDeck`, etc. |
| 4 | `backend/src/repositories/reviewLogRepository.ts` | `findRecent`, `getDailyStats`, `getGlobalStats`, etc. |
| 5 | `backend/src/repositories/analyticsRepository.ts` | Todos |

## Fora de Escopo

- Criar interfaces de domínio separadas
- Refatorar queries

## Arquivos Permitidos para Modificação

- Todos os arquivos em `backend/src/repositories/`

## Regression Risks

- (Listar riscos de regressão específicos desta task)

## Validation Scope

### Manual

- (Listar fluxos manuais para validação)

### Automated

- `npx tsc --noEmit`
- Build
- Testes relevantes

## Checklist de Implementação

- [ ] 1. Revisar cada método em cada repository
- [ ] 2. Adicionar tipo de retorno explícito (ex: `Promise<User | undefined>`, `Promise<Deck[]>`)
- [ ] 3. Garantir que `findByDeckIdPaginated` retorna `Promise<{ rows: Card[]; total: number }>`
- [ ] 4. Rodar `npx tsc --noEmit`

## Critérios de Aceitação

- Nenhum método de repository tem retorno implícito `any`
- Type check passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] Todos os retornos tipados
- [ ] `tsc --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
