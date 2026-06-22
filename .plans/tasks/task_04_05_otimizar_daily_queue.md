---
id: "T04.05"
phase: "P04"
title: "Otimizar `findDailyQueue` com Cálculo no SQL"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 04.05 — Otimizar `findDailyQueue` com Cálculo no SQL

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 04 — Performance e Banco](./phase_04_performance_banco.md)
- **Dependências**: Nenhuma

## Objetivo

Mover o cálculo de `predicted_recall` do backend (em memória) para o SQL, e ordenar pelo resultado no banco.

## Locais a Modificar

| # | Arquivo | O que fazer |
|---|---------|-------------|
| 1 | `backend/src/repositories/cardRepository.ts` | Modificar `findDailyQueue` para calcular `predicted_recall` no SQL |
| 2 | `backend/src/services/priorityQueueService.ts` | Remover cálculo em memória e ordenação |

## Fora de Escopo

- Mudar lógica de prioridade (será melhorada na T05.02)
- Alterar limite de cards retornados

## Arquivos Permitidos para Modificação

- `backend/src/repositories/cardRepository.ts`
- `backend/src/services/priorityQueueService.ts`

## Regression Risks

- `NULLIF(c.stability, 1)` causava divisão por zero com stability=0 e NULL com stability=1 — corrigido para `COALESCE(NULLIF(c.stability, 0), 1)`

## Validation Scope

### Manual

- (Listar fluxos manuais para validação)

### Automated

- `npx tsc --noEmit`
- Build
- Testes relevantes

## Checklist de Implementação

- [x] 1. Modificar `findDailyQueue` para calcular `predicted_recall` no SQL
- [x] 2. Remover cálculo em memória e `.sort()` de `priorityQueueService.ts`
- [x] 3. Adicionar `predicted_recall` ao tipo `QueueCardRow`
- [x] 4. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- `predicted_recall` calculado no SQL
- Ordenação correta (menor recall primeiro)
- Testes de priority queue passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [x] Query otimizada
- [x] Cálculo em memória removido
- [x] `tsc --noEmit` passando
- [x] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
