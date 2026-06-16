# Task 02.03 — Aplicar Interfaces Existentes no CardRepository

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 02 — Qualidade de Código e Tipagem](./phase_02_qualidade_tipagem.md)
- **Dependências**: Nenhuma

## Objetivo

As interfaces `CreateCardInput` e `FsrsUpdateData` já existem em `cardRepository.ts` mas não estão sendo usadas para tipar os parâmetros. Aplicá-las.

## Locais a Modificar

| # | Arquivo | Linha | Interface existe? | Está sendo usada? |
|---|---------|-------|-------------------|-------------------|
| 1 | `backend/src/repositories/cardRepository.ts` | 98 | `CreateCardInput` (linha 4) | ❌ — parâmetro `data` não usa |
| 2 | `backend/src/repositories/cardRepository.ts` | 194 | `FsrsUpdateData` (linha 18) | ❌ — parâmetro `data` não usa |

## Fora de Escopo

- Renomear interfaces
- Refatorar lógica dos métodos

## Arquivos Permitidos para Modificação

- `backend/src/repositories/cardRepository.ts`

## Checklist de Implementação

- [ ] 1. Aplicar `CreateCardInput` como tipo do parâmetro `data` em `create()`
- [ ] 2. Aplicar `FsrsUpdateData` como tipo do parâmetro `data` em `updateFsrsData()`
- [ ] 3. Exportar as interfaces para uso em services
- [ ] 4. Ajustar chamada em `cardService.ts` se `front`/`back` forem string (CreateCardInput espera string)
- [ ] 5. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- Interfaces existentes aplicadas como tipos dos parâmetros
- Type check passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] Interfaces exportadas e aplicadas
- [ ] `tsc --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou
