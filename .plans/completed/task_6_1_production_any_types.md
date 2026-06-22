---
id: "task_6_1_production_any_types"
title: "Tipar `any` em Produção (Backend)"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 6.1 — Tipar `any` em Produção (Backend)

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 06 — Type Hardening](./phase_06_type_hardening.md)
- **Dependências**: Nenhuma

## Objetivo

Substituir 6 ocorrências de `any` no código de produção do backend por tipos específicos.

## Locais a Modificar

| # | Arquivo | Linha | Uso atual | Tipo sugerido |
|---|---|---|---|---|
| 1 | `backend/src/repositories/cardRepository.ts` | 72 | `create(data: any, client?: PoolClient)` | `CreateCardInput` (tipo a inferir/definir) |
| 2 | `backend/src/repositories/cardRepository.ts` | 168 | `updateFsrsData(client, cardId, data: any)` | `FsrsUpdateData` (tipo a inferir/definir) |
| 3 | `backend/src/middlewares/errorHandler.ts` | 9 | `err: any` | `unknown` (com narrowing) |
| 4 | `backend/src/services/reviewService.ts` | 123 | `private formatPreview(item: any)` | `CardDueRow` ou tipo inferido do repositório |
| 5 | `backend/src/app.ts` | 113,117,122 | `(req as any).userId`, `(req as any).requestId`, `(req as any).url` | Estender tipo `Request` do Express |
| 6 | `backend/src/routes/importRoutes.ts` | 39 | `new Error(...) as any` | Usar `NodeJS.ErrnoException` ou tipo próprio |

## Fora de Escopo

- Tipar `any` em testes
- Refatorar a lógica dos arquivos

## Arquivos Permitidos para Modificação

- `backend/src/repositories/cardRepository.ts`
- `backend/src/middlewares/errorHandler.ts`
- `backend/src/services/reviewService.ts`
- `backend/src/app.ts`
- `backend/src/routes/importRoutes.ts`

## Checklist de Implementação

- [ ] 1. Tipar `create()` em cardRepository.ts — definir/importar interface para os dados
- [ ] 2. Tipar `updateFsrsData()` em cardRepository.ts
- [ ] 3. Trocar `err: any` para `err: unknown` em errorHandler.ts com narrowing adequado
- [ ] 4. Tipar `formatPreview()` em reviewService.ts
- [ ] 5. Estender tipo Request do Express via module augmentation em app.ts ou types/
- [ ] 6. Substituir `as any` em importRoutes.ts com tipo apropriado
- [ ] 7. Rodar `tsc --noEmit` e garantir zero erros

## Critérios de Aceitação

- Nenhuma ocorrência de `any` nos 6 locais identificados
- `tsc --noEmit` passa sem erros
- Testes existentes continuam passando

## Comandos de Verificação

```bash
npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] 6 locais tipados corretamente
- [ ] `tsc --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
