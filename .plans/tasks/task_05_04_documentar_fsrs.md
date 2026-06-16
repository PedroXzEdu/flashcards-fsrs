# Task 05.04 — Documentar Arquitetura do FSRS

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 05 — Evolução do FSRS](./phase_05_evolucao_fsrs.md)
- **Dependências**: T05.01, T05.02, T05.03

## Objetivo

Adicionar documentação no código sobre o fluxo FSRS, explicando a sincronização frontend ↔ backend, estados de card, e como a fila de prioridade funciona.

## Locais a Modificar

| # | Arquivo | O que adicionar |
|---|---------|-----------------|
| 1 | `backend/src/services/fsrsService.ts` | Comentários de alto nível explicando o fluxo |
| 2 | `ARCHITECTURE.md` | Seção explicando o FSRS no projeto |

## Fora de Escopo

- Documentação externa (README)
- Tutorial de uso do FSRS

## Arquivos Permitidos para Modificação

- `backend/src/services/fsrsService.ts`
- `ARCHITECTURE.md`

## Checklist de Implementação

- [ ] 1. Adicionar cabeçalho explicativo em `fsrsService.ts`
- [ ] 2. Adicionar seção no `ARCHITECTURE.md` sobre FSRS flow
- [ ] 3. Revisar com `@doc`

## Critérios de Aceitação

- Fluxo FSRS documentado no código e na arquitetura
- `@doc` aprovou

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
```

## Definition of Done

- [ ] Documentação adicionada
- [ ] `tsc --noEmit` passando
- [ ] `@doc` aprovou
