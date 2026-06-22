---
id: "T05.02"
phase: "P05"
title: "Integrar Revisões com Fila de Prioridade"
status: "pending"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 05.02 — Integrar Revisões com Fila de Prioridade

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 05 — Evolução do FSRS](./phase_05_evolucao_fsrs.md)
- **Dependências**: T04.05 (daily queue otimizada)

## Objetivo

Integrar o review flow com a fila de prioridade, de modo que o "Próximo Card" seja o que tem menor `predicted_recall` dentro do baralho atual, mantendo compatibilidade com o fluxo existente.

## Locais a Modificar

| # | Arquivo | O que fazer |
|---|---------|-------------|
| 1 | `backend/src/services/reviewService.ts` | Usar priority queue para próximo card |
| 2 | `backend/src/routes/reviewRoutes.ts` | Se necessário, ajustar rota |

## Fora de Escopo

- Modificar frontend (já consome a fila)
- Alterar fluxo de submit (continua igual)

## Arquivos Permitidos para Modificação

- `backend/src/services/reviewService.ts`
- `backend/src/controllers/reviewController.ts`

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

- [ ] 1. Estudar `reviewService.ts` e identificar onde a fila é obtida
- [ ] 2. Substituir `findDailyQueue` por chamada com prioridade
- [ ] 3. Garantir que o card returned é o de menor `predicted_recall` não revisado hoje
- [ ] 4. Testar manualmente o fluxo
- [ ] 5. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- Próximo card é o de menor predicted_recall
- Fluxo existente não quebra
- Testes passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] Integração implementada
- [ ] `tsc --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
