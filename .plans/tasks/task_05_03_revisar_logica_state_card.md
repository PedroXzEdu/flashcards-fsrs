---
id: "T05.03"
phase: "P05"
title: "Revisar Lógica de `state` do Card na Transição"
status: "pending"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 05.03 — Revisar Lógica de `state` do Card na Transição

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 05 — Evolução do FSRS](./phase_05_evolucao_fsrs.md)
- **Dependências**: T05.01

## Objetivo

Verificar se a transição de estados (New → Learning → Review, Review → Relearning) está correta no fluxo de review, comparando com a documentação do FSRS.

## Locais a Modificar

| # | Arquivo | O que analisar |
|---|---------|----------------|
| 1 | `backend/src/services/fsrsService.ts` | Lógica de transição de estados |
| 2 | `backend/src/services/reviewService.ts` | `submitReview` e `getNextCard` |

## Fora de Escopo

- Modificar o FSRS.js em si (a biblioteca)
- Alterar a estrutura do banco

## Arquivos Permitidos para Modificação

- `backend/src/services/fsrsService.ts` (mudanças mínimas se houver bug)
- `backend/src/services/reviewService.ts`

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

- [ ] 1. Mapear máquina de estados atual do FSRS
- [ ] 2. Comparar com a documentação oficial do FSRS
- [ ] 3. Verificar se `New → Learning` acontece no primeiro review
- [ ] 4. Verificar se `Review → Relearning` acontece quando `Again` em card com `stability > 0`
- [ ] 5. Corrigir se necessário (com teste correspondente)
- [ ] 6. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- Estados de card seguem FSRS spec
- Testes cobrindo transições existem (da T05.01)
- Nada quebrou

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] Estados revisados e corretos
- [ ] `tsc --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
