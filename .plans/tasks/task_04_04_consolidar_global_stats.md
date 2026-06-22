---
id: "T04.04"
phase: "P04"
title: "Consolidar Queries do `getGlobalStats`"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 04.04 — Consolidar Queries do `getGlobalStats`

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 04 — Performance e Banco](./phase_04_performance_banco.md)
- **Dependências**: Nenhuma

## Objetivo

Analisar e possivelmente combinar as 4 queries separadas de `getGlobalStats` (cards, reviews, decks, daily) em uma única CTE.

## Locais a Modificar

| # | Arquivo | Linhas | Queries atuais |
|---|---------|--------|----------------|
| 1 | `backend/src/repositories/reviewLogRepository.ts` | 127-183 | 4 queries independentes |

## Fora de Escopo

- Mudar formato da resposta da API (manter compatibilidade)
- Refatorar o frontend

## Arquivos Permitidos para Modificação

- `backend/src/repositories/reviewLogRepository.ts`

## Regression Risks

- Nenhum — alteração é apenas comentário documentando decisão

## Validation Scope

### Manual

- (Listar fluxos manuais para validação)

### Automated

- `npx tsc --noEmit`
- Build
- Testes relevantes

## Checklist de Implementação

- [x] 1. Analisar se as 4 queries podem ser combinadas com CTE
- [x] 2. CTE exigiria subqueries JSON (daily_stats retorna múltiplas linhas) — ilegível, mantido separado
- [x] 3. Decisão documentada no código (comentário em reviewLogRepository.ts)
- [x] 4. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- Ou queries consolidadas, ou decisão documentada
- Testes de global stats continuam passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [x] Queries analisadas
- [x] Decisão documentada (manter 4 queries separadas)
- [x] `tsc --noEmit` passando
- [x] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
