# Task 00.02 — Remover Duplicata PUT/PATCH em Settings

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 00 — Correções Rápidas](./phase_00_correcoes_rapidas.md)
- **Dependências**: Nenhuma

## Objetivo

Remover a rota `PATCH /decks/:id/settings` duplicada em `deckRoutes.ts`, mantendo apenas `PUT /decks/:id/settings`.

## Itens

- `backend/src/routes/deckRoutes.ts:36-37` — ambas `PUT` e `PATCH` chamam `updateDeckSettings`
- O frontend usa `api.put()` para settings — verificar se há uso de `PATCH` em algum lugar

## Fora de Escopo

- Mudar a lógica de `updateDeckSettings`
- Alterar o controller

## Arquivos Permitidos para Modificação

- `backend/src/routes/deckRoutes.ts`

## Checklist de Implementação

- [ ] 1. Remover `router.patch("/:id/settings", validate(settingsSchema), updateDeckSettings);`
- [ ] 2. Verificar se frontend usa `PATCH` em `decks.ts` (buscar por "patch" em `frontend/src/api/`)
- [ ] 3. Rodar `npx tsc --noEmit`

## Critérios de Aceitação

- Apenas uma rota para settings (PUT)
- Nenhuma chamada frontend quebrada

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc -b --noEmit
```

## Definition of Done

- [ ] Rota duplicada removida
- [ ] `tsc` passando
- [ ] `@reviewer` aprovou
