---
id: "T04.02"
phase: "P04"
title: "Versionar Migrations"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 04.02 — Versionar Migrations

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 04 — Performance e Banco](./phase_04_performance_banco.md)
- **Dependências**: Nenhuma

## Objetivo

Substituir `migrations.sql` único e executado em lote toda vez que o servidor sobe por arquivos numerados com controle de versão via tabela `_migrations`.

## Locais a Modificar

| # | Arquivo | O que fazer |
|---|---------|-------------|
| 1 | `backend/src/database/migrations/` (novo) | Criar diretório |
| 2 | `backend/src/database/migrations/001_create_users.sql` | Criar |
| 3 | `backend/src/database/migrations/002_create_decks.sql` | Extrair de migrations.sql |
| 4 | `backend/src/database/migrations/003_create_cards.sql` | Extrair |
| 5 | `backend/src/database/migrations/004_create_review_logs.sql` | Extrair |
| 6 | `backend/src/database/migrations/005_add_indexes.sql` | Extrair |
| 7 | `backend/src/database/migrations/006_add_share_token.sql` | Novo |
| 8 | `backend/src/database/migrations/007_add_new_cards_per_day.sql` | Novo |
| 9 | `backend/src/database/migrationRunner.ts` (novo) | Runner |
| 10 | `backend/src/database/db.ts` | Substituir `runMigrations` |

## Fora de Escopo

- Migrations com rollback automático (apenas forward por enquanto)
- Migrations para ambientes de produção (serão executadas manualmente)

## Arquivos Permitidos para Modificação

- `backend/src/database/migrations/001_create_users.sql` (novo)
- ... (arquivos numerados)
- `backend/src/database/migrationRunner.ts` (novo)
- `backend/src/database/db.ts`
- `backend/src/database/migrations.sql` (remover ou manter como referência)

## Regression Risks

- Build de produção: build script precisou ser atualizado para copiar diretório `migrations/` (não apenas `migrations.sql`)
- Testes de integração: helper `db.ts` atualizado para usar o novo runner com pool injetado
- Ordem 006/007 invertida em relação ao `migrations.sql` original (funcionalmente seguro pois ambos usam `IF NOT EXISTS`)

## Validation Scope

### Manual

- (Listar fluxos manuais para validação)

### Automated

- `npx tsc --noEmit`
- Build
- Testes relevantes

## Checklist de Implementação

- [x] 1. Criar `backend/src/database/migrations/` com arquivos numerados extraídos de `migrations.sql`
- [x] 2. Criar `migrationRunner.ts` que:
  - Cria tabela `_migrations` se não existir
  - Lê arquivos `.sql` ordenados
  - Executa apenas os não executados (por nome do arquivo)
  - Registra cada migration na tabela `_migrations`
- [x] 3. Substituir `runMigrations()` em `db.ts` para usar o runner
- [ ] 4. Remover (ou arquivar) `migrations.sql` (mantido como referência)
- [x] 5. Rodar `npx tsc --noEmit` e corrigir build script

## Critérios de Aceitação

- Migrations executadas em ordem
- Migrations já executadas não reexecutam
- Servidor sobe corretamente com banco vazio

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
# docker compose down -v && docker compose up -d db e verificar logs
```

## Definition of Done

- [x] Migrations numeradas criadas
- [x] Runner implementado
- [x] `tsc --noEmit` passando
- [x] Build script corrigido para copiar diretório `migrations/`
- [x] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
