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

## Checklist de Implementação

- [ ] 1. Criar migration `008_add_missing_indexes.sql`:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
  CREATE INDEX IF NOT EXISTS idx_review_logs_user_card ON review_logs (user_id, card_id);
  ```
- [ ] 2. Verificar com `EXPLAIN ANALYZE` que `findByEmail` usa o índice
- [ ] 3. Rodar `npx tsc --noEmit`

## Critérios de Aceitação

- Índices criados
- Query `findByEmail` usa Index Scan
- Nenhuma regressão

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
```

## Definition of Done

- [ ] Migração criada
- [ ] Índices adicionados
- [ ] `tsc --noEmit` passando
- [ ] `@reviewer` aprovou
