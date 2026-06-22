---
id: "T04.05"
phase: "P04"
title: "Otimizar `findDailyQueue` com Cálculo no SQL"
status: "pending"
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

- (Listar riscos de regressão específicos desta task)

## Validation Scope

### Manual

- (Listar fluxos manuais para validação)

### Automated

- `npx tsc --noEmit`
- Build
- Testes relevantes

## Checklist de Implementação

- [ ] 1. Modificar `findDailyQueue` para calcular `predicted_recall` no SQL:
  ```sql
  SELECT c.id, c.front, c.back, c.stability, c.due, c.state,
         ROUND(
           EXP(-GREATEST(EXTRACT(EPOCH FROM NOW() - c.due) / 86400, 0)
               / NULLIF(c.stability, 1)) * 100, 2
         ) AS predicted_recall
  FROM cards c
  JOIN decks d ON d.id = c.deck_id
  WHERE d.user_id = $1
  ORDER BY predicted_recall ASC
  LIMIT $2
  ```
- [ ] 2. Remover cálculo em memória e `.sort()` de `priorityQueueService.ts`
- [ ] 3. Ajustar tipo de retorno se necessário
- [ ] 4. Rodar `npx tsc --noEmit` e testes

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

- [ ] Query otimizada
- [ ] Cálculo em memória removido
- [ ] `tsc --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
