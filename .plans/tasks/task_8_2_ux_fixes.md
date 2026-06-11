# Task 8.2 — UX Fixes

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 08 — UX Consistency & Fixes](./phase_08_ux_consistency.md)
- **Dependências**: Nenhuma

## Objetivo

Corrigir pequenas falhas de UX: z-index do toast, click-outside no Dashboard, spinner no "Carregar mais", e timeout frágil na transição de cards.

## Itens

### 1. Toast sem z-index
`ToastContext.tsx` — container `.toast-container` sem `z-index` pode ficar atrás de modais (que usam `z-index: 100`).

### 2. Click-outside no form "Novo baralho"
`DashboardPage.tsx` — form de criação não fecha ao clicar fora, apenas com botão "Cancelar".

### 3. Spinner no "Carregar mais"
`DeckPage.tsx:1215-1226` — botão "Carregar mais" mostra apenas texto "Carregando..." sem indicador visual de progresso.

### 4. setTimeout frágil na transição de cards
`ReviewPage.tsx:227` — `setTimeout(() => setIndex(next), 50)` para evitar flash visual. Frágil e timing-dependente.

## Arquivos Permitidos para Modificação

- `frontend/src/contexts/ToastContext.tsx`
- `frontend/src/pages/decks/DashboardPage.tsx`
- `frontend/src/pages/decks/DeckPage.tsx`
- `frontend/src/pages/review/ReviewPage.tsx`

## Checklist de Implementação

- [ ] 1. Adicionar `z-index: 9999` ao `.toast-container` (ou classe equivalente)
- [ ] 2. Adicionar click-outside handler no form "Novo baralho" (DashboardPage)
- [ ] 3. Adicionar spinner no botão "Carregar mais" (DeckPage) — usar componente Button com `loading` prop
- [ ] 4. Refatorar setTimeout do ReviewPage — usar `useLayoutEffect` ou estado derivado para evitar flicker
- [ ] 5. Rodar `npx tsc -b --noEmit`
- [ ] 6. Verificar manualmente os 4 fluxos

## Critérios de Aceitação

- Toast visível acima de modais
- Click-outside fecha form "Novo baralho"
- "Carregar mais" mostra spinner durante loading
- Transição de cards sem flicker e sem setTimeout mágico

## Comandos de Verificação

```bash
npx tsc -b --noEmit
npx vitest --project frontend
```

## Definition of Done

- [ ] 4 UX issues corrigidas
- [ ] `tsc -b --noEmit` passando
- [ ] Testes passando
- [ ] Verificação manual OK
- [ ] `@reviewer` aprovou
