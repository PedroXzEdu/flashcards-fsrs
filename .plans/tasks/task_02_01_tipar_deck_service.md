# Task 02.01 — Tipar `data: any` em DeckService e DeckRepository

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 02 — Qualidade de Código e Tipagem](./phase_02_qualidade_tipagem.md)
- **Dependências**: Nenhuma

## Objetivo

Substituir `data: any` por interfaces `CreateDeckInput` e `UpdateDeckInput` em `deckService.ts` e `deckRepository.ts`.

## Locais a Modificar

| # | Arquivo | Linha | Uso atual | Tipo sugerido |
|---|---------|-------|-----------|---------------|
| 1 | `backend/src/services/deckService.ts` | 9 | `create(data: any)` | `CreateDeckInput { title: string; description?: string; is_public?: boolean; userId: number }` |
| 2 | `backend/src/services/deckService.ts` | 41 | `update(id, userId, data: any)` | `UpdateDeckInput { title: string; description?: string; is_public?: boolean }` |
| 3 | `backend/src/repositories/deckRepository.ts` | 5 | `create(data: any)` | `CreateDeckInput` |
| 4 | `backend/src/repositories/deckRepository.ts` | 43 | `update(id, userId, data: any)` | `UpdateDeckInput` |

## Fora de Escopo

- Refatorar lógica dos métodos
- Tipar retornos dos repositórios (T02.05)

## Arquivos Permitidos para Modificação

- `backend/src/services/deckService.ts`
- `backend/src/repositories/deckRepository.ts`

## Checklist de Implementação

- [ ] 1. Definir interface `CreateDeckInput` em `deckRepository.ts` (ou `types/deck.ts`)
- [ ] 2. Definir interface `UpdateDeckInput`
- [ ] 3. Tipar parâmetros dos métodos
- [ ] 4. Ajustar chamadas se necessário (provavelmente não)
- [ ] 5. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- Nenhum `any` nos métodos de create/update de deck
- Type check passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] Interfaces criadas
- [ ] `any` substituído
- [ ] `tsc --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou
