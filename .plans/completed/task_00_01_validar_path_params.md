---
id: "T00.01"
phase: "P00"
title: "Validar Path Params com Zod"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 00.01 — Validar Path Params com Zod

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 00 — Correções Rápidas](./phase_00_correcoes_rapidas.md)
- **Dependências**: Nenhuma

## Objetivo

Adicionar validação de `cardId` e `deckId` como `z.coerce.number().int().positive()` nos controllers que recebem esses parâmetros como string.

## Locais a Modificar

| # | Arquivo | Uso atual | Problema |
|---|---------|-----------|----------|
| 1 | `backend/src/controllers/cardController.ts` | `req.params.deck_id as string` | Sem validação, `parseInt` no service pode gerar `NaN` |
| 2 | `backend/src/controllers/reviewController.ts` | `req.params.deck_id as string` | Idem |
| 3 | `backend/src/controllers/deckController.ts` | `req.params.id as string` | Idem |
| 4 | `backend/src/services/cardService.ts` | `parseInt(deckId)` | `parseInt("abc")` = `NaN`, passa para o PostgreSQL como `0` |

## Fora de Escopo

- Refatorar a lógica dos controllers ou services
- Validar query params (será feito na Fase 03)

## Arquivos Permitidos para Modificação

- `backend/src/schemas/cardSchema.ts` (ou criar `backend/src/schemas/paramsSchema.ts`)
- `backend/src/controllers/cardController.ts`
- `backend/src/controllers/reviewController.ts`
- `backend/src/controllers/deckController.ts`
- `backend/src/services/cardService.ts`

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

- [ ] 1. Criar schema `paramsSchema.ts` com `z.object({ deck_id: z.coerce.number().int().positive(), card_id: z.coerce.number().int().positive() })`
- [ ] 2. Aplicar nos controllers que recebem path params
- [ ] 3. Substituir `parseInt(deckId)` em `cardService.ts` pelo número já validado
- [ ] 4. Remover casts `as string` desnecessários
- [ ] 5. Rodar `npx tsc --noEmit` e garantir zero erros

## Critérios de Aceitação

- Nenhum path param passa sem validação de tipo numérico
- `tsc --noEmit` passa sem erros
- Testes de controller continuam passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] Schema criado e aplicado
- [ ] `tsc --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
