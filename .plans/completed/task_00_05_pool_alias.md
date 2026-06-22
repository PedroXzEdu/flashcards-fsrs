---
id: "T00.05"
phase: "P00"
title: "Corrigir Alias `pool as client` em DeckRepository"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 00.05 — Corrigir Alias `pool as client` em DeckRepository

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 00 — Correções Rápidas](./phase_00_correcoes_rapidas.md)
- **Dependências**: Nenhuma

## Objetivo

Substituir `import { pool as client }` por `import { pool }` em `deckRepository.ts` para consistência com os demais repositórios.

## Locais a Modificar

| # | Arquivo | Linha | Problema |
|---|---------|-------|----------|
| 1 | `backend/src/repositories/deckRepository.ts` | 1 | `import { pool as client }` — alias confuso |

## Fora de Escopo

- Alterar lógica do repositório
- Renomear variáveis em outros arquivos

## Arquivos Permitidos para Modificação

- `backend/src/repositories/deckRepository.ts`

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

- [ ] 1. Substituir `import { pool as client }` por `import { pool }`
- [ ] 2. Substituir todas as ocorrências de `client.query(` por `pool.query(`
- [ ] 3. Rodar `npx tsc --noEmit`

## Critérios de Aceitação

- Nome `pool` usado consistentemente em vez de `client`
- Type check passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] Alias corrigido
- [ ] `tsc --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
