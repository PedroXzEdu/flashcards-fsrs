---
id: "T01.03"
phase: "P01"
title: "Extrair Componente `CardListItem`"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 01.03 — Extrair Componente `CardListItem`

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 01 — Refatoração Frontend](./phase_01_refatoracao_frontend.md)
- **Dependências**: Nenhuma

## Objetivo

Extrair cada card individual da lista (linhas 1119-1212 do `DeckPage.tsx`) em `CardListItem.tsx`, e o botão "Carregar mais" em `LoadMoreButton.tsx`.

## Escopo

- Criar `frontend/src/components/CardListItem.tsx`
- Criar `frontend/src/components/LoadMoreButton.tsx`
- O componente `CardListItem` deve receber `card`, `onEdit`, `onDelete` como props
- Substituir o `filteredCards.map(...)` em DeckPage

## Fora de Escopo

- Modificar a lógica de filtro (search)
- Alterar a exibição do state badge

## Arquivos Permitidos para Modificação

- `frontend/src/components/CardListItem.tsx` (novo)
- `frontend/src/components/LoadMoreButton.tsx` (novo)
- `frontend/src/pages/decks/DeckPage.tsx`

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

- [ ] 1. Criar `CardListItem.tsx` com props `{ card: Card, onEdit: (card) => void, onDelete: (card) => void }`
- [ ] 2. Mover state badge, hover, botões editar/excluir, contagem de revisões
- [ ] 3. Criar `LoadMoreButton.tsx` com props `{ loading: boolean, onClick: () => void }`
- [ ] 4. Substituir `filteredCards.map(...)` e `{hasMore && (...)}` em DeckPage
- [ ] 5. Rodar `npx tsc -b --noEmit`

## Critérios de Aceitação

- Lista de cards funciona identicamente
- DeckPage reduz em ~100 linhas
- Cards e "Carregar mais" são componentes independentes

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [ ] CardListItem criado
- [ ] LoadMoreButton criado
- [ ] DeckPage reduzido
- [ ] `tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
