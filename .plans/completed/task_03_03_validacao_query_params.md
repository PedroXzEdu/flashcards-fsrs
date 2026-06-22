---
id: "T03.03"
phase: "P03"
title: "Adicionar Validação de Query Params"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 03.03 — Adicionar Validação de Query Params

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 03 — Segurança e Hardening](./phase_03_seguranca_hardening.md)
- **Dependências**: Nenhuma

## Objetivo

Criar middleware de validação para query params usando Zod e aplicar nas rotas que usam `page`, `limit`, `months`, `days`.

## Locais a Modificar

| # | Arquivo | Query params atuais | Validação atual |
|---|---------|---------------------|-----------------|
| 1 | `backend/src/controllers/cardController.ts` | `page`, `limit` | `Math.max(parseInt(...) || 1, 1)` |
| 2 | `backend/src/controllers/analyticsController.ts` | `months`, `days` | `Math.min(Math.max(parseInt(...) || 12, 1), 120)` |
| 3 | `backend/src/middlewares/validate.ts` | — | Apenas body, não query |

## Fora de Escopo

- Refatorar controllers
- Validar path params (T00.01)

## Arquivos Permitidos para Modificação

- `backend/src/middlewares/validate.ts`
- `backend/src/controllers/cardController.ts`
- `backend/src/controllers/analyticsController.ts`

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

- [ ] 1. Estender `validate()` para aceitar schema de query opcional
- [ ] 2. Criar schemas `paginationSchema` (page, limit) e `analyticsRangeSchema` (months, days)
- [ ] 3. Aplicar nas rotas de card list e analytics
- [ ] 4. Remover validação manual dos controllers
- [ ] 5. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- Query params validados por Zod centralizado
- Validação manual removida dos controllers
- Type check passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] validate() estendido
- [ ] Schemas criados e aplicados
- [ ] Validação manual removida
- [ ] `tsc --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
