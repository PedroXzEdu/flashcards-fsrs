# Task 00.05 — Corrigir Alias `pool as client` em DeckRepository

## Estado Atual

- **Situação**: Pendente
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
