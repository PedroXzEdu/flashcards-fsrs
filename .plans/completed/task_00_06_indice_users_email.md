---
id: "T00.06"
phase: "P00"
title: "Adicionar Índice `idx_users_email`"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 00.06 — Adicionar Índice `idx_users_email`

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 00 — Correções Rápidas](./phase_00_correcoes_rapidas.md)
- **Dependências**: Nenhuma

## Objetivo

Adicionar `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);` no arquivo de migração.

## Itens

- `backend/src/database/migrations.sql` — atualmente sem índice em `users.email`
- `userRepository.findByEmail()` faz scan linear na tabela `users` a cada login/registro

## Fora de Escopo

- Versionar migrations (será feito na Fase 04)
- Adicionar outros índices (Fase 04)

## Arquivos Permitidos para Modificação

- `backend/src/database/migrations.sql`

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

- [ ] 1. Adicionar `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);` no final de `migrations.sql`
- [ ] 2. Verificar se o banco de dev/test precisa ser recriado (rodar `runMigrations`)

## Critérios de Aceitação

- Índice criado em ambiente dev após restart
- Query `findByEmail` usa index scan

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
```

(Teste manual: `docker compose restart backend` e verificar logs de migração)

## Definition of Done

- [ ] Índice adicionado
- [ ] `tsc --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
