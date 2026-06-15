# Task 8.1 — Dead Code + ImportApi Refactor

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 08 — UX Consistency & Fixes](./phase_08_ux_consistency.md)
- **Dependências**: Nenhuma

## Objetivo

Remover dead code, corrigir mismatch de limite de upload, e refatorar `importApi` para usar o client compartilhado.

## Itens

### 1. Dead code: `BASE_URL` em decks.ts:2
`const BASE_URL = ...` no topo de `frontend/src/api/decks.ts` não é usado por nenhum consumer. O `importApi` redeclara sua própria URL.

### 2. Mismatch: 100MB vs 50MB
`frontend/src/components/ImportModal.tsx:272` diz "100MB" mas `backend/src/routes/importRoutes.ts:44` limita a 50MB via multer.

### 3. ImportApi duplicando fetch
`importApi.importApkg()` em `decks.ts:45-66` implementa fetch manual em vez de usar o `apiPost` do `client.ts`.

## Arquivos Permitidos para Modificação

- `frontend/src/api/decks.ts`
- `frontend/src/components/ImportModal.tsx`

## Checklist de Implementação

- [ ] 1. Remover `const BASE_URL` não utilizada de decks.ts
- [ ] 2. Corrigir "100MB" para "50MB" em ImportModal.tsx
- [ ] 3. Refatorar `importApi.importApkg()` para usar `apiPost` do client.ts (com `FormData`)
- [ ] 4. Rodar `npx tsc -b --noEmit`
- [ ] 5. Verificar import de .apkg manualmente se possível

## Critérios de Aceitação

- `BASE_URL` removida
- Limite de upload consistente (50MB)
- `importApi.importApkg` usa client compartilhado
- Build e type check passando

## Comandos de Verificação

```bash
npx tsc -b --noEmit
npx vitest --project frontend
```

## Definition of Done

- [ ] Dead code removido
- [ ] Limite corrigido
- [ ] ImportApi refatorado
- [ ] `tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou
