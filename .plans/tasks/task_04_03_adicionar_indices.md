---
id: "T04.03"
phase: "P04"
title: "Adicionar Índices Faltantes"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 04.03 — Adicionar Índices Faltantes

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 04 — Performance e Banco](./phase_04_performance_banco.md)
- **Dependências**: T04.02 (migration runner)

## Objetivo

Adicionar índices identificados na análise: `users.email` e `review_logs (user_id, card_id)`.

## Locais a Modificar

| # | Tabela | Índice | Motivação |
|---|--------|--------|-----------|
| 1 | `users` | `idx_users_email` | `findByEmail` chamado em todo login/registro |
| 2 | `review_logs` | `idx_review_logs_user_card` | Queries de "última revisão deste card" |

## Fora de Escopo

- Índices já existentes (cards.due, decks.user_id, etc.)
- Índices GIN para tags (Fase 06)

## Arquivos Permitidos para Modificação

- `backend/src/database/migrations/008_add_missing_indexes.sql` (novo)

## Regression Risks

- `idx_users_email` já existe em `005_add_indexes.sql` — `CREATE INDEX IF NOT EXISTS` torna idempotente
- Nome do índice composto ajustado para `idx_review_logs_user_id_card_id` seguindo convenção existente

## Validation Scope

### Manual

- (Listar fluxos manuais para validação)

### Automated

- `npx tsc --noEmit`
- Build
- Testes relevantes

## Checklist de Implementação

- [x] 1. Criar migration `008_add_missing_indexes.sql`:
- [ ] 2. Verificar com `EXPLAIN ANALYZE` que `findByEmail` usa o índice (opcional com Docker)
- [x] 3. Rodar `npx tsc --noEmit`

## Critérios de Aceitação

- Índices criados
- Query `findByEmail` usa Index Scan
- Nenhuma regressão

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
```

## Definition of Done

- [x] Migração criada
- [x] Índices adicionados
- [x] `tsc --noEmit` passando
- [x] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
